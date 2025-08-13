# Railway Deployment Configuration

## Project Structure
This project uses Railpack for Railway deployments with adaptive path resolution.

## File Locations
- **Requirements**: Automatically discovered from multiple locations
- **Entry Point**: Auto-discovered (main.py, app.py, etc.)
- **Start Command**: Adaptive Gunicorn configuration

## Configuration Files
- `railpack.json`: Main adaptive configuration
- `install_deps.sh`: Smart dependency installer
- `start_app.sh`: Adaptive application starter
- `railpack.flat.json`: Alternative for flat project structure
- `railpack.monorepo.json`: Alternative for backend/ subdirectory structure
- `discover_structure.sh`: Diagnostic tool for deployment issues

## Adaptive Path Resolution
The deployment configuration automatically searches for:

### Requirements.txt locations (in order):
1. `backend/crossfit-api/requirements.txt`
2. `requirements.txt` (project root)
3. `backend/requirements.txt`
4. `api/requirements.txt`
5. `src/requirements.txt`

### Application entry points (in order):
1. `backend/crossfit-api/src/main.py`
2. `src/main.py`
3. `main.py`
4. `app.py`
5. `backend/app.py`
6. `backend/main.py`

## Deployment Process
1. **Install Phase**: `install_deps.sh` searches for requirements.txt and installs dependencies
2. **Start Phase**: `start_app.sh` finds the application entry point and starts with Gunicorn
3. **Fallback**: Each script provides detailed logging for troubleshooting

## Environment Variables
- `PORT`: Application port (default: 8000)
- `WORKERS`: Number of Gunicorn workers (default: 4)
- `TIMEOUT`: Request timeout in seconds (default: 120)

## Troubleshooting
If deployment fails:
1. Check Railway logs for path errors
2. Run `./discover_structure.sh` locally to understand structure
3. Verify requirements.txt location matches searched paths
4. Ensure app.py or main.py exists and contains Flask app
5. Confirm gunicorn is in requirements.txt

## Manual Override
To use a specific configuration:
```bash
# For flat structure
railway deploy --config railpack.flat.json

# For monorepo structure  
railway deploy --config railpack.monorepo.json
```

## Scripts Usage
```bash
# Test dependency installation
./install_deps.sh

# Test application startup (use Ctrl+C to stop)
./start_app.sh

# Discover repository structure
./discover_structure.sh

# Validate configuration
./validate-railpack.sh
```

## Production Considerations
- The adaptive scripts add ~2-5 seconds to deployment time
- All fallback paths are logged for transparency
- Failed path attempts are non-fatal and logged
- Gunicorn is configured with production-ready settings