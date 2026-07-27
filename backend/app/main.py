"""
IoT Remote Monitoring Dashboard — FastAPI Application Entry Point

Registers routers, CORS middleware, and startup/shutdown events.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import devices, telemetry
from app.routers.websocket import manager, router as ws_router
from app.services.mqtt_service import mqtt_service

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown events."""
    # --- Startup ---
    logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    logger.info(f"📡 MQTT Broker: {settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT}")

    # Connect MQTT service to WebSocket broadcast
    mqtt_service.set_broadcast_callback(manager.broadcast)

    # Start MQTT subscriber background task
    if settings.MQTT_USERNAME:
        await mqtt_service.start()
        logger.info("📡 MQTT subscriber started")
    else:
        logger.warning("⚠️  MQTT credentials not configured — subscriber not started")

    yield

    # --- Shutdown ---
    logger.info(f"👋 {settings.APP_NAME} shutting down...")
    await mqtt_service.stop()


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

# --- Register Routers ---
app.include_router(devices.router)
app.include_router(telemetry.router)
app.include_router(ws_router)


# --- Health Check ---
@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint for monitoring and container orchestration."""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "mqtt_connected": mqtt_service._running,
        "websocket_clients": manager.client_count,
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
