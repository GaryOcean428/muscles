from flask_sqlalchemy import SQLAlchemy
from src.models.user import db
from datetime import datetime

class Workout(db.Model):
    __tablename__ = 'workouts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    workout_type = db.Column(db.String(50), nullable=False)  # crossfit, hiit, strength, cardio
    duration_minutes = db.Column(db.Integer)
    difficulty_level = db.Column(db.String(20))  # beginner, intermediate, advanced
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='workouts')
    exercises = db.relationship('WorkoutExercise', backref='workout', cascade='all, delete-orphan')
    sessions = db.relationship('WorkoutSession', backref='workout')
    
    def __repr__(self):
        return f'<Workout {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'workout_type': self.workout_type,
            'duration_minutes': self.duration_minutes,
            'difficulty_level': self.difficulty_level,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'exercises': [exercise.to_dict() for exercise in self.exercises]
        }

class WorkoutExercise(db.Model):
    __tablename__ = 'workout_exercises'
    
    id = db.Column(db.Integer, primary_key=True)
    workout_id = db.Column(db.Integer, db.ForeignKey('workouts.id'), nullable=False)
    exercise_name = db.Column(db.String(200), nullable=False)
    exercise_type = db.Column(db.String(50), nullable=False)  # strength, cardio, plyometric, etc.
    sets = db.Column(db.Integer)
    reps = db.Column(db.String(50))  # Can be "10", "10-12", "AMRAP", etc.
    weight_percentage = db.Column(db.Float)  # Percentage of 1RM
    rest_time_seconds = db.Column(db.Integer)
    notes = db.Column(db.Text)
    order_index = db.Column(db.Integer, nullable=False)
    equipment_required = db.Column(db.String(200))
    
    def __repr__(self):
        return f'<WorkoutExercise {self.exercise_name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'workout_id': self.workout_id,
            'exercise_name': self.exercise_name,
            'exercise_type': self.exercise_type,
            'sets': self.sets,
            'reps': self.reps,
            'weight_percentage': self.weight_percentage,
            'rest_time_seconds': self.rest_time_seconds,
            'notes': self.notes,
            'order_index': self.order_index,
            'equipment_required': self.equipment_required
        }

class ExerciseTemplate(db.Model):
    __tablename__ = 'exercise_templates'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    category = db.Column(db.String(50), nullable=False)  # strength, cardio, plyometric, etc.
    muscle_groups = db.Column(db.String(200))  # JSON array of muscle groups
    equipment_required = db.Column(db.String(200))
    difficulty_level = db.Column(db.String(20))
    description = db.Column(db.Text)
    instructions = db.Column(db.Text)
    video_url = db.Column(db.String(500))
    image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ExerciseTemplate {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'muscle_groups': self.muscle_groups,
            'equipment_required': self.equipment_required,
            'difficulty_level': self.difficulty_level,
            'description': self.description,
            'instructions': self.instructions,
            'video_url': self.video_url,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat()
        }

