"""
Research-Based Knowledge Base for AI Workout Generation
Based on "Research-Based Insights for Optimizing HIIT and HIIT Programs Across Body Types"
"""

# Somatotype-specific training adaptations
SOMATOTYPE_ADAPTATIONS = {
    "ectomorph": {
        "characteristics": {
            "body_fat": "low",
            "muscle_mass": "low",
            "metabolism": "fast",
            "bone_structure": "small"
        },
        "hiit_preferences": {
            "type": "plyometric_hiit",
            "work_rest_ratio": "1:4",
            "intensity": "moderate_to_high",
            "duration": "15-30_minutes",
            "frequency": "3-4_per_week"
        },
        "muscles_adaptations": {
            "focus": "foundational_movements",
            "scaling": "bodyweight_emphasis",
            "progression": "gradual_loading",
            "recovery": "extended_rest_periods"
        },
        "injury_prevention": {
            "risk_areas": ["joints", "tendons"],
            "emphasis": "technique_mastery",
            "progression_rate": "conservative"
        }
    },
    "mesomorph": {
        "characteristics": {
            "body_fat": "moderate",
            "muscle_mass": "high",
            "metabolism": "efficient",
            "bone_structure": "medium_to_large"
        },
        "hiit_preferences": {
            "type": "traditional_hiit",
            "work_rest_ratio": "1:2_to_1:4",
            "intensity": "high",
            "duration": "20-45_minutes",
            "frequency": "4-6_per_week"
        },
        "muscles_adaptations": {
            "focus": "high_intensity_functional_movements",
            "scaling": "progressive_overload",
            "progression": "rapid_advancement",
            "recovery": "standard_protocols"
        },
        "advantages": {
            "cellular_health": "superior_phase_angle",
            "power_output": "high_anaerobic_capacity",
            "recovery": "efficient_adaptation"
        }
    },
    "endomorph": {
        "characteristics": {
            "body_fat": "higher",
            "muscle_mass": "moderate_to_high",
            "metabolism": "slower",
            "bone_structure": "large"
        },
        "hiit_preferences": {
            "type": "metabolic_conditioning",
            "work_rest_ratio": "1:1_to_1:2",
            "intensity": "moderate_to_high",
            "duration": "30-60_minutes",
            "frequency": "5-6_per_week"
        },
        "muscles_adaptations": {
            "focus": "metabolic_conditioning",
            "scaling": "volume_emphasis",
            "progression": "endurance_building",
            "recovery": "active_recovery_focus"
        },
        "metabolic_focus": {
            "fat_oxidation": "priority",
            "glycolytic_training": "extended_intervals",
            "recovery_nutrition": "carb_cycling"
        }
    }
}

# Age and sex-specific adaptations
AGE_SEX_ADAPTATIONS = {
    "adolescents": {
        "male": {
            "hiit_preference": "traditional_hiit",
            "body_fat_reduction": "more_effective",
            "progression": "4_rounds_20s_work_10s_rest_to_8_rounds",
            "supervision": "required"
        },
        "female": {
            "hiit_preference": "plyometric_hiit",
            "body_fat_reduction": "hipt_more_effective",
            "progression": "gradual_intensity_increase",
            "supervision": "required"
        }
    },
    "older_adults_60plus": {
        "adaptations": {
            "vo2_peak_improvement": "2.90_ml_kg_min",
            "6mwt_improvement": "51.62_meters",
            "quality_of_life": "significant_improvement"
        },
        "safety_considerations": {
            "medical_screening": "required",
            "supervision": "essential",
            "progression": "conservative",
            "chronic_conditions": "adaptable"
        },
        "protocol_modifications": {
            "intensity": "moderate",
            "duration": "shorter_sessions",
            "recovery": "extended_periods",
            "monitoring": "continuous"
        }
    },
    "combat_athletes": {
        "vo2_max_effect_size": 1.007,
        "peak_power_effect_size": 0.528,
        "mean_power_effect_size": 0.871,
        "optimal_work_rest_ratios": ["1:4", "1:8"],
        "sport_specific": "running_or_sport_drills"
    }
}

# Energy system training protocols
ENERGY_SYSTEM_PROTOCOLS = {
    "phosphagen_system": {
        "work_duration": "10-30_seconds",
        "rest_duration": "30-90_seconds",
        "adaptations": "explosive_power",
        "exercises": ["olympic_lifts", "plyometrics", "sprints"]
    },
    "glycolytic_system": {
        "work_duration": "30-120_seconds",
        "rest_duration": "60-240_seconds",
        "adaptations": "sustained_power",
        "exercises": ["circuit_training", "metabolic_conditioning"]
    },
    "oxidative_system": {
        "work_duration": "2-15_minutes",
        "rest_duration": "1-5_minutes",
        "adaptations": "aerobic_capacity",
        "exercises": ["rowing", "cycling", "running"]
    }
}

# Periodization strategies
PERIODIZATION_PRINCIPLES = {
    "norwegian_model": {
        "low_intensity_volume": "85-95_percent",
        "high_intensity_volume": "5-15_percent",
        "altitude_training": "50-100_days_annually",
        "competition_peaking": "strategic_timing"
    },
    "adaptive_periodization": {
        "hrv_monitoring": "daily_assessment",
        "load_adjustment": "real_time_modification",
        "deload_triggers": "elevated_hrv_scores",
        "progression_markers": "performance_metrics"
    },
    "muscles_periodization": {
        "constantly_varied": "movement_patterns",
        "progressive_overload": "systematic_advancement",
        "modal_domains": "ten_fitness_components",
        "recovery_integration": "planned_rest_cycles"
    }
}

# Injury prevention and biomechanical insights
INJURY_PREVENTION = {
    "common_injury_areas": {
        "muscles": ["shoulders", "knees", "lumbar_spine"],
        "hiit": ["ankles", "knees", "lower_back"]
    },
    "risk_factors": {
        "competitive_involvement": "significantly_increased_risk",
        "insufficient_rest": "overtraining_syndrome",
        "excessive_duration": "fatigue_accumulation",
        "poor_technique": "movement_dysfunction"
    },
    "prevention_strategies": {
        "foundational_mastery": "technique_before_load",
        "progressive_scaling": "gradual_advancement",
        "biomechanical_feedback": "real_time_correction",
        "recovery_optimization": "systematic_rest"
    },
    "high_risk_workouts": {
        "muscles": ["fran", "murph", "fight_gone_bad", "helen", "filthy_50"],
        "symptoms": ["excessive_fatigue", "prolonged_soreness", "swelling"]
    }
}

# Recovery optimization techniques
RECOVERY_PROTOCOLS = {
    "traditional_methods": {
        "active_recovery": "low_intensity_movement",
        "nutrition": "protein_carbohydrate_timing",
        "hydration": "electrolyte_balance",
        "sleep": "7-9_hours_quality"
    },
    "advanced_techniques": {
        "cold_therapy": "vasoconstriction_benefits",
        "heat_therapy": "vasodilation_recovery",
        "contrast_therapy": "alternating_hot_cold",
        "percussive_massage": "muscle_tension_relief"
    },
    "altitude_training": {
        "erythropoiesis_stimulation": "red_blood_cell_increase",
        "oxygen_utilization": "enhanced_efficiency",
        "timing": "50-100_days_annually",
        "intensity": "low_to_moderate_at_altitude"
    },
    "technology_assisted": {
        "hrv_monitoring": "autonomic_recovery",
        "sleep_tracking": "recovery_quality",
        "biomechanical_analysis": "movement_efficiency",
        "ai_recommendations": "personalized_protocols"
    }
}

# Hybrid training model integration
HYBRID_TRAINING_PRINCIPLES = {
    "hiit_muscles_synergy": {
        "shared_principles": "functional_movements",
        "complementary_adaptations": "cardiovascular_strength",
        "periodization_integration": "systematic_planning",
        "recovery_balance": "structured_rest"
    },
    "implementation_strategies": {
        "beginner_protocols": "lower_intensity_extended_recovery",
        "elite_protocols": "high_intensity_shorter_recovery",
        "sport_specific": "resistance_sprint_plyometric",
        "technology_integration": "wearable_feedback"
    }
}

# AI-driven personalization factors
AI_PERSONALIZATION_FACTORS = {
    "physiological_metrics": {
        "heart_rate_variability": "autonomic_status",
        "resting_heart_rate": "cardiovascular_fitness",
        "sleep_quality": "recovery_status",
        "perceived_exertion": "subjective_load"
    },
    "performance_indicators": {
        "power_output": "anaerobic_capacity",
        "vo2_max": "aerobic_capacity",
        "movement_quality": "biomechanical_efficiency",
        "consistency": "adherence_patterns"
    },
    "environmental_factors": {
        "equipment_availability": "exercise_selection",
        "time_constraints": "session_duration",
        "location": "indoor_outdoor_adaptations",
        "climate": "heat_cold_considerations"
    },
    "behavioral_patterns": {
        "motivation_levels": "engagement_strategies",
        "preference_feedback": "exercise_selection",
        "adherence_history": "program_modifications",
        "goal_progression": "outcome_tracking"
    }
}

# Evidence-based workout modifications
WORKOUT_MODIFICATIONS = {
    "intensity_scaling": {
        "beginner": "50-70_percent_max_effort",
        "intermediate": "70-85_percent_max_effort",
        "advanced": "85-95_percent_max_effort",
        "elite": "95-100_percent_max_effort"
    },
    "volume_adjustments": {
        "frequency": "3-6_sessions_per_week",
        "duration": "15-60_minutes_per_session",
        "sets": "3-8_per_exercise",
        "reps": "variable_by_goal"
    },
    "rest_optimization": {
        "between_sets": "30_seconds_to_5_minutes",
        "between_sessions": "24-72_hours",
        "deload_weeks": "every_4-6_weeks",
        "complete_rest": "1-2_days_per_week"
    },
    "progression_strategies": {
        "linear": "consistent_incremental_increase",
        "undulating": "varied_daily_weekly",
        "block": "focused_training_phases",
        "conjugate": "simultaneous_multiple_qualities"
    }
}

# Technology integration guidelines
TECHNOLOGY_INTEGRATION = {
    "wearable_devices": {
        "heart_rate_monitors": "intensity_guidance",
        "fitness_trackers": "activity_monitoring",
        "smartwatches": "comprehensive_metrics",
        "specialized_sensors": "biomechanical_analysis"
    },
    "mobile_applications": {
        "workout_tracking": "performance_logging",
        "ai_coaching": "real_time_adjustments",
        "social_features": "community_engagement",
        "gamification": "motivation_enhancement"
    },
    "feedback_systems": {
        "real_time_form": "technique_correction",
        "performance_analytics": "progress_tracking",
        "recovery_monitoring": "adaptation_assessment",
        "goal_adjustment": "dynamic_programming"
    }
}

def get_somatotype_recommendations(somatotype, fitness_level, goals):
    """
    Get personalized recommendations based on somatotype and other factors.
    
    Args:
        somatotype (str): 'ectomorph', 'mesomorph', or 'endomorph'
        fitness_level (str): 'beginner', 'intermediate', 'advanced', 'elite'
        goals (list): List of fitness goals
    
    Returns:
        dict: Personalized training recommendations
    """
    base_recommendations = SOMATOTYPE_ADAPTATIONS.get(somatotype, {})
    
    # Adjust based on fitness level
    if fitness_level == 'beginner':
        base_recommendations['intensity_modifier'] = 0.7
        base_recommendations['volume_modifier'] = 0.8
        base_recommendations['complexity_modifier'] = 0.6
    elif fitness_level == 'elite':
        base_recommendations['intensity_modifier'] = 1.2
        base_recommendations['volume_modifier'] = 1.3
        base_recommendations['complexity_modifier'] = 1.4
    
    return base_recommendations

def get_age_sex_modifications(age, sex):
    """
    Get age and sex-specific training modifications.
    
    Args:
        age (int): Age in years
        sex (str): 'male' or 'female'
    
    Returns:
        dict: Age and sex-specific modifications
    """
    if age < 18:
        return AGE_SEX_ADAPTATIONS['adolescents'][sex]
    elif age >= 60:
        return AGE_SEX_ADAPTATIONS['older_adults_60plus']
    else:
        return {
            'standard_protocols': True,
            'modifications': 'minimal'
        }

def get_energy_system_focus(goals, duration):
    """
    Determine primary energy system focus based on goals and duration.
    
    Args:
        goals (list): List of fitness goals
        duration (int): Workout duration in minutes
    
    Returns:
        dict: Energy system training recommendations
    """
    if 'power' in goals or 'strength' in goals:
        return ENERGY_SYSTEM_PROTOCOLS['phosphagen_system']
    elif 'muscle_gain' in goals or 'hiit' in goals:
        return ENERGY_SYSTEM_PROTOCOLS['glycolytic_system']
    elif 'endurance' in goals or 'cardio' in goals:
        return ENERGY_SYSTEM_PROTOCOLS['oxidative_system']
    else:
        # Default to glycolytic for mixed goals
        return ENERGY_SYSTEM_PROTOCOLS['glycolytic_system']

def get_injury_prevention_focus(somatotype, experience_level):
    """
    Get injury prevention recommendations based on somatotype and experience.
    
    Args:
        somatotype (str): Body type
        experience_level (str): Training experience level
    
    Returns:
        dict: Injury prevention strategies
    """
    base_prevention = INJURY_PREVENTION.copy()
    
    if somatotype == 'ectomorph':
        base_prevention['priority_areas'] = ['joint_stability', 'tendon_health']
        base_prevention['progression_rate'] = 'conservative'
    elif somatotype == 'endomorph':
        base_prevention['priority_areas'] = ['movement_quality', 'load_management']
        base_prevention['progression_rate'] = 'moderate'
    
    if experience_level == 'beginner':
        base_prevention['technique_emphasis'] = 'maximum'
        base_prevention['supervision_level'] = 'high'
    
    return base_prevention

def get_recovery_protocol(training_intensity, somatotype, age):
    """
    Get personalized recovery protocol recommendations.
    
    Args:
        training_intensity (str): 'low', 'moderate', 'high', 'very_high'
        somatotype (str): Body type
        age (int): Age in years
    
    Returns:
        dict: Recovery protocol recommendations
    """
    base_protocol = RECOVERY_PROTOCOLS['traditional_methods'].copy()
    
    if training_intensity in ['high', 'very_high']:
        base_protocol.update(RECOVERY_PROTOCOLS['advanced_techniques'])
    
    if age >= 60:
        base_protocol['sleep_requirement'] = '8-9_hours'
        base_protocol['recovery_time'] = 'extended'
    
    if somatotype == 'endomorph':
        base_protocol['active_recovery_emphasis'] = 'high'
        base_protocol['nutrition_focus'] = 'metabolic_support'
    
    return base_protocol

