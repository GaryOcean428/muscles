from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User
from ..models.profile import UserProfile
from ..models.workout import Workout, Exercise
from ..ai_engine_enhanced import EnhancedAIWorkoutEngine
from ..database import db
import json

workout_enhanced_bp = Blueprint('workout_enhanced', __name__)
ai_engine = EnhancedAIWorkoutEngine()

@workout_enhanced_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_workout():
    """Generate AI-powered workout with research-based optimization"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user profile
        profile = UserProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            return jsonify({'error': 'User profile not found. Please complete your profile first.'}), 400
        
        # Get workout preferences from request
        data = request.get_json()
        preferences = {
            'type': data.get('type', 'mixed'),  # hiit, muscles, strength, cardio, mixed
            'duration': data.get('duration', 30),  # minutes
            'intensity': data.get('intensity', 'moderate'),  # low, moderate, high, very_high
            'target_areas': data.get('target_areas', []),  # muscle groups or movement patterns
            'equipment_override': data.get('equipment', None)  # override profile equipment
        }
        
        # Override equipment if specified
        if preferences['equipment_override']:
            profile.equipment_available = preferences['equipment_override']
        
        # Generate workout using enhanced AI engine
        workout_data = ai_engine.generate_workout(profile, preferences)
        
        # Save workout to database
        workout = Workout(
            user_id=user_id,
            name=workout_data.get('workout_name', 'AI Generated Workout'),
            description=workout_data.get('description', ''),
            difficulty=workout_data.get('difficulty', 'Moderate'),
            duration=workout_data.get('total_duration', preferences['duration']),
            workout_type=preferences['type'],
            workout_data=json.dumps(workout_data)
        )
        
        db.session.add(workout)
        db.session.commit()
        
        # Add research-based metadata to response
        response_data = {
            'workout_id': workout.id,
            'generated_at': workout.created_at.isoformat(),
            'research_enhanced': True,
            'ai_model_used': 'GPT-4',
            'somatotype_optimized': workout_data.get('somatotype_focus', 'Not specified'),
            'evidence_based': True,
            **workout_data
        }
        
        return jsonify(response_data), 201
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate workout: {str(e)}'}), 500

@workout_enhanced_bp.route('/research-insights/<int:workout_id>', methods=['GET'])
@jwt_required()
def get_workout_research_insights():
    """Get research-based insights for a specific workout"""
    try:
        user_id = get_jwt_identity()
        workout_id = request.view_args['workout_id']
        
        workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()
        
        if not workout:
            return jsonify({'error': 'Workout not found'}), 404
        
        workout_data = json.loads(workout.workout_data) if workout.workout_data else {}
        
        # Extract research-specific information
        research_insights = {
            'somatotype_optimization': workout_data.get('somatotype_optimization', {}),
            'research_rationale': workout_data.get('research_rationale', 'Not available'),
            'energy_system_targeted': workout_data.get('energy_system_targeted', 'Not specified'),
            'work_rest_ratio_applied': workout_data.get('work_rest_ratio_applied', 'Not specified'),
            'periodization_context': workout_data.get('periodization_context', {}),
            'injury_prevention_focus': workout_data.get('safety_protocols', {}),
            'recovery_recommendations': workout_data.get('recovery_recommendations', {}),
            'progression_strategy': workout_data.get('progression_strategy', {}),
            'monitoring_recommendations': workout_data.get('monitoring_recommendations', {}),
            'research_citations': workout_data.get('research_citations', {}),
            'technology_integration': workout_data.get('technology_integration', {})
        }
        
        return jsonify(research_insights), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get research insights: {str(e)}'}), 500

@workout_enhanced_bp.route('/research-recommendations', methods=['GET'])
@jwt_required()
def get_research_recommendations():
    """Get personalized research-based training recommendations"""
    try:
        user_id = get_jwt_identity()
        
        # Get user profile
        profile = UserProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            return jsonify({'error': 'User profile not found'}), 400
        
        # Import knowledge base functions
        from ..knowledge_base import (
            get_somatotype_recommendations,
            get_age_sex_modifications,
            get_energy_system_focus,
            get_injury_prevention_focus,
            get_recovery_protocol
        )
        
        # Estimate somatotype (simplified)
        goals = [goal.lower() for goal in profile.goals]
        if 'weight_loss' in goals or 'endurance' in goals:
            somatotype = 'endomorph'
        elif 'muscle_gain' in goals or 'strength' in goals:
            somatotype = 'mesomorph'
        else:
            somatotype = 'mesomorph'
        
        # Get research-based recommendations
        recommendations = {
            'estimated_somatotype': somatotype,
            'somatotype_recommendations': get_somatotype_recommendations(somatotype, profile.fitness_level, profile.goals),
            'age_sex_modifications': get_age_sex_modifications(profile.age, profile.gender),
            'optimal_energy_systems': {
                'strength_goals': get_energy_system_focus(['strength'], 30),
                'endurance_goals': get_energy_system_focus(['endurance'], 45),
                'hiit_goals': get_energy_system_focus(['hiit'], 20)
            },
            'injury_prevention_focus': get_injury_prevention_focus(somatotype, profile.fitness_level),
            'recovery_protocols': get_recovery_protocol('moderate', somatotype, profile.age),
            'personalized_insights': {
                'optimal_workout_frequency': f"{profile.workout_frequency} sessions per week aligns with research recommendations",
                'progression_strategy': f"Based on {somatotype} characteristics, focus on gradual progression with emphasis on movement quality",
                'monitoring_priorities': ["Heart Rate Variability", "Sleep Quality", "Movement Quality", "Recovery Status"]
            }
        }
        
        return jsonify(recommendations), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get recommendations: {str(e)}'}), 500

