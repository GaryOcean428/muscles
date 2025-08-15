"""
Static file server for React frontend integration
"""
import os
from flask import send_from_directory, send_file

def setup_static_routes(app):
    """Setup routes to serve React frontend static files"""
    
    # Path to the built React app
    frontend_build_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                                      'frontend', 'muscles-web', 'dist')
    
    @app.route('/')
    def serve_frontend():
        """Serve the React app's index.html"""
        try:
            return send_file(os.path.join(frontend_build_path, 'index.html'))
        except FileNotFoundError:
            return {"message": "FitForge API is running. Frontend not built yet."}, 200
    
    @app.route('/<path:path>')
    def serve_static_files(path):
        """Serve static files from React build directory"""
        try:
            # Check if file exists in build directory
            if os.path.exists(os.path.join(frontend_build_path, path)):
                return send_from_directory(frontend_build_path, path)
            else:
                # For client-side routing, serve index.html for non-API routes
                if not path.startswith('api/'):
                    return send_file(os.path.join(frontend_build_path, 'index.html'))
                else:
                    return {"error": "API endpoint not found"}, 404
        except FileNotFoundError:
            return {"error": "File not found"}, 404
    
    return app

