#!/bin/bash
# Muscles Project - Remove CrossFit References Migration Script
# This script performs atomic directory renaming and updates all references

set -e  # Exit on error

echo "🚀 Starting CrossFit terminology removal migration..."

# Phase 1: Create backup
echo "📦 Creating backup..."
cp -r backend/crossfit-api backend/crossfit-api.backup 2>/dev/null || true
cp -r frontend/crossfit-web frontend/crossfit-web.backup 2>/dev/null || true
cp -r android/CrossFitApp android/CrossFitApp.backup 2>/dev/null || true

# Phase 2: Copy directories to new names (preserving git history)
echo "📁 Migrating directories..."
if [ -d "backend/crossfit-api" ] && [ ! -d "backend/api" ]; then
    cp -r backend/crossfit-api backend/api
    echo "✅ Copied backend/crossfit-api → backend/api"
fi

if [ -d "frontend/crossfit-web" ] && [ ! -d "frontend/web" ]; then
    cp -r frontend/crossfit-web frontend/web
    echo "✅ Copied frontend/crossfit-web → frontend/web"
fi

if [ -d "android/CrossFitApp" ] && [ ! -d "android/MusclesApp" ]; then
    cp -r android/CrossFitApp android/MusclesApp
    echo "✅ Copied android/CrossFitApp → android/MusclesApp"
fi

# Phase 3: Update all Python imports
echo "🐍 Updating Python imports..."
find backend/api -name "*.py" -type f -exec sed -i.bak \
    -e 's/crossfit-api/api/g' \
    -e 's/crossfit_api/api/g' \
    -e 's/CrossFit/Muscles/g' \
    {} \;

# Phase 4: Update configuration files
echo "⚙️ Updating configuration files..."

# Update docker-compose.yml
if [ -f "docker-compose.yml" ]; then
    sed -i.bak 's|backend/crossfit-api|backend/api|g' docker-compose.yml
    sed -i.bak 's|frontend/crossfit-web|frontend/web|g' docker-compose.yml
fi

# Update package.json files
if [ -f "frontend/web/package.json" ]; then
    sed -i.bak 's/crossfit/muscles/g' frontend/web/package.json
fi

# Update validation scripts
for script in validate_deployment.sh validate-railpack.sh build_and_deploy.py start_app.sh; do
    if [ -f "$script" ]; then
        sed -i.bak 's|backend/crossfit-api|backend/api|g' "$script"
        sed -i.bak 's|frontend/crossfit-web|frontend/web|g' "$script"
        sed -i.bak 's|android/CrossFitApp|android/MusclesApp|g' "$script"
    fi
done

# Phase 5: Update root requirements.txt
echo "📦 Updating root requirements.txt..."
cat > requirements.txt << 'EOF'
# Root requirements.txt for Railway deployment
# References the actual requirements file in the backend directory

-r backend/api/requirements.txt
EOF

# Phase 6: Update documentation
echo "📚 Updating documentation..."
for doc in README.md docs/*.md *.md; do
    if [ -f "$doc" ]; then
        sed -i.bak \
            -e 's|backend/crossfit-api|backend/api|g' \
            -e 's|frontend/crossfit-web|frontend/web|g' \
            -e 's|android/CrossFitApp|android/MusclesApp|g' \
            -e 's/CrossFit-Inspired/High-Intensity/g' \
            -e 's/CrossFit/HIIT/g' \
            "$doc"
    fi
done

# Phase 7: Update HTML and manifest files
echo "🌐 Updating frontend assets..."
if [ -f "frontend/web/public/manifest.json" ]; then
    sed -i.bak 's/CrossFit-Inspired/High-Intensity/g' frontend/web/public/manifest.json
    sed -i.bak 's/CrossFit/HIIT/g' frontend/web/public/manifest.json
fi

if [ -f "frontend/web/index.html" ]; then
    sed -i.bak 's/CrossFit/Muscles/g' frontend/web/index.html
fi

# Phase 8: Update React components
echo "⚛️ Updating React components..."
find frontend/web/src -name "*.jsx" -o -name "*.js" -o -name "*.tsx" -o -name "*.ts" | while read file; do
    sed -i.bak \
        -e "s/'crossfit'/'hiit'/g" \
        -e 's/"crossfit"/"hiit"/g' \
        -e 's/CrossFit-Inspired/High-Intensity/g' \
        -e 's/CrossFit/HIIT/g' \
        "$file"
done

# Phase 9: Clean up backup files
echo "🧹 Cleaning up backup files..."
find . -name "*.bak" -delete

# Phase 10: Verify migration
echo "✅ Verifying migration..."
errors=0

if [ ! -d "backend/api" ]; then
    echo "❌ backend/api directory not created"
    errors=$((errors + 1))
fi

if [ ! -d "frontend/web" ]; then
    echo "❌ frontend/web directory not created"
    errors=$((errors + 1))
fi

# Check for remaining crossfit references
remaining=$(grep -r "crossfit" --include="*.py" --include="*.js" --include="*.jsx" --include="*.json" --include="*.md" . 2>/dev/null | grep -v ".backup" | wc -l)
if [ $remaining -gt 0 ]; then
    echo "⚠️ Found $remaining remaining 'crossfit' references"
fi

if [ $errors -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Remove old directories: rm -rf backend/crossfit-api frontend/crossfit-web android/CrossFitApp"
    echo "2. Remove backup directories: rm -rf *.backup"
    echo "3. Commit changes: git add -A && git commit -m 'Complete CrossFit terminology removal'"
    echo "4. Force Railway rebuild: railway up --force"
else
    echo "❌ Migration completed with $errors errors"
    echo "Review the errors above and run the script again after fixing them"
fi
