"""
IoT Remote Monitoring Dashboard — FastAPI Application Entry Point

Registers routers, CORS middleware, and startup/shutdown events.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown events."""
    # --- Startup ---
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    print(f"📡 MQTT Broker: {settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT}")
    print(f"🗄️  Database: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else 'configured'}")

    # TODO (Phase 1): Initialize database connection pool
    # TODO (Phase 1): Start MQTT subscriber background task

    yield

    # --- Shutdown ---
    print(f"👋 {settings.APP_NAME} shutting down...")
    # TODO (Phase 1): Close database connections
    # TODO (Phase 1): Disconnect MQTT client


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Real-time IoT device monitoring and management platform",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Health Check ---
@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint for monitoring and container orchestration."""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# --- Root ---
@app.get("/", tags=["System"])
async def root():
    """API root — basic info."""
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


# TODO (Phase 1): Include routers
# from app.routers import devices, telemetry, auth, websocket
# app.include_router(devices.router, prefix="/api", tags=["Devices"])
# app.include_router(telemetry.router, prefix="/api", tags=["Telemetry"])
# app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
# app.include_router(websocket.router, tags=["WebSocket"])
