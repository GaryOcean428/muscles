#!/bin/bash
set -e

# Ensure we're on the main branch
git checkout main

# Check for important directories and files
DIRS=(
  "src"
  "public"
  "supabase"
)

FILES=(
  "package.json"
  "vite.config.ts"
  "tailwind.config.js"
  "tsconfig.json"
  "railway.json"
  "nixpacks.toml"
  "DEPLOYMENT_STATUS.md"
  "DEPLOYMENT_GUIDE.md"
  "BACKEND_SETUP_COMPLETE.md"
  "STRIPE_INTEGRATION_TESTING.md"
  "backend-info.json"
)

# Create backup of current main branch
mkdir -p ../backup_main
find . -maxdepth 1 -type f -not -path "*/\.*" -exec cp {} ../backup_main/ \;
find . -maxdepth 1 -type d -not -path "*/\.*" -not -path "." -exec cp -r {} ../backup_main/ \;

# Switch to master to copy files
git checkout master

# Copy directories
for dir in "${DIRS[@]}"; do
  if [ -d "$dir" ]; then
    mkdir -p "../backup_master/$dir"
    cp -r "$dir"/* "../backup_master/$dir/"
  fi
done

# Copy files
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "../backup_master/"
  fi
done

# Switch back to main
git checkout main

# Restore files from master
for dir in "${DIRS[@]}"; do
  if [ -d "../backup_master/$dir" ]; then
    mkdir -p "$dir"
    cp -r "../backup_master/$dir"/* "$dir/"
  fi
done

for file in "${FILES[@]}"; do
  if [ -f "../backup_master/$file" ]; then
    cp "../backup_master/$file" .
  fi
done

# Check for untracked files
git status

# Add all changes
git add .

# Commit the changes
git commit -m "Sync all files from master to main"

# Push to remote
git push origin main

echo "All done! Main branch updated with content from master."
