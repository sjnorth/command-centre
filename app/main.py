import secrets
from base64 import b64decode
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.routers import action_items, clients, projects, reflections, travel_plans

DIST = Path(__file__).parent.parent / "dashboard" / "dist"


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        description="Personal AI Command Centre API",
        debug=settings.debug,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins.split(","),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    if settings.auth_username and settings.auth_password:
        @app.middleware("http")
        async def basic_auth(request: Request, call_next):
            if request.url.path == "/health":
                return await call_next(request)
            auth = request.headers.get("Authorization", "")
            if auth.startswith("Basic "):
                try:
                    decoded = b64decode(auth[6:]).decode()
                    username, _, password = decoded.partition(":")
                    ok = (
                        secrets.compare_digest(username, settings.auth_username)
                        and secrets.compare_digest(password, settings.auth_password)
                    )
                    if ok:
                        return await call_next(request)
                except Exception:
                    pass
            return Response(
                content="Unauthorized",
                status_code=401,
                headers={"WWW-Authenticate": 'Basic realm="Command Centre"'},
            )

    @app.get("/health", tags=["system"])
    def health_check():
        return {"status": "ok", "version": "0.1.0"}

    app.include_router(clients.router, prefix="/api/v1")
    app.include_router(projects.router, prefix="/api/v1")
    app.include_router(travel_plans.router, prefix="/api/v1")
    app.include_router(reflections.router, prefix="/api/v1")
    app.include_router(action_items.router, prefix="/api/v1")

    # Serve React dashboard if the build exists
    if DIST.exists():
        app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")

        @app.get("/{full_path:path}", include_in_schema=False)
        def serve_spa(full_path: str):
            return FileResponse(DIST / "index.html")

    return app


app = create_app()
