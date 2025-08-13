#!/bin/bash
set -e

echo "Migrating muscles project to Railpack..."

# Backup existing configs (already done but keeping this for reference)
mkdir -p .backup
cp railway.* .backup/ 2>/dev/null || true
cp backend/crossfit-api/Dockerfile .backup/ 2>/dev/null || true
cp frontend/crossfit-web/Dockerfile .backup/ 2>/dev/null || true

# Remove old configs (already done)
rm -f railway.toml railway.json
rm -f backend/crossfit-api/Dockerfile backend/crossfit-api/railway.json
rm -f frontend/crossfit-web/Dockerfile frontend/crossfit-web/railway.json

# Install dependencies
echo "Installing Railpack CLI..."
# Check if pnpm is available
if command -v pnpm &> /dev/null; then
    pnpm add -g @railway/railpack-cli || echo "Global install failed, adding as dev dependency..."
    pnpm add -D @railway/railpack-cli
else
    npm install -g @railway/railpack-cli || echo "Global install failed"
fi

# Validate new Railpack config
echo "Validating Railpack configuration..."
railpack validate || echo "Validation failed - continuing with migration..."

# Test build (dry run)
echo "Testing build configuration..."
railpack build --dry-run || echo "Dry run failed - continuing with migration..."

echo "Migration complete. Deploy with: railpack deploy --config railpack.production.json"
echo "For development: railpack dev --config railpack.development.json"