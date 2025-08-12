import openai
import json
import os
from typing import Dict, List, Any
from src.models.profile import UserProfile
from src.models.workout import Workout, WorkoutExercise
from src.models.session import WorkoutSession, ExercisePerformance
from src.models.user import db
from datetime import datetime, timedelta

class AIWorkoutGenerator:
    def __init__(self):
        # Use the pre-configured OpenAI API key
        openai.api_key = os.environ.get('OPENAI_API_KEY')
        if not openai.api_key:
            raise ValueError("OpenAI API key not found in environment variables")
    
    def generate_personalized_workout(self, user, profile: UserProfile, workout_type: str, 
                                    duration: int, focus_areas: List[str] = None,
                                    available_equipment: List[str] = None) -> Workout:
        """Generate a personalized workout using AI"""
        
        # Get user's workout history for better personalization
        workout_history = self._get_user_workout_history(user.id)
        performance_data = self._get_user_performance_data(user.id)
        
        # Create AI prompt for workout generation
        prompt = self._create_workout_prompt(
            profile, workout_type, duration, focus_areas, 
            available_equipment, workout_history, performance_data
        )
        
        # Generate workout using OpenAI
        ai_response = self._call_openai_api(prompt)
        
        # Parse AI response and create workout
        workout_data = self._parse_ai_response(ai_response)
        
        # Create and save workout
        workout = self._create_workout_from_ai_data(user.id, workout_data, workout_type, duration)
        
        return workout
    
    def _get_user_workout_history(self, user_id: int) -> List[Dict]:
        """Get user's recent workout history"""
        recent_workouts = Workout.query.filter_by(user_id=user_id)\
            .order_by(Workout.created_at.desc())\
            .limit(10).all()
        
        history = []
        for workout in recent_workouts:
            history.append({
                'name': workout.name,
                'type': workout.workout_type,
                'duration': workout.duration_minutes,
                'difficulty': workout.difficulty_level,
                'exercises': [ex.exercise_name for ex in workout.exercises]
            })
        
        return history
    
    def _get_user_performance_data(self, user_id: int) -> Dict:
        """Get user's performance trends"""
        # Get recent sessions with performance data
        recent_sessions = WorkoutSession.query.filter_by(user_id=user_id)\
            .filter(WorkoutSession.status == 'completed')\
            .order_by(WorkoutSession.completed_at.desc())\
            .limit(20).all()
        
        performance_summary = {
            'total_sessions': len(recent_sessions),
            'average_rating': 0,
            'common_exercises': {},
            'strength_trends': {},
            'endurance_trends': {}
        }
        
        if recent_sessions:
            # Calculate average rating
            ratings = [s.overall_rating for s in recent_sessions if s.overall_rating]
            if ratings:
                performance_summary['average_rating'] = sum(ratings) / len(ratings)
            
            # Analyze exercise performance
            for session in recent_sessions:
                for perf in session.performances:
                    if perf.completed:
                        exercise_name = perf.exercise.exercise_name
                        if exercise_name not in performance_summary['common_exercises']:
                            performance_summary['common_exercises'][exercise_name] = 0
                        performance_summary['common_exercises'][exercise_name] += 1
        
        return performance_summary
    
    def _create_workout_prompt(self, profile: UserProfile, workout_type: str, duration: int,
                             focus_areas: List[str], available_equipment: List[str],
                             workout_history: List[Dict], performance_data: Dict) -> str:
        """Create a detailed prompt for AI workout generation"""
        
        equipment_str = ', '.join(available_equipment) if available_equipment else 'bodyweight only'
        focus_str = ', '.join(focus_areas) if focus_areas else 'full body'
        
        prompt = f"""
You are an expert fitness trainer and workout designer. Create a personalized {workout_type} workout plan.

USER PROFILE:
- Fitness Level: {profile.fitness_level}
- Body Type: {profile.body_type}
- Goals: {json.loads(profile.fitness_goals) if profile.fitness_goals else 'general fitness'}
- Available Equipment: {equipment_str}
- Workout Duration: {duration} minutes
- Focus Areas: {focus_str}

WORKOUT HISTORY:
{json.dumps(workout_history[-5:], indent=2) if workout_history else 'No previous workouts'}

PERFORMANCE DATA:
- Total completed sessions: {performance_data.get('total_sessions', 0)}
- Average workout rating: {performance_data.get('average_rating', 0):.1f}/5
- Most performed exercises: {list(performance_data.get('common_exercises', {}).keys())[:5]}

REQUIREMENTS:
1. Create a {workout_type} workout that is appropriate for {profile.fitness_level} level
2. Include 6-12 exercises depending on duration
3. Provide specific sets, reps, and rest times
4. Consider the user's body type for exercise selection
5. Avoid repeating exercises from recent workouts when possible
6. Include progression notes for future workouts
7. Ensure exercises match available equipment

RESPONSE FORMAT (JSON):
{{
    "workout_name": "Descriptive workout name",
    "description": "Brief workout description and goals",
    "warm_up": [
        {{
            "name": "Exercise name",
            "duration": "time in minutes",
            "instructions": "Brief instructions"
        }}
    ],
    "main_exercises": [
        {{
            "name": "Exercise name",
            "type": "strength/cardio/plyometric/core",
            "sets": 3,
            "reps": "10-12",
            "rest_seconds": 60,
            "weight_guidance": "bodyweight/light/moderate/heavy",
            "equipment": "required equipment",
            "instructions": "Detailed form instructions",
            "modifications": "Easier/harder variations"
        }}
    ],
    "cool_down": [
        {{
            "name": "Stretch/exercise name",
            "duration": "time in minutes",
            "instructions": "Instructions"
        }}
    ],
    "progression_notes": "How to progress this workout in the future",
    "estimated_calories": 250
}}

Generate the workout now:
"""
        
        return prompt
    
    def _call_openai_api(self, prompt: str) -> str:
        """Call OpenAI API to generate workout"""
        try:
            from openai import OpenAI
            client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
            
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert fitness trainer who creates personalized workout plans. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"OpenAI API error: {e}")
            # Fallback to basic workout generation
            return self._generate_fallback_workout()
    
    def _generate_fallback_workout(self) -> str:
        """Generate a basic workout if AI fails"""
        fallback_workout = {
            "workout_name": "Basic HIIT Workout",
            "description": "A simple high-intensity interval training workout",
            "warm_up": [
                {
                    "name": "Light jogging in place",
                    "duration": "3 minutes",
                    "instructions": "Start slow and gradually increase pace"
                }
            ],
            "main_exercises": [
                {
                    "name": "Burpees",
                    "type": "cardio",
                    "sets": 3,
                    "reps": "30 seconds",
                    "rest_seconds": 30,
                    "weight_guidance": "bodyweight",
                    "equipment": "none",
                    "instructions": "Full body movement, maintain good form",
                    "modifications": "Step back instead of jumping"
                },
                {
                    "name": "Push-ups",
                    "type": "strength",
                    "sets": 3,
                    "reps": "10-15",
                    "rest_seconds": 45,
                    "weight_guidance": "bodyweight",
                    "equipment": "none",
                    "instructions": "Keep body straight, full range of motion",
                    "modifications": "Knee push-ups or wall push-ups"
                },
                {
                    "name": "Mountain Climbers",
                    "type": "cardio",
                    "sets": 3,
                    "reps": "30 seconds",
                    "rest_seconds": 30,
                    "weight_guidance": "bodyweight",
                    "equipment": "none",
                    "instructions": "Fast alternating knee drives",
                    "modifications": "Slower pace, step instead of run"
                }
            ],
            "cool_down": [
                {
                    "name": "Static stretching",
                    "duration": "5 minutes",
                    "instructions": "Hold each stretch for 30 seconds"
                }
            ],
            "progression_notes": "Increase duration or add more rounds next time",
            "estimated_calories": 200
        }
        
        return json.dumps(fallback_workout)
    
    def _parse_ai_response(self, ai_response: str) -> Dict:
        """Parse AI response and extract workout data"""
        try:
            # Try to extract JSON from the response
            start_idx = ai_response.find('{')
            end_idx = ai_response.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = ai_response[start_idx:end_idx]
                workout_data = json.loads(json_str)
                return workout_data
            else:
                raise ValueError("No valid JSON found in response")
                
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error parsing AI response: {e}")
            # Return fallback workout data
            return json.loads(self._generate_fallback_workout())
    
    def _create_workout_from_ai_data(self, user_id: int, workout_data: Dict, 
                                   workout_type: str, duration: int) -> Workout:
        """Create workout and exercises from AI-generated data"""
        
        # Create workout
        workout = Workout(
            user_id=user_id,
            name=workout_data.get('workout_name', f'{workout_type.title()} Workout'),
            description=workout_data.get('description', ''),
            workout_type=workout_type,
            duration_minutes=duration,
            difficulty_level='intermediate'  # Could be determined from AI response
        )
        
        db.session.add(workout)
        db.session.flush()  # Get workout ID
        
        # Add warm-up exercises
        order_index = 1
        for warmup in workout_data.get('warm_up', []):
            exercise = WorkoutExercise(
                workout_id=workout.id,
                exercise_name=warmup['name'],
                exercise_type='warmup',
                sets=1,
                reps=warmup.get('duration', '5 minutes'),
                rest_time_seconds=0,
                notes=warmup.get('instructions', ''),
                order_index=order_index,
                equipment_required='none'
            )
            db.session.add(exercise)
            order_index += 1
        
        # Add main exercises
        for exercise_data in workout_data.get('main_exercises', []):
            exercise = WorkoutExercise(
                workout_id=workout.id,
                exercise_name=exercise_data['name'],
                exercise_type=exercise_data.get('type', 'strength'),
                sets=exercise_data.get('sets', 3),
                reps=str(exercise_data.get('reps', '10')),
                rest_time_seconds=exercise_data.get('rest_seconds', 60),
                notes=f"{exercise_data.get('instructions', '')} | Modifications: {exercise_data.get('modifications', '')}",
                order_index=order_index,
                equipment_required=exercise_data.get('equipment', 'none')
            )
            db.session.add(exercise)
            order_index += 1
        
        # Add cool-down exercises
        for cooldown in workout_data.get('cool_down', []):
            exercise = WorkoutExercise(
                workout_id=workout.id,
                exercise_name=cooldown['name'],
                exercise_type='cooldown',
                sets=1,
                reps=cooldown.get('duration', '5 minutes'),
                rest_time_seconds=0,
                notes=cooldown.get('instructions', ''),
                order_index=order_index,
                equipment_required='none'
            )
            db.session.add(exercise)
            order_index += 1
        
        db.session.commit()
        return workout
    
    def analyze_workout_feedback(self, session: WorkoutSession) -> Dict[str, Any]:
        """Analyze workout feedback to improve future recommendations"""
        
        feedback_analysis = {
            'overall_satisfaction': session.overall_rating or 3,
            'difficulty_assessment': 'appropriate',
            'exercise_feedback': [],
            'recommendations': []
        }
        
        # Analyze individual exercise performance
        for performance in session.performances:
            if performance.completed:
                exercise_feedback = {
                    'exercise_name': performance.exercise.exercise_name,
                    'perceived_exertion': performance.perceived_exertion or 5,
                    'completion_status': 'completed',
                    'notes': performance.notes or ''
                }
                
                # Determine if exercise was too easy/hard
                if performance.perceived_exertion:
                    if performance.perceived_exertion <= 3:
                        exercise_feedback['difficulty'] = 'too_easy'
                        feedback_analysis['recommendations'].append(
                            f"Increase intensity for {performance.exercise.exercise_name}"
                        )
                    elif performance.perceived_exertion >= 8:
                        exercise_feedback['difficulty'] = 'too_hard'
                        feedback_analysis['recommendations'].append(
                            f"Reduce intensity for {performance.exercise.exercise_name}"
                        )
                    else:
                        exercise_feedback['difficulty'] = 'appropriate'
                
                feedback_analysis['exercise_feedback'].append(exercise_feedback)
        
        # Overall workout difficulty assessment
        if session.overall_rating:
            if session.overall_rating <= 2:
                feedback_analysis['difficulty_assessment'] = 'too_hard'
                feedback_analysis['recommendations'].append("Consider reducing overall workout intensity")
            elif session.overall_rating >= 4:
                feedback_analysis['difficulty_assessment'] = 'could_be_harder'
                feedback_analysis['recommendations'].append("Consider increasing workout challenge")
        
        return feedback_analysis
    
    def suggest_workout_modifications(self, workout: Workout, feedback_analysis: Dict) -> List[str]:
        """Suggest modifications for future workouts based on feedback"""
        
        modifications = []
        
        # Based on overall difficulty
        if feedback_analysis['difficulty_assessment'] == 'too_hard':
            modifications.extend([
                "Reduce number of sets by 1",
                "Increase rest time between exercises",
                "Choose easier exercise variations",
                "Reduce workout duration by 5-10 minutes"
            ])
        elif feedback_analysis['difficulty_assessment'] == 'could_be_harder':
            modifications.extend([
                "Add 1 more set to main exercises",
                "Reduce rest time between exercises",
                "Include more challenging exercise variations",
                "Add 5-10 minutes to workout duration"
            ])
        
        # Exercise-specific modifications
        for exercise_feedback in feedback_analysis['exercise_feedback']:
            if exercise_feedback['difficulty'] == 'too_easy':
                modifications.append(
                    f"Increase intensity for {exercise_feedback['exercise_name']}: "
                    "add weight, increase reps, or choose harder variation"
                )
            elif exercise_feedback['difficulty'] == 'too_hard':
                modifications.append(
                    f"Reduce intensity for {exercise_feedback['exercise_name']}: "
                    "reduce weight, decrease reps, or choose easier variation"
                )
        
        return modifications[:5]  # Return top 5 modifications

