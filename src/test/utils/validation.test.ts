import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useFormValidation, sanitizeString, sanitizeEmail, sanitizeNumber } from '@/utils/validation'
import { z } from 'zod'

const testSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18 or older')
})

const initialData = {
  name: '',
  email: '',
  age: 0
}

describe('useFormValidation Hook', () => {
  it('initializes with provided data', () => {
    const { result } = renderHook(() => 
      useFormValidation(testSchema, initialData)
    )
    
    expect(result.current.data).toEqual(initialData)
    expect(result.current.isValid).toBe(false)
  })

  it('validates fields and shows errors', () => {
    const { result } = renderHook(() => 
      useFormValidation(testSchema, initialData)
    )
    
    act(() => {
      result.current.updateField('name', 'a') // Too short
    })
    
    expect(result.current.errors.name).toBe('Name too short')
    expect(result.current.isValid).toBe(false)
  })

  it('validates successfully with correct data', () => {
    const { result } = renderHook(() => 
      useFormValidation(testSchema, initialData)
    )
    
    act(() => {
      result.current.updateField('name', 'John Doe')
    })
    
    act(() => {
      result.current.updateField('email', 'john@example.com')
    })
    
    act(() => {
      result.current.updateField('age', 25)
    })
    
    expect(result.current.errors).toEqual({})
    expect(result.current.isValid).toBe(true)
  })

  it('resets form data', () => {
    const { result } = renderHook(() => 
      useFormValidation(testSchema, initialData)
    )
    
    act(() => {
      result.current.updateField('name', 'John')
    })
    
    act(() => {
      result.current.resetForm()
    })
    
    expect(result.current.data).toEqual(initialData)
    expect(result.current.errors).toEqual({})
  })
})

describe('Sanitization Functions', () => {
  describe('sanitizeString', () => {
    it('removes dangerous characters', () => {
      const input = '<script>alert("xss")</script>'
      const result = sanitizeString(input)
      expect(result).toBe('scriptalert(xss)/script')
    })

    it('trims whitespace', () => {
      const input = '  hello world  '
      const result = sanitizeString(input)
      expect(result).toBe('hello world')
    })

    it('limits string length', () => {
      const input = 'a'.repeat(2000)
      const result = sanitizeString(input)
      expect(result).toHaveLength(1000)
    })
  })

  describe('sanitizeEmail', () => {
    it('converts to lowercase', () => {
      const result = sanitizeEmail('TEST@EXAMPLE.COM')
      expect(result).toBe('test@example.com')
    })

    it('trims whitespace', () => {
      const result = sanitizeEmail('  test@example.com  ')
      expect(result).toBe('test@example.com')
    })
  })

  describe('sanitizeNumber', () => {
    it('parses string numbers', () => {
      const result = sanitizeNumber('42')
      expect(result).toBe(42)
    })

    it('handles invalid numbers', () => {
      const result = sanitizeNumber('not a number', 0, 100)
      expect(result).toBe(0)
    })

    it('clamps values to range', () => {
      const result = sanitizeNumber(150, 0, 100)
      expect(result).toBe(100)
    })

    it('handles negative numbers', () => {
      const result = sanitizeNumber(-50, 0, 100)
      expect(result).toBe(0)
    })
  })
})