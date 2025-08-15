#!/bin/bash
# Smart application starter - finds and starts the Flask app with enhanced error handling

set -e

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Smart application startup starting...${NC}"

# Detect environment
if [ -n "$RAILWAY_ENVIRONMENT" ]; then
    echo -e "${GREEN}🚂 Railway environment detected: $RAILWAY_ENVIRONMENT${NC}"
elif [ -n "$PORT" ]; then
    echo -e "${GREEN}☁️ Cloud environment detected (PORT=$PORT)${NC}"
else
    echo -e "${YELLOW}💻 Local development environment detected${NC}"
    PORT=${PORT:-8000}
fi

echo -e "${BLUE}📍 Current directory: $(pwd)${NC}"

# Priority-ordered locations to search for Flask app entry points
APP_LOCATIONS=(
  "backend/api/src/main.py"
  "src/main.py"
  "main.py"
  "app.py"
  "backend/app.py"
  "backend/main.py"
  "api/main.py"
  "api/app.py"
)

echo -e "${BLUE}🔍 Searching for Flask application entry point...${NC}"

APP_FILE=""
for loc in "${APP_LOCATIONS[@]}"; do
  echo -e "${BLUE}🔎 Checking: $loc${NC}"
  if [ -f "$loc" ]; then
    APP_FILE="$loc"
    echo -e "${GREEN}✅ Found application at: $APP_FILE${NC}"
    break
  else
    echo -e "${RED}❌ Not found: $loc${NC}"
  fi
done

# If not found, try wildcard search
if [ -z "$APP_FILE" ]; then
    echo -e "${YELLOW}🔍 Trying wildcard search for Flask apps...${NC}"
    
    # Look for files with Flask app patterns
    FOUND_APPS=$(find . -name "*.py" -type f -exec grep -l "app = Flask\|from flask import Flask" {} \; 2>/dev/null | head -5)
    
    if [ -n "$FOUND_APPS" ]; then
        echo -e "${GREEN}✅ Found potential Flask apps:${NC}"
        echo "$FOUND_APPS" | sed 's/^/  /'
        APP_FILE=$(echo "$FOUND_APPS" | head -n 1)
        echo -e "${BLUE}📄 Using: $APP_FILE${NC}"
    fi
fi

if [ -z "$APP_FILE" ]; then
  echo -e "${RED}🚨 ERROR: Could not find Flask application entry point${NC}"
  echo -e "${BLUE}🔍 Searched locations:${NC}"
  printf '  - %s\n' "${APP_LOCATIONS[@]}"
  
  echo -e "\n${BLUE}📁 Available Python files:${NC}"
  find . -name "*.py" -type f | head -10 | sed 's/^/  /'
  
  echo -e "\n${BLUE}💡 Possible solutions:${NC}"
  echo -e "  1. Ensure main.py or app.py exists in one of the expected locations"
  echo -e "  2. Check if the Flask app is in a different file"
  echo -e "  3. Verify the file permissions are correct"
  echo -e "  4. Make sure the Flask app variable is named 'app'"
  
  exit 1
fi

# Extract directory and app name information
APP_DIR=$(dirname "$APP_FILE")
APP_NAME=$(basename "$APP_FILE" .py)

echo -e "${GREEN}📁 Application directory: $APP_DIR${NC}"
echo -e "${GREEN}📄 Application name: $APP_NAME${NC}"

# Verify the Flask app file contains expected patterns
echo -e "${BLUE}🔍 Validating Flask application file...${NC}"
if grep -q "app = Flask\|from flask import Flask" "$APP_FILE"; then
    echo -e "${GREEN}✅ Flask application detected in file${NC}"
else
    echo -e "${YELLOW}⚠️ Warning: File may not contain Flask app${NC}"
fi

# Navigate to application directory
cd "$APP_DIR"
echo -e "${GREEN}📍 Changed to directory: $(pwd)${NC}"

# Environment configuration
WORKERS=${WORKERS:-4}
TIMEOUT=${TIMEOUT:-120}
BIND_ADDRESS="0.0.0.0:${PORT}"

echo -e "${BLUE}⚙️ Configuration:${NC}"
echo -e "  - Workers: $WORKERS"
echo -e "  - Timeout: $TIMEOUT seconds"
echo -e "  - Bind Address: $BIND_ADDRESS"

# Check if gunicorn is available and prefer it for production
if command -v gunicorn &> /dev/null; then
  echo -e "${GREEN}🦄 Starting with Gunicorn (production-ready)...${NC}"
  
  # Determine the correct module path based on directory structure
  if [[ "$APP_DIR" == *"src"* ]]; then
    MODULE_PATH="src.${APP_NAME}:app"
    cd ..  # Go up one level if we're in src directory
    echo -e "${BLUE}📍 Adjusted directory for src structure: $(pwd)${NC}"
    echo -e "${BLUE}🔧 Module path: $MODULE_PATH${NC}"
  else
    MODULE_PATH="${APP_NAME}:app"
    echo -e "${BLUE}🔧 Module path: $MODULE_PATH${NC}"
  fi
  
  # Verify the module can be imported
  echo -e "${BLUE}🔍 Testing module import...${NC}"
  if python -c "import sys; sys.path.insert(0, '.'); from ${MODULE_PATH%:*} import app; print('✅ Module imported successfully')" 2>/dev/null; then
    echo -e "${GREEN}✅ Flask app module loads correctly${NC}"
  else
    echo -e "${YELLOW}⚠️ Warning: Module import test failed, proceeding anyway...${NC}"
  fi
  
  # Start the application with gunicorn
  echo -e "${GREEN}🎯 Starting Gunicorn server...${NC}"
  exec gunicorn "$MODULE_PATH" \
    --bind "$BIND_ADDRESS" \
    --workers "$WORKERS" \
    --timeout "$TIMEOUT" \
    --access-logfile "-" \
    --error-logfile "-" \
    --log-level "info" \
    --preload \
    --max-requests 1000 \
    --max-requests-jitter 100
else
  echo -e "${YELLOW}🐍 Gunicorn not available, starting with Python directly...${NC}"
  echo -e "${BLUE}💡 For production, install gunicorn: pip install gunicorn${NC}"
  
  # Set PORT environment variable for Flask
  export PORT
  export FLASK_APP="$APP_NAME"
  export FLASK_ENV="${FLASK_ENV:-production}"
  
  # Start with Python directly
  exec python "$APP_FILE"
fi