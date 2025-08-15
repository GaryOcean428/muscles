from flask_sqlalchemy import SQLAlchemy
from src.models.user import db
import json
from datetime import datetime

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    fitness_level = db.Column(db.String(20), nullable=False)  # beginner, intermediate, advanced
    # body_type removed - will be determined through chat UI
    fitness_goals = db.Column(db.Text)  # JSON array of goals
    available_equipment = db.Column(db.Text)  # JSON array of equipment
    workout_preferences = db.Column(db.Text)  # JSON object of preferences
    height_cm = db.Column(db.Integer)
    weight_kg = db.Column(db.Float)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', backref=db.backref('profile', uselist=False))
    
    def __repr__(self):
        return f'<UserProfile {self.user_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'fitness_level': self.fitness_level,
            'fitness_goals': json.loads(self.fitness_goals) if self.fitness_goals else [],
            'available_equipment': json.loads(self.available_equipment) if self.available_equipment else [],
            'workout_preferences': json.loads(self.workout_preferences) if self.workout_preferences else {},
            'height_cm': self.height_cm,
            'weight_kg': self.weight_kg,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def set_fitness_goals(self, goals_list):
        self.fitness_goals = json.dumps(goals_list)
    
    def set_available_equipment(self, equipment_list):
        self.available_equipment = json.dumps(equipment_list)
    
    def set_workout_preferences(self, preferences_dict):
        self.workout_preferences = json.dumps(preferences_dict)

