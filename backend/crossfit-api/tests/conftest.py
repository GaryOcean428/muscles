import pytest
import os
import sys
import tempfile
from datetime import datetime

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from src.main import app
from src.models.user import db, User
from src.models.profile import UserProfile
from src.models.workout import Workout, ExerciseTemplate
from src.models.subscription import Subscription
from src.models.calendar import CalendarIntegration

@pytest.fixture
def client():
    """Create a test client for the Flask application."""
    # Create a temporary database file
    db_fd, app.config['DATABASE'] = tempfile.mkstemp()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['JWT_SECRET_KEY'] = 'test-jwt-secret'
    app.config['SECRET_KEY'] = 'test-secret-key'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()
    
    os.close(db_fd)
    os.unlink(app.config['DATABASE'])

@pytest.fixture
def test_user(client):
    """Create a test user."""
    user = User(
        email='test@example.com',
        first_name='Test',
        last_name='User'
    )
    user.set_password('testpassword123')
    db.session.add(user)
    db.session.commit()
    return user

@pytest.fixture
def test_user_with_profile(client, test_user):
    """Create a test user with profile."""
    profile = UserProfile(
        user_id=test_user.id,
        age=25,
        gender='male',
        height_cm=175,
        weight_kg=70,
        fitness_level='intermediate',
        primary_goal='muscle_gain',
        workout_frequency=4,
        available_equipment=['dumbbells', 'barbell', 'pull_up_bar']
    )
    db.session.add(profile)
    db.session.commit()
    return test_user

@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers for test user."""
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'testpassword123'
    })
    token = response.get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture
def test_exercise_template(client):
    """Create a test exercise template."""
    exercise = ExerciseTemplate(
        name='Push-ups',
        category='bodyweight',
        muscle_groups=['chest', 'triceps', 'shoulders'],
        equipment_needed=[],
        difficulty_level='beginner',
        instructions='Start in plank position, lower body to ground, push back up',
        tips='Keep core tight, maintain straight line from head to heels'
    )
    db.session.add(exercise)
    db.session.commit()
    return exercise

@pytest.fixture
def test_workout(client, test_user, test_exercise_template):
    """Create a test workout."""
    workout = Workout(
        user_id=test_user.id,
        name='Test Workout',
        description='A test workout for unit testing',
        workout_type='strength',
        difficulty_level='intermediate',
        estimated_duration=45,
        target_muscle_groups=['chest', 'triceps']
    )
    db.session.add(workout)
    db.session.commit()
    return workout

@pytest.fixture
def test_subscription(client, test_user):
    """Create a test subscription."""
    subscription = Subscription(
        user_id=test_user.id,
        plan_type='premium',
        status='active'
    )
    db.session.add(subscription)
    db.session.commit()
    return subscription

@pytest.fixture
def test_calendar_integration(client, test_user):
    """Create a test calendar integration."""
    integration = CalendarIntegration(
        user_id=test_user.id,
        provider='google',
        access_token='test_access_token',
        refresh_token='test_refresh_token',
        is_active=True
    )
    db.session.add(integration)
    db.session.commit()
    return integration

