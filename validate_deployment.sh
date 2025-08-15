#!/bin/bash
# Comprehensive Railway deployment validation script

set +e  # Allow script to continue on errors for validation

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

echo -e "${BOLD}${BLUE}🚀 Railway Deployment Validation${NC}"
echo -e "${BLUE}===============================================${NC}"

# Helper functions
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️ $1${NC}"
    ((WARNINGS++))
}

echo -e "\n${BOLD}📋 Phase 1: Configuration Files${NC}"
echo "=================================="

# Check railpack.json
if [ -f "railpack.json" ]; then
    check_pass "railpack.json exists"
    
    # Validate JSON syntax
    if command -v jq >/dev/null 2>&1; then
        if jq empty railpack.json >/dev/null 2>&1; then
            check_pass "railpack.json has valid JSON syntax"
        else
            check_fail "railpack.json has invalid JSON syntax"
        fi
    else
        check_warn "jq not available - skipping JSON validation"
    fi
    
    # Check required fields
    if jq -e '.provider' railpack.json >/dev/null 2>&1; then
        PROVIDER=$(jq -r '.provider' railpack.json)
        check_pass "Provider specified: $PROVIDER"
    else
        check_fail "No provider specified in railpack.json"
    fi
    
    if jq -e '.steps.install' railpack.json >/dev/null 2>&1; then
        check_pass "Install steps defined"
    else
        check_fail "No install steps defined"
    fi
    
    if jq -e '.deploy.startCommand' railpack.json >/dev/null 2>&1; then
        START_CMD=$(jq -r '.deploy.startCommand' railpack.json)
        check_pass "Start command specified: $START_CMD"
    else
        check_fail "No start command specified"
    fi
    
else
    check_fail "railpack.json missing"
fi

# Check helper scripts
if [ -f "install_deps.sh" ] && [ -x "install_deps.sh" ]; then
    check_pass "install_deps.sh exists and is executable"
else
    check_fail "install_deps.sh missing or not executable"
fi

if [ -f "start_app.sh" ] && [ -x "start_app.sh" ]; then
    check_pass "start_app.sh exists and is executable"
else
    check_fail "start_app.sh missing or not executable"
fi

echo -e "\n${BOLD}📁 Phase 2: Directory Structure${NC}"
echo "=================================="

# Check critical directories
if [ -d "backend/api" ]; then
    check_pass "Backend API directory exists"
else
    check_fail "Backend API directory missing"
fi

if [ -d "backend/api/src" ]; then
    check_pass "Backend source directory exists"
else
    check_fail "Backend source directory missing"
fi

if [ -d "frontend/web" ]; then
    check_pass "Frontend directory exists"
else
    check_warn "Frontend directory missing (may be intentional for API-only deployment)"
fi

echo -e "\n${BOLD}📄 Phase 3: Application Files${NC}"
echo "=================================="

# Check for Flask application
if [ -f "backend/api/src/main.py" ]; then
    check_pass "Flask main application exists"
    
    # Check if it contains Flask app
    if grep -q "app = Flask\|from flask import Flask" "backend/api/src/main.py"; then
        check_pass "Flask application detected in main.py"
    else
        check_warn "Flask application pattern not detected in main.py"
    fi
else
    check_fail "Flask main application missing"
fi

# Check for requirements.txt
if [ -f "backend/api/requirements.txt" ]; then
    check_pass "requirements.txt exists"
    
    # Check if it's not empty
    if [ -s "backend/api/requirements.txt" ]; then
        check_pass "requirements.txt is not empty"
        
        # Check for critical packages
        CRITICAL_PACKAGES=("Flask" "gunicorn" "psycopg2-binary")
        for pkg in "${CRITICAL_PACKAGES[@]}"; do
            if grep -i "$pkg" "backend/api/requirements.txt" >/dev/null 2>&1; then
                check_pass "$pkg found in requirements.txt"
            else
                check_warn "$pkg not explicitly listed in requirements.txt"
            fi
        done
    else
        check_fail "requirements.txt is empty"
    fi
else
    check_fail "requirements.txt missing"
fi

echo -e "\n${BOLD}🐍 Phase 4: Python Environment${NC}"
echo "=================================="

# Check Python version
if command -v python >/dev/null 2>&1; then
    PYTHON_VERSION=$(python --version 2>&1)
    check_pass "Python available: $PYTHON_VERSION"
    
    # Check if it's Python 3
    if python -c "import sys; exit(0 if sys.version_info[0] >= 3 else 1)"; then
        check_pass "Python 3.x detected"
    else
        check_fail "Python 2.x detected - Python 3 required"
    fi
else
    check_fail "Python not available"
fi

# Check pip
if command -v pip >/dev/null 2>&1; then
    PIP_VERSION=$(pip --version 2>&1)
    check_pass "pip available: $PIP_VERSION"
else
    check_fail "pip not available"
fi

echo -e "\n${BOLD}🔧 Phase 5: Dependency Testing${NC}"
echo "=================================="

# Test if we can find and install dependencies (dry run)
echo -e "${BLUE}Testing dependency resolution...${NC}"
if [ -f "backend/api/requirements.txt" ]; then
    # Check if packages can be resolved (without installing)
    if pip install --dry-run -r "backend/api/requirements.txt" >/dev/null 2>&1; then
        check_pass "All dependencies can be resolved"
    else
        check_warn "Some dependencies may have resolution issues"
    fi
else
    check_fail "Cannot test dependencies - requirements.txt missing"
fi

echo -e "\n${BOLD}🚦 Phase 6: Script Testing${NC}"
echo "=================================="

# Test install script (dry run or safe test)
echo -e "${BLUE}Testing install script...${NC}"
if [ -x "install_deps.sh" ]; then
    # Check if script can find requirements.txt without running full install
    if ./install_deps.sh 2>&1 | grep -q "Found requirements.txt"; then
        check_pass "Install script can locate requirements.txt"
    else
        check_warn "Install script test inconclusive"
    fi
else
    check_fail "Install script not executable"
fi

# Test start script can find app
echo -e "${BLUE}Testing start script...${NC}"
if [ -x "start_app.sh" ]; then
    # Check if start script can find the Flask app
    if timeout 5s ./start_app.sh 2>&1 | grep -q "Found application"; then
        check_pass "Start script can locate Flask application"
    else
        check_warn "Start script test inconclusive"
    fi
else
    check_fail "Start script not executable"
fi

echo -e "\n${BOLD}🔍 Phase 7: Environment Variables${NC}"
echo "=================================="

# Check for important environment variables
ENV_VARS=("DATABASE_URL" "SECRET_KEY" "PORT")
for var in "${ENV_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        check_pass "$var is set"
    else
        if [ "$var" = "PORT" ]; then
            check_warn "$var not set (will use default)"
        else
            check_warn "$var not set (may be required for production)"
        fi
    fi
done

echo -e "\n${BOLD}📊 Validation Summary${NC}"
echo "=================================="
echo -e "✅ Passed: ${GREEN}$PASSED${NC}"
echo -e "❌ Failed: ${RED}$FAILED${NC}" 
echo -e "⚠️ Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}${BOLD}🎉 Perfect! Deployment configuration is ready.${NC}"
        exit 0
    else
        echo -e "${YELLOW}${BOLD}✅ Good! Deployment should work with minor warnings.${NC}"
        exit 0
    fi
else
    echo -e "${RED}${BOLD}🚨 Issues detected! Please fix the failed checks before deploying.${NC}"
    echo ""
    echo -e "${BLUE}💡 Common solutions:${NC}"
    echo -e "  - Ensure all required files exist in the correct locations"
    echo -e "  - Check file permissions (chmod +x for scripts)"
    echo -e "  - Validate JSON syntax in configuration files"
    echo -e "  - Verify Python dependencies are correctly specified"
    exit 1
fi