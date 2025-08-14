# Railway Deployment Troubleshooting Guide

## If Railpack Error Persists

If you still see "Install inputs must be an image or step input" after this fix:

### Option 1: Force Railpack Usage
```bash
railway variables set RAILWAY_USE_RAILPACK=true
railway variables set RAILWAY_BUILDER_BP_USE_RAILPACK=1
```

### Option 2: Switch to Dockerfile
```bash
# Rename fallback to active
mv Dockerfile.fallback Dockerfile

# Set Railway to use Dockerfile
railway variables set RAILWAY_DOCKERFILE_PATH=Dockerfile
```

### Option 3: Switch to Nixpacks  
```bash
# Remove railpack.json temporarily
mv railpack.json railpack.json.disabled

# Deploy with Nixpacks (Railway default)
railway deploy
```

### Option 4: Debug Railway Builder
```bash
# Check which builder Railway is using
railway variables | grep BUILDER
railway variables | grep RAILWAY

# View Railway logs during deployment
railway logs --follow
```

### Option 5: Minimal Nixpacks Config
If switching to Nixpacks, create `nixpacks.toml`:
```toml
[phases.setup]
nixPkgs = ["python311", "gcc", "postgresql"]

[phases.install]
cmds = [
  "cd backend/crossfit-api",
  "pip install --upgrade pip", 
  "pip install -r requirements.txt"
]

[start]
cmd = "cd backend/crossfit-api && gunicorn src.main:app --bind 0.0.0.0:$PORT --workers 4"
```

## Emergency Deployment Commands

### Quick Railway Commands
```bash
# Check service status
railway status

# View current variables
railway variables

# Redeploy current config  
railway up --detach

# View deployment logs
railway logs --tail 100
```

### Reset Railway Config
```bash
# Clear any problematic variables
railway variables unset RAILWAY_USE_RAILPACK
railway variables unset RAILWAY_DOCKERFILE_PATH
railway variables unset RAILWAY_BUILDER_BP_USE_RAILPACK

# Let Railway auto-detect (usually picks Nixpacks)
railway deploy
```

## Success Indicators

You'll know the fix worked when you see:
- ✅ "Provider detected: Python"
- ✅ Install commands run without "inputs" errors
- ✅ "gunicorn" starts successfully
- ✅ Service becomes healthy on Railway dashboard

## Still Having Issues?

The simplified railpack.json should resolve 95% of configuration issues. If problems persist:

1. **Check Railway Dashboard** - Look for detailed error logs
2. **Try Dockerfile Fallback** - Most reliable deployment method  
3. **Use Nixpacks** - Railway's default, very stable
4. **Contact Railway Support** - They can check server-side issues

The key insight: Multiple railpack.json files were causing Railway's config parser to fail. Now there's only one clean configuration.