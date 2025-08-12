from flask_sqlalchemy import SQLAlchemy
from src.models.user import db
from datetime import datetime

class CalendarEvent(db.Model):
    __tablename__ = 'calendar_events'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey('workout_sessions.id'))
    external_event_id = db.Column(db.String(200))  # ID from external calendar service
    calendar_type = db.Column(db.String(20), default='internal')  # internal, google, outlook
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    reminder_minutes_before = db.Column(db.Integer, default=15)
    sync_status = db.Column(db.String(20), default='pending')  # pending, synced, failed
    last_sync_attempt = db.Column(db.DateTime)
    sync_error_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='calendar_events')
    session = db.relationship('WorkoutSession', backref='calendar_event', uselist=False)
    
    def __repr__(self):
        return f'<CalendarEvent {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_id': self.session_id,
            'external_event_id': self.external_event_id,
            'calendar_type': self.calendar_type,
            'title': self.title,
            'description': self.description,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat(),
            'reminder_minutes_before': self.reminder_minutes_before,
            'sync_status': self.sync_status,
            'last_sync_attempt': self.last_sync_attempt.isoformat() if self.last_sync_attempt else None,
            'sync_error_message': self.sync_error_message,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CalendarIntegration(db.Model):
    __tablename__ = 'calendar_integrations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    calendar_type = db.Column(db.String(20), nullable=False)  # google, outlook
    access_token = db.Column(db.Text)  # Encrypted access token
    refresh_token = db.Column(db.Text)  # Encrypted refresh token
    token_expires_at = db.Column(db.DateTime)
    calendar_id = db.Column(db.String(200))  # External calendar ID
    is_active = db.Column(db.Boolean, default=True)
    sync_enabled = db.Column(db.Boolean, default=True)
    last_sync = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='calendar_integrations')
    
    def __repr__(self):
        return f'<CalendarIntegration {self.calendar_type} for user {self.user_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'calendar_type': self.calendar_type,
            'calendar_id': self.calendar_id,
            'is_active': self.is_active,
            'sync_enabled': self.sync_enabled,
            'last_sync': self.last_sync.isoformat() if self.last_sync else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

