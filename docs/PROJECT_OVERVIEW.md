# Muscles - High-Intensity/HIIT Workout Application

## Project Overview

This is a comprehensive High-Intensity/HIIT workout application that provides personalized workout plans, calendar integration, and progress tracking across web and mobile platforms.

## Architecture

### Backend (Flask API)
- **Location**: `/backend/muscles-api/`
- **Technology**: Flask with SQLite database
- **Features**: 
  - User authentication and profile management
  - AI-powered workout generation
  - Session tracking and feedback
  - Calendar integration APIs
  - Payment processing with Stripe

### Web Frontend (React)
- **Location**: `/frontend/muscles-web/`
- **Technology**: React with Vite, Tailwind CSS, shadcn/ui
- **Features**:
  - Responsive web interface
  - User dashboard and profile management
  - Workout generation and tracking
  - Calendar view and scheduling
  - Payment and subscription management

### Android App (React Native)
- **Location**: `/android/`
- **Technology**: React Native
- **Features**:
  - Native mobile experience
  - Push notifications
  - Offline workout tracking
  - Calendar synchronization

## Key Features

1. **Personalized Workout Generation**
   - AI-powered workout creation based on user goals, body type, and fitness level
   - Equipment-specific exercise substitutions
   - Progressive difficulty adjustment

2. **User Management**
   - Secure authentication system
   - Comprehensive user profiles
   - Equipment registry management

3. **Workout Tracking**
   - Real-time performance logging
   - Feedback collection and analysis
   - Progress visualization

4. **Calendar Integration**
   - In-app workout scheduling
   - Google Calendar synchronization
   - Outlook Calendar synchronization

5. **Payment Processing**
   - Stripe integration for subscriptions
   - Tiered access levels (free/premium)
   - Billing management

## Development Status

- ✅ Project structure created
- ✅ Flask backend initialized
- ✅ React frontend initialized
- ✅ Android project structure created
- 🔄 Database design and API development (in progress)

## Getting Started

### Backend Development
```bash
cd backend/api
source venv/bin/activate
python src/main.py
```

### Frontend Development
```bash
cd frontend/web
yarn dev
```

## API Endpoints (Planned)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/equipment` - Get equipment registry
- `POST /api/users/equipment` - Add equipment

### Workouts
- `GET /api/workouts` - Get user workouts
- `POST /api/workouts/generate` - Generate new workout
- `GET /api/workouts/:id` - Get specific workout

### Sessions
- `GET /api/sessions` - Get workout sessions
- `POST /api/sessions` - Create session
- `PUT /api/sessions/:id/complete` - Complete session
- `POST /api/sessions/:id/feedback` - Submit feedback

### Calendar
- `GET /api/calendar/events` - Get calendar events
- `POST /api/calendar/events` - Create event
- `POST /api/calendar/sync` - Sync external calendar

### Payments
- `POST /api/payments/subscribe` - Create subscription
- `GET /api/payments/history` - Payment history

