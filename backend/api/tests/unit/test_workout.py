import pytest
import json
from src.models.workout import Workout, ExerciseTemplate, db

class TestWorkoutEndpoints:
    """Test workout management endpoints."""
    
    def test_get_workouts_success(self, client, auth_headers, test_workout):
        """Test getting user's workouts."""
        response = client.get('/api/workouts', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert len(data['workouts']) == 1
        assert data['workouts'][0]['name'] == 'Test Workout'
    
    def test_get_workouts_without_auth(self, client):
        """Test getting workouts without authentication."""
        response = client.get('/api/workouts')
        
        assert response.status_code == 401
    
    def test_get_workout_by_id_success(self, client, auth_headers, test_workout):
        """Test getting specific workout by ID."""
        response = client.get(f'/api/workouts/{test_workout.id}', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['workout']['name'] == 'Test Workout'
        assert data['workout']['id'] == test_workout.id
    
    def test_get_workout_not_found(self, client, auth_headers):
        """Test getting non-existent workout."""
        response = client.get('/api/workouts/999', headers=auth_headers)
        
        assert response.status_code == 404
        data = response.get_json()
        assert data['success'] is False
    
    def test_create_workout_success(self, client, auth_headers, test_exercise_template):
        """Test creating a new workout."""
        workout_data = {
            'name': 'New Test Workout',
            'description': 'A newly created workout',
            'workout_type': 'cardio',
            'difficulty_level': 'beginner',
            'estimated_duration': 30,
            'target_muscle_groups': ['legs', 'core'],
            'exercises': [
                {
                    'exercise_template_id': test_exercise_template.id,
                    'sets': 3,
                    'reps': 15,
                    'rest_seconds': 60,
                    'notes': 'Focus on form'
                }
            ]
        }
        
        response = client.post('/api/workouts', json=workout_data, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert data['workout']['name'] == 'New Test Workout'
        assert len(data['workout']['exercises']) == 1
        
        # Verify workout was created in database
        workout = Workout.query.filter_by(name='New Test Workout').first()
        assert workout is not None
    
    def test_create_workout_missing_fields(self, client, auth_headers):
        """Test creating workout with missing required fields."""
        workout_data = {
            'description': 'Missing name field'
        }
        
        response = client.post('/api/workouts', json=workout_data, headers=auth_headers)
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
    
    def test_update_workout_success(self, client, auth_headers, test_workout):
        """Test updating an existing workout."""
        update_data = {
            'name': 'Updated Workout Name',
            'description': 'Updated description',
            'difficulty_level': 'advanced'
        }
        
        response = client.put(f'/api/workouts/{test_workout.id}', 
                            json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['workout']['name'] == 'Updated Workout Name'
        
        # Verify update in database
        updated_workout = Workout.query.get(test_workout.id)
        assert updated_workout.name == 'Updated Workout Name'
        assert updated_workout.difficulty_level == 'advanced'
    
    def test_update_workout_not_found(self, client, auth_headers):
        """Test updating non-existent workout."""
        update_data = {'name': 'Updated Name'}
        
        response = client.put('/api/workouts/999', 
                            json=update_data, headers=auth_headers)
        
        assert response.status_code == 404
        data = response.get_json()
        assert data['success'] is False
    
    def test_delete_workout_success(self, client, auth_headers, test_workout):
        """Test deleting a workout."""
        workout_id = test_workout.id
        
        response = client.delete(f'/api/workouts/{workout_id}', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        
        # Verify deletion in database
        deleted_workout = Workout.query.get(workout_id)
        assert deleted_workout is None
    
    def test_delete_workout_not_found(self, client, auth_headers):
        """Test deleting non-existent workout."""
        response = client.delete('/api/workouts/999', headers=auth_headers)
        
        assert response.status_code == 404
        data = response.get_json()
        assert data['success'] is False
    
    def test_generate_ai_workout_success(self, client, auth_headers, test_user_with_profile):
        """Test AI workout generation."""
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
        data = response.get_json()
        assert data['success'] is True
        assert 'workout' in data
        assert data['workout']['workout_type'] == 'strength'
    
    def test_generate_ai_workout_without_profile(self, client, auth_headers, test_user):
        """Test AI workout generation without user profile."""
        generation_data = {
            'workout_type': 'cardio',
            'duration_minutes': 30
        }
        
        response = client.post('/api/workouts/generate', 
                             json=generation_data, headers=auth_headers)
        
        # Should still work with default values
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
    
    def test_get_exercise_templates(self, client, auth_headers, test_exercise_template):
        """Test getting exercise templates."""
        response = client.get('/api/exercises/templates', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert len(data['templates']) >= 1
        assert any(t['name'] == 'Push-ups' for t in data['templates'])
    
    def test_search_exercise_templates(self, client, auth_headers, test_exercise_template):
        """Test searching exercise templates."""
        response = client.get('/api/exercises/templates?search=push', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert len(data['templates']) >= 1
        assert all('push' in t['name'].lower() for t in data['templates'])
    
    def test_filter_exercise_templates_by_category(self, client, auth_headers, test_exercise_template):
        """Test filtering exercise templates by category."""
        response = client.get('/api/exercises/templates?category=bodyweight', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert all(t['category'] == 'bodyweight' for t in data['templates'])
    
    def test_get_workout_statistics(self, client, auth_headers, test_workout):
        """Test getting workout statistics."""
        response = client.get('/api/workouts/statistics', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'total_workouts' in data['statistics']
        assert data['statistics']['total_workouts'] >= 1

