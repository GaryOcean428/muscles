# Railpack Configuration Reference

This document provides guidance on the correct Railpack configuration to avoid common deployment errors.

## ✅ Fixed Configuration Structure

The current `railpack.json` follows the correct schema:

```json
{
  "$schema": "https://schema.railpack.com",
  "provider": "python", 
  "packages": {
    "python": "3.11"
  },
  "steps": {
    "install": {
      "commands": [
        "pip install --upgrade pip",
        "if [ -f backend/api/requirements.txt ]; then pip install -r backend/api/requirements.txt; elif [ -f requirements.txt ]; then pip install -r requirements.txt; else echo ERROR: No requirements.txt found; exit 1; fi"
      ]
    }
  },
  "deploy": {
    "inputs": [{"step": "install"}],
    "startCommand": "cd backend/api && gunicorn src.main:app --bind 0.0.0.0:${PORT:-8000} --workers 4",
    "aptPackages": ["libpq5", "python3-dev"]
  }
}
```

## ❌ Common Errors to Avoid

### Error: "Install inputs must be an image or step input"

**Cause:** Invalid `inputs` field in install step:
```json
// ❌ WRONG - This causes the error
"install": {
  "inputs": [
    {
      "local": true,
      "include": ["."]
    }
  ],
  "commands": [...]
}
```

**Fix:** Remove the `inputs` field from install step:
```json
// ✅ CORRECT - No inputs field needed for install
"install": {
  "commands": [...]
}
```

## 📋 Valid Step Structure

### Install Steps
- **Purpose:** Install dependencies and prepare the build environment
- **Inputs:** ❌ Typically should NOT have inputs field
- **Commands:** ✅ Required - list of shell commands to run

### Deploy Steps  
- **Purpose:** Deploy and run the application
- **Inputs:** ✅ Should reference other steps (e.g., `{"step": "install"}`)
- **StartCommand:** ✅ Required - command to start the application

## 🛠️ Inputs Field Usage

The `inputs` field is for referencing filesystem layers from:
- Other steps: `{"step": "stepName"}`
- Docker images: `{"image": "node:18"}`
- Local filesystem: `{"local": true}` (advanced use cases only)

**Rule of thumb:** Install steps typically don't need inputs unless copying from other steps or images.

## 🧪 Validation

To validate your railpack.json:

```bash
# Check JSON syntax
python -m json.tool railpack.json > /dev/null && echo "✅ Valid JSON" || echo "❌ Invalid JSON"

# Check that install step doesn't have inputs field
grep -A 10 '"install"' railpack.json | grep '"inputs"' && echo "⚠️ Install step has inputs field" || echo "✅ Install step is clean"
```

## 🚀 Railway Build Priority

Railway uses this order to detect your build system:
1. **Dockerfile** (if RAILWAY_DOCKERFILE_PATH is set)
2. **Railpack** (if railpack.json exists) 
3. **Nixpacks** (default fallback)

## 📚 Additional Resources

- [Official Railpack Documentation](https://docs.railway.app/reference/railpack)
- [Railpack Schema](https://schema.railpack.com)
- [Railway Deployment Guide](../RAILWAY_DEPLOYMENT_GUIDE.md)

---

*Last updated: August 2024 - Fixed invalid inputs field configuration*