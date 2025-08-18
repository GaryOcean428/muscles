import { z } from 'zod'

// Validation schemas
export const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(13, 'Must be at least 13 years old').max(120, 'Invalid age').optional(),
  height_cm: z.number().min(100, 'Height too low').max(300, 'Height too high').optional(),
  weight_kg: z.number().min(20, 'Weight too low').max(500, 'Weight too high').optional(),
  body_type: z.enum(['ectomorph', 'mesomorph', 'endomorph']).optional(),
  fitness_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  workout_frequency: z.number().min(1).max(7).optional(),
  preferred_duration: z.number().min(10).max(240).optional()
})

export const workoutGenerationSchema = z.object({
  fitness_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  duration_minutes: z.number().min(10, 'Minimum 10 minutes').max(240, 'Maximum 4 hours'),
  equipment_available: z.array(z.string()).min(1, 'Select at least one equipment option'),
  target_muscle_groups: z.array(z.string()).optional(),
  workout_type: z.enum(['strength', 'cardio', 'hiit', 'flexibility', 'mixed']).optional(),
  user_preferences: z.object({
    avoid_exercises: z.array(z.string()).optional(),
    focus_areas: z.array(z.string()).optional(),
    intensity_preference: z.enum(['low', 'moderate', 'high']).optional()
  }).optional()
})

export const chatMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
  conversation_id: z.string().uuid('Invalid conversation ID')
})

// Input sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
    .slice(0, 1000) // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function sanitizeNumber(input: string | number, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  const num = typeof input === 'string' ? parseFloat(input) : input
  if (isNaN(num)) return min
  return Math.max(min, Math.min(max, num))
}

// Rate limiting utilities
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private limit: number
  private windowMs: number

  constructor(limit: number, windowMs: number) {
    this.limit = limit
    this.windowMs = windowMs
  }

  isAllowed(key: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.limit) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(key, validRequests)
    return true
  }

  reset(key?: string): void {
    if (key) {
      this.requests.delete(key)
    } else {
      this.requests.clear()
    }
  }
}

// Rate limiters for different operations
export const chatRateLimiter = new RateLimiter(10, 60000) // 10 messages per minute
export const workoutGenerationRateLimiter = new RateLimiter(5, 300000) // 5 generations per 5 minutes
export const apiRateLimiter = new RateLimiter(100, 60000) // 100 API calls per minute

// Form validation hook
export function useFormValidation<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  initialData: T
) {
  const [data, setData] = useState<T>(initialData)
  const [errors, setErrors] = useState<Record<keyof T, string>>({})
  const [isValid, setIsValid] = useState(false)

  const validate = useCallback((data: T) => {
    try {
      schema.parse(data)
      setErrors({})
      setIsValid(true)
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = {} as Record<keyof T, string>
        error.errors.forEach(err => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as keyof T] = err.message
          }
        })
        setErrors(fieldErrors)
      }
      setIsValid(false)
      return false
    }
  }, [schema])

  const updateField = useCallback((field: keyof T, value: any) => {
    const newData = { ...data, [field]: value }
    setData(newData)
    validate(newData)
  }, [data, validate])

  const resetForm = useCallback(() => {
    setData(initialData)
    setErrors({})
    setIsValid(false)
  }, [initialData])

  useEffect(() => {
    validate(data)
  }, [data, validate])

  return {
    data,
    errors,
    isValid,
    updateField,
    resetForm,
    validate: () => validate(data)
  }
}

// Content Security Policy helpers
export function validateImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['https:', 'data:'].includes(parsed.protocol) &&
           /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(parsed.pathname)
  } catch {
    return false
  }
}

export function validateVideoUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['https:'].includes(parsed.protocol) &&
           (/\.(mp4|webm|ogg)$/i.test(parsed.pathname) ||
            ['youtube.com', 'youtu.be', 'vimeo.com'].some(domain => 
              parsed.hostname.includes(domain)
            ))
  } catch {
    return false
  }
}

// XSS prevention
export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

// CSRF token management
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function validateCSRFToken(token: string): boolean {
  return /^[a-f0-9]{64}$/i.test(token)
}

import { useState, useCallback, useEffect } from 'react'