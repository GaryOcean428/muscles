import openai
import json
import random
from datetime import datetime
from typing import Dict, List, Optional
from .models.workout import Exercise, Workout
from .models.user import User
from .models.profile import UserProfile
from .knowledge_base import (
    get_somatotype_recommendations,
    get_age_sex_modifications,
    get_energy_system_focus,
    get_injury_prevention_focus,
    get_recovery_protocol,
    SOMATOTYPE_ADAPTATIONS,
    ENERGY_SYSTEM_PROTOCOLS,
    INJURY_PREVENTION,
    PERIODIZATION_PRINCIPLES
)

class EnhancedAIWorkoutEngine:
    """
    Enhanced AI Workout Engine incorporating research-based insights for 
    optimizing HIIT and CrossFit programs across body types.
    
    Based on research findings from:
    - PEER-HEART study on adolescent HIIT adaptations
    - Meta-analysis of HIIT in older adults
    - Combat sports athlete performance studies
    - Somatotype-specific training adaptations
    - Biomechanical injury prevention strategies
    """
    
    def __init__(self):
        self.client = openai.OpenAI()
        self.model = "gpt-4"  # Using GPT-4 for enhanced reasoning
        
    def generate_workout(self, user_profile: UserProfile, preferences: Dict) -> Dict:
        """
        Generate a research-based personalized workout using OpenAI GPT-4
        with comprehensive sports science knowledge integration.
        """
        try:
            # Build enhanced context from user profile and research
            context = self._build_enhanced_user_context(user_profile, preferences)
            
            # Create research-informed prompt
            prompt = self._create_research_based_prompt(context)
            
            # Call OpenAI API with enhanced system message
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self._get_enhanced_system_message()},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=3500,
                temperature=0.7
            )
            
            # Parse response
            workout_data = self._parse_workout_response(response.choices[0].message.content)
            
            # Apply research-based post-processing
            workout_data = self._apply_research_modifications(workout_data, context)
            
            return workout_data
            
        except Exception as e:
            # Fallback to research-based template generation
            return self._generate_research_based_fallback(user_profile, preferences)
    
    def _build_enhanced_user_context(self, profile: UserProfile, preferences: Dict) -> Dict:
        """Build comprehensive user context enhanced with research insights"""
        # Determine somatotype (simplified classification based on profile)
        somatotype = self._estimate_somatotype(profile)
        
        # Get research-based recommendations
        somatotype_recs = get_somatotype_recommendations(somatotype, profile.fitness_level, profile.goals)
        age_sex_mods = get_age_sex_modifications(profile.age, profile.gender)
        energy_focus = get_energy_system_focus(profile.goals, preferences.get('duration', 30))
        injury_prevention = get_injury_prevention_focus(somatotype, profile.fitness_level)
        recovery_protocol = get_recovery_protocol(preferences.get('intensity', 'moderate'), somatotype, profile.age)
        
        return {
            # Basic profile data
            "fitness_level": profile.fitness_level,
            "goals": profile.goals,
            "age": profile.age,
            "gender": profile.gender,
            "equipment": profile.equipment_available,
            "limitations": profile.limitations,
            "workout_frequency": profile.workout_frequency,
            "session_duration": preferences.get('duration', 30),
            "workout_type": preferences.get('type', 'mixed'),
            "intensity": preferences.get('intensity', 'moderate'),
            "target_areas": preferences.get('target_areas', []),
            
            # Research-based enhancements
            "somatotype": somatotype,
            "somatotype_recommendations": somatotype_recs,
            "age_sex_modifications": age_sex_mods,
            "energy_system_focus": energy_focus,
            "injury_prevention_focus": injury_prevention,
            "recovery_protocol": recovery_protocol,
            
            # Research-derived parameters
            "work_rest_ratio": somatotype_recs.get('hiit_preferences', {}).get('work_rest_ratio', '1:2'),
            "progression_rate": injury_prevention.get('progression_rate', 'moderate'),
            "technique_emphasis": injury_prevention.get('technique_emphasis', 'standard'),
            "metabolic_focus": somatotype_recs.get('metabolic_focus', {}),
        }
    
    def _estimate_somatotype(self, profile: UserProfile) -> str:
        """
        Estimate somatotype based on available profile data.
        
        In a production system, this could be enhanced with:
        - Body composition measurements
        - Bioelectrical impedance analysis (BIVA)
        - Physical assessment questionnaires
        - Performance testing results
        """
        goals = [goal.lower() for goal in profile.goals]
        
        # Simplified estimation based on goals and characteristics
        if 'weight_loss' in goals or 'endurance' in goals:
            return 'endomorph'
        elif 'muscle_gain' in goals or 'strength' in goals or 'power' in goals:
            return 'mesomorph'
        elif 'flexibility' in goals or 'general_fitness' in goals:
            return 'ectomorph'
        else:
            return 'mesomorph'  # Default to mesomorph for balanced approach
    
    def _get_enhanced_system_message(self) -> str:
        """Enhanced system message incorporating latest research findings"""
        return """You are an elite CrossFit and HIIT trainer with a PhD in Exercise Science and extensive knowledge of the latest research in personalized training methodologies. Your expertise is based on cutting-edge studies including:

RESEARCH-BASED TRAINING PRINCIPLES:

1. SOMATOTYPE-SPECIFIC ADAPTATIONS (Based on Italian CrossFit athlete studies):
   - ECTOMORPHS: Respond optimally to plyometric HIIT (HIPT), require extended recovery (1:4 to 1:8 work:rest ratios), focus on joint stability and tendon health, conservative progression rates
   - MESOMORPHS: Excel with traditional HIIT, demonstrate superior cellular health (higher phase angles indicating robust cell membrane integrity), can handle higher intensities with 1:2 to 1:4 work:rest ratios, rapid advancement capability
   - ENDOMORPHS: Benefit from metabolic conditioning focus, respond well to volume-based training with 1:1 to 1:2 work:rest ratios, require active recovery emphasis and carb cycling strategies

2. AGE AND SEX-SPECIFIC ADAPTATIONS (PEER-HEART Study & Meta-analyses):
   - ADOLESCENT MALES: Traditional HIIT more effective for body fat reduction, can progress from 4 rounds (20s work/10s rest) to 8 rounds over 8 weeks
   - ADOLESCENT FEMALES: Plyometric HIIT (HIPT) demonstrates greater efficacy, requires structured supervision and systematic planning
   - OLDER ADULTS (60+): Require medical screening, benefit from moderate intensity, show 2.90 mL·kg⁻¹·min⁻¹ VO₂peak improvements and 51.62m 6MWT gains, need extended recovery periods
   - COMBAT ATHLETES: Optimal work:rest ratios of 1:4 and 1:8 for peak power development (ES = 0.528), VO₂max improvements (ES = 1.007)

3. ENERGY SYSTEM TARGETING (Evidence-based protocols):
   - PHOSPHAGEN (10-30s work, 30-90s rest): Explosive power, Olympic lifts, plyometrics, sprint intervals
   - GLYCOLYTIC (30-120s work, 60-240s rest): Sustained power, metabolic conditioning, HIIT circuits
   - OXIDATIVE (2-15min work, 1-5min rest): Aerobic capacity, endurance training, steady-state cardio

4. INJURY PREVENTION PRIORITIES (Systematic review findings):
   - HIGH-RISK AREAS: Shoulders, knees, lumbar spine (CrossFit); ankles, knees, lower back (HIIT)
   - HIGH-RISK WORKOUTS: Fran, Murph, Fight Gone Bad, Helen, Filthy 50 require careful scaling for beginners
   - CRITICAL FACTORS: Foundational movement mastery before weighted progressions, competitive involvement increases injury risk significantly
   - BIOMECHANICAL EMPHASIS: Real-time feedback integration, technique over intensity for beginners

5. PERIODIZATION PRINCIPLES (Norwegian endurance model adaptation):
   - VOLUME DISTRIBUTION: 85-95% low intensity training, 5-15% high intensity
   - HRV-GUIDED ADJUSTMENTS: Daily autonomic monitoring for load modification
   - DELOAD PROTOCOLS: Every 4-6 weeks based on accumulated fatigue
   - ALTITUDE TRAINING: 50-100 days annually for endurance adaptations (when applicable)

6. RECOVERY OPTIMIZATION (Multi-modal approach):
   - TRADITIONAL: Active recovery, nutrition timing (protein/carb), hydration, sleep (7-9 hours)
   - ADVANCED: Contrast therapy (hot/cold), percussive massage, infrared sauna, altitude exposure
   - TECHNOLOGY-ASSISTED: HRV monitoring, sleep tracking, biomechanical analysis, AI-driven recommendations

SAFETY AND PROGRESSION PROTOCOLS:
- Always prioritize movement quality over intensity
- Implement progressive overload systematically
- Consider individual recovery capacity and adaptation rates
- Integrate real-time biomechanical feedback when possible
- Adjust protocols based on somatotype, age, sex, and experience level
- Monitor for overtraining symptoms and implement deload strategies

Your workout prescriptions must be evidence-based, safe, and optimized for the individual's specific physiological and biomechanical characteristics."""

    def _create_research_based_prompt(self, context: Dict) -> str:
        """Create detailed prompt incorporating comprehensive research insights"""
        somatotype_info = context['somatotype_recommendations']
        energy_system = context['energy_system_focus']
        injury_prevention = context['injury_prevention_focus']
        
        return f"""
        Design a research-optimized {context['workout_type']} workout for a {context['fitness_level']} level {context['gender']} athlete based on the latest sports science research.
        
        COMPREHENSIVE USER PROFILE:
        - Age: {context['age']} (Research-based modifications: {context['age_sex_modifications']})
        - Estimated Somatotype: {context['somatotype']}
        - Fitness Goals: {', '.join(context['goals'])}
        - Available Equipment: {', '.join(context['equipment'])}
        - Workout Duration: {context['session_duration']} minutes
        - Intensity Level: {context['intensity']}
        - Target Areas: {', '.join(context['target_areas'])}
        - Physical Limitations: {', '.join(context['limitations']) if context['limitations'] else 'None reported'}
        - Weekly Frequency: {context['workout_frequency']} sessions
        
        RESEARCH-BASED OPTIMIZATION PARAMETERS:
        - Somatotype Adaptations: {somatotype_info}
        - Evidence-based Work:Rest Ratio: {context['work_rest_ratio']}
        - Primary Energy System Target: {energy_system}
        - Injury Prevention Priority Areas: {injury_prevention}
        - Progression Rate: {context['progression_rate']}
        - Recovery Protocol Requirements: {context['recovery_protocol']}
        - Metabolic Focus: {context['metabolic_focus']}
        
        EVIDENCE-BASED REQUIREMENTS:
        1. Apply somatotype-specific exercise selection and intensity modulation based on cellular health research
        2. Implement optimal work:rest ratios proven effective for the user's demographic
        3. Target appropriate energy systems based on goals, duration, and physiological adaptations
        4. Include comprehensive injury prevention strategies for identified high-risk areas
        5. Implement proper progression scaling based on experience level and adaptation capacity
        6. Integrate recovery considerations and periodization principles into workout design
        7. Consider age and sex-specific adaptations from peer-reviewed research
        8. Include detailed biomechanical cues for movement quality and safety
        9. Provide evidence-based modifications for different skill levels
        10. Include real-time monitoring recommendations when applicable
        
        SAFETY AND PROGRESSION CONSIDERATIONS:
        - Avoid high-risk exercises for beginners (avoid Fran, Murph-style workouts until advanced)
        - Emphasize foundational movement patterns before complex variations
        - Include comprehensive technique cues and progressive modification options
        - Specify when supervision, medical clearance, or biomechanical assessment is recommended
        - Integrate HRV and recovery monitoring recommendations
        - Consider competitive involvement risk factors
        
        RESEARCH INTEGRATION REQUIREMENTS:
        - Reference specific studies or principles that inform exercise selection
        - Explain the physiological rationale for work:rest ratios chosen
        - Justify energy system targeting based on user goals and research
        - Include somatotype-specific adaptations and their scientific basis
        - Provide evidence-based progression timelines and markers
        
        Format the response as comprehensive JSON with the following enhanced structure:
        {{
            "workout_name": "string",
            "total_duration": "number (minutes)",
            "difficulty": "string",
            "description": "string",
            "somatotype_focus": "string",
            "energy_system_targeted": "string",
            "research_rationale": "string (detailed explanation of scientific basis)",
            "work_rest_ratio_applied": "string",
            "periodization_phase": "string",
            "warm_up": [
                {{
                    "exercise": "string",
                    "duration": "string",
                    "instructions": "string",
                    "biomechanical_cues": "string",
                    "research_basis": "string",
                    "modifications": "string"
                }}
            ],
            "main_workout": [
                {{
                    "exercise": "string",
                    "sets": "number",
                    "reps": "string",
                    "rest": "string",
                    "weight": "string",
                    "instructions": "string",
                    "biomechanical_cues": "string",
                    "modifications": "string",
                    "injury_prevention_notes": "string",
                    "energy_system": "string",
                    "somatotype_adaptation": "string",
                    "research_basis": "string"
                }}
            ],
            "cool_down": [
                {{
                    "exercise": "string",
                    "duration": "string",
                    "instructions": "string",
                    "recovery_benefits": "string",
                    "research_basis": "string"
                }}
            ],
            "recovery_recommendations": {{
                "immediate_post_workout": "string",
                "24_hour_protocol": "string",
                "next_session_timing": "string",
                "hrv_monitoring": "string",
                "nutrition_timing": "string",
                "sleep_optimization": "string"
            }},
            "progression_strategy": {{
                "next_session_modifications": "string",
                "weekly_progression": "string",
                "deload_indicators": "string",
                "advancement_criteria": "string"
            }},
            "monitoring_recommendations": {{
                "key_metrics": ["string"],
                "warning_signs": ["string"],
                "adaptation_markers": ["string"],
                "technology_integration": "string"
            }},
            "safety_protocols": {{
                "contraindications": ["string"],
                "supervision_requirements": "string",
                "emergency_modifications": "string",
                "medical_considerations": "string"
            }},
            "research_citations": {{
                "primary_studies": ["string"],
                "methodology_basis": "string",
                "evidence_level": "string"
            }}
        }}
        """
    
    def _apply_research_modifications(self, workout_data: Dict, context: Dict) -> Dict:
        """Apply comprehensive research-based modifications to generated workout"""
        
        # Apply somatotype-specific intensity modifications
        somatotype_recs = context['somatotype_recommendations']
        if 'intensity_modifier' in somatotype_recs:
            modifier = somatotype_recs['intensity_modifier']
            # Adjust rest periods based on modifier
            for exercise in workout_data.get('main_workout', []):
                if 'rest' in exercise:
                    rest_seconds = self._parse_rest_time(exercise['rest'])
                    modified_rest = int(rest_seconds / modifier)
                    exercise['rest'] = f"{modified_rest} seconds"
                    exercise['modification_applied'] = f"Somatotype-adjusted rest ({modifier}x modifier)"
        
        # Add age-specific safety modifications
        age = context['age']
        if age < 18:
            workout_data['age_specific_notes'] = "Adolescent protocol: Requires supervision and progressive intensity scaling per PEER-HEART study guidelines."
        elif age >= 60:
            workout_data['age_specific_notes'] = "Older adult protocol: Medical screening recommended. Focus on functional capacity improvements with extended recovery periods."
            # Reduce intensity for older adults
            for exercise in workout_data.get('main_workout', []):
                if 'intensity' in exercise:
                    exercise['age_modification'] = "Reduced intensity for older adult safety and adaptation"
        
        # Add research-based safety warnings
        fitness_level = context['fitness_level']
        if fitness_level == 'beginner':
            workout_data['beginner_safety_protocol'] = {
                "supervision": "Highly recommended for first 4-6 sessions",
                "progression": "Master bodyweight movements before adding load",
                "monitoring": "Track RPE and recovery between sessions",
                "red_flags": ["Excessive fatigue lasting >24h", "Joint pain", "Movement compensation"]
            }
        
        # Add somatotype-specific optimization notes
        somatotype = context['somatotype']
        somatotype_notes = {
            'ectomorph': {
                "recovery_emphasis": "Extended rest periods crucial for joint and tendon adaptation",
                "progression_strategy": "Conservative loading with emphasis on movement quality",
                "metabolic_focus": "Plyometric emphasis for neuromuscular development",
                "research_basis": "Based on joint stability requirements and tendon adaptation rates"
            },
            'mesomorph': {
                "cellular_advantage": "Superior phase angle allows for higher intensity tolerance",
                "progression_strategy": "Rapid advancement possible with proper monitoring",
                "metabolic_focus": "High-intensity traditional HIIT protocols optimal",
                "research_basis": "Based on cellular health markers and adaptation capacity studies"
            },
            'endomorph': {
                "metabolic_emphasis": "Focus on metabolic conditioning and fat oxidation",
                "progression_strategy": "Volume-based progression with active recovery integration",
                "metabolic_focus": "Extended intervals for glycolytic system development",
                "research_basis": "Based on metabolic efficiency and body composition research"
            }
        }
        
        workout_data['somatotype_optimization'] = somatotype_notes.get(somatotype, {})
        
        # Add periodization context
        workout_data['periodization_context'] = {
            "current_phase": "Base building" if fitness_level == 'beginner' else "Intensification",
            "norwegian_model_application": "85-95% low intensity principle applied to weekly programming",
            "deload_recommendation": "Every 4-6 weeks based on HRV trends and performance markers",
            "altitude_consideration": "Consider altitude training camps for endurance goals (50-100 days annually)"
        }
        
        # Add technology integration recommendations
        workout_data['technology_integration'] = {
            "wearable_metrics": ["Heart rate variability", "Sleep quality", "Resting heart rate"],
            "mobile_app_features": ["Real-time form feedback", "RPE tracking", "Recovery monitoring"],
            "ai_adaptations": ["Dynamic intensity adjustment", "Personalized rest periods", "Injury risk assessment"],
            "biomechanical_feedback": "Real-time movement analysis recommended for complex movements"
        }
        
        return workout_data
    
    def _parse_rest_time(self, rest_str: str) -> int:
        """Parse rest time string to seconds"""
        try:
            rest_str = rest_str.lower()
            if 'minute' in rest_str:
                return int(rest_str.split()[0]) * 60
            elif 'second' in rest_str:
                return int(rest_str.split()[0])
            else:
                return 60  # Default to 60 seconds
        except:
            return 60
    
    def _parse_workout_response(self, response: str) -> Dict:
        """Parse AI response into structured workout data with error handling"""
        try:
            # Try to extract JSON from response
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = response[start_idx:end_idx]
                parsed_data = json.loads(json_str)
                
                # Validate required fields
                required_fields = ['workout_name', 'main_workout', 'warm_up', 'cool_down']
                for field in required_fields:
                    if field not in parsed_data:
                        raise ValueError(f"Missing required field: {field}")
                
                return parsed_data
            else:
                raise ValueError("No valid JSON found in response")
                
        except (json.JSONDecodeError, ValueError) as e:
            # Fallback parsing if JSON is malformed
            return self._parse_text_response(response)
    
    def _parse_text_response(self, response: str) -> Dict:
        """Enhanced fallback parser for non-JSON responses"""
        lines = response.split('\n')
        workout = {
            "workout_name": "Research-Based AI Workout",
            "total_duration": 30,
            "difficulty": "Moderate",
            "description": "Evidence-based workout generated from text parsing",
            "somatotype_focus": "Balanced approach",
            "energy_system_targeted": "Mixed systems",
            "research_rationale": "Fallback generation with research principles",
            "warm_up": [],
            "main_workout": [],
            "cool_down": [],
            "recovery_recommendations": {
                "immediate_post_workout": "5-10 minutes active recovery",
                "24_hour_protocol": "Adequate sleep and nutrition",
                "next_session_timing": "24-48 hours based on recovery"
            },
            "notes": "Generated from text response with research-based fallback"
        }
        
        current_section = None
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if "warm" in line.lower():
                current_section = "warm_up"
            elif "main" in line.lower() or "workout" in line.lower():
                current_section = "main_workout"
            elif "cool" in line.lower():
                current_section = "cool_down"
            elif current_section and line and not line.startswith('#'):
                # Add exercise to current section
                exercise = {
                    "exercise": line,
                    "instructions": "Follow proper form and technique",
                    "biomechanical_cues": "Maintain neutral spine and controlled movement"
                }
                
                if current_section == "main_workout":
                    exercise.update({
                        "sets": 3,
                        "reps": "8-12",
                        "rest": "60 seconds",
                        "weight": "Bodyweight or light resistance",
                        "energy_system": "glycolytic",
                        "research_basis": "Standard progression principles"
                    })
                else:
                    exercise.update({
                        "duration": "30-45 seconds",
                        "research_basis": "Movement preparation and recovery protocols"
                    })
                    
                workout[current_section].append(exercise)
        
        return workout
    
    def _generate_research_based_fallback(self, profile: UserProfile, preferences: Dict) -> Dict:
        """Generate comprehensive research-based workout when AI fails"""
        somatotype = self._estimate_somatotype(profile)
        somatotype_recs = get_somatotype_recommendations(somatotype, profile.fitness_level, profile.goals)
        energy_focus = get_energy_system_focus(profile.goals, preferences.get('duration', 30))
        
        # Research-based workout templates with comprehensive structure
        workout_templates = {
            "beginner_ectomorph": {
                "workout_name": "Ectomorph Foundation Builder",
                "somatotype_focus": "Joint stability and movement quality",
                "energy_system_targeted": "Phosphagen with extended recovery",
                "research_rationale": "Based on ectomorph joint stability needs and conservative progression principles",
                "work_rest_ratio_applied": "1:4 (research-optimal for ectomorphs)",
                "warm_up": [
                    {
                        "exercise": "Dynamic Arm Circles",
                        "duration": "45 seconds",
                        "instructions": "Gradual range increase from small to large circles",
                        "biomechanical_cues": "Maintain shoulder blade stability, avoid excessive range initially",
                        "research_basis": "Joint mobility preparation for ectomorphic joint stability needs",
                        "modifications": "Reduce range if shoulder impingement present"
                    },
                    {
                        "exercise": "Leg Swings (Front-to-Back)",
                        "duration": "45 seconds each leg",
                        "instructions": "Controlled pendulum motion, support with wall if needed",
                        "biomechanical_cues": "Engage core for stability, avoid excessive hip flexion",
                        "research_basis": "Hip mobility preparation with stability emphasis",
                        "modifications": "Reduce range for hip impingement or lower back issues"
                    },
                    {
                        "exercise": "Bodyweight Squats",
                        "duration": "1 minute",
                        "instructions": "Focus on depth and control, pause at bottom",
                        "biomechanical_cues": "Knees track over toes, maintain neutral spine, weight in heels",
                        "research_basis": "Movement pattern preparation with emphasis on technique mastery",
                        "modifications": "Box squat for depth limitation, heel elevation for ankle mobility"
                    }
                ],
                "main_workout": [
                    {
                        "exercise": "Modified Push-ups",
                        "sets": 3,
                        "reps": "5-8",
                        "rest": "120 seconds",
                        "weight": "Bodyweight",
                        "instructions": "Knee modification recommended, focus on full range of motion",
                        "biomechanical_cues": "Straight line from knees to head, controlled descent",
                        "modifications": "Wall push-ups for further regression, incline for progression",
                        "injury_prevention_notes": "Avoid if shoulder impingement present",
                        "energy_system": "phosphagen",
                        "somatotype_adaptation": "Extended rest for joint recovery",
                        "research_basis": "Conservative loading for ectomorph joint adaptation"
                    },
                    {
                        "exercise": "Goblet Squats",
                        "sets": 3,
                        "reps": "8-12",
                        "rest": "120 seconds",
                        "weight": "Light dumbbell (5-15 lbs)",
                        "instructions": "Hold weight at chest, focus on movement quality",
                        "biomechanical_cues": "Elbows down, chest up, sit back into squat",
                        "modifications": "Bodyweight only, box squat for depth assistance",
                        "injury_prevention_notes": "Ensure ankle and hip mobility before loading",
                        "energy_system": "glycolytic",
                        "somatotype_adaptation": "Light loading with technique emphasis",
                        "research_basis": "Progressive overload with joint-friendly loading"
                    },
                    {
                        "exercise": "Plank Hold",
                        "sets": 3,
                        "reps": "20-30 seconds",
                        "rest": "120 seconds",
                        "weight": "Bodyweight",
                        "instructions": "Maintain neutral spine, breathe normally",
                        "biomechanical_cues": "Straight line from head to heels, engage core",
                        "modifications": "Knee plank, incline plank on bench",
                        "injury_prevention_notes": "Avoid if lower back pain present",
                        "energy_system": "phosphagen",
                        "somatotype_adaptation": "Isometric strength building",
                        "research_basis": "Core stability foundation for movement quality"
                    }
                ],
                "cool_down": [
                    {
                        "exercise": "Child's Pose",
                        "duration": "90 seconds",
                        "instructions": "Deep breathing, allow spine to decompress",
                        "recovery_benefits": "Spinal decompression and parasympathetic activation",
                        "research_basis": "Stress reduction and spinal health maintenance"
                    },
                    {
                        "exercise": "Hamstring Stretch",
                        "duration": "45 seconds each leg",
                        "instructions": "Gentle progression, avoid bouncing",
                        "recovery_benefits": "Posterior chain mobility and tension reduction",
                        "research_basis": "Flexibility maintenance for movement quality"
                    }
                ]
            },
            "beginner_mesomorph": {
                "workout_name": "Mesomorph Power Foundation",
                "somatotype_focus": "Balanced strength and conditioning",
                "energy_system_targeted": "Glycolytic with power emphasis",
                "research_rationale": "Leverages mesomorph cellular health advantages for balanced development",
                "work_rest_ratio_applied": "1:2 (optimal for mesomorph recovery capacity)",
                "warm_up": [
                    {
                        "exercise": "Arm Circles",
                        "duration": "30 seconds each direction",
                        "instructions": "Progressive range from small to large",
                        "biomechanical_cues": "Maintain shoulder blade stability throughout range",
                        "research_basis": "Shoulder mobility preparation for upper body training",
                        "modifications": "Reduce range if shoulder restrictions present"
                    },
                    {
                        "exercise": "High Knees",
                        "duration": "30 seconds",
                        "instructions": "Moderate pace, focus on form over speed",
                        "biomechanical_cues": "Maintain upright posture, land on balls of feet",
                        "research_basis": "Dynamic warm-up for neuromuscular activation",
                        "modifications": "Marching in place for lower intensity"
                    },
                    {
                        "exercise": "Bodyweight Squats",
                        "duration": "1 minute",
                        "instructions": "Full range of motion, controlled tempo",
                        "biomechanical_cues": "Hip hinge pattern, knees track over toes",
                        "research_basis": "Movement pattern rehearsal and muscle activation",
                        "modifications": "Partial range for mobility limitations"
                    }
                ],
                "main_workout": [
                    {
                        "exercise": "Push-ups",
                        "sets": 3,
                        "reps": "8-12",
                        "rest": "60 seconds",
                        "weight": "Bodyweight",
                        "instructions": "Full range progression, maintain form",
                        "biomechanical_cues": "Straight body line, controlled descent and ascent",
                        "modifications": "Incline for regression, feet elevated for progression",
                        "injury_prevention_notes": "Ensure shoulder stability before progression",
                        "energy_system": "glycolytic",
                        "somatotype_adaptation": "Standard progression suitable for mesomorph adaptation",
                        "research_basis": "Progressive overload for strength development"
                    },
                    {
                        "exercise": "Squats",
                        "sets": 3,
                        "reps": "12-15",
                        "rest": "60 seconds",
                        "weight": "Bodyweight",
                        "instructions": "Focus on depth and control",
                        "biomechanical_cues": "Chest up, weight in heels, full hip extension",
                        "modifications": "Box squat for depth assistance, goblet squat for progression",
                        "injury_prevention_notes": "Ensure adequate ankle and hip mobility",
                        "energy_system": "glycolytic",
                        "somatotype_adaptation": "Volume emphasis for mesomorph muscle development",
                        "research_basis": "Functional strength development with metabolic conditioning"
                    },
                    {
                        "exercise": "Mountain Climbers",
                        "sets": 3,
                        "reps": "30 seconds",
                        "rest": "60 seconds",
                        "weight": "Bodyweight",
                        "instructions": "Controlled pace, maintain plank position",
                        "biomechanical_cues": "Straight body line, avoid hip hiking",
                        "modifications": "Slow tempo for beginners, hands on bench for regression",
                        "injury_prevention_notes": "Avoid if wrist or lower back issues present",
                        "energy_system": "glycolytic",
                        "somatotype_adaptation": "Metabolic conditioning suitable for mesomorph",
                        "research_basis": "Cardiovascular conditioning with core stability"
                    }
                ],
                "cool_down": [
                    {
                        "exercise": "Downward Dog",
                        "duration": "60 seconds",
                        "instructions": "Active stretch, pedal feet for calf stretch",
                        "recovery_benefits": "Full body mobility and circulation enhancement",
                        "research_basis": "Multi-joint mobility and recovery facilitation"
                    },
                    {
                        "exercise": "Hip Flexor Stretch",
                        "duration": "30 seconds each side",
                        "instructions": "Deep stretch, avoid excessive lumbar extension",
                        "recovery_benefits": "Hip mobility and posture improvement",
                        "research_basis": "Counteract sitting posture and improve hip function"
                    }
                ]
            }
        }
        
        # Select appropriate template
        template_key = f"{profile.fitness_level}_{somatotype}"
        template = workout_templates.get(template_key, workout_templates["beginner_mesomorph"])
        
        # Add comprehensive metadata
        base_workout = {
            "total_duration": preferences.get('duration', 30),
            "difficulty": profile.fitness_level.title(),
            "description": f"Research-based workout optimized for {somatotype} somatotype with {profile.fitness_level} progression",
            "periodization_phase": "Foundation building",
            "recovery_recommendations": {
                "immediate_post_workout": "5-10 minutes light walking, hydration with electrolytes",
                "24_hour_protocol": "Active recovery, adequate sleep (7-9 hours), protein intake within 2 hours",
                "next_session_timing": "24-48 hours based on recovery status and HRV trends",
                "hrv_monitoring": "Track daily for training load adjustment",
                "nutrition_timing": "Protein within 30 minutes, carbohydrates within 2 hours",
                "sleep_optimization": "7-9 hours with consistent sleep schedule"
            },
            "progression_strategy": {
                "next_session_modifications": f"Increase reps by 1-2 or add 5-10 seconds to holds based on {somatotype_recs.get('progression_rate', 'moderate')} progression",
                "weekly_progression": "Increase volume by 10-15% weekly while maintaining form",
                "deload_indicators": "Elevated resting HR, decreased HRV, persistent fatigue",
                "advancement_criteria": "Consistent completion of prescribed reps/time with good form"
            },
            "monitoring_recommendations": {
                "key_metrics": ["RPE (Rate of Perceived Exertion)", "Heart Rate Variability", "Sleep Quality", "Movement Quality"],
                "warning_signs": ["Joint pain", "Excessive fatigue >24h", "Decreased performance", "Mood changes"],
                "adaptation_markers": ["Increased strength", "Improved movement quality", "Enhanced recovery", "Better sleep"],
                "technology_integration": "Wearable devices for HRV and sleep tracking recommended"
            },
            "safety_protocols": {
                "contraindications": ["Acute injury", "Illness", "Excessive fatigue", "Joint pain"],
                "supervision_requirements": "Recommended for first 4-6 sessions, especially for complex movements",
                "emergency_modifications": "Reduce intensity, increase rest, modify range of motion as needed",
                "medical_considerations": "Consult healthcare provider if new to exercise or have health conditions"
            },
            "research_citations": {
                "primary_studies": [
                    "PEER-HEART study on adolescent HIIT adaptations",
                    "Italian CrossFit athlete somatotype analysis",
                    "Meta-analysis of HIIT in older adults",
                    "Combat sports athlete performance research"
                ],
                "methodology_basis": "Evidence-based exercise selection and progression principles",
                "evidence_level": "High-quality systematic reviews and randomized controlled trials"
            }
        }
        
        # Merge template with base workout
        base_workout.update(template)
        
        return base_workout

# Maintain backward compatibility
class AIWorkoutEngine(EnhancedAIWorkoutEngine):
    """Backward compatible wrapper for the enhanced AI engine"""
    pass

