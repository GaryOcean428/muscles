# CrossFit/HIIT Workout Application - API Documentation

## Overview

The CrossFit/HIIT Workout Application API provides a comprehensive backend service for managing users, workouts, sessions, payments, and calendar integrations. This RESTful API is built with Flask and supports JWT authentication.

**Base URL:** `http://localhost:5000/api`

**Version:** 1.0.0

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

#### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

#### Get Current User
```http
GET /auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

#### Logout
```http
POST /auth/logout
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

## User Profile Management

### Create User Profile
```http
POST /profile
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "age": 25,
  "gender": "male",
  "height_cm": 175,
  "weight_kg": 70,
  "fitness_level": "intermediate",
  "primary_goal": "muscle_gain",
  "workout_frequency": 4,
  "available_equipment": ["dumbbells", "barbell", "pull_up_bar"],
  "medical_conditions": [],
  "workout_preferences": ["strength_training", "hiit"]
}
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": 1,
    "user_id": 1,
    "age": 25,
    "gender": "male",
    "height_cm": 175,
    "weight_kg": 70,
    "fitness_level": "intermediate",
    "primary_goal": "muscle_gain",
    "workout_frequency": 4,
    "available_equipment": ["dumbbells", "barbell", "pull_up_bar"],
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### Get User Profile
```http
GET /profile
```

**Headers:** `Authorization: Bearer <token>`

### Update User Profile
```http
PUT /profile
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (partial update supported)
```json
{
  "age": 26,
  "fitness_level": "advanced"
}
```

## Workout Management

### Get All Workouts
```http
GET /workouts
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of workouts per page
- `workout_type` (optional): Filter by workout type
- `difficulty_level` (optional): Filter by difficulty level

**Response:**
```json
{
  "success": true,
  "workouts": [
    {
      "id": 1,
      "name": "Upper Body Strength",
      "description": "Focus on chest, back, and arms",
      "workout_type": "strength",
      "difficulty_level": "intermediate",
      "estimated_duration": 45,
      "target_muscle_groups": ["chest", "back", "arms"],
      "exercises": [
        {
          "id": 1,
          "exercise_template_id": 1,
          "sets": 3,
          "reps": 12,
          "weight": 50.0,
          "rest_seconds": 60,
          "notes": "Focus on form"
        }
      ],
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 5,
    "per_page": 10,
    "total": 45
  }
}
```

### Get Workout by ID
```http
GET /workouts/{workout_id}
```

**Headers:** `Authorization: Bearer <token>`

### Create Workout
```http
POST /workouts
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "New Workout",
  "description": "A custom workout",
  "workout_type": "cardio",
  "difficulty_level": "beginner",
  "estimated_duration": 30,
  "target_muscle_groups": ["legs", "core"],
  "exercises": [
    {
      "exercise_template_id": 1,
      "sets": 3,
      "reps": 15,
      "rest_seconds": 45,
      "notes": "Keep steady pace"
    }
  ]
}
```

### Update Workout
```http
PUT /workouts/{workout_id}
```

**Headers:** `Authorization: Bearer <token>`

### Delete Workout
```http
DELETE /workouts/{workout_id}
```

**Headers:** `Authorization: Bearer <token>`

### Generate AI Workout
```http
POST /workouts/generate
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "workout_type": "strength",
  "duration_minutes": 45,
  "difficulty_level": "intermediate",
  "target_muscle_groups": ["chest", "back"],
  "available_equipment": ["dumbbells", "barbell"],
  "focus_areas": ["upper_body"],
  "exclude_exercises": ["burpees"]
}
```

**Response:**
```json
{
  "success": true,
  "workout": {
    "name": "AI Generated Upper Body Strength",
    "description": "Customized workout based on your preferences",
    "workout_type": "strength",
    "difficulty_level": "intermediate",
    "estimated_duration": 45,
    "target_muscle_groups": ["chest", "back"],
    "exercises": [
      {
        "exercise_template_id": 1,
        "name": "Push-ups",
        "sets": 3,
        "reps": 12,
        "rest_seconds": 60,
        "instructions": "Keep body straight, lower to ground, push back up"
      }
    ]
  }
}
```

## Exercise Templates

### Get Exercise Templates
```http
GET /exercises/templates
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `search` (optional): Search by exercise name
- `category` (optional): Filter by category
- `muscle_group` (optional): Filter by muscle group
- `equipment` (optional): Filter by required equipment
- `difficulty_level` (optional): Filter by difficulty

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "id": 1,
      "name": "Push-ups",
      "category": "bodyweight",
      "muscle_groups": ["chest", "triceps", "shoulders"],
      "equipment_needed": [],
      "difficulty_level": "beginner",
      "instructions": "Start in plank position, lower body to ground, push back up",
      "tips": "Keep core tight, maintain straight line from head to heels",
      "variations": ["knee push-ups", "diamond push-ups"]
    }
  ]
}
```

## Workout Sessions

### Start Workout Session
```http
POST /sessions
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "workout_id": 1,
  "notes": "Feeling strong today"
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": 1,
    "workout_id": 1,
    "user_id": 1,
    "status": "in_progress",
    "start_time": "2024-01-15T10:00:00Z",
    "notes": "Feeling strong today"
  }
}
```

### Log Exercise Performance
```http
POST /sessions/{session_id}/exercises
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "exercise_id": 1,
  "sets_completed": 3,
  "reps_completed": [12, 10, 8],
  "weight_used": 50.0,
  "rest_time_seconds": 60,
  "notes": "Felt challenging on last set"
}
```

### Complete Workout Session
```http
PUT /sessions/{session_id}/complete
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "notes": "Great workout!",
  "rating": 4
}
```

### Get Session History
```http
GET /sessions
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Sessions per page
- `status` (optional): Filter by status
- `start_date` (optional): Filter from date
- `end_date` (optional): Filter to date

## Payment and Subscriptions

### Get Subscription Plans
```http
GET /payment/plans
```

**Response:**
```json
{
  "success": true,
  "plans": {
    "premium": {
      "name": "Premium Plan",
      "price": 1999,
      "currency": "usd",
      "interval": "month",
      "features": [
        "AI-powered workout generation",
        "Unlimited workouts",
        "Calendar synchronization",
        "Progress tracking",
        "Email support"
      ]
    },
    "pro": {
      "name": "Pro Plan",
      "price": 3999,
      "currency": "usd",
      "interval": "month",
      "features": [
        "Everything in Premium",
        "Advanced analytics",
        "Priority support",
        "Custom workout templates",
        "Team collaboration"
      ]
    }
  }
}
```

### Get User Subscription
```http
GET /payment/subscription
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "subscription": {
    "id": 1,
    "user_id": 1,
    "plan_type": "premium",
    "status": "active",
    "current_period_start": "2024-01-01T00:00:00Z",
    "current_period_end": "2024-02-01T00:00:00Z",
    "cancel_at_period_end": false
  }
}
```

### Create Payment Intent
```http
POST /payment/create-payment-intent
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "plan_type": "premium",
  "payment_method_id": "pm_1234567890"
}
```

### Create Subscription
```http
POST /payment/create-subscription
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "plan_type": "premium",
  "payment_method_id": "pm_1234567890"
}
```

### Cancel Subscription
```http
POST /payment/cancel-subscription
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "immediate": false
}
```

### Check Feature Access
```http
POST /payment/check-feature-access
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "feature": "ai_generation"
}
```

**Response:**
```json
{
  "success": true,
  "has_access": true,
  "plan_type": "premium",
  "feature": "ai_generation"
}
```

### Get Payment History
```http
GET /payment/payment-history
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional): Number of payments to return

## Calendar Integration

### Get Calendar Integrations
```http
GET /calendar/integrations
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "integrations": [
    {
      "id": 1,
      "provider": "google",
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Connect Google Calendar
```http
POST /calendar/google/connect
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "auth_url": "https://accounts.google.com/o/oauth2/auth?..."
}
```

### Connect Microsoft Calendar
```http
POST /calendar/microsoft/connect
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "auth_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?..."
}
```

### Disconnect Calendar
```http
POST /calendar/disconnect
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "provider": "google"
}
```

### Create Workout Event
```http
POST /calendar/create-event
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "workout": {
    "name": "Morning Workout",
    "description": "Upper body strength training"
  },
  "start_time": "2024-01-16T08:00:00Z",
  "duration_minutes": 60
}
```

### Get Sync Status
```http
GET /calendar/sync-status
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "sync_status": {
    "google": true,
    "microsoft": false,
    "total_integrations": 1
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **General endpoints**: 100 requests per minute per user
- **AI generation**: 10 requests per hour per user (free plan), unlimited (premium/pro)

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Webhooks

### Stripe Webhooks

The API supports Stripe webhooks for payment processing:

```http
POST /payment/webhook
```

**Headers:**
- `Stripe-Signature`: Webhook signature for verification

Supported events:
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## SDK and Libraries

### JavaScript/TypeScript
```javascript
// Example usage with fetch
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
```

### Python
```python
import requests

# Login example
response = requests.post('http://localhost:5000/api/auth/login', json={
    'email': 'user@example.com',
    'password': 'password123'
})

data = response.json()
token = data['access_token']

# Authenticated request
headers = {'Authorization': f'Bearer {token}'}
response = requests.get('http://localhost:5000/api/workouts', headers=headers)
```

## Environment Variables

Required environment variables for the API:

```bash
# Database
DATABASE_URL=sqlite:///app.db

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
SECRET_KEY=your-flask-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Calendar
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/google/callback

# Microsoft Calendar
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_REDIRECT_URI=http://localhost:5000/api/calendar/microsoft/callback

# OpenAI
OPENAI_API_KEY=sk-...
```

## Support

For API support and questions:
- Email: support@fitforge.com
- Documentation: https://docs.fitforge.com
- Status Page: https://status.fitforge.com

