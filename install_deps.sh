#!/bin/bash
# Smart requirements installer - searches multiple possible locations with enhanced error handling

set -e

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Smart dependency installation starting...${NC}"

# Detect environment
if [ -n "$RAILWAY_ENVIRONMENT" ]; then
    echo -e "${GREEN}🚂 Railway environment detected: $RAILWAY_ENVIRONMENT${NC}"
elif [ -n "$PORT" ]; then
    echo -e "${GREEN}☁️ Cloud environment detected${NC}"
else
    echo -e "${YELLOW}💻 Local development environment detected${NC}"
fi

# Priority-ordered locations to search for requirements.txt
LOCATIONS=(
  "backend/crossfit-api/requirements.txt"
  "requirements.txt" 
  "backend/requirements.txt"
  "api/requirements.txt"
  "src/requirements.txt"
  "*/requirements.txt"
)

echo -e "${BLUE}📍 Current directory: $(pwd)${NC}"
echo -e "${BLUE}📂 Directory structure:${NC}"
if command -v tree >/dev/null 2>&1; then
    tree -L 2 -I 'node_modules|venv|__pycache__|.git' . || ls -la
else
    ls -la
fi

echo -e "\n${BLUE}🔍 Searching for requirements.txt...${NC}"

# First pass: exact matches
for loc in "${LOCATIONS[@]}"; do
  echo -e "${BLUE}🔎 Checking: $loc${NC}"
  if [ -f "$loc" ]; then
    echo -e "${GREEN}✅ Found requirements.txt at: $loc${NC}"
    
    # Validate requirements.txt content
    if [ -s "$loc" ]; then
        echo -e "${GREEN}📋 Requirements file is not empty${NC}"
        echo -e "${BLUE}📋 Preview of dependencies (first 10 lines):${NC}"
        head -n 10 "$loc" | sed 's/^/  /'
    else
        echo -e "${YELLOW}⚠️ Warning: Requirements file is empty${NC}"
    fi
    
    echo -e "${BLUE}⬆️ Upgrading pip to latest version...${NC}"
    pip install --upgrade pip --no-warn-script-location
    
    echo -e "${BLUE}📦 Installing dependencies from $loc...${NC}"
    pip install -r "$loc" --no-warn-script-location --user
    
    # Verify critical packages are installed
    echo -e "${BLUE}🔍 Verifying critical packages...${NC}"
    CRITICAL_PACKAGES=("flask" "gunicorn")
    for pkg in "${CRITICAL_PACKAGES[@]}"; do
        if pip show "$pkg" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $pkg is installed${NC}"
        else
            echo -e "${YELLOW}⚠️ Warning: $pkg not found${NC}"
        fi
    done
    
    echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"
    echo -e "${BLUE}📊 Installed packages summary:${NC}"
    pip list | head -n 20
    exit 0
  else
    echo -e "${RED}❌ Not found: $loc${NC}"
  fi
done

# Second pass: wildcard search if exact matches failed
echo -e "${YELLOW}🔍 Trying wildcard search for requirements.txt...${NC}"
FOUND_FILES=$(find . -name "requirements.txt" -type f 2>/dev/null | head -5)

if [ -n "$FOUND_FILES" ]; then
    echo -e "${GREEN}✅ Found requirements.txt files via search:${NC}"
    echo "$FOUND_FILES" | sed 's/^/  /'
    
    # Use the first found file
    FIRST_FILE=$(echo "$FOUND_FILES" | head -n 1)
    echo -e "${BLUE}📦 Using: $FIRST_FILE${NC}"
    
    pip install --upgrade pip --no-warn-script-location
    pip install -r "$FIRST_FILE" --no-warn-script-location --user
    echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"
    exit 0
fi

# Error handling - provide comprehensive diagnostic information
echo -e "${RED}🚨 ERROR: Could not find requirements.txt in any expected location${NC}"
echo -e "${BLUE}🔍 Searched locations:${NC}"
printf '  - %s\n' "${LOCATIONS[@]}"

echo -e "\n${BLUE}📂 Available files in current directory:${NC}"
find . -name "*.txt" -type f | head -10 | sed 's/^/  /'

echo -e "\n${BLUE}📁 Directory structure (up to 3 levels):${NC}"
if command -v tree >/dev/null 2>&1; then
    tree -L 3 -I 'node_modules|venv|__pycache__|.git|dist|build' . | head -50
else
    find . -type f -name "*.py" -o -name "*.txt" -o -name "*.json" | head -20 | sed 's/^/  /'
fi

echo -e "\n${BLUE}💡 Possible solutions:${NC}"
echo -e "  1. Ensure requirements.txt exists in one of the expected locations"
echo -e "  2. Check if this is a monorepo structure - you may need to navigate to the correct subdirectory"
echo -e "  3. Verify the file permissions are correct"
echo -e "  4. Check if requirements.txt is named differently (e.g., requirements-prod.txt)"

exit 1