from flask import Blueprint, request, jsonify
from src.models.user import User, db
from src.models.workout import Workout
from src.models.session import WorkoutSession, ExercisePerformance, PersonalRecord
from datetime import datetime, timedelta

session_bp = Blueprint('session', __name__)

def get_current_user():
    """Helper function to get current user from token"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    return User.verify_token(token)

@session_bp.route('/sessions', methods=['GET'])
def get_sessions():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = WorkoutSession.query.filter_by(user_id=user.id)
        
        if status:
            query = query.filter_by(status=status)
        
        if start_date:
            try:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                query = query.filter(WorkoutSession.scheduled_date >= start_dt)
            except ValueError:
                return jsonify({'error': 'start_date must be in YYYY-MM-DD format'}), 400
        
        if end_date:
            try:
                end_dt = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
                query = query.filter(WorkoutSession.scheduled_date < end_dt)
            except ValueError:
                return jsonify({'error': 'end_date must be in YYYY-MM-DD format'}), 400
        
        sessions = query.order_by(WorkoutSession.scheduled_date.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'sessions': [session.to_dict() for session in sessions.items],
            'total': sessions.total,
            'pages': sessions.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get sessions', 'details': str(e)}), 500

@session_bp.route('/sessions/<int:session_id>', methods=['GET'])
def get_session(session_id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        session = WorkoutSession.query.filter_by(id=session_id, user_id=user.id).first()
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        return jsonify({'session': session.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get session', 'details': str(e)}), 500

@session_bp.route('/sessions', methods=['POST'])
def create_session():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('workout_id'):
            return jsonify({'error': 'workout_id is required'}), 400
        
        # Verify workout belongs to user
        workout = Workout.query.filter_by(id=data['workout_id'], user_id=user.id).first()
        if not workout:
            return jsonify({'error': 'Workout not found'}), 404
        
        # Parse scheduled date
        scheduled_date = None
        if data.get('scheduled_date'):
            try:
                scheduled_date = datetime.fromisoformat(data['scheduled_date'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'error': 'scheduled_date must be in ISO format'}), 400
        
        # Create session
        session = WorkoutSession(
            user_id=user.id,
            workout_id=data['workout_id'],
            scheduled_date=scheduled_date,
            status='scheduled'
        )
        
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            'message': 'Session created successfully',
            'session': session.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create session', 'details': str(e)}), 500

@session_bp.route('/sessions/<int:session_id>/start', methods=['POST'])
def start_session(session_id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        session = WorkoutSession.query.filter_by(id=session_id, user_id=user.id).first()
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        if session.status != 'scheduled':
            return jsonify({'error': 'Session cannot be started'}), 400
        
        session.status = 'in_progress'
        session.started_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Session started successfully',
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to start session', 'details': str(e)}), 500

@session_bp.route('/sessions/<int:session_id>/complete', methods=['POST'])
def complete_session(session_id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        session = WorkoutSession.query.filter_by(id=session_id, user_id=user.id).first()
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        if session.status not in ['scheduled', 'in_progress']:
            return jsonify({'error': 'Session cannot be completed'}), 400
        
        data = request.get_json() or {}
        
        session.status = 'completed'
        session.completed_at = datetime.utcnow()
        
        if session.started_at:
            duration = (session.completed_at - session.started_at).total_seconds() / 60
            session.duration_minutes = int(duration)
        
        if 'overall_rating' in data:
            session.overall_rating = data['overall_rating']
        
        if 'feedback_notes' in data:
            session.feedback_notes = data['feedback_notes']
        
        if 'calories_burned' in data:
            session.calories_burned = data['calories_burned']
        
        db.session.commit()
        
        # Check for personal records
        check_personal_records(session)
        
        return jsonify({
            'message': 'Session completed successfully',
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to complete session', 'details': str(e)}), 500

@session_bp.route('/sessions/<int:session_id>/feedback', methods=['POST'])
def submit_feedback(session_id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        session = WorkoutSession.query.filter_by(id=session_id, user_id=user.id).first()
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        data = request.get_json()
        
        if 'overall_rating' in data:
            if not 1 <= data['overall_rating'] <= 5:
                return jsonify({'error': 'overall_rating must be between 1 and 5'}), 400
            session.overall_rating = data['overall_rating']
        
        if 'feedback_notes' in data:
            session.feedback_notes = data['feedback_notes']
        
        session.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Feedback submitted successfully',
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to submit feedback', 'details': str(e)}), 500

@session_bp.route('/sessions/<int:session_id>/performance', methods=['POST'])
def log_performance(session_id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        session = WorkoutSession.query.filter_by(id=session_id, user_id=user.id).first()
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        data = request.get_json()
        
        if not data.get('exercise_id'):
            return jsonify({'error': 'exercise_id is required'}), 400
        
        # Check if performance already exists
        existing_performance = ExercisePerformance.query.filter_by(
            session_id=session_id,
            exercise_id=data['exercise_id']
        ).first()
        
        if existing_performance:
            # Update existing performance
            performance = existing_performance
        else:
            # Create new performance
            performance = ExercisePerformance(
                session_id=session_id,
                exercise_id=data['exercise_id']
            )
        
        # Update performance data
        if 'actual_sets' in data:
            performance.actual_sets = data['actual_sets']
        
        if 'actual_reps' in data:
            performance.actual_reps = data['actual_reps']
        
        if 'actual_weight' in data:
            performance.actual_weight = data['actual_weight']
        
        if 'actual_duration' in data:
            performance.actual_duration = data['actual_duration']
        
        if 'perceived_exertion' in data:
            if not 1 <= data['perceived_exertion'] <= 10:
                return jsonify({'error': 'perceived_exertion must be between 1 and 10'}), 400
            performance.perceived_exertion = data['perceived_exertion']
        
        if 'notes' in data:
            performance.notes = data['notes']
        
        if 'completed' in data:
            performance.completed = data['completed']
        
        if not existing_performance:
            db.session.add(performance)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Performance logged successfully',
            'performance': performance.to_dict()
        }), 201 if not existing_performance else 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to log performance', 'details': str(e)}), 500

@session_bp.route('/personal-records', methods=['GET'])
def get_personal_records():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        exercise_name = request.args.get('exercise_name')
        record_type = request.args.get('record_type')
        
        query = PersonalRecord.query.filter_by(user_id=user.id)
        
        if exercise_name:
            query = query.filter_by(exercise_name=exercise_name)
        
        if record_type:
            query = query.filter_by(record_type=record_type)
        
        records = query.order_by(PersonalRecord.achieved_date.desc()).all()
        
        return jsonify({
            'records': [record.to_dict() for record in records]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get personal records', 'details': str(e)}), 500

def check_personal_records(session):
    """Check if any personal records were set during the session"""
    try:
        for performance in session.performances:
            if not performance.completed:
                continue
            
            exercise = performance.exercise
            
            # Check for weight PR
            if performance.actual_weight:
                existing_pr = PersonalRecord.query.filter_by(
                    user_id=session.user_id,
                    exercise_name=exercise.exercise_name,
                    record_type='max_weight'
                ).first()
                
                if not existing_pr or performance.actual_weight > existing_pr.value:
                    if existing_pr:
                        existing_pr.value = performance.actual_weight
                        existing_pr.achieved_date = session.completed_at
                        existing_pr.session_id = session.id
                    else:
                        pr = PersonalRecord(
                            user_id=session.user_id,
                            exercise_name=exercise.exercise_name,
                            record_type='max_weight',
                            value=performance.actual_weight,
                            unit='kg',
                            achieved_date=session.completed_at,
                            session_id=session.id
                        )
                        db.session.add(pr)
            
            # Check for reps PR (if weight is the same or higher)
            if performance.actual_reps and performance.actual_reps.isdigit():
                reps = int(performance.actual_reps)
                existing_pr = PersonalRecord.query.filter_by(
                    user_id=session.user_id,
                    exercise_name=exercise.exercise_name,
                    record_type='max_reps'
                ).first()
                
                if not existing_pr or reps > existing_pr.value:
                    if existing_pr:
                        existing_pr.value = reps
                        existing_pr.achieved_date = session.completed_at
                        existing_pr.session_id = session.id
                    else:
                        pr = PersonalRecord(
                            user_id=session.user_id,
                            exercise_name=exercise.exercise_name,
                            record_type='max_reps',
                            value=reps,
                            unit='reps',
                            achieved_date=session.completed_at,
                            session_id=session.id
                        )
                        db.session.add(pr)
        
        db.session.commit()
        
    except Exception as e:
        print(f"Error checking personal records: {e}")
        # Don't fail the session completion if PR checking fails

