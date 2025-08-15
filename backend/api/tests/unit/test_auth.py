import pytest
import json
from src.models.user import User, db

class TestAuthEndpoints:
    """Test authentication endpoints."""
    
    def test_register_success(self, client):
        """Test successful user registration."""
        response = client.post('/api/auth/register', json={
            'email': 'newuser@example.com',
            'password': 'newpassword123',
            'first_name': 'New',
            'last_name': 'User'
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert 'access_token' in data
        assert data['user']['email'] == 'newuser@example.com'
        
        # Verify user was created in database
        user = User.query.filter_by(email='newuser@example.com').first()
        assert user is not None
        assert user.first_name == 'New'
        assert user.last_name == 'User'
    
    def test_register_duplicate_email(self, client, test_user):
        """Test registration with duplicate email."""
        response = client.post('/api/auth/register', json={
            'email': 'test@example.com',  # Same as test_user
            'password': 'newpassword123',
            'first_name': 'Another',
            'last_name': 'User'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'already exists' in data['error']
    
    def test_register_missing_fields(self, client):
        """Test registration with missing required fields."""
        response = client.post('/api/auth/register', json={
            'email': 'incomplete@example.com',
            'password': 'password123'
            # Missing first_name and last_name
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
    
    def test_register_weak_password(self, client):
        """Test registration with weak password."""
        response = client.post('/api/auth/register', json={
            'email': 'weakpass@example.com',
            'password': '123',  # Too short
            'first_name': 'Weak',
            'last_name': 'Password'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'password' in data['error'].lower()
    
    def test_login_success(self, client, test_user):
        """Test successful login."""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'testpassword123'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'access_token' in data
        assert data['user']['email'] == 'test@example.com'
    
    def test_login_invalid_email(self, client):
        """Test login with invalid email."""
        response = client.post('/api/auth/login', json={
            'email': 'nonexistent@example.com',
            'password': 'password123'
        })
        
        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False
        assert 'invalid' in data['error'].lower()
    
    def test_login_invalid_password(self, client, test_user):
        """Test login with invalid password."""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'wrongpassword'
        })
        
        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False
        assert 'invalid' in data['error'].lower()
    
    def test_login_missing_fields(self, client):
        """Test login with missing fields."""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com'
            # Missing password
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
    
    def test_logout_success(self, client, auth_headers):
        """Test successful logout."""
        response = client.post('/api/auth/logout', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'logged out' in data['message'].lower()
    
    def test_logout_without_token(self, client):
        """Test logout without authentication token."""
        response = client.post('/api/auth/logout')
        
        assert response.status_code == 401
    
    def test_refresh_token_success(self, client, auth_headers):
        """Test successful token refresh."""
        response = client.post('/api/auth/refresh', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'access_token' in data
    
    def test_refresh_token_without_auth(self, client):
        """Test token refresh without authentication."""
        response = client.post('/api/auth/refresh')
        
        assert response.status_code == 401
    
    def test_get_current_user(self, client, auth_headers, test_user):
        """Test getting current user information."""
        response = client.get('/api/auth/me', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['user']['email'] == test_user.email
        assert data['user']['first_name'] == test_user.first_name
    
    def test_get_current_user_without_auth(self, client):
        """Test getting current user without authentication."""
        response = client.get('/api/auth/me')
        
        assert response.status_code == 401

