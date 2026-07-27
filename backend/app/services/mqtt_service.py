"""
MQTT Service — subscribes to EMQX broker and ingests telemetry from ESP32 devices.

Runs as a background task during FastAPI's lifespan. On each received message:
1. Extracts the device MAC address from the MQTT topic
2. Looks up or auto-registers the device in PostgreSQL
3. Parses the JSON payload and writes telemetry to TimescaleDB
4. Broadcasts the data to connected WebSocket clients
"""

import asyncio
import json
import logging
import ssl
from datetime import datetime, timezone
from typing import Callable, Optional

import aiomqtt
from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import async_session
from app.models.device import Device
from app.models.telemetry import Telemetry
from app.schemas.telemetry import TelemetryPayload
from app.services.alert_service import alert_service

logger = logging.getLogger(__name__)


class MQTTService:
    """
    Manages the MQTT connection and processes incoming telemetry messages.
    Designed to run as a long-lived background task.
    """

    def __init__(self):
        self._broadcast_callback: Optional[Callable] = None
        self._running = False
        self._task: Optional[asyncio.Task] = None

    def set_broadcast_callback(self, callback: Callable):
        """Register a callback to broadcast data to WebSocket clients."""
        self._broadcast_callback = callback

    async def start(self):
        """Start the MQTT subscriber as a background task."""
        self._running = True
        self._task = asyncio.create_task(self._run_subscriber())
        logger.info("MQTT subscriber background task started")

    async def stop(self):
        """Stop the MQTT subscriber gracefully."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("MQTT subscriber stopped")

    async def _run_subscriber(self):
        """Main subscriber loop with automatic reconnection."""
        while self._running:
            try:
                await self._connect_and_listen()
            except aiomqtt.MqttError as e:
                logger.error(f"MQTT connection error: {e}. Reconnecting in 5s...")
                await asyncio.sleep(5)
            except asyncio.CancelledError:
                logger.info("MQTT subscriber cancelled")
                break
            except Exception as e:
                logger.error(f"Unexpected error in MQTT subscriber: {e}. Reconnecting in 10s...")
                await asyncio.sleep(10)

    async def _connect_and_listen(self):
        """Establish MQTT connection and process messages."""
        # Configure TLS if enabled
        tls_params = None
        if settings.MQTT_USE_TLS:
            tls_context = ssl.create_default_context()
            tls_context.check_hostname = True
            tls_context.verify_mode = ssl.CERT_REQUIRED
            tls_params = tls_context

        logger.info(
            f"Connecting to MQTT broker: {settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT}"
        )

        async with aiomqtt.Client(
            hostname=settings.MQTT_BROKER_HOST,
            port=settings.MQTT_BROKER_PORT,
            username=settings.MQTT_USERNAME if settings.MQTT_USERNAME else None,
            password=settings.MQTT_PASSWORD if settings.MQTT_PASSWORD else None,
            tls_context=tls_params,
        ) as client:
            # Subscribe to wildcard topic: test/devices/+/power
            await client.subscribe(settings.MQTT_TOPIC_PATTERN)
            logger.info(f"Subscribed to: {settings.MQTT_TOPIC_PATTERN}")

            async for message in client.messages:
                try:
                    await self._process_message(
                        topic=str(message.topic),
                        payload=message.payload.decode("utf-8"),
                    )
                except Exception as e:
                    logger.error(f"Error processing MQTT message: {e}")

    async def _process_message(self, topic: str, payload: str):
        """
        Process a single MQTT message:
        1. Extract MAC from topic
        2. Parse JSON payload
        3. Upsert device record
        4. Store telemetry
        5. Broadcast to WebSocket clients
        """
        # Extract MAC address from topic: test/devices/{MAC}/power
        parts = topic.split("/")
        if len(parts) < 4:
            logger.warning(f"Unexpected topic format: {topic}")
            return

        mac_address = parts[2]

        # Parse JSON payload
        try:
            data = json.loads(payload)
            telemetry_data = TelemetryPayload(**data)
        except (json.JSONDecodeError, Exception) as e:
            logger.warning(f"Invalid payload from {mac_address}: {e}")
            return

        now = datetime.now(timezone.utc)

        # Database operations
        async with async_session() as session:
            # Upsert device (auto-register if unknown)
            device = await self._upsert_device(session, mac_address, now)

            # Store telemetry
            await self._store_telemetry(session, device.id, telemetry_data, now)

            # Evaluate alert rules against incoming telemetry
            await alert_service.evaluate_telemetry(
                session=session,
                device_id=device.id,
                device_name=device.name or f"Device-{mac_address[-6:]}",
                telemetry_data=telemetry_data.model_dump(exclude_none=True),
            )

            await session.commit()

        # Broadcast to WebSocket clients
        if self._broadcast_callback:
            broadcast_data = {
                "type": "telemetry",
                "device_id": str(device.id),
                "mac_address": mac_address,
                "device_name": device.name,
                "is_online": True,
                "last_seen": now.isoformat(),
                **telemetry_data.model_dump(exclude_none=True),
            }
            await self._broadcast_callback(broadcast_data)

        logger.debug(f"Processed telemetry from {mac_address}: {telemetry_data}")

    async def _upsert_device(
        self, session: AsyncSession, mac_address: str, now: datetime
    ) -> Device:
        """Look up device by MAC, or auto-register if unknown."""
        # Try to find existing device
        result = await session.execute(
            select(Device).where(Device.mac_address == mac_address)
        )
        device = result.scalar_one_or_none()

        if device:
            # Update last_seen and online status
            await session.execute(
                update(Device)
                .where(Device.id == device.id)
                .values(is_online=True, last_seen=now, updated_at=now)
            )
            device.is_online = True
            device.last_seen = now
        else:
            # Auto-register new device
            device = Device(
                mac_address=mac_address,
                name=f"Device-{mac_address[-6:]}",
                is_online=True,
                last_seen=now,
            )
            session.add(device)
            await session.flush()  # Get the generated ID
            logger.info(f"Auto-registered new device: {mac_address} -> {device.id}")

        return device

    async def _store_telemetry(
        self,
        session: AsyncSession,
        device_id,
        data: TelemetryPayload,
        now: datetime,
    ):
        """Insert a telemetry record into the hypertable."""
        record = Telemetry(
            time=now,
            device_id=device_id,
            battery_1_voltage=data.battery_1_voltage,
            battery_2_voltage=data.battery_2_voltage,
            ac_1_status=data.ac_1_status,
            ac_2_status=data.ac_2_status,
        )
        session.add(record)


# Singleton instance
mqtt_service = MQTTService()
