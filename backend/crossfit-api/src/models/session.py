from flask_sqlalchemy import SQLAlchemy
from src.models.user import db
from datetime import datetime

class WorkoutSession(db.Model):
    __tablename__ = 'workout_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    workout_id = db.Column(db.Integer, db.ForeignKey('workouts.id'), nullable=False)
    scheduled_date = db.Column(db.DateTime)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='scheduled')  # scheduled, in_progress, completed, skipped
    overall_rating = db.Column(db.Integer)  # 1-5 rating
    feedback_notes = db.Column(db.Text)
    duration_minutes = db.Column(db.Integer)
    calories_burned = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='workout_sessions')
    performances = db.relationship('ExercisePerformance', backref='session', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<WorkoutSession {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'workout_id': self.workout_id,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'status': self.status,
            'overall_rating': self.overall_rating,
            'feedback_notes': self.feedback_notes,
            'duration_minutes': self.duration_minutes,
            'calories_burned': self.calories_burned,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'performances': [perf.to_dict() for perf in self.performances]
        }

class ExercisePerformance(db.Model):
    __tablename__ = 'exercise_performances'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('workout_sessions.id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('workout_exercises.id'), nullable=False)
    actual_sets = db.Column(db.Integer)
    actual_reps = db.Column(db.String(50))
    actual_weight = db.Column(db.Float)
    actual_duration = db.Column(db.Integer)  # in seconds
    perceived_exertion = db.Column(db.Integer)  # 1-10 RPE scale
    notes = db.Column(db.Text)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    exercise = db.relationship('WorkoutExercise', backref='performances')
    
    def __repr__(self):
        return f'<ExercisePerformance {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'exercise_id': self.exercise_id,
            'actual_sets': self.actual_sets,
            'actual_reps': self.actual_reps,
            'actual_weight': self.actual_weight,
            'actual_duration': self.actual_duration,
            'perceived_exertion': self.perceived_exertion,
            'notes': self.notes,
            'completed': self.completed,
            'created_at': self.created_at.isoformat()
        }

class PersonalRecord(db.Model):
    __tablename__ = 'personal_records'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    exercise_name = db.Column(db.String(200), nullable=False)
    record_type = db.Column(db.String(50), nullable=False)  # max_weight, max_reps, best_time, etc.
    value = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20))  # kg, lbs, seconds, reps, etc.
    achieved_date = db.Column(db.DateTime, default=datetime.utcnow)
    session_id = db.Column(db.Integer, db.ForeignKey('workout_sessions.id'))
    notes = db.Column(db.Text)
    
    # Relationships
    user = db.relationship('User', backref='personal_records')
    session = db.relationship('WorkoutSession', backref='records_set')
    
    def __repr__(self):
        return f'<PersonalRecord {self.exercise_name}: {self.value} {self.unit}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'exercise_name': self.exercise_name,
            'record_type': self.record_type,
            'value': self.value,
            'unit': self.unit,
            'achieved_date': self.achieved_date.isoformat(),
            'session_id': self.session_id,
            'notes': self.notes
        }

