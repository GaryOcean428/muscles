#!/usr/bin/env python3
"""
Seed data script to populate the database with exercise templates and equipment templates
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.user import db
from src.models.workout import ExerciseTemplate
from src.models.equipment import EquipmentTemplate
from src.main import app
import json

def create_exercise_templates():
    """Create exercise templates"""
    
    exercises = [
        # Cardio Exercises
        {
            'name': 'Burpees',
            'category': 'cardio',
            'muscle_groups': json.dumps(['full_body', 'core', 'legs', 'chest']),
            'equipment_required': 'none',
            'difficulty_level': 'intermediate',
            'description': 'Full-body exercise combining squat, plank, and jump',
            'instructions': '1. Start standing\n2. Drop to squat position\n3. Jump back to plank\n4. Do push-up\n5. Jump feet to squat\n6. Jump up with arms overhead',
            'video_url': '',
            'image_url': ''
        },
        {
            'name': 'Mountain Climbers',
            'category': 'cardio',
            'muscle_groups': json.dumps(['core', 'shoulders', 'legs']),
            'equipment_required': 'none',
            'difficulty_level': 'beginner',
            'description': 'High-intensity cardio exercise in plank position',
            'instructions': '1. Start in plank position\n2. Bring right knee to chest\n3. Switch legs quickly\n4. Keep core tight\n5. Maintain steady rhythm',
            'video_url': '',
            'image_url': ''
        },
        {
            'name': 'Jumping Jacks',
            'category': 'cardio',
            'muscle_groups': json.dumps(['legs', 'shoulders', 'core']),
            'equipment_required': 'none',
            'difficulty_level': 'beginner',
            'description': 'Classic cardio exercise with jumping motion',
            'instructions': '1. Start with feet together, arms at sides\n2. Jump feet apart while raising arms overhead\n3. Jump back to starting position\n4. Maintain steady rhythm',
            'video_url': '',
            'image_url': ''
        },
        
        # Strength Exercises
        {
            'name': 'Push-ups',
            'category': 'strength',
            'muscle_groups': json.dumps(['chest', 'shoulders', 'triceps', 'core']),
            'equipment_required': 'none',
            'difficulty_level': 'beginner',
            'description': 'Upper body strength exercise',
            'instructions': '1. Start in plank position\n2. Lower body until chest nearly touches floor\n3. Push back up to starting position\n4. Keep body straight throughout',
            'video_url': '',
            'image_url': ''
        },
        {
            'name': 'Squats',
            'category': 'strength',
            'muscle_groups': json.dumps(['legs', 'glutes', 'core']),
            'equipment_required': 'none',
            'difficulty_level': 'beginner',
            'description': 'Lower body strength exercise',
            'instructions': '1. Stand with feet shoulder-width apart\n2. Lower body as if sitting back into chair\n3. Keep chest up and knees behind toes\n4. Return to standing position',
            'video_url': '',
            'image_url': ''
        },
        {
            'name': 'Deadlifts',
            'category': 'strength',
            'muscle_groups': json.dumps(['back', 'legs', 'glutes', 'core']),
            'equipment_required': 'barbell',
            'difficulty_level': 'intermediate',
            'description': 'Compound strength exercise for posterior chain',
            'instructions': '1. Stand with feet hip-width apart\n2. Grip barbell with hands outside legs\n3. Keep back straight, lift by extending hips and knees\n4. Stand tall, then lower with control',
            'video_url': '',
            'image_url': ''
        },
        {
            'name': 'Pull-ups',
            'category': 'strength',
            'muscle_groups': json.dumps(['back', 'biceps', 'shoulders']),
            'equipment_required': 'pull-up bar',
            'difficulty_level': 'intermediate',
            'description': 'Upper body pulling exercise',
            'instructions': '1. Hang from bar with overhand grip\n2. Pull body up until chin clears bar\n3. Lower with control to full extension\n4. Avoid swinging or kipping',
            'video_url': '',
            'image_url': ''
        },
        
        # Plyometric Exercises
        {
            'name': 'Jump Squats',
            'category': 'plyometric',
            'muscle_groups': json.dumps(['legs', 'glutes', 'core']),
            'equipment_required': 'none',
            'difficulty_level': 'intermediate',
            'description': 'Explosive lower body exercise',
            'instructions': '1. Start in squat position\n2. Jump up explosively\n3. Land softly back in squat\n4. Minimize ground contact time',
            'video_url': '',
            'image_url': ''
        },
        {
            'name': 'Box Jumps',
            'category': 'plyometric',
            'muscle_groups': json.dumps(['legs', 'glutes', 'core']),
            'equipment_required': 'box',
            'difficulty_level': 'intermediate',
            'description': 'Explosive jumping exercise onto elevated surface',
            'instructions': '1. Stand facing box\n2. Jump onto box with both feet\n3. Stand fully on box\n4. Step down carefully',
            'video_url': '',
            'image_url': ''
        },
        
        # Core Exercises
        {
            'name': 'Plank',
            'category': 'core',
            'muscle_groups': json.dumps(['core', 'shoulders', 'back']),
            'equipment_required': 'none',
            'difficulty_level': 'beginner',
            'description': 'Isometric core strengthening exercise',
            'instructions': '1. Start in push-up position\n2. Hold body straight from head to heels\n3. Keep core tight\n4. Breathe normally',
            'video_url': '',
            'image_url': ''
        },
        {
            'name': 'Russian Twists',
            'category': 'core',
            'muscle_groups': json.dumps(['core', 'obliques']),
            'equipment_required': 'none',
            'difficulty_level': 'beginner',
            'description': 'Rotational core exercise',
            'instructions': '1. Sit with knees bent, feet off ground\n2. Lean back slightly\n3. Rotate torso side to side\n4. Keep chest up',
            'video_url': '',
            'image_url': ''
        },
        
        # CrossFit Specific
        {
            'name': 'Thrusters',
            'category': 'strength',
            'muscle_groups': json.dumps(['legs', 'shoulders', 'core']),
            'equipment_required': 'barbell',
            'difficulty_level': 'advanced',
            'description': 'Compound movement combining squat and overhead press',
            'instructions': '1. Start with barbell in front rack position\n2. Perform front squat\n3. Drive up and press bar overhead\n4. Lower bar to shoulders',
            'video_url': '',
            'image_url': ''
        },
        {
            'name': 'Wall Balls',
            'category': 'strength',
            'muscle_groups': json.dumps(['legs', 'shoulders', 'core']),
            'equipment_required': 'medicine ball',
            'difficulty_level': 'intermediate',
            'description': 'Functional movement throwing medicine ball to target',
            'instructions': '1. Hold medicine ball at chest\n2. Squat down\n3. Drive up and throw ball to wall target\n4. Catch ball and repeat',
            'video_url': '',
            'image_url': ''
        },
        {
            'name': 'Kettlebell Swings',
            'category': 'strength',
            'muscle_groups': json.dumps(['glutes', 'hamstrings', 'core', 'shoulders']),
            'equipment_required': 'kettlebell',
            'difficulty_level': 'intermediate',
            'description': 'Hip-hinge movement with kettlebell',
            'instructions': '1. Stand with feet shoulder-width apart\n2. Hold kettlebell with both hands\n3. Hinge at hips and swing bell between legs\n4. Drive hips forward to swing bell to chest level',
            'video_url': '',
            'image_url': ''
        }
    ]
    
    for exercise_data in exercises:
        # Check if exercise already exists
        existing = ExerciseTemplate.query.filter_by(name=exercise_data['name']).first()
        if not existing:
            exercise = ExerciseTemplate(**exercise_data)
            db.session.add(exercise)
    
    print(f"Added {len(exercises)} exercise templates")

def create_equipment_templates():
    """Create equipment templates"""
    
    equipment = [
        # Weights
        {
            'name': 'Barbell',
            'category': 'weights',
            'description': 'Long bar for heavy lifting exercises',
            'typical_exercises': json.dumps(['deadlifts', 'squats', 'bench press', 'rows', 'overhead press']),
            'image_url': ''
        },
        {
            'name': 'Dumbbells',
            'category': 'weights',
            'description': 'Handheld weights for unilateral training',
            'typical_exercises': json.dumps(['bicep curls', 'shoulder press', 'lunges', 'chest press']),
            'image_url': ''
        },
        {
            'name': 'Kettlebell',
            'category': 'weights',
            'description': 'Cast iron weight with handle for dynamic movements',
            'typical_exercises': json.dumps(['swings', 'turkish get-ups', 'goblet squats', 'snatches']),
            'image_url': ''
        },
        
        # Cardio Equipment
        {
            'name': 'Treadmill',
            'category': 'cardio',
            'description': 'Motorized running/walking machine',
            'typical_exercises': json.dumps(['running', 'walking', 'sprints', 'incline walking']),
            'image_url': ''
        },
        {
            'name': 'Rowing Machine',
            'category': 'cardio',
            'description': 'Full-body cardio machine simulating rowing',
            'typical_exercises': json.dumps(['rowing intervals', 'steady state rowing', 'rowing sprints']),
            'image_url': ''
        },
        {
            'name': 'Jump Rope',
            'category': 'cardio',
            'description': 'Rope for jumping cardio exercise',
            'typical_exercises': json.dumps(['single unders', 'double unders', 'jump rope intervals']),
            'image_url': ''
        },
        
        # Bodyweight Equipment
        {
            'name': 'Pull-up Bar',
            'category': 'bodyweight',
            'description': 'Bar for hanging and pulling exercises',
            'typical_exercises': json.dumps(['pull-ups', 'chin-ups', 'hanging leg raises', 'muscle-ups']),
            'image_url': ''
        },
        {
            'name': 'Dip Station',
            'category': 'bodyweight',
            'description': 'Parallel bars for dipping exercises',
            'typical_exercises': json.dumps(['dips', 'L-sits', 'leg raises']),
            'image_url': ''
        },
        
        # Accessories
        {
            'name': 'Medicine Ball',
            'category': 'accessories',
            'description': 'Weighted ball for functional movements',
            'typical_exercises': json.dumps(['wall balls', 'slams', 'russian twists', 'throws']),
            'image_url': ''
        },
        {
            'name': 'Resistance Bands',
            'category': 'accessories',
            'description': 'Elastic bands for resistance training',
            'typical_exercises': json.dumps(['band pull-aparts', 'assisted pull-ups', 'band squats']),
            'image_url': ''
        },
        {
            'name': 'Foam Roller',
            'category': 'accessories',
            'description': 'Cylindrical tool for self-massage and recovery',
            'typical_exercises': json.dumps(['foam rolling', 'myofascial release', 'recovery']),
            'image_url': ''
        },
        
        # Machines
        {
            'name': 'Cable Machine',
            'category': 'machines',
            'description': 'Adjustable pulley system for various exercises',
            'typical_exercises': json.dumps(['cable rows', 'lat pulldowns', 'cable flyes', 'tricep pushdowns']),
            'image_url': ''
        },
        {
            'name': 'Leg Press Machine',
            'category': 'machines',
            'description': 'Machine for leg pressing movements',
            'typical_exercises': json.dumps(['leg press', 'calf raises', 'single leg press']),
            'image_url': ''
        }
    ]
    
    for equipment_data in equipment:
        # Check if equipment already exists
        existing = EquipmentTemplate.query.filter_by(name=equipment_data['name']).first()
        if not existing:
            equipment_item = EquipmentTemplate(**equipment_data)
            db.session.add(equipment_item)
    
    print(f"Added {len(equipment)} equipment templates")

def main():
    """Main function to seed the database"""
    with app.app_context():
        print("Starting database seeding...")
        
        # Create exercise templates
        create_exercise_templates()
        
        # Create equipment templates
        create_equipment_templates()
        
        # Commit all changes
        db.session.commit()
        
        print("Database seeding completed successfully!")

if __name__ == '__main__':
    main()

