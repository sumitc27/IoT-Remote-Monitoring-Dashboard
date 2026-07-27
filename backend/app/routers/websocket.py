"""
WebSocket router — real-time telemetry relay to frontend clients.

Manages connected WebSocket clients and broadcasts incoming MQTT data
to all active connections.
"""

import asyncio
import json
import logging
from typing import Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSocket"])


class ConnectionManager:
    """Manages active WebSocket connections and broadcasts messages."""

    def __init__(self):
        self._active_connections: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        async with self._lock:
            self._active_connections.add(websocket)
        logger.info(
            f"WebSocket client connected. Total: {len(self._active_connections)}"
        )

    async def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        async with self._lock:
            self._active_connections.discard(websocket)
        logger.info(
            f"WebSocket client disconnected. Total: {len(self._active_connections)}"
        )

    async def broadcast(self, data: dict):
        """Send data to all connected WebSocket clients."""
        if not self._active_connections:
            return

        message = json.dumps(data)
        disconnected = set()

        async with self._lock:
            for connection in self._active_connections:
                try:
                    await connection.send_text(message)
                except Exception:
                    disconnected.add(connection)

            # Clean up dead connections
            self._active_connections -= disconnected

    @property
    def client_count(self) -> int:
        return len(self._active_connections)


# Singleton connection manager
manager = ConnectionManager()


@router.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    """
    WebSocket endpoint for real-time telemetry streaming.

    Clients connect here to receive live device data broadcasts.
    The connection stays open until the client disconnects.
    """
    await manager.connect(websocket)
    try:
        # Keep the connection alive — listen for client pings/messages
        while True:
            # Wait for any client message (ping/pong or close)
            data = await websocket.receive_text()
            # Respond to ping messages
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await manager.disconnect(websocket)
