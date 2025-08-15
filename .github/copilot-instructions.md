# Muscles - CrossFit-Inspired/HIIT Workout Application

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

Muscles is a comprehensive full-stack fitness application for CrossFit-Inspired and HIIT workouts. Built with Flask Python backend, React frontend, and React Native mobile app, deployed via Railway with Railpack configuration.

## Working Effectively

### Bootstrap and Build the Repository

**CRITICAL: NEVER CANCEL long-running commands. Set timeouts appropriately.**

1. **Backend Setup (Python Flask API)**:
   ```bash
   cd backend/api
   python3 -m venv venv                    # Takes ~3 seconds
   source venv/bin/activate                # Instant
   pip install -r requirements.txt        # Takes ~20 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
   ```

2. **Frontend Setup (React/Vite)**:
   ```bash
   cd frontend/crossfit-web
   pnpm install                           # Takes ~5 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
   pnpm build                            # Takes ~6 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
   ```

3. **Validate Deployment Configuration**:
   ```bash
   ./validate_deployment.sh              # Takes ~8 seconds. Comprehensive validation script.
   ```

### Running the Application

**Development Mode (Local)**:
1. **Backend**: 
   ```bash
   cd backend/api && source venv/bin/activate
   python src/main.py                    # Development server on port 8000
   ```

2. **Frontend**:
   ```bash
   cd frontend/crossfit-web
   pnpm dev                             # Development server on port 5173
   ```

**Production Mode (Railway-style)**:
```bash
./start_app.sh                          # Smart startup script. Takes ~8 seconds to start Gunicorn.
```

**Docker Compose (Full Stack)**:
```bash
docker compose up -d                    # NEVER CANCEL. Can take 5-15 minutes first time. Set timeout to 30+ minutes.
# Access: Web at http://localhost:3000, API at http://localhost:8000
```

### Testing

**Backend Tests**:
```bash
cd backend/api && source venv/bin/activate
python -m pytest tests/unit/ -v        # Takes ~15 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
python -m pytest tests/unit/test_simple.py -v  # Quick smoke test, ~1 second
```

**NOTE**: Full test suite may fail due to database connectivity in sandboxed environments. Use simple tests for validation.

### Linting and Code Quality

**Backend (Python)**:
```bash
cd backend/api && source venv/bin/activate
# No specific linter configured - follows PEP 8 manually
```

**Frontend (JavaScript/React)**:
```bash
cd frontend/crossfit-web
pnpm lint                              # ESLint check. Takes ~2 seconds. Expect some warnings.
```

## Validation Scenarios

**ALWAYS validate your changes with these complete scenarios after making modifications:**

1. **Basic Health Check**:
   ```bash
   ./validate_deployment.sh             # Must pass with 0 failures
   cd backend/api && source venv/bin/activate
   python -c "from src.main import app; print('✅ Flask app loads')"
   ```

2. **Build Validation**:
   ```bash
   cd frontend/crossfit-web && pnpm build  # Must complete successfully
   cd backend/api && source venv/bin/activate && python -m pytest tests/unit/test_simple.py -v
   ```

3. **Startup Test**:
   ```bash
   timeout 15s ./start_app.sh           # Should start Gunicorn successfully
   ```

## Critical Information

### Timeouts and Timing

- **pip install**: 20 seconds typical, set 120+ second timeout
- **pnpm install**: 5 seconds typical, set 60+ second timeout  
- **pnpm build**: 6 seconds typical, set 60+ second timeout
- **Docker builds**: 10-30 minutes first time, set 45+ minute timeout
- **Tests**: Simple tests 1-15 seconds, full suite may timeout, set 120+ second timeout
- **App startup**: 8 seconds to working server, set 60+ second timeout

### Repository Structure

```
muscles/
├── backend/api/                    # Flask Python API
│   ├── src/                       # Source code (main.py is entry point)
│   ├── tests/                     # pytest tests
│   ├── requirements.txt           # Python dependencies
│   └── venv/                      # Virtual environment (create this)
├── frontend/crossfit-web/         # React/Vite web application  
│   ├── src/                       # Source code
│   ├── package.json               # Node.js dependencies
│   └── dist/                      # Build output
├── android/CrossFitApp/           # React Native mobile app (limited)
├── docker-compose.yml             # Full-stack development
├── railpack.json                  # Railway deployment config
├── install_deps.sh                # Smart dependency installer
├── start_app.sh                   # Smart application starter
└── validate_deployment.sh         # Comprehensive validation
```

### Smart Deployment Scripts

The repository includes intelligent scripts that auto-detect project structure:

- **`install_deps.sh`**: Finds and installs Python dependencies automatically
- **`start_app.sh`**: Locates Flask app and starts with Gunicorn
- **`validate_deployment.sh`**: Validates entire deployment configuration

### Environment Setup

**Required Tools**:
- Python 3.11+ (3.12+ preferred)
- Node.js 20+ with pnpm
- Docker and Docker Compose (for full-stack)

**Database Configuration**:
- PostgreSQL 15+ (production)
- SQLite in-memory (testing)
- Redis 7+ (caching, optional)

**External Services**:
- OpenAI API (workout generation)
- Stripe (payments)
- Google Calendar & Microsoft Outlook APIs

### Common Issues and Solutions

1. **Frontend build fails with "Could not resolve ../lib/utils"**:
   - The utils.js file should exist at `frontend/crossfit-web/src/lib/utils.js`
   - Contains utility functions: `cn`, `formatDate`, `formatDuration`, `getDifficultyColor`, `getWorkoutTypeColor`

2. **Backend tests fail with database errors**:
   - Expected in sandboxed environments without external database
   - Use `tests/unit/test_simple.py` for basic validation
   - Full tests work with proper PostgreSQL connection

3. **Install script fails with "--user" error**:
   - Minor issue when using virtual environments
   - Dependencies install correctly regardless

4. **Linting shows many warnings**:
   - Expected, mostly unused imports and test globals
   - Focus on errors, warnings are acceptable

### Railway Deployment

**Configuration**: Uses Railpack for optimized deployment
```bash
railpack validate                    # Validate configuration
railpack deploy --config railpack.production.json  # Deploy to production
```

**Environment Variables for Production**:
- `DATABASE_URL` (PostgreSQL connection)
- `SECRET_KEY` (Flask secret)
- `JWT_SECRET_KEY` (JWT signing)
- `OPENAI_API_KEY` (AI workout generation)
- `STRIPE_SECRET_KEY` (payments)

## Workflow for Changes

1. **Always start with validation**: `./validate_deployment.sh`
2. **Make minimal changes** to address the issue
3. **Test locally**:
   - Backend: `python -c "from src.main import app; print('OK')"`
   - Frontend: `pnpm build`
4. **Run simple tests**: `python -m pytest tests/unit/test_simple.py -v`
5. **Validate startup**: `timeout 15s ./start_app.sh`
6. **Always run linting before committing**: `pnpm lint` (frontend)

## Key Files and Locations

### Frequently Modified
- **Backend API routes**: `backend/api/src/routes/`
- **Frontend pages**: `frontend/crossfit-web/src/pages/`  
- **Frontend components**: `frontend/crossfit-web/src/components/`
- **Database models**: `backend/api/src/models/`

### Configuration Files
- **Railway**: `railpack.json` (production deployment)
- **Docker**: `docker-compose.yml` (local development)
- **Frontend**: `frontend/crossfit-web/package.json`, `vite.config.js`
- **Backend**: `backend/api/requirements.txt`, `pytest.ini`

### Don't Modify Unless Necessary
- Smart deployment scripts (`install_deps.sh`, `start_app.sh`, `validate_deployment.sh`)
- GitHub Actions workflows (`.github/workflows/`)
- Core configuration files

**Remember: These instructions are tested and validated. Always verify commands work as documented before suggesting alternatives.**