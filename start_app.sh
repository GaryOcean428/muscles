#!/bin/bash
# Smart application starter - finds and starts the Flask app

set -e

echo "🚀 Smart application startup starting..."
echo "📍 Current directory: $(pwd)"

# First, try to find the main application file
APP_LOCATIONS=(
  "backend/crossfit-api/src/main.py"
  "src/main.py"
  "main.py"
  "app.py"
  "backend/app.py"
  "backend/main.py"
)

echo "🔍 Searching for application entry point..."

APP_FILE=""
for loc in "${APP_LOCATIONS[@]}"; do
  echo "🔎 Checking: $loc"
  if [ -f "$loc" ]; then
    APP_FILE="$loc"
    echo "✅ Found application at: $APP_FILE"
    break
  else
    echo "❌ Not found: $loc"
  fi
done

if [ -z "$APP_FILE" ]; then
  echo "🚨 ERROR: Could not find application entry point"
  echo "🔍 Searched locations:"
  printf '  - %s\n' "${APP_LOCATIONS[@]}"
  exit 1
fi

# Extract directory and app name
APP_DIR=$(dirname "$APP_FILE")
APP_NAME=$(basename "$APP_FILE" .py)

echo "📁 Application directory: $APP_DIR"
echo "📄 Application name: $APP_NAME"

# Navigate to application directory
cd "$APP_DIR"
echo "📍 Changed to directory: $(pwd)"

# Check if gunicorn is available
if command -v gunicorn &> /dev/null; then
  echo "🦄 Starting with Gunicorn..."
  
  # Determine the module path based on directory structure
  if [[ "$APP_DIR" == *"src"* ]]; then
    MODULE_PATH="src.${APP_NAME}:app"
    cd ..  # Go up one level if we're in src
    echo "📍 Adjusted directory: $(pwd)"
    echo "🔧 Module path: $MODULE_PATH"
  else
    MODULE_PATH="${APP_NAME}:app"
    echo "🔧 Module path: $MODULE_PATH"
  fi
  
  # Start the application with gunicorn
  exec gunicorn "$MODULE_PATH" \
    --bind "0.0.0.0:${PORT:-8000}" \
    --workers "${WORKERS:-4}" \
    --timeout "${TIMEOUT:-120}" \
    --access-logfile "-" \
    --error-logfile "-" \
    --log-level "info"
else
  echo "🐍 Starting with Python directly..."
  exec python "$APP_FILE"
fi