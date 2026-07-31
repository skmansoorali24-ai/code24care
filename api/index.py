import os
import sys
from pathlib import Path

# Add the backend directory to sys.path to enable backend module imports
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from backend.main import app

# Expose app and handler for Vercel Python serverless runtime
handler = app


