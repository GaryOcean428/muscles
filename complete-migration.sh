#!/bin/bash
# Complete Directory Migration Script for Railway Deployment Fix
# This script copies the entire backend/crossfit-api to backend/api

set -e  # Exit on error

echo "🚀 Starting complete directory migration for Railway deployment fix..."

# Phase 1: Ensure backend/api exists with all files from crossfit-api
if [ -d "backend/crossfit-api" ]; then
    echo "📁 Creating backend/api with all files from crossfit-api..."
    
    # Remove any partial backend/api directory if it exists
    rm -rf backend/api
    
    # Copy entire directory structure
    cp -r backend/crossfit-api backend/api
    
    echo "✅ Successfully copied backend/crossfit-api → backend/api"
    
    # List what was copied for verification
    echo "📋 Copied structure:"
    find backend/api -type f -name "*.py" | head -20
else
    echo "❌ Error: backend/crossfit-api directory not found!"
    exit 1
fi

# Phase 2: Update railpack.json to use backend/api
echo "⚙️ Updating railpack.json configuration..."
cat > railpack.json << 'EOF'
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
    ".git/",
    "*.pyc",
    "__pycache__/",
    ".pytest_cache/",
    ".coverage",
    "*.log",
    ".env",
    ".venv/",
    "venv/",
    "docs/",
    "tests/",
    "*.md"
  ],
  "steps": {
    "install": {
      "commands": [
        "pip install --upgrade pip setuptools wheel",
        "cd backend/api && pip install --no-cache-dir -r requirements.txt"
      ],
      "timeout": 600
    },
    "build": {
      "commands": [
        "cd backend/api && python -m py_compile src/main.py",
        "cd backend/api && python -c 'import src.main; print(\"✅ Flask app imports successfully\")'"
      ],
      "timeout": 120
    }
  },
  "deploy": {
    "startCommand": "cd backend/api && gunicorn src.main:app --bind 0.0.0.0:${PORT:-5000} --workers 4 --worker-class sync --timeout 120 --keep-alive 2 --max-requests 1000 --max-requests-jitter 100 --log-level info --access-logfile - --error-logfile -",
    "healthCheckPath": "/api/health",
    "healthCheckTimeout": 300,
    "healthCheckInterval": 30,
    "healthCheckRetries": 3,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3,
    "gracefulShutdownTimeout": 30
  },
  "environment": {
    "FLASK_ENV": "production",
    "PYTHONUNBUFFERED": "1",
    "PYTHONDONTWRITEBYTECODE": "1",
    "PYTHONPATH": "/app/backend/api:$PYTHONPATH"
  },
  "services": {
    "postgres": {
      "required": true,
      "version": "15"
    },
    "redis": {
      "required": true,
      "version": "7"
    }
  },
  "monitoring": {
    "healthCheck": {
      "enabled": true,
      "path": "/api/health",
      "interval": 30,
      "timeout": 10
    }
  }
}
EOF
echo "✅ Updated railpack.json"

# Phase 3: Update root requirements.txt
echo "📦 Updating root requirements.txt..."
cat > requirements.txt << 'EOF'
# Root requirements.txt for Railway deployment
# References the actual requirements file in the backend directory

-r backend/api/requirements.txt
EOF
echo "✅ Updated requirements.txt"

# Phase 4: Verify the migration
echo ""
echo "✅ Verification checklist:"

if [ -f "backend/api/src/main.py" ]; then
    echo "  ✓ backend/api/src/main.py exists"
else
    echo "  ✗ backend/api/src/main.py NOT FOUND"
fi

if [ -f "backend/api/requirements.txt" ]; then
    echo "  ✓ backend/api/requirements.txt exists"
else
    echo "  ✗ backend/api/requirements.txt NOT FOUND"
fi

if [ -d "backend/api/src/routes" ]; then
    echo "  ✓ backend/api/src/routes directory exists"
else
    echo "  ✗ backend/api/src/routes directory NOT FOUND"
fi

if [ -d "backend/api/src/models" ]; then
    echo "  ✓ backend/api/src/models directory exists"
else
    echo "  ✗ backend/api/src/models directory NOT FOUND"
fi

echo ""
echo "📝 Migration complete! Next steps:"
echo "1. Run this script: ./complete-migration.sh"
echo "2. Commit changes: git add -A && git commit -m 'Complete backend directory migration to backend/api'"
echo "3. Push to GitHub: git push origin main"
echo "4. Railway will automatically redeploy with the new structure"
echo ""
echo "Optional cleanup after successful deployment:"
echo "  rm -rf backend/crossfit-api  # Remove old directory"
echo "  rm -rf frontend/crossfit-web  # Remove old frontend if needed"
