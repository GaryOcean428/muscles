#!/bin/bash
# Apply Railway optimizations and commit changes

echo "Applying Railway deployment optimizations..."

# Ensure all files exist
if [ ! -f "/workspace/railway.json" ] || [ ! -f "/workspace/nixpacks.toml" ] || [ ! -f "/workspace/package.json" ] || [ ! -f "/workspace/vite.config.ts" ]; then
  echo "Error: Required files missing. Aborting."
  exit 1
fi

# Stage changes
git add railway.json nixpacks.toml package.json vite.config.ts .env .npmrc .nvmrc RAILWAY_BEST_PRACTICES.md DEPLOYMENT_STATUS.md

# Commit changes
git commit -m "🚀 Optimize Railway deployment configuration with best practices

- Implement memory optimization for Railway constraints
- Enhance build process with proper caching
- Improve deployment configuration with better health checks
- Add proper Node.js version constraints
- Optimize Vite build for production deployment
- Add comprehensive documentation"

# Push changes (if needed)
echo "Changes committed. Run 'git push origin main' to deploy to Railway."
echo "Optimization complete!"
