# Railway Deployment Configuration Guide

This guide explains the Railway deployment configuration for the Muscles CrossFit application and how to troubleshoot common issues.

## 🚀 Quick Start

The application is configured for automatic Railway deployment using Railpack. Simply push to the repository and Railway will handle the deployment using the provided configuration.

```bash
git push origin main  # Triggers automatic deployment
```

## 📋 Configuration Overview

### Main Configuration: `railpack.json`

```json
{
  "$schema": "https://schema.railpack.com",
  "provider": "python",
  "packages": {
    "python": "3.11"
  },
  "ignore": [
    "frontend/",
    "android/", 
    "node_modules/",
    "*.md",
    ".git/"
  ],
  "steps": {
    "install": {
      "commands": ["./install_deps.sh"]
    }
  },
  "deploy": {
    "startCommand": "./start_app.sh",
    "aptPackages": ["libpq5", "python3-dev"]
  }
}
```

### Smart Deployment Scripts

The configuration uses intelligent scripts that automatically detect and adapt to the repository structure:

- **`install_deps.sh`**: Automatically finds and installs Python dependencies
- **`start_app.sh`**: Automatically finds and starts the Flask application
- **`validate_deployment.sh`**: Validates the deployment configuration before deployment

## 🛠️ Repository Structure

```
muscles/
├── railpack.json                 # Main Railway configuration
├── install_deps.sh              # Smart dependency installer
├── start_app.sh                 # Smart application starter
├── validate_deployment.sh       # Deployment validator
├── backend/
│   └── crossfit-api/
│       ├── requirements.txt      # Python dependencies
│       ├── src/
│       │   └── main.py          # Flask application
│       └── tests/               # Test files
├── frontend/                    # Frontend application (ignored in API deployment)
└── android/                     # Android app (ignored in API deployment)
```

## 🔧 How It Works

### 1. Dependency Installation (`install_deps.sh`)

The script searches for `requirements.txt` in priority order:

1. `backend/crossfit-api/requirements.txt` ✅ (Current location)
2. `requirements.txt` (Root level)
3. `backend/requirements.txt`
4. `api/requirements.txt`
5. `src/requirements.txt`

**Features:**
- ✅ Automatic path detection
- ✅ Environment detection (Railway/Cloud/Local)
- ✅ Dependency validation
- ✅ Critical package verification
- ✅ Comprehensive error messages

### 2. Application Startup (`start_app.sh`)

The script searches for Flask applications in priority order:

1. `backend/crossfit-api/src/main.py` ✅ (Current location)
2. `src/main.py`
3. `main.py`
4. `app.py`
5. Plus additional fallback locations

**Features:**
- ✅ Automatic Flask app detection
- ✅ Gunicorn production server (preferred)
- ✅ Python fallback for development
- ✅ Environment configuration
- ✅ Module import validation

## 🧪 Testing & Validation

### Pre-deployment Validation

Run the validation script to check your configuration:

```bash
./validate_deployment.sh
```

This checks:
- ✅ Configuration file syntax
- ✅ Required files and directories
- ✅ Script permissions
- ✅ Python environment
- ✅ Dependency resolution
- ✅ Flask application detection

### Local Testing

Test the deployment scripts locally:

```bash
# Test dependency installation
./install_deps.sh

# Test application startup (with timeout)
timeout 10s ./start_app.sh
```

### Run Application Tests

```bash
cd backend/crossfit-api
python -m pytest tests/unit/ -v
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. "Could not find requirements.txt"

**Symptoms:**
```
ERROR: Could not find requirements.txt in any expected location
```

**Solutions:**
- Verify `backend/crossfit-api/requirements.txt` exists
- Check file permissions: `ls -la backend/crossfit-api/requirements.txt`
- Ensure file is not empty
- Run validation: `./validate_deployment.sh`

#### 2. "Could not find Flask application"

**Symptoms:**
```
ERROR: Could not find application entry point
```

**Solutions:**
- Verify `backend/crossfit-api/src/main.py` exists
- Check that it contains Flask app: `grep -n "Flask" backend/crossfit-api/src/main.py`
- Ensure file permissions are correct
- Validate Flask app can be imported: `cd backend/crossfit-api && python -c "from src.main import app"`

#### 3. Module Import Errors

**Symptoms:**
```
ModuleNotFoundError: No module named 'src'
```

**Solutions:**
- The start script automatically handles module path resolution
- Ensure directory structure matches expectations
- Check Python path configuration in the application

#### 4. Database Connection Errors (Expected in local development)

**Symptoms:**
```
could not translate host name "postgres-xxx.railway.internal"
```

**Solutions:**
- This is normal in local development
- Railway provides database environment variables automatically
- For local testing, set up local database or use SQLite fallback

### Railway-Specific Issues

#### Build Timeout
- Increase build timeout in Railway dashboard
- Optimize requirements.txt (remove unnecessary packages)
- Use Railway's build cache

#### Memory Issues
- Reduce Gunicorn workers: Set `WORKERS=2` environment variable
- Upgrade Railway plan for more memory
- Optimize application memory usage

#### Port Binding Issues
- Railway automatically sets `PORT` environment variable
- The start script automatically uses this port
- Don't hardcode port numbers in the application

## 🌐 Environment Variables

### Required for Production

| Variable | Description | Source |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Railway (automatic) |
| `SECRET_KEY` | Flask secret key | Set in Railway dashboard |

### Optional Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | Railway sets automatically | Application port |
| `WORKERS` | 4 | Number of Gunicorn workers |
| `TIMEOUT` | 120 | Request timeout in seconds |
| `FLASK_ENV` | production | Flask environment |

### Setting Environment Variables

In Railway dashboard:
1. Go to your project
2. Click "Variables" tab
3. Add variables as needed

## 📚 Additional Resources

### Railway Documentation
- [Railway Docs](https://docs.railway.app/)
- [Railpack Configuration](https://docs.railway.app/deploy/railpack)
- [Python Deployment Guide](https://docs.railway.app/deploy/python)

### Application-Specific
- Flask Documentation: https://flask.palletsprojects.com/
- Gunicorn Documentation: https://gunicorn.org/

## 🚨 Production Checklist

Before deploying to production:

- [ ] Run `./validate_deployment.sh` with no failures
- [ ] Set required environment variables in Railway
- [ ] Test locally with production-like data
- [ ] Ensure database migrations are ready
- [ ] Configure monitoring and logging
- [ ] Set up backup procedures
- [ ] Test scaling configuration
- [ ] Verify security configurations

## 🔄 Deployment Workflow

1. **Development**: Make changes locally
2. **Testing**: Run `./validate_deployment.sh`
3. **Local Testing**: Test scripts locally
4. **Commit**: Push changes to repository
5. **Automatic Deployment**: Railway deploys automatically
6. **Monitoring**: Check Railway logs for issues

## 🆘 Getting Help

If you encounter issues:

1. Check Railway logs in the dashboard
2. Run the validation script locally
3. Test deployment scripts locally
4. Check the troubleshooting section above
5. Consult Railway documentation
6. Contact support with specific error messages and logs

---

*This configuration provides a robust, self-healing deployment setup that automatically adapts to repository changes while maintaining production reliability.*