import pytest
import json
from unittest.mock import patch, MagicMock
from src.models.workout import Workout, ExerciseTemplate, db
from src.models.session import WorkoutSession
from src.models.calendar import CalendarEvent

class TestWorkoutFlow:
    """Integration tests for complete workout flow."""
    
    def test_complete_workout_creation_flow(self, client, auth_headers, test_user_with_profile):
        """Test complete flow from AI generation to workout creation."""
        # Step 1: Generate AI workout
        generation_data = {
            'workout_type': 'strength',
            'duration_minutes': 45,
            'difficulty_level': 'intermediate',
            'target_muscle_groups': ['chest', 'back'],
            'available_equipment': ['dumbbells', 'barbell']
        }
        
        response = client.post('/api/workouts/generate', 
                             json=generation_data, headers=auth_headers)
        
        assert response.status_code == 200
        ai_workout = response.get_json()['workout']
        
        # Step 2: Create workout from AI generation
        workout_data = {
            'name': ai_workout['name'],
            'description': ai_workout['description'],
            'workout_type': ai_workout['workout_type'],
            'difficulty_level': ai_workout['difficulty_level'],
            'estimated_duration': ai_workout['estimated_duration'],
            'target_muscle_groups': ai_workout['target_muscle_groups'],
            'exercises': ai_workout['exercises']
        }
        
        response = client.post('/api/workouts', json=workout_data, headers=auth_headers)
        
        assert response.status_code == 201
        created_workout = response.get_json()['workout']
        workout_id = created_workout['id']
        
        # Step 3: Verify workout was created correctly
        response = client.get(f'/api/workouts/{workout_id}', headers=auth_headers)
        
        assert response.status_code == 200
        workout_details = response.get_json()['workout']
        assert workout_details['name'] == ai_workout['name']
        assert len(workout_details['exercises']) > 0
        
        # Step 4: Start workout session
        session_data = {
            'workout_id': workout_id,
            'notes': 'Starting my workout session'
        }
        
        response = client.post('/api/sessions', json=session_data, headers=auth_headers)
        
        assert response.status_code == 201
        session = response.get_json()['session']
        session_id = session['id']
        
        # Step 5: Log exercise performance
        exercise_id = workout_details['exercises'][0]['id']
        performance_data = {
            'exercise_id': exercise_id,
            'sets_completed': 3,
            'reps_completed': [12, 10, 8],
            'weight_used': 50.0,
            'rest_time_seconds': 60,
            'notes': 'Felt strong today'
        }
        
        response = client.post(f'/api/sessions/{session_id}/exercises', 
                             json=performance_data, headers=auth_headers)
        
        assert response.status_code == 201
        
        # Step 6: Complete workout session
        completion_data = {
            'notes': 'Great workout!',
            'rating': 4
        }
        
        response = client.put(f'/api/sessions/{session_id}/complete', 
                            json=completion_data, headers=auth_headers)
        
        assert response.status_code == 200
        completed_session = response.get_json()['session']
        assert completed_session['status'] == 'completed'
        
        # Step 7: Verify session appears in history
        response = client.get('/api/sessions', headers=auth_headers)
        
        assert response.status_code == 200
        sessions = response.get_json()['sessions']
        assert len(sessions) == 1
        assert sessions[0]['id'] == session_id
    
    @patch('src.services.calendar_service.CalendarService.create_workout_event')
    def test_workout_with_calendar_integration(self, mock_calendar, client, auth_headers, 
                                             test_user_with_profile, test_calendar_integration):
        """Test workout creation with calendar integration."""
        mock_calendar.return_value = {
            'google': {'success': True, 'event_id': 'test_event_id'}
        }
        
        # Create workout
        workout_data = {
            'name': 'Scheduled Workout',
            'description': 'A workout with calendar integration',
            'workout_type': 'cardio',
            'difficulty_level': 'beginner',
            'estimated_duration': 30,
            'target_muscle_groups': ['legs']
        }
        
        response = client.post('/api/workouts', json=workout_data, headers=auth_headers)
        assert response.status_code == 201
        workout = response.get_json()['workout']
        
        # Schedule workout in calendar
        calendar_data = {
            'workout': workout,
            'start_time': '2024-01-15T10:00:00Z',
            'duration_minutes': 30
        }
        
        response = client.post('/api/calendar/create-event', 
                             json=calendar_data, headers=auth_headers)
        
        assert response.status_code == 200
        results = response.get_json()['results']
        assert results['google']['success'] is True
        
        # Verify calendar service was called
        mock_calendar.assert_called_once()
    
    def test_subscription_feature_access_flow(self, client, auth_headers, test_user):
        """Test feature access based on subscription level."""
        # Check feature access with free plan (should be created automatically)
        feature_data = {'feature': 'ai_generation'}
        
        response = client.post('/api/payment/check-feature-access', 
                             json=feature_data, headers=auth_headers)
        
        assert response.status_code == 200
        access_data = response.get_json()
        assert access_data['plan_type'] == 'free'
        assert access_data['has_access'] is False  # Free plan doesn't have AI generation
        
        # Try to generate AI workout with free plan
        generation_data = {
            'workout_type': 'strength',
            'duration_minutes': 30
        }
        
        response = client.post('/api/workouts/generate', 
                             json=generation_data, headers=auth_headers)
        
        # Should still work but with limited features
        assert response.status_code == 200
    
    def test_user_profile_workout_customization(self, client, auth_headers, test_user):
        """Test workout customization based on user profile."""
        # Create user profile
        profile_data = {
            'age': 30,
            'gender': 'female',
            'height_cm': 165,
            'weight_kg': 60,
            'fitness_level': 'beginner',
            'primary_goal': 'weight_loss',
            'workout_frequency': 3,
            'available_equipment': ['resistance_bands', 'yoga_mat']
        }
        
        response = client.post('/api/profile', json=profile_data, headers=auth_headers)
        assert response.status_code == 201
        
        # Generate workout based on profile
        generation_data = {
            'workout_type': 'cardio',
            'duration_minutes': 30
        }
        
        response = client.post('/api/workouts/generate', 
                             json=generation_data, headers=auth_headers)
        
        assert response.status_code == 200
        workout = response.get_json()['workout']
        
        # Verify workout is customized for beginner level
        assert workout['difficulty_level'] == 'beginner'
        
        # Verify exercises use available equipment
        for exercise in workout['exercises']:
            if exercise.get('equipment_needed'):
                assert any(eq in ['resistance_bands', 'yoga_mat', 'bodyweight'] 
                          for eq in exercise['equipment_needed'])
    
    def test_workout_statistics_and_progress(self, client, auth_headers, test_user_with_profile):
        """Test workout statistics and progress tracking."""
        # Create multiple workout sessions
        for i in range(3):
            # Create workout
            workout_data = {
                'name': f'Test Workout {i+1}',
                'description': f'Workout number {i+1}',
                'workout_type': 'strength',
                'difficulty_level': 'intermediate',
                'estimated_duration': 45
            }
            
            response = client.post('/api/workouts', json=workout_data, headers=auth_headers)
            workout_id = response.get_json()['workout']['id']
            
            # Create session
            session_data = {'workout_id': workout_id}
            response = client.post('/api/sessions', json=session_data, headers=auth_headers)
            session_id = response.get_json()['session']['id']
            
            # Complete session
            completion_data = {'rating': 4 + i % 2}  # Varying ratings
            response = client.put(f'/api/sessions/{session_id}/complete', 
                                json=completion_data, headers=auth_headers)
            assert response.status_code == 200
        
        # Get workout statistics
        response = client.get('/api/workouts/statistics', headers=auth_headers)
        
        assert response.status_code == 200
        stats = response.get_json()['statistics']
        assert stats['total_workouts'] == 3
        assert stats['completed_sessions'] == 3
        assert 'average_rating' in stats
        
        # Get session history
        response = client.get('/api/sessions', headers=auth_headers)
        
        assert response.status_code == 200
        sessions = response.get_json()['sessions']
        assert len(sessions) == 3
        assert all(s['status'] == 'completed' for s in sessions)
    
    def test_equipment_based_workout_filtering(self, client, auth_headers, test_user_with_profile):
        """Test workout generation based on available equipment."""
        # Update profile with specific equipment
        profile_update = {
            'available_equipment': ['dumbbells', 'pull_up_bar']
        }
        
        response = client.put('/api/profile', json=profile_update, headers=auth_headers)
        assert response.status_code == 200
        
        # Generate workout
        generation_data = {
            'workout_type': 'strength',
            'duration_minutes': 45,
            'available_equipment': ['dumbbells', 'pull_up_bar']
        }
        
        response = client.post('/api/workouts/generate', 
                             json=generation_data, headers=auth_headers)
        
        assert response.status_code == 200
        workout = response.get_json()['workout']
        
        # Verify exercises use only available equipment
        for exercise in workout['exercises']:
            if exercise.get('equipment_needed'):
                for equipment in exercise['equipment_needed']:
                    assert equipment in ['dumbbells', 'pull_up_bar', 'bodyweight', 'none']

