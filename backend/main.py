"""
TAURIQ OS — Python Backend
Root entry point. Starts the FastAPI service that bridges the Tauri frontend
with local AI models, filesystem operations, and system automation.
"""

import asyncio
import uvicorn
from core.app import create_app

if __name__ == "__main__":
    app = create_app()
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8765,
        log_level="info",
        reload=False,
    )
