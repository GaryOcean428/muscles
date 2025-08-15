from flask import Blueprint, request, jsonify
from src.models.user import User, db
from src.models.profile import UserProfile
from src.models.workout import Workout, WorkoutExercise, ExerciseTemplate
from src.ai_engine import AIWorkoutGenerator
from datetime import datetime
import random
import json

workout_bp = Blueprint('workout', __name__)

def get_current_user():
    """Helper function to get current user from token"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    return User.verify_token(token)

@workout_bp.route('/workouts', methods=['GET'])
def get_workouts():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        workout_type = request.args.get('type')
        
        query = Workout.query.filter_by(user_id=user.id)
        
        if workout_type:
            query = query.filter_by(workout_type=workout_type)
        
        workouts = query.order_by(Workout.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'workouts': [workout.to_dict() for workout in workouts.items],
            'total': workouts.total,
            'pages': workouts.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get workouts', 'details': str(e)}), 500

@workout_bp.route('/workouts/<int:workout_id>', methods=['GET'])
def get_workout(workout_id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        workout = Workout.query.filter_by(id=workout_id, user_id=user.id).first()
        if not workout:
            return jsonify({'error': 'Workout not found'}), 404
        
        return jsonify({'workout': workout.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get workout', 'details': str(e)}), 500

@workout_bp.route('/workouts/generate', methods=['POST'])
def generate_workout():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Get user profile for personalization
        profile = UserProfile.query.filter_by(user_id=user.id).first()
        if not profile:
            return jsonify({'error': 'User profile required for workout generation'}), 400
        
        data = request.get_json()
        workout_type = data.get('workout_type', 'hiit')
        duration = data.get('duration_minutes', 30)
        focus_areas = data.get('focus_areas', [])
        use_ai = data.get('use_ai', True)
        available_equipment = data.get('available_equipment', [])
        
        if use_ai:
            # Use AI-powered workout generation
            try:
                ai_generator = AIWorkoutGenerator()
                workout = ai_generator.generate_personalized_workout(
                    user, profile, workout_type, duration, focus_areas, available_equipment
                )
                
                return jsonify({
                    'message': 'AI-powered workout generated successfully',
                    'workout': workout.to_dict(),
                    'generated_by': 'ai'
                }), 201
                
            except Exception as ai_error:
                print(f"AI generation failed: {ai_error}")
                # Fallback to basic generation
                workout = generate_basic_workout(user, profile, workout_type, duration, focus_areas)
                
                return jsonify({
                    'message': 'Workout generated successfully (fallback mode)',
                    'workout': workout.to_dict(),
                    'generated_by': 'fallback',
                    'note': 'AI generation temporarily unavailable'
                }), 201
        else:
            # Use basic workout generation
            workout = generate_basic_workout(user, profile, workout_type, duration, focus_areas)
            
            return jsonify({
                'message': 'Workout generated successfully',
                'workout': workout.to_dict(),
                'generated_by': 'basic'
            }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to generate workout', 'details': str(e)}), 500

def generate_basic_workout(user, profile, workout_type, duration, focus_areas):
    """Generate a basic workout without AI (fallback method)"""
    
    # Create workout
    workout = Workout(
        user_id=user.id,
        name=f"{workout_type.upper()} Workout - {datetime.now().strftime('%Y-%m-%d')}",
        description=f"Personalized {workout_type} workout for {profile.fitness_level} level",
        workout_type=workout_type,
        duration_minutes=duration,
        difficulty_level=profile.fitness_level
    )
    
    db.session.add(workout)
    db.session.flush()  # Get the workout ID
    
    # Generate exercises based on workout type and user profile
    exercises = []
    
    if workout_type == 'hiit':
        exercises = generate_hiit_exercises(profile, duration, focus_areas)
    elif workout_type == 'muscles-style':
        exercises = generate_muscles_style_exercises(profile, duration, focus_areas)
    elif workout_type == 'strength':
        exercises = generate_strength_exercises(profile, duration, focus_areas)
    else:
        exercises = generate_general_exercises(profile, duration, focus_areas)
    
    # Add exercises to workout
    for i, exercise_data in enumerate(exercises):
        exercise = WorkoutExercise(
            workout_id=workout.id,
            exercise_name=exercise_data['name'],
            exercise_type=exercise_data['type'],
            sets=exercise_data.get('sets', 1),
            reps=exercise_data.get('reps', '10'),
            rest_time_seconds=exercise_data.get('rest_time', 60),
            notes=exercise_data.get('notes', ''),
            order_index=i + 1,
            equipment_required=exercise_data.get('equipment', 'bodyweight')
        )
        db.session.add(exercise)
    
    db.session.commit()
    return workout

def generate_hiit_exercises(profile, duration, focus_areas):
    """Generate HIIT exercises"""
    exercises = []
    
    # Base HIIT exercises
    hiit_exercises = [
        {'name': 'Burpees', 'type': 'cardio', 'sets': 4, 'reps': '30 seconds', 'rest_time': 30},
        {'name': 'Mountain Climbers', 'type': 'cardio', 'sets': 4, 'reps': '30 seconds', 'rest_time': 30},
        {'name': 'Jump Squats', 'type': 'plyometric', 'sets': 4, 'reps': '30 seconds', 'rest_time': 30},
        {'name': 'High Knees', 'type': 'cardio', 'sets': 4, 'reps': '30 seconds', 'rest_time': 30},
        {'name': 'Push-ups', 'type': 'strength', 'sets': 4, 'reps': '30 seconds', 'rest_time': 30},
        {'name': 'Plank Jacks', 'type': 'core', 'sets': 4, 'reps': '30 seconds', 'rest_time': 30},
        {'name': 'Jumping Jacks', 'type': 'cardio', 'sets': 4, 'reps': '30 seconds', 'rest_time': 30},
        {'name': 'Squat Thrusts', 'type': 'cardio', 'sets': 4, 'reps': '30 seconds', 'rest_time': 30}
    ]
    
    # Adjust difficulty based on fitness level
    if profile.fitness_level == 'beginner':
        for exercise in hiit_exercises:
            exercise['sets'] = 3
            exercise['reps'] = '20 seconds'
            exercise['rest_time'] = 40
    elif profile.fitness_level == 'advanced':
        for exercise in hiit_exercises:
            exercise['sets'] = 5
            exercise['reps'] = '45 seconds'
            exercise['rest_time'] = 15
    
    # Select exercises based on duration
    num_exercises = min(duration // 4, len(hiit_exercises))
    selected_exercises = random.sample(hiit_exercises, num_exercises)
    
    return selected_exercises

def generate_muscles_style_exercises(profile, duration, focus_areas):
    """Generate HIIT-style exercises"""
    exercises = []
    
    muscles_style_exercises = [
        {'name': 'Thrusters', 'type': 'strength', 'sets': 5, 'reps': '10', 'rest_time': 90, 'equipment': 'barbell'},
        {'name': 'Pull-ups', 'type': 'strength', 'sets': 5, 'reps': '8', 'rest_time': 90, 'equipment': 'pull-up bar'},
        {'name': 'Box Jumps', 'type': 'plyometric', 'sets': 4, 'reps': '12', 'rest_time': 60, 'equipment': 'box'},
        {'name': 'Kettlebell Swings', 'type': 'strength', 'sets': 4, 'reps': '15', 'rest_time': 60, 'equipment': 'kettlebell'},
        {'name': 'Wall Balls', 'type': 'strength', 'sets': 4, 'reps': '15', 'rest_time': 60, 'equipment': 'medicine ball'},
        {'name': 'Deadlifts', 'type': 'strength', 'sets': 5, 'reps': '8', 'rest_time': 120, 'equipment': 'barbell'},
        {'name': 'Double Unders', 'type': 'cardio', 'sets': 4, 'reps': '30', 'rest_time': 60, 'equipment': 'jump rope'},
        {'name': 'Rowing', 'type': 'cardio', 'sets': 4, 'reps': '250m', 'rest_time': 90, 'equipment': 'rowing machine'}
    ]
    
    # Adjust for fitness level
    if profile.fitness_level == 'beginner':
        for exercise in muscles_style_exercises:
            exercise['sets'] = max(3, exercise['sets'] - 1)
            if isinstance(exercise['reps'], str) and exercise['reps'].isdigit():
                exercise['reps'] = str(max(5, int(exercise['reps']) - 2))
    elif profile.fitness_level == 'advanced':
        for exercise in muscles_style_exercises:
            exercise['sets'] = exercise['sets'] + 1
            if isinstance(exercise['reps'], str) and exercise['reps'].isdigit():
                exercise['reps'] = str(int(exercise['reps']) + 3)
    
    num_exercises = min(duration // 6, len(muscles_style_exercises))
    selected_exercises = random.sample(muscles_style_exercises, num_exercises)
    
    return selected_exercises

def generate_strength_exercises(profile, duration, focus_areas):
    """Generate strength training exercises"""
    exercises = []
    
    strength_exercises = [
        {'name': 'Squats', 'type': 'strength', 'sets': 4, 'reps': '12', 'rest_time': 90},
        {'name': 'Bench Press', 'type': 'strength', 'sets': 4, 'reps': '10', 'rest_time': 120, 'equipment': 'barbell'},
        {'name': 'Deadlifts', 'type': 'strength', 'sets': 4, 'reps': '8', 'rest_time': 120, 'equipment': 'barbell'},
        {'name': 'Overhead Press', 'type': 'strength', 'sets': 4, 'reps': '10', 'rest_time': 90, 'equipment': 'barbell'},
        {'name': 'Bent-over Rows', 'type': 'strength', 'sets': 4, 'reps': '12', 'rest_time': 90, 'equipment': 'barbell'},
        {'name': 'Lunges', 'type': 'strength', 'sets': 3, 'reps': '12 each leg', 'rest_time': 60},
        {'name': 'Dips', 'type': 'strength', 'sets': 3, 'reps': '10', 'rest_time': 60, 'equipment': 'dip bars'},
        {'name': 'Pull-ups', 'type': 'strength', 'sets': 4, 'reps': '8', 'rest_time': 90, 'equipment': 'pull-up bar'}
    ]
    
    # Adjust for fitness level
    if profile.fitness_level == 'beginner':
        for exercise in strength_exercises:
            exercise['sets'] = max(2, exercise['sets'] - 1)
            exercise['rest_time'] = exercise['rest_time'] + 30
    elif profile.fitness_level == 'advanced':
        for exercise in strength_exercises:
            exercise['sets'] = exercise['sets'] + 1
            exercise['rest_time'] = max(60, exercise['rest_time'] - 15)
    
    num_exercises = min(duration // 8, len(strength_exercises))
    selected_exercises = random.sample(strength_exercises, num_exercises)
    
    return selected_exercises

def generate_general_exercises(profile, duration, focus_areas):
    """Generate general fitness exercises"""
    return generate_hiit_exercises(profile, duration, focus_areas)

@workout_bp.route('/workouts/<int:workout_id>', methods=['PUT'])
def update_workout(workout_id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        workout = Workout.query.filter_by(id=workout_id, user_id=user.id).first()
        if not workout:
            return jsonify({'error': 'Workout not found'}), 404
        
        data = request.get_json()
        
        # Update workout fields
        if 'name' in data:
            workout.name = data['name']
        if 'description' in data:
            workout.description = data['description']
        if 'workout_type' in data:
            workout.workout_type = data['workout_type']
        if 'duration_minutes' in data:
            workout.duration_minutes = data['duration_minutes']
        if 'difficulty_level' in data:
            workout.difficulty_level = data['difficulty_level']
        
        workout.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Workout updated successfully',
            'workout': workout.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update workout', 'details': str(e)}), 500

@workout_bp.route('/workouts/<int:workout_id>', methods=['DELETE'])
def delete_workout(workout_id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        workout = Workout.query.filter_by(id=workout_id, user_id=user.id).first()
        if not workout:
            return jsonify({'error': 'Workout not found'}), 404
        
        db.session.delete(workout)
        db.session.commit()
        
        return jsonify({'message': 'Workout deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete workout', 'details': str(e)}), 500

@workout_bp.route('/workouts/<int:workout_id>/analyze', methods=['POST'])
def analyze_workout_feedback(workout_id):
    """Analyze workout feedback and provide recommendations"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        workout = Workout.query.filter_by(id=workout_id, user_id=user.id).first()
        if not workout:
            return jsonify({'error': 'Workout not found'}), 404
        
        # Get the most recent session for this workout
        session = WorkoutSession.query.filter_by(
            user_id=user.id, 
            workout_id=workout_id,
            status='completed'
        ).order_by(WorkoutSession.completed_at.desc()).first()
        
        if not session:
            return jsonify({'error': 'No completed session found for this workout'}), 404
        
        # Analyze feedback using AI engine
        ai_generator = AIWorkoutGenerator()
        feedback_analysis = ai_generator.analyze_workout_feedback(session)
        modifications = ai_generator.suggest_workout_modifications(workout, feedback_analysis)
        
        return jsonify({
            'analysis': feedback_analysis,
            'suggested_modifications': modifications,
            'session_id': session.id
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to analyze workout feedback', 'details': str(e)}), 500

@workout_bp.route('/exercise-templates', methods=['GET'])
def get_exercise_templates():
    try:
        category = request.args.get('category')
        difficulty = request.args.get('difficulty')
        
        query = ExerciseTemplate.query
        
        if category:
            query = query.filter_by(category=category)
        if difficulty:
            query = query.filter_by(difficulty_level=difficulty)
        
        templates = query.all()
        
        return jsonify({
            'templates': [template.to_dict() for template in templates]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get exercise templates', 'details': str(e)}), 500

