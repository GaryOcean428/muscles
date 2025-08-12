import pytest
import requests
import time
from datetime import datetime

# These tests assume the Flask server is running on localhost:5000
BASE_URL = 'http://localhost:5000/api'

class TestAPIEndpoints:
    """End-to-end tests for API endpoints."""
    
    @pytest.fixture(scope='class')
    def test_user_data(self):
        """Test user data for registration."""
        return {
            'email': f'e2e_test_{int(time.time())}@example.com',
            'password': 'testpassword123',
            'first_name': 'E2E',
            'last_name': 'Test'
        }
    
    @pytest.fixture(scope='class')
    def registered_user(self, test_user_data):
        """Register a test user and return auth token."""
        response = requests.post(f'{BASE_URL}/auth/register', json=test_user_data)
        
        if response.status_code == 201:
            data = response.json()
            return {
                'token': data['access_token'],
                'user': data['user'],
                'email': test_user_data['email'],
                'password': test_user_data['password']
            }
        else:
            pytest.skip(f"Failed to register test user: {response.text}")
    
    def test_health_check(self):
        """Test API health check endpoint."""
        try:
            response = requests.get(f'{BASE_URL}/../')
            assert response.status_code == 200
            
            data = response.json()
            assert data['status'] == 'healthy'
        except requests.exceptions.ConnectionError:
            pytest.skip("API server is not running")
    
    def test_user_registration_flow(self, test_user_data):
        """Test complete user registration flow."""
        try:
            # Register new user
            response = requests.post(f'{BASE_URL}/auth/register', json=test_user_data)
            
            assert response.status_code == 201
            data = response.json()
            assert data['success'] is True
            assert 'access_token' in data
            assert data['user']['email'] == test_user_data['email']
            
            # Try to register same user again (should fail)
            response = requests.post(f'{BASE_URL}/auth/register', json=test_user_data)
            assert response.status_code == 400
            
        except requests.exceptions.ConnectionError:
            pytest.skip("API server is not running")
    
    def test_user_login_flow(self, registered_user):
        """Test user login flow."""
        try:
            # Login with correct credentials
            login_data = {
                'email': registered_user['email'],
                'password': registered_user['password']
            }
            
            response = requests.post(f'{BASE_URL}/auth/login', json=login_data)
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            assert 'access_token' in data
            
            # Login with incorrect password
            wrong_login_data = {
                'email': registered_user['email'],
                'password': 'wrongpassword'
            }
            
            response = requests.post(f'{BASE_URL}/auth/login', json=wrong_login_data)
            assert response.status_code == 401
            
        except requests.exceptions.ConnectionError:
            pytest.skip("API server is not running")
    
    def test_protected_endpoint_access(self, registered_user):
        """Test access to protected endpoints."""
        try:
            headers = {'Authorization': f'Bearer {registered_user["token"]}'}
            
            # Access protected endpoint with valid token
            response = requests.get(f'{BASE_URL}/auth/me', headers=headers)
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            assert data['user']['email'] == registered_user['email']
            
            # Access protected endpoint without token
            response = requests.get(f'{BASE_URL}/auth/me')
            assert response.status_code == 401
            
            # Access protected endpoint with invalid token
            invalid_headers = {'Authorization': 'Bearer invalid_token'}
            response = requests.get(f'{BASE_URL}/auth/me', headers=invalid_headers)
            assert response.status_code == 422  # JWT decode error
            
        except requests.exceptions.ConnectionError:
            pytest.skip("API server is not running")
    
    def test_user_profile_management(self, registered_user):
        """Test user profile creation and management."""
        try:
            headers = {'Authorization': f'Bearer {registered_user["token"]}'}
            
            # Create user profile
            profile_data = {
                'age': 25,
                'gender': 'male',
                'height_cm': 175,
                'weight_kg': 70,
                'fitness_level': 'intermediate',
                'primary_goal': 'muscle_gain',
                'workout_frequency': 4,
                'available_equipment': ['dumbbells', 'barbell']
            }
            
            response = requests.post(f'{BASE_URL}/profile', json=profile_data, headers=headers)
            
            assert response.status_code == 201
            data = response.json()
            assert data['success'] is True
            assert data['profile']['age'] == 25
            
            # Get user profile
            response = requests.get(f'{BASE_URL}/profile', headers=headers)
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            assert data['profile']['fitness_level'] == 'intermediate'
            
            # Update user profile
            update_data = {
                'age': 26,
                'fitness_level': 'advanced'
            }
            
            response = requests.put(f'{BASE_URL}/profile', json=update_data, headers=headers)
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            assert data['profile']['age'] == 26
            assert data['profile']['fitness_level'] == 'advanced'
            
        except requests.exceptions.ConnectionError:
            pytest.skip("API server is not running")
    
    def test_workout_management_flow(self, registered_user):
        """Test workout creation and management."""
        try:
            headers = {'Authorization': f'Bearer {registered_user["token"]}'}
            
            # Create workout
            workout_data = {
                'name': 'E2E Test Workout',
                'description': 'A workout created during E2E testing',
                'workout_type': 'strength',
                'difficulty_level': 'intermediate',
                'estimated_duration': 45,
                'target_muscle_groups': ['chest', 'triceps']
            }
            
            response = requests.post(f'{BASE_URL}/workouts', json=workout_data, headers=headers)
            
            assert response.status_code == 201
            data = response.json()
            assert data['success'] is True
            workout_id = data['workout']['id']
            
            # Get all workouts
            response = requests.get(f'{BASE_URL}/workouts', headers=headers)
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            assert len(data['workouts']) >= 1
            
            # Get specific workout
            response = requests.get(f'{BASE_URL}/workouts/{workout_id}', headers=headers)
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            assert data['workout']['name'] == 'E2E Test Workout'
            
            # Update workout
            update_data = {
                'name': 'Updated E2E Test Workout',
                'difficulty_level': 'advanced'
            }
            
            response = requests.put(f'{BASE_URL}/workouts/{workout_id}', 
                                  json=update_data, headers=headers)
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            assert data['workout']['name'] == 'Updated E2E Test Workout'
            
            # Delete workout
            response = requests.delete(f'{BASE_URL}/workouts/{workout_id}', headers=headers)
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            
        except requests.exceptions.ConnectionError:
            pytest.skip("API server is not running")
    
    def test_subscription_management(self, registered_user):
        """Test subscription and payment endpoints."""
        try:
            headers = {'Authorization': f'Bearer {registered_user["token"]}'}
            
            # Get subscription plans
            response = requests.get(f'{BASE_URL}/payment/plans')
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            assert 'premium' in data['plans']
            assert 'pro' in data['plans']
            
            # Get user subscription (should create free plan)
            response = requests.get(f'{BASE_URL}/payment/subscription', headers=headers)
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            assert data['subscription']['plan_type'] == 'free'
            
            # Check feature access
            feature_data = {'feature': 'ai_generation'}
            response = requests.post(f'{BASE_URL}/payment/check-feature-access', 
                                   json=feature_data, headers=headers)
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            assert 'has_access' in data
            
            # Get payment history
            response = requests.get(f'{BASE_URL}/payment/payment-history', headers=headers)
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            assert isinstance(data['payments'], list)
            
        except requests.exceptions.ConnectionError:
            pytest.skip("API server is not running")
    
    def test_calendar_integration_endpoints(self, registered_user):
        """Test calendar integration endpoints."""
        try:
            headers = {'Authorization': f'Bearer {registered_user["token"]}'}
            
            # Get calendar integrations
            response = requests.get(f'{BASE_URL}/calendar/integrations', headers=headers)
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            assert isinstance(data['integrations'], list)
            
            # Get sync status
            response = requests.get(f'{BASE_URL}/calendar/sync-status', headers=headers)
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] is True
            assert 'sync_status' in data
            
        except requests.exceptions.ConnectionError:
            pytest.skip("API server is not running")
    
    def test_error_handling(self):
        """Test API error handling."""
        try:
            # Test 404 for non-existent endpoint
            response = requests.get(f'{BASE_URL}/nonexistent')
            assert response.status_code == 404
            
            # Test 400 for malformed request
            response = requests.post(f'{BASE_URL}/auth/login', json={'invalid': 'data'})
            assert response.status_code == 400
            
        except requests.exceptions.ConnectionError:
            pytest.skip("API server is not running")

