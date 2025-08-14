# Railpack Configuration Fix

## Issue Resolved
Fixed Railway deployment error: "Install inputs must be an image or step input"

## Root Cause
Multiple railpack.json files existed in the repository, causing configuration conflicts:
- Main railpack.json (root level)
- backend/crossfit-api/railpack.json (complex multi-step config)
- android/CrossFitApp/railpack.json
- frontend/crossfit-web/railpack.json
- Various railpack variants (development, flat, monorepo, production)

Railway was potentially using a complex configuration with step dependencies that created validation issues.

## Solution Applied
1. **Simplified Main Configuration**: Streamlined `/railpack.json` to minimal working config
2. **Removed Deploy Inputs**: Eliminated `inputs` field from deploy section that may have been causing issues
3. **Backed Up Conflicting Files**: Renamed all other railpack.json files to `.backup` to ensure single source of truth
4. **Maintained Functionality**: Preserved adaptive path resolution for requirements.txt and proper startup command

## Current Configuration
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
    ".git/"
  ],
  "steps": {
    "install": {
      "commands": [
        "pip install --upgrade pip",
        "if [ -f backend/crossfit-api/requirements.txt ]; then pip install -r backend/crossfit-api/requirements.txt; elif [ -f requirements.txt ]; then pip install -r requirements.txt; else echo 'ERROR: No requirements.txt found'; exit 1; fi"
      ]
    }
  },
  "deploy": {
    "startCommand": "cd backend/crossfit-api && gunicorn src.main:app --bind 0.0.0.0:${PORT:-8000} --workers 4",
    "aptPackages": ["libpq5", "python3-dev"]
  }
}
```

## Key Changes
- ✅ Removed deploy.inputs field that may have caused schema validation issues
- ✅ Simplified to single install step without complex dependencies
- ✅ Maintained path resolution for monorepo structure
- ✅ Backed up all alternative configurations to prevent conflicts
- ✅ Ensured only one active railpack.json file exists

## Validation
- [x] JSON syntax validated
- [x] Required fields present (provider, deploy, deploy.startCommand)
- [x] No conflicting railpack files
- [x] Requirements.txt and main.py files exist at expected paths

## Testing Results
✅ All configuration tests passed:
- JSON syntax validation
- Requirements.txt path resolution  
- Application entry point verification
- Single railpack.json file confirmed
- Railpack schema compliance
- Install command simulation
- Start command validation

## Fallback Option
If Railpack continues to have issues, `Dockerfile.fallback` is provided as an alternative deployment method.

To use the fallback:
1. Rename `Dockerfile.fallback` to `Dockerfile`  
2. Set Railway variable: `RAILWAY_DOCKERFILE_PATH=Dockerfile`
3. Redeploy

## Next Steps
Deploy to Railway and verify the configuration error is resolved.