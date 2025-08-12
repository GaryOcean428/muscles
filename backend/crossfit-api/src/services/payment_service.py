import stripe
import os
from datetime import datetime, timedelta
from src.database import db
from src.models.subscription import Subscription, PaymentHistory
from src.models.user import User

# Configure Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_...')

class PaymentService:
    
    # Subscription plans configuration
    PLANS = {
        'premium': {
            'name': 'Premium Plan',
            'price': 1999,  # $19.99 in cents
            'currency': 'usd',
            'interval': 'month',
            'features': [
                'AI-powered workout generation',
                'Unlimited workouts',
                'Calendar synchronization',
                'Progress tracking',
                'Email support'
            ]
        },
        'pro': {
            'name': 'Pro Plan',
            'price': 3999,  # $39.99 in cents
            'currency': 'usd',
            'interval': 'month',
            'features': [
                'Everything in Premium',
                'Advanced analytics',
                'Priority support',
                'Custom workout templates',
                'Team collaboration'
            ]
        }
    }
    
    @staticmethod
    def create_customer(user):
        """Create a Stripe customer for the user"""
        try:
            customer = stripe.Customer.create(
                email=user.email,
                name=f"{user.first_name} {user.last_name}",
                metadata={
                    'user_id': user.id
                }
            )
            return customer
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create Stripe customer: {str(e)}")
    
    @staticmethod
    def create_payment_intent(user_id, plan_type, payment_method_id=None):
        """Create a payment intent for subscription"""
        try:
            user = User.query.get(user_id)
            if not user:
                raise Exception("User not found")
            
            plan = PaymentService.PLANS.get(plan_type)
            if not plan:
                raise Exception("Invalid plan type")
            
            # Get or create Stripe customer
            subscription = Subscription.query.filter_by(user_id=user_id).first()
            if subscription and subscription.stripe_customer_id:
                customer_id = subscription.stripe_customer_id
            else:
                customer = PaymentService.create_customer(user)
                customer_id = customer.id
            
            # Create payment intent
            intent = stripe.PaymentIntent.create(
                amount=plan['price'],
                currency=plan['currency'],
                customer=customer_id,
                payment_method=payment_method_id,
                confirmation_method='manual',
                confirm=True if payment_method_id else False,
                metadata={
                    'user_id': user_id,
                    'plan_type': plan_type
                }
            )
            
            return intent
            
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create payment intent: {str(e)}")
    
    @staticmethod
    def create_subscription(user_id, plan_type, payment_method_id):
        """Create a subscription for the user"""
        try:
            user = User.query.get(user_id)
            if not user:
                raise Exception("User not found")
            
            plan = PaymentService.PLANS.get(plan_type)
            if not plan:
                raise Exception("Invalid plan type")
            
            # Get or create Stripe customer
            existing_subscription = Subscription.query.filter_by(user_id=user_id).first()
            if existing_subscription and existing_subscription.stripe_customer_id:
                customer_id = existing_subscription.stripe_customer_id
            else:
                customer = PaymentService.create_customer(user)
                customer_id = customer.id
            
            # Attach payment method to customer
            stripe.PaymentMethod.attach(
                payment_method_id,
                customer=customer_id,
            )
            
            # Set as default payment method
            stripe.Customer.modify(
                customer_id,
                invoice_settings={
                    'default_payment_method': payment_method_id,
                },
            )
            
            # Create Stripe price if it doesn't exist
            price = stripe.Price.create(
                unit_amount=plan['price'],
                currency=plan['currency'],
                recurring={'interval': plan['interval']},
                product_data={'name': plan['name']},
            )
            
            # Create subscription
            stripe_subscription = stripe.Subscription.create(
                customer=customer_id,
                items=[{'price': price.id}],
                payment_behavior='default_incomplete',
                payment_settings={'save_default_payment_method': 'on_subscription'},
                expand=['latest_invoice.payment_intent'],
            )
            
            # Update or create local subscription record
            if existing_subscription:
                existing_subscription.stripe_customer_id = customer_id
                existing_subscription.stripe_subscription_id = stripe_subscription.id
                existing_subscription.plan_type = plan_type
                existing_subscription.status = stripe_subscription.status
                existing_subscription.current_period_start = datetime.fromtimestamp(
                    stripe_subscription.current_period_start
                )
                existing_subscription.current_period_end = datetime.fromtimestamp(
                    stripe_subscription.current_period_end
                )
                existing_subscription.updated_at = datetime.utcnow()
                subscription = existing_subscription
            else:
                subscription = Subscription(
                    user_id=user_id,
                    stripe_customer_id=customer_id,
                    stripe_subscription_id=stripe_subscription.id,
                    plan_type=plan_type,
                    status=stripe_subscription.status,
                    current_period_start=datetime.fromtimestamp(
                        stripe_subscription.current_period_start
                    ),
                    current_period_end=datetime.fromtimestamp(
                        stripe_subscription.current_period_end
                    )
                )
                db.session.add(subscription)
            
            db.session.commit()
            
            return {
                'subscription': subscription,
                'stripe_subscription': stripe_subscription,
                'client_secret': stripe_subscription.latest_invoice.payment_intent.client_secret
            }
            
        except stripe.error.StripeError as e:
            db.session.rollback()
            raise Exception(f"Failed to create subscription: {str(e)}")
    
    @staticmethod
    def cancel_subscription(user_id, immediate=False):
        """Cancel user's subscription"""
        try:
            subscription = Subscription.query.filter_by(user_id=user_id).first()
            if not subscription or not subscription.stripe_subscription_id:
                raise Exception("No active subscription found")
            
            if immediate:
                # Cancel immediately
                stripe.Subscription.delete(subscription.stripe_subscription_id)
                subscription.status = 'canceled'
                subscription.current_period_end = datetime.utcnow()
            else:
                # Cancel at period end
                stripe.Subscription.modify(
                    subscription.stripe_subscription_id,
                    cancel_at_period_end=True
                )
                subscription.cancel_at_period_end = True
            
            subscription.updated_at = datetime.utcnow()
            db.session.commit()
            
            return subscription
            
        except stripe.error.StripeError as e:
            db.session.rollback()
            raise Exception(f"Failed to cancel subscription: {str(e)}")
    
    @staticmethod
    def reactivate_subscription(user_id):
        """Reactivate a canceled subscription"""
        try:
            subscription = Subscription.query.filter_by(user_id=user_id).first()
            if not subscription or not subscription.stripe_subscription_id:
                raise Exception("No subscription found")
            
            # Remove cancel at period end
            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                cancel_at_period_end=False
            )
            
            subscription.cancel_at_period_end = False
            subscription.updated_at = datetime.utcnow()
            db.session.commit()
            
            return subscription
            
        except stripe.error.StripeError as e:
            db.session.rollback()
            raise Exception(f"Failed to reactivate subscription: {str(e)}")
    
    @staticmethod
    def handle_webhook(payload, sig_header):
        """Handle Stripe webhook events"""
        try:
            endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
            
            if event['type'] == 'invoice.payment_succeeded':
                PaymentService._handle_payment_succeeded(event['data']['object'])
            elif event['type'] == 'invoice.payment_failed':
                PaymentService._handle_payment_failed(event['data']['object'])
            elif event['type'] == 'customer.subscription.updated':
                PaymentService._handle_subscription_updated(event['data']['object'])
            elif event['type'] == 'customer.subscription.deleted':
                PaymentService._handle_subscription_deleted(event['data']['object'])
            
            return True
            
        except ValueError as e:
            raise Exception(f"Invalid payload: {str(e)}")
        except stripe.error.SignatureVerificationError as e:
            raise Exception(f"Invalid signature: {str(e)}")
    
    @staticmethod
    def _handle_payment_succeeded(invoice):
        """Handle successful payment"""
        subscription_id = invoice.get('subscription')
        if not subscription_id:
            return
        
        subscription = Subscription.query.filter_by(
            stripe_subscription_id=subscription_id
        ).first()
        
        if subscription:
            # Record payment
            payment = PaymentHistory(
                user_id=subscription.user_id,
                subscription_id=subscription.id,
                amount=invoice['amount_paid'],
                currency=invoice['currency'],
                status='succeeded',
                description=f"Payment for {subscription.plan_type} plan"
            )
            db.session.add(payment)
            
            # Update subscription status
            subscription.status = 'active'
            subscription.updated_at = datetime.utcnow()
            
            db.session.commit()
    
    @staticmethod
    def _handle_payment_failed(invoice):
        """Handle failed payment"""
        subscription_id = invoice.get('subscription')
        if not subscription_id:
            return
        
        subscription = Subscription.query.filter_by(
            stripe_subscription_id=subscription_id
        ).first()
        
        if subscription:
            # Record failed payment
            payment = PaymentHistory(
                user_id=subscription.user_id,
                subscription_id=subscription.id,
                amount=invoice['amount_due'],
                currency=invoice['currency'],
                status='failed',
                description=f"Failed payment for {subscription.plan_type} plan"
            )
            db.session.add(payment)
            
            # Update subscription status
            subscription.status = 'past_due'
            subscription.updated_at = datetime.utcnow()
            
            db.session.commit()
    
    @staticmethod
    def _handle_subscription_updated(stripe_subscription):
        """Handle subscription updates"""
        subscription = Subscription.query.filter_by(
            stripe_subscription_id=stripe_subscription['id']
        ).first()
        
        if subscription:
            subscription.status = stripe_subscription['status']
            subscription.current_period_start = datetime.fromtimestamp(
                stripe_subscription['current_period_start']
            )
            subscription.current_period_end = datetime.fromtimestamp(
                stripe_subscription['current_period_end']
            )
            subscription.cancel_at_period_end = stripe_subscription.get('cancel_at_period_end', False)
            subscription.updated_at = datetime.utcnow()
            
            db.session.commit()
    
    @staticmethod
    def _handle_subscription_deleted(stripe_subscription):
        """Handle subscription deletion"""
        subscription = Subscription.query.filter_by(
            stripe_subscription_id=stripe_subscription['id']
        ).first()
        
        if subscription:
            subscription.status = 'canceled'
            subscription.current_period_end = datetime.utcnow()
            subscription.updated_at = datetime.utcnow()
            
            db.session.commit()
    
    @staticmethod
    def get_subscription_info(user_id):
        """Get subscription information for user"""
        subscription = Subscription.query.filter_by(user_id=user_id).first()
        
        if not subscription:
            # Create free subscription
            subscription = Subscription(
                user_id=user_id,
                plan_type='free',
                status='active'
            )
            db.session.add(subscription)
            db.session.commit()
        
        return subscription
    
    @staticmethod
    def get_payment_history(user_id, limit=10):
        """Get payment history for user"""
        payments = PaymentHistory.query.filter_by(user_id=user_id)\
            .order_by(PaymentHistory.created_at.desc())\
            .limit(limit)\
            .all()
        
        return payments

