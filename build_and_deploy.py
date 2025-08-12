#!/usr/bin/env python3
"""
Build script to copy React frontend to Flask static folder for unified deployment
"""
import os
import shutil
import subprocess
import sys

def run_command(command, cwd=None):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error running command: {command}")
            print(f"Error output: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Exception running command {command}: {e}")
        return False

def main():
    """Main build process"""
    print("🚀 Starting FitForge build process...")
    
    # Get project root directory
    project_root = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(project_root, 'frontend', 'crossfit-web')
    backend_dir = os.path.join(project_root, 'backend', 'crossfit-api')
    static_dir = os.path.join(backend_dir, 'src', 'static')
    
    print(f"📁 Project root: {project_root}")
    print(f"📁 Frontend dir: {frontend_dir}")
    print(f"📁 Backend dir: {backend_dir}")
    print(f"📁 Static dir: {static_dir}")
    
    # Check if frontend directory exists
    if not os.path.exists(frontend_dir):
        print("❌ Frontend directory not found!")
        return False
    
    # Install frontend dependencies
    print("📦 Installing frontend dependencies...")
    if not run_command("pnpm install", cwd=frontend_dir):
        print("❌ Failed to install frontend dependencies")
        return False
    
    # Build React application
    print("🔨 Building React application...")
    if not run_command("pnpm run build", cwd=frontend_dir):
        print("❌ Failed to build React application")
        return False
    
    # Check if build directory exists
    build_dir = os.path.join(frontend_dir, 'dist')
    if not os.path.exists(build_dir):
        print("❌ Build directory not found after build!")
        return False
    
    # Create static directory if it doesn't exist
    os.makedirs(static_dir, exist_ok=True)
    
    # Copy built files to Flask static directory
    print("📋 Copying built files to Flask static directory...")
    try:
        # Remove existing static files
        if os.path.exists(static_dir):
            for item in os.listdir(static_dir):
                item_path = os.path.join(static_dir, item)
                if os.path.isdir(item_path):
                    shutil.rmtree(item_path)
                else:
                    os.remove(item_path)
        
        # Copy new build files
        for item in os.listdir(build_dir):
            src = os.path.join(build_dir, item)
            dst = os.path.join(static_dir, item)
            if os.path.isdir(src):
                shutil.copytree(src, dst)
            else:
                shutil.copy2(src, dst)
        
        print("✅ Successfully copied frontend build to static directory")
        
    except Exception as e:
        print(f"❌ Error copying files: {e}")
        return False
    
    # Verify the copy was successful
    index_file = os.path.join(static_dir, 'index.html')
    if os.path.exists(index_file):
        print("✅ Frontend build successfully integrated with Flask backend")
        print(f"📄 Index file: {index_file}")
        
        # List static directory contents
        print("📁 Static directory contents:")
        for item in os.listdir(static_dir):
            print(f"  - {item}")
        
        return True
    else:
        print("❌ index.html not found in static directory")
        return False

if __name__ == "__main__":
    success = main()
    if success:
        print("\n🎉 Build completed successfully!")
        print("🚀 Ready for deployment to Railway")
    else:
        print("\n❌ Build failed!")
        sys.exit(1)

