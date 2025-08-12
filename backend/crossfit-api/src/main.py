import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
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
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.errorhandler(404)
def not_found(error):
    return {'error': 'Not found'}, 404

@app.errorhandler(500)
def internal_error(error):
    return {'error': 'Internal server error'}, 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
