from flask import Blueprint, request, jsonify, redirect
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User, db
from src.models.calendar import CalendarEvent, CalendarIntegration
from src.models.session import WorkoutSession
from src.services.calendar_service import CalendarService
from datetime import datetime, timedelta
import logging

calendar_bp = Blueprint('calendar', __name__)

def get_current_user():
    """Helper function to get current user from token"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    return User.verify_token(token)

# OAuth Integration Routes
@calendar_bp.route('/integrations', methods=['GET'])
@jwt_required()
def get_integrations():
    """Get user's calendar integrations"""
    try:
        user_id = get_jwt_identity()
        integrations = CalendarService.get_user_integrations(user_id)
        
        return jsonify({
            'success': True,
            'integrations': integrations
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting integrations: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get calendar integrations'
        }), 500

@calendar_bp.route('/google/connect', methods=['POST'])
@jwt_required()
def connect_google():
    """Get Google Calendar authorization URL"""
    try:
        user_id = get_jwt_identity()
        auth_url = CalendarService.get_google_auth_url(user_id)
        
        return jsonify({
            'success': True,
            'auth_url': auth_url
        }), 200
        
    except Exception as e:
        logging.error(f"Error connecting Google Calendar: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@calendar_bp.route('/google/callback', methods=['GET'])
def google_callback():
    """Handle Google Calendar OAuth callback"""
    try:
        code = request.args.get('code')
        state = request.args.get('state')
        error = request.args.get('error')
        
        if error:
            return redirect(f"http://localhost:3000/settings?calendar_error={error}")
        
        if not code or not state:
            return redirect("http://localhost:3000/settings?calendar_error=missing_parameters")
        
        integration = CalendarService.handle_google_callback(code, state)
        
        return redirect("http://localhost:3000/settings?calendar_success=google")
        
    except Exception as e:
        logging.error(f"Error in Google callback: {str(e)}")
        return redirect(f"http://localhost:3000/settings?calendar_error={str(e)}")

@calendar_bp.route('/microsoft/connect', methods=['POST'])
@jwt_required()
def connect_microsoft():
    """Get Microsoft Calendar authorization URL"""
    try:
        user_id = get_jwt_identity()
        auth_url = CalendarService.get_microsoft_auth_url(user_id)
        
        return jsonify({
            'success': True,
            'auth_url': auth_url
        }), 200
        
    except Exception as e:
        logging.error(f"Error connecting Microsoft Calendar: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@calendar_bp.route('/microsoft/callback', methods=['GET'])
def microsoft_callback():
    """Handle Microsoft Calendar OAuth callback"""
    try:
        code = request.args.get('code')
        state = request.args.get('state')
        error = request.args.get('error')
        
        if error:
            return redirect(f"http://localhost:3000/settings?calendar_error={error}")
        
        if not code or not state:
            return redirect("http://localhost:3000/settings?calendar_error=missing_parameters")
        
        integration = CalendarService.handle_microsoft_callback(code, state)
        
        return redirect("http://localhost:3000/settings?calendar_success=microsoft")
        
    except Exception as e:
        logging.error(f"Error in Microsoft callback: {str(e)}")
        return redirect(f"http://localhost:3000/settings?calendar_error={str(e)}")

@calendar_bp.route('/disconnect', methods=['POST'])
@jwt_required()
def disconnect_calendar():
    """Disconnect a calendar integration"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        provider = data.get('provider')
        if not provider:
            return jsonify({
                'success': False,
                'error': 'Provider is required'
            }), 400
        
        CalendarService.disconnect_calendar(user_id, provider)
        
        return jsonify({
            'success': True,
            'message': f'{provider.title()} calendar disconnected successfully'
        }), 200
        
    except Exception as e:
        logging.error(f"Error disconnecting calendar: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to disconnect calendar'
        }), 500

@calendar_bp.route('/create-event', methods=['POST'])
@jwt_required()
def create_workout_event():
    """Create a workout event in user's calendars"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        workout_data = data.get('workout')
        start_time_str = data.get('start_time')
        duration_minutes = data.get('duration_minutes', 60)
        
        if not workout_data or not start_time_str:
            return jsonify({
                'success': False,
                'error': 'Workout data and start time are required'
            }), 400
        
        # Parse start time
        try:
            start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid start time format'
            }), 400
        
        results = CalendarService.create_workout_event(
            user_id=user_id,
            workout_data=workout_data,
            start_time=start_time,
            duration_minutes=duration_minutes
        )
        
        return jsonify({
            'success': True,
            'results': results
        }), 200
        
    except Exception as e:
        logging.error(f"Error creating workout event: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create workout event'
        }), 500

# Existing calendar event management routes
@calendar_bp.route('/calendar/events', methods=['GET'])
def get_calendar_events():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        calendar_type = request.args.get('calendar_type')
        
        query = CalendarEvent.query.filter_by(user_id=user.id)
        
        if start_date:
            try:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                query = query.filter(CalendarEvent.start_time >= start_dt)
            except ValueError:
                return jsonify({'error': 'start_date must be in YYYY-MM-DD format'}), 400
        
        if end_date:
            try:
                end_dt = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
                query = query.filter(CalendarEvent.start_time < end_dt)
            except ValueError:
                return jsonify({'error': 'end_date must be in YYYY-MM-DD format'}), 400
        
        if calendar_type:
            query = query.filter_by(calendar_type=calendar_type)
        
        events = query.order_by(CalendarEvent.start_time).all()
        
        return jsonify({
            'events': [event.to_dict() for event in events]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get calendar events', 'details': str(e)}), 500

@calendar_bp.route('/calendar/events', methods=['POST'])
def create_calendar_event():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'start_time', 'end_time']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Parse datetime fields
        try:
            start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
            end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({'error': 'start_time and end_time must be in ISO format'}), 400
        
        if start_time >= end_time:
            return jsonify({'error': 'end_time must be after start_time'}), 400
        
        # Validate session_id if provided
        session_id = data.get('session_id')
        if session_id:
            session = WorkoutSession.query.filter_by(id=session_id, user_id=user.id).first()
            if not session:
                return jsonify({'error': 'Session not found'}), 404
        
        # Create calendar event
        event = CalendarEvent(
            user_id=user.id,
            session_id=session_id,
            calendar_type=data.get('calendar_type', 'internal'),
            title=data['title'],
            description=data.get('description', ''),
            start_time=start_time,
            end_time=end_time,
            reminder_minutes_before=data.get('reminder_minutes_before', 15)
        )
        
        db.session.add(event)
        db.session.commit()
        
        # If this is for external calendar sync, trigger sync
        if event.calendar_type in ['google', 'outlook']:
            # In a real implementation, you would trigger external calendar sync here
            event.sync_status = 'pending'
            db.session.commit()
        
        return jsonify({
            'message': 'Calendar event created successfully',
            'event': event.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create calendar event', 'details': str(e)}), 500

@calendar_bp.route('/sync-status', methods=['GET'])
@jwt_required()
def get_sync_status():
    """Get calendar synchronization status"""
    try:
        user_id = get_jwt_identity()
        integrations = CalendarService.get_user_integrations(user_id)
        
        sync_status = {
            'google': False,
            'microsoft': False,
            'total_integrations': len(integrations)
        }
        
        for integration in integrations:
            if integration['provider'] == 'google' and integration['is_active']:
                sync_status['google'] = True
            elif integration['provider'] == 'microsoft' and integration['is_active']:
                sync_status['microsoft'] = True
        
        return jsonify({
            'success': True,
            'sync_status': sync_status,
            'integrations': integrations
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting sync status: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get sync status'
        }), 500

