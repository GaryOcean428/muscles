#!/usr/bin/env python3
"""
Database initialization script for FitForge application.
This script ensures the database is properly set up on Railway deployment.
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.user import db
from src.main import app

def init_database():
    """Initialize the database with all required tables."""
    with app.app_context():
        try:
            # Create all tables
            db.create_all()
            print("✅ Database tables created successfully")
            
            # Verify database connection
            result = db.engine.execute("SELECT 1")
            print("✅ Database connection verified")
            
            return True
        except Exception as e:
            print(f"❌ Error initializing database: {e}")
            return False

if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)

