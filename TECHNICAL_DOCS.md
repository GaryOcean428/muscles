# Muscles Application - Technical Documentation

## Overview
Muscles is a comprehensive HIIT (High-Intensity Interval Training) fitness application built with:
- **Backend**: Flask Python API with PostgreSQL database
- **Frontend**: React web application with Vite and TailwindCSS
- **Mobile**: React Native Android app
- **Deployment**: Railway platform using railpack configuration

## Repository Structure

```
muscles/
├── backend/api/                 # Flask Python API
│   ├── src/                    # Source code
│   │   ├── main.py            # Flask application entry point
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── routes/            # API endpoints
│   │   └── services/          # Business logic services
│   ├── tests/                 # Test files
│   ├── requirements.txt       # Python dependencies
│   ├── mypy.ini              # Type checking configuration
│   └── venv/                 # Virtual environment
├── frontend/web/              # React web application
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utility functions
│   │   └── services/        # API services
│   ├── public/              # Static assets
│   ├── package.json         # Node.js dependencies
│   └── dist/               # Build output
├── android/MusclesApp/       # React Native mobile app
├── docs/                    # Documentation
├── railpack.json           # Railway deployment configuration
├── docker-compose.yml      # Local development environment
├── install_deps.sh         # Dependency installation script
├── start_app.sh           # Application startup script
└── validate_deployment.sh  # Deployment validation script
```

## Quick Start

### Development Setup

1. **Backend Setup**:
   ```bash
   cd backend/api
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python src/main.py
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend/web
   yarn install
   yarn dev
   ```

3. **Full Stack with Docker**:
   ```bash
   docker compose up -d
   ```

### Building and Testing

```bash
# Install all dependencies
yarn install:backend
yarn install:frontend

# Build frontend
yarn build:frontend

# Run tests
yarn test:backend

# Type checking
yarn type-check:backend

# Linting
yarn lint:frontend

# Validate deployment
yarn validate
```

## Railway Deployment

### Configuration
The application uses `railpack.json` for Railway deployment with the following features:
- Python 3.11 runtime
- Smart dependency installation via `install_deps.sh`
- Production-ready Gunicorn server
- Health checks and monitoring
- PostgreSQL and Redis services

### Deployment Process
1. Push code to repository
2. Railway automatically detects railpack.json
3. Runs installation and build steps
4. Starts application with Gunicorn
5. Health checks validate deployment

### Environment Variables
Required for production:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Flask secret key
- `JWT_SECRET_KEY`: JWT signing key
- `OPENAI_API_KEY`: AI workout generation
- `STRIPE_SECRET_KEY`: Payment processing

## Key Features

### Backend Features
- **Authentication**: JWT-based user authentication
- **Database**: SQLAlchemy models for users, workouts, sessions
- **AI Integration**: Workout generation using Groq/OpenAI
- **Payment Processing**: Stripe integration for subscriptions
- **Calendar Sync**: Google Calendar and Microsoft Outlook integration
- **Type Safety**: MyPy type checking enabled

### Frontend Features
- **Modern UI**: React with TailwindCSS and shadcn/ui components
- **Responsive Design**: Mobile and desktop optimized
- **Type Safety**: TypeScript configurations
- **Build Optimization**: Vite for fast development and builds
- **Component Library**: Reusable UI components

### Quality Assurance
- **Testing**: Pytest for backend, Jest for frontend
- **Linting**: ESLint for frontend, Python standards for backend
- **Type Checking**: MyPy for Python, TypeScript configurations
- **Code Formatting**: Consistent code style across languages

## Troubleshooting

### Common Issues

1. **Frontend Build Fails**: 
   - Check if `frontend/web/src/lib/utils.js` exists
   - Ensure all dependencies are installed with `npm install`

2. **Backend Import Errors**:
   - Activate virtual environment: `source backend/api/venv/bin/activate`
   - Install dependencies: `pip install -r requirements.txt`

3. **Railway Deployment Issues**:
   - Run validation: `./validate_deployment.sh`
   - Check environment variables in Railway dashboard
   - Review deployment logs for specific errors

4. **Database Connection Issues**:
   - Expected in development without external database
   - Use SQLite for local development
   - Configure PostgreSQL URL for production

### Development Tips
- Use `validate_deployment.sh` before pushing changes
- Test both frontend and backend builds locally
- Keep dependencies updated and compatible
- Follow type hints for better code quality

## Contributing

1. Run validation before committing: `./validate_deployment.sh`
2. Ensure all tests pass: `npm run test:backend`
3. Fix linting issues: `npm run lint:frontend`
4. Add type hints to new Python code
5. Update documentation for major changes

---
*Last updated: August 2025*