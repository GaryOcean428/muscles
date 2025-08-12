from flask_sqlalchemy import SQLAlchemy
from src.models.user import db
from datetime import datetime

class Equipment(db.Model):
    __tablename__ = 'equipment'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # weights, cardio, bodyweight, etc.
    availability_status = db.Column(db.String(20), default='available')  # available, unavailable, maintenance
    weight_range_min = db.Column(db.Float)  # For adjustable weights
    weight_range_max = db.Column(db.Float)
    quantity = db.Column(db.Integer, default=1)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='equipment')
    
    def __repr__(self):
        return f'<Equipment {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'category': self.category,
            'availability_status': self.availability_status,
            'weight_range_min': self.weight_range_min,
            'weight_range_max': self.weight_range_max,
            'quantity': self.quantity,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class EquipmentTemplate(db.Model):
    __tablename__ = 'equipment_templates'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    typical_exercises = db.Column(db.Text)  # JSON array of exercises this equipment is used for
    image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<EquipmentTemplate {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'typical_exercises': self.typical_exercises,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat()
        }

