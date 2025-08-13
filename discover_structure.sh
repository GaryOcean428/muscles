#!/bin/bash
echo "=== Repository Structure Discovery ==="
echo "Current directory: $(pwd)"
echo ""
echo "=== All Python files ==="
find . -name "*.py" -type f | head -10
echo ""
echo "=== All requirements.txt files ==="
find . -name "requirements.txt" -type f
echo ""
echo "=== Directory structure (2 levels) ==="
if command -v tree >/dev/null 2>&1; then
    tree -L 2 -I 'node_modules|venv|__pycache__|.git' 2>/dev/null
else
    echo "Tree command not available, using ls:"
    find . -maxdepth 2 -type d | sort
fi
echo ""
echo "=== Checking for app entry points ==="
for file in app.py main.py server.py wsgi.py manage.py; do
  find . -name "$file" -type f | head -1
done
echo ""
echo "=== Environment information ==="
echo "Python version: $(python --version 2>/dev/null || echo 'Python not available')"
echo "Pip version: $(pip --version 2>/dev/null || echo 'Pip not available')"
echo "Working directory: $(pwd)"
echo "User: $(whoami)"
echo ""
echo "=== File permissions ==="
ls -la | head -10