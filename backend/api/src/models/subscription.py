from datetime import datetime, timedelta
from src.database import db

class Subscription(db.Model):
    __tablename__ = 'subscriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    stripe_customer_id = db.Column(db.String(255), nullable=True)
    stripe_subscription_id = db.Column(db.String(255), nullable=True)
    plan_type = db.Column(db.String(50), nullable=False)  # 'free', 'premium', 'pro'
    status = db.Column(db.String(50), nullable=False, default='active')  # 'active', 'canceled', 'past_due', 'unpaid'
    current_period_start = db.Column(db.DateTime, nullable=True)
    current_period_end = db.Column(db.DateTime, nullable=True)
    cancel_at_period_end = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('subscription', uselist=False))
    
    def __repr__(self):
        return f'<Subscription {self.id}: {self.user_id} - {self.plan_type}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'plan_type': self.plan_type,
            'status': self.status,
            'current_period_start': self.current_period_start.isoformat() if self.current_period_start else None,
            'current_period_end': self.current_period_end.isoformat() if self.current_period_end else None,
            'cancel_at_period_end': self.cancel_at_period_end,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def is_active(self):
        """Check if subscription is currently active"""
        if self.status != 'active':
            return False
        
        if self.current_period_end and datetime.utcnow() > self.current_period_end:
            return False
            
        return True
    
    def days_remaining(self):
        """Get number of days remaining in current period"""
        if not self.current_period_end:
            return None
            
        remaining = self.current_period_end - datetime.utcnow()
        return max(0, remaining.days)
    
    def can_access_feature(self, feature):
        """Check if subscription plan allows access to specific feature"""
        if not self.is_active():
            return False
            
        feature_access = {
            'free': {
                'basic_workouts': True,
                'ai_generation': False,
                'unlimited_workouts': False,
                'advanced_analytics': False,
                'calendar_sync': False,
                'priority_support': False
            },
            'premium': {
                'basic_workouts': True,
                'ai_generation': True,
                'unlimited_workouts': True,
                'advanced_analytics': False,
                'calendar_sync': True,
                'priority_support': False
            },
            'pro': {
                'basic_workouts': True,
                'ai_generation': True,
                'unlimited_workouts': True,
                'advanced_analytics': True,
                'calendar_sync': True,
                'priority_support': True
            }
        }
        
        plan_features = feature_access.get(self.plan_type, {})
        return plan_features.get(feature, False)

class PaymentHistory(db.Model):
    __tablename__ = 'payment_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subscription_id = db.Column(db.Integer, db.ForeignKey('subscriptions.id'), nullable=True)
    stripe_payment_intent_id = db.Column(db.String(255), nullable=True)
    amount = db.Column(db.Integer, nullable=False)  # Amount in cents
    currency = db.Column(db.String(3), nullable=False, default='usd')
    status = db.Column(db.String(50), nullable=False)  # 'succeeded', 'failed', 'pending'
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='payment_history')
    subscription = db.relationship('Subscription', backref='payments')
    
    def __repr__(self):
        return f'<PaymentHistory {self.id}: {self.user_id} - ${self.amount/100}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'subscription_id': self.subscription_id,
            'amount': self.amount / 100,  # Convert cents to dollars
            'currency': self.currency,
            'status': self.status,
            'description': self.description,
            'created_at': self.created_at.isoformat()
        }

