import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for AI fitness platform

export const BODY_TYPES = {
  ECTOMORPH: 'ectomorph',
  MESOMORPH: 'mesomorph',
  ENDOMORPH: 'endomorph'
} as const

export const FITNESS_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
} as const

export const WORKOUT_TYPES = {
  HIIT: 'HIIT',
  CROSSFIT: 'CrossFit',
  STRENGTH: 'Strength Training',
  CARDIO: 'Cardio',
  YOGA: 'Yoga',
  PILATES: 'Pilates',
  BODYWEIGHT: 'Bodyweight'
} as const

export const FITNESS_GOALS = {
  WEIGHT_LOSS: 'Weight Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  STRENGTH: 'Build Strength',
  ENDURANCE: 'Improve Endurance',
  FLEXIBILITY: 'Increase Flexibility',
  GENERAL_FITNESS: 'General Fitness',
  ATHLETIC_PERFORMANCE: 'Athletic Performance'
} as const

// FitCraft Coach 12-step conversation flow
export const FITCRAFT_STEPS = {
  WELCOME: 1,
  GOALS: 2,
  BODY_TYPE: 3,
  TIME_AVAILABILITY: 4,
  FREQUENCY: 5,
  EXPERIENCE: 6,
  DURATION: 7,
  EQUIPMENT: 8,
  PLAN_GENERATION: 9,
  PRESENTATION: 10,
  ASSISTANCE: 11,
  REVIEW: 12
} as const

export const FITCRAFT_STEP_LABELS = {
  [FITCRAFT_STEPS.WELCOME]: 'Welcome & Introduction',
  [FITCRAFT_STEPS.GOALS]: 'Fitness Goals Assessment',
  [FITCRAFT_STEPS.BODY_TYPE]: 'Body Type Analysis',
  [FITCRAFT_STEPS.TIME_AVAILABILITY]: 'Time Availability',
  [FITCRAFT_STEPS.FREQUENCY]: 'Training Frequency',
  [FITCRAFT_STEPS.EXPERIENCE]: 'Experience Level',
  [FITCRAFT_STEPS.DURATION]: 'Workout Duration',
  [FITCRAFT_STEPS.EQUIPMENT]: 'Equipment Available',
  [FITCRAFT_STEPS.PLAN_GENERATION]: 'Plan Generation',
  [FITCRAFT_STEPS.PRESENTATION]: 'Workout Presentation',
  [FITCRAFT_STEPS.ASSISTANCE]: 'Ongoing Assistance',
  [FITCRAFT_STEPS.REVIEW]: 'Progress Review'
} as const

// Helper functions
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

export function calculateCalories(duration: number, intensity: string, bodyWeight: number = 70): number {
  // Rough calculation based on MET values
  const metValues = {
    low: 3,
    moderate: 6,
    high: 8,
    intense: 10
  }
  
  const met = metValues[intensity as keyof typeof metValues] || 6
  return Math.round((met * bodyWeight * (duration / 60)))
}

export function getBodyTypeDescription(bodyType: string): string {
  const descriptions = {
    ectomorph: 'Naturally lean with fast metabolism, difficulty gaining weight',
    mesomorph: 'Naturally muscular with balanced metabolism, gains muscle easily',
    endomorph: 'Naturally broader with slower metabolism, tends to store fat easily'
  }
  
  return descriptions[bodyType as keyof typeof descriptions] || 'Body type not specified'
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateWorkoutId(): string {
  return `workout_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}