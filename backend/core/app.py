"""
TAURIQ OS Backend — FastAPI Application Factory
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.system import router as system_router
from api.filesystem import router as filesystem_router
from api.ai import router as ai_router
from api.automation import router as automation_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="TAURIQ OS Backend",
        description="AI-native desktop OS backend service",
        version="0.1.0-alpha",
        docs_url="/api/docs",
        redoc_url=None,
    )

    # Allow Tauri webview origin
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["tauri://localhost", "http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(system_router, prefix="/api/system", tags=["system"])
    app.include_router(filesystem_router, prefix="/api/fs", tags=["filesystem"])
    app.include_router(ai_router, prefix="/api/ai", tags=["ai"])
    app.include_router(automation_router, prefix="/api/automation", tags=["automation"])

    @app.get("/api/health")
    async def health():
        return {"status": "ok", "service": "tauriq-backend", "version": "0.1.0-alpha"}

    return app
