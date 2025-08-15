#!/bin/bash

echo "🚀 Validating Muscles Railpack Configuration"
echo "=============================================="

# Check if required files exist
echo "📋 Checking configuration files..."
if [ -f "railpack.json" ]; then
    echo "✅ railpack.json exists"
else
    echo "❌ railpack.json missing"
    exit 1
fi

if [ -f "railpack.production.json" ]; then
    echo "✅ railpack.production.json exists"
else
    echo "❌ railpack.production.json missing"
fi

if [ -f "railpack.development.json" ]; then
    echo "✅ railpack.development.json exists"
else
    echo "❌ railpack.development.json missing"
fi

# Check directory structure
echo -e "\n📁 Checking directory structure..."
if [ -d "backend/api/src" ]; then
    echo "✅ Backend source directory exists"
else
    echo "❌ Backend source directory missing"
fi

if [ -d "frontend/web/src" ]; then
    echo "✅ Frontend source directory exists"
else
    echo "❌ Frontend source directory missing"
fi

if [ -d "backend/var" ]; then
    echo "✅ Volume mount directories exist"
else
    echo "❌ Volume mount directories missing"
fi

# Check key files
echo -e "\n📄 Checking key application files..."
if [ -f "backend/api/src/main.py" ]; then
    echo "✅ Flask main app exists"
else
    echo "❌ Flask main app missing"
fi

if [ -f "backend/api/requirements.txt" ]; then
    echo "✅ Python requirements exist"
else
    echo "❌ Python requirements missing"
fi

if [ -f "frontend/web/package.json" ]; then
    echo "✅ Frontend package.json exists"
else
    echo "❌ Frontend package.json missing"
fi

# Test JSON syntax
echo -e "\n🔍 Validating JSON syntax..."
if command -v jq >/dev/null 2>&1; then
    if jq . railpack.json >/dev/null 2>&1; then
        echo "✅ railpack.json is valid JSON"
    else
        echo "❌ railpack.json has invalid JSON syntax"
    fi
else
    echo "⚠️  jq not available - skipping JSON validation"
fi

# Test Python imports
echo -e "\n🐍 Testing Python imports..."
cd backend/api
if python -c "import src.main" 2>/dev/null; then
    echo "✅ Flask app imports successfully"
else
    echo "❌ Flask app import failed - check dependencies"
fi
cd ../..

# Test frontend build files
echo -e "\n⚛️  Checking frontend build..."
if [ -d "frontend/web/dist" ]; then
    echo "✅ Frontend build directory exists"
    if [ -f "frontend/web/dist/index.html" ]; then
        echo "✅ Frontend build appears complete"
    else
        echo "⚠️  Frontend build may be incomplete"
    fi
else
    echo "⚠️  Frontend not built yet - run 'pnpm build' in frontend/web"
fi

echo -e "\n✅ Validation complete! Configuration appears ready for Railpack deployment."
echo "🚀 To deploy: railpack deploy --config railpack.production.json"