from flask import Blueprint, request, jsonify
from src.models.user import User, db
from src.models.profile import UserProfile
from datetime import datetime
import json

profile_bp = Blueprint('profile', __name__)

def get_current_user():
    """Helper function to get current user from token"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    return User.verify_token(token)

@profile_bp.route('/profile', methods=['GET'])
def get_profile():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        profile = UserProfile.query.filter_by(user_id=user.id).first()
        
        if not profile:
            return jsonify({
                'user': user.to_dict(),
                'profile': None,
                'message': 'Profile not created yet'
            }), 200
        
        return jsonify({
            'user': user.to_dict(),
            'profile': profile.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get profile', 'details': str(e)}), 500

@profile_bp.route('/profile', methods=['POST'])
def create_profile():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Check if profile already exists
        existing_profile = UserProfile.query.filter_by(user_id=user.id).first()
        if existing_profile:
            return jsonify({'error': 'Profile already exists. Use PUT to update.'}), 409
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['fitness_level', 'body_type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate enum values
        valid_fitness_levels = ['beginner', 'intermediate', 'advanced']
        valid_body_types = ['ectomorph', 'mesomorph', 'endomorph']
        
        if data['fitness_level'] not in valid_fitness_levels:
            return jsonify({'error': f'fitness_level must be one of: {valid_fitness_levels}'}), 400
        
        if data['body_type'] not in valid_body_types:
            return jsonify({'error': f'body_type must be one of: {valid_body_types}'}), 400
        
        # Create profile
        profile = UserProfile(
            user_id=user.id,
            fitness_level=data['fitness_level'],
            body_type=data['body_type'],
            height_cm=data.get('height_cm'),
            weight_kg=data.get('weight_kg'),
            gender=data.get('gender')
        )
        
        # Set JSON fields
        if data.get('fitness_goals'):
            profile.set_fitness_goals(data['fitness_goals'])
        
        if data.get('available_equipment'):
            profile.set_available_equipment(data['available_equipment'])
        
        if data.get('workout_preferences'):
            profile.set_workout_preferences(data['workout_preferences'])
        
        # Parse date of birth if provided
        if data.get('date_of_birth'):
            try:
                profile.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'date_of_birth must be in YYYY-MM-DD format'}), 400
        
        db.session.add(profile)
        db.session.commit()
        
        return jsonify({
            'message': 'Profile created successfully',
            'profile': profile.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create profile', 'details': str(e)}), 500

@profile_bp.route('/profile', methods=['PUT'])
def update_profile():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        profile = UserProfile.query.filter_by(user_id=user.id).first()
        if not profile:
            return jsonify({'error': 'Profile not found. Create one first.'}), 404
        
        data = request.get_json()
        
        # Validate enum values if provided
        if 'fitness_level' in data:
            valid_fitness_levels = ['beginner', 'intermediate', 'advanced']
            if data['fitness_level'] not in valid_fitness_levels:
                return jsonify({'error': f'fitness_level must be one of: {valid_fitness_levels}'}), 400
            profile.fitness_level = data['fitness_level']
        
        if 'body_type' in data:
            valid_body_types = ['ectomorph', 'mesomorph', 'endomorph']
            if data['body_type'] not in valid_body_types:
                return jsonify({'error': f'body_type must be one of: {valid_body_types}'}), 400
            profile.body_type = data['body_type']
        
        # Update other fields
        if 'height_cm' in data:
            profile.height_cm = data['height_cm']
        
        if 'weight_kg' in data:
            profile.weight_kg = data['weight_kg']
        
        if 'gender' in data:
            profile.gender = data['gender']
        
        # Update JSON fields
        if 'fitness_goals' in data:
            profile.set_fitness_goals(data['fitness_goals'])
        
        if 'available_equipment' in data:
            profile.set_available_equipment(data['available_equipment'])
        
        if 'workout_preferences' in data:
            profile.set_workout_preferences(data['workout_preferences'])
        
        # Update date of birth if provided
        if 'date_of_birth' in data:
            if data['date_of_birth']:
                try:
                    profile.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'error': 'date_of_birth must be in YYYY-MM-DD format'}), 400
            else:
                profile.date_of_birth = None
        
        profile.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'profile': profile.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile', 'details': str(e)}), 500

@profile_bp.route('/profile', methods=['DELETE'])
def delete_profile():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        profile = UserProfile.query.filter_by(user_id=user.id).first()
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
        
        db.session.delete(profile)
        db.session.commit()
        
        return jsonify({'message': 'Profile deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete profile', 'details': str(e)}), 500

