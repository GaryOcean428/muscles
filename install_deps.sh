#!/bin/bash
# Smart requirements installer - searches multiple possible locations

set -e

echo "🔍 Smart dependency installation starting..."

LOCATIONS=(
  "backend/crossfit-api/requirements.txt"
  "requirements.txt"
  "backend/requirements.txt"
  "api/requirements.txt"
  "src/requirements.txt"
)

echo "📍 Current directory: $(pwd)"
echo "📂 Directory contents:"
ls -la

for loc in "${LOCATIONS[@]}"; do
  echo "🔎 Checking: $loc"
  if [ -f "$loc" ]; then
    echo "✅ Found requirements.txt at: $loc"
    echo "⬆️ Upgrading pip..."
    pip install --upgrade pip
    echo "📦 Installing dependencies from $loc..."
    pip install -r "$loc"
    echo "✅ Dependencies installed successfully!"
    exit 0
  else
    echo "❌ Not found: $loc"
  fi
done

echo "🚨 ERROR: Could not find requirements.txt in any expected location"
echo "🔍 Searched locations:"
printf '  - %s\n' "${LOCATIONS[@]}"
echo "📂 Available files in current directory:"
find . -name "*.txt" -type f | head -10
exit 1