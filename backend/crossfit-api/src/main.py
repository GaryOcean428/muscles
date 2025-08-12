import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, send_file, jsonify
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.profile import profile_bp
from src.routes.workout import workout_bp
from src.routes.session import session_bp
from src.routes.equipment import equipment_bp
from src.routes.calendar import calendar_bp
from src.routes.payment import payment_bp

# Import all models to ensure they are registered with SQLAlchemy
from src.models.user import User
from src.models.profile import UserProfile
from src.models.workout import Workout, WorkoutExercise, ExerciseTemplate
from src.models.session import WorkoutSession, ExercisePerformance, PersonalRecord
from src.models.equipment import Equipment, EquipmentTemplate
from src.models.calendar import CalendarEvent, CalendarIntegration
from src.models.subscription import Subscription, PaymentHistory

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')

# Enable CORS for all routes
CORS(app, origins="*")

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(profile_bp, url_prefix='/api')
app.register_blueprint(workout_bp, url_prefix='/api')
app.register_blueprint(session_bp, url_prefix='/api')
app.register_blueprint(equipment_bp, url_prefix='/api')
app.register_blueprint(calendar_bp, url_prefix='/api/calendar')
app.register_blueprint(payment_bp, url_prefix='/api/payment')

# Database configuration
database_url = os.environ.get('DATABASE_URL')
if not database_url:
    # Try alternative environment variable names
    database_url = os.environ.get('DATABASE_PRIVATE_URL')
    
if database_url:
    # Railway PostgreSQL connection
    # Fix postgres:// to postgresql:// for SQLAlchemy compatibility
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    print(f"Using PostgreSQL database: {database_url[:50]}...")
else:
    # Fallback to SQLite for local development
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
    print(f"Using SQLite database: {db_path}")

# Redis configuration
redis_url = os.environ.get('REDIS_URL')
if redis_url:
    print(f"Redis configured: {redis_url[:50]}...")
else:
    print("Redis not configured - using in-memory cache")

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 300,
    'pool_timeout': 20,
    'max_overflow': 0
}

db.init_app(app)

# Initialize database tables
with app.app_context():
    try:
        # Test database connection first (SQLAlchemy 2.0 compatible)
        with db.engine.connect() as connection:
            connection.execute(db.text('SELECT 1'))
        db.create_all()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating database tables: {e}")
        # Don't fail the app startup if database creation fails
        pass

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'FitForge API is running',
        'database': 'connected',
        'version': '1.0.0'
    })

# Serve React frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    
    # If path starts with 'api/', let Flask handle it normally (will 404 if not found)
    if path.startswith('api/'):
        return {'error': 'API endpoint not found'}, 404
    
    # For static assets (js, css, images, etc.)
    if static_folder_path and path and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    
    # For all other routes, serve index.html (React Router will handle client-side routing)
    if static_folder_path:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_file(index_path)
    
    # Fallback: show API info if frontend not available
    return jsonify({
        'message': 'FitForge API is running',
        'status': 'Frontend not built yet',
        'api_endpoints': {
            'health': '/api/health',
            'auth': '/api/auth/*',
            'users': '/api/users',
            'workouts': '/api/workouts',
            'sessions': '/api/sessions',
            'equipment': '/api/equipment',
            'calendar': '/api/calendar/*',
            'payment': '/api/payment/*'
        },
        'note': 'Frontend will be available after successful build'
    })

@app.errorhandler(404)
def not_found(error):
    return {'error': 'Not found'}, 404

@app.errorhandler(500)
def internal_error(error):
    return {'error': 'Internal server error'}, 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
