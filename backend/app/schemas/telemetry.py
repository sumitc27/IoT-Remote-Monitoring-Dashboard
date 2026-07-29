"""
Pydantic schemas for Telemetry — data from MQTT messages and API responses.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TelemetryPayload(BaseModel):
    """Schema matching the JSON payload published by ESP32 devices."""

    battery_1_voltage: Optional[float] = None
    battery_2_voltage: Optional[float] = None
    ac_1_status: Optional[str] = None
    ac_2_status: Optional[str] = None
    main_mcb_status: Optional[str] = None
    fsds_mcb_status: Optional[str] = None
    battery_status: Optional[str] = None
    countdown_timer: Optional[int] = None


class TelemetryResponse(BaseModel):
    """Single telemetry record returned by the API."""

    time: datetime
    device_id: uuid.UUID
    battery_1_voltage: Optional[float] = None
    battery_2_voltage: Optional[float] = None
    ac_1_status: Optional[str] = None
    ac_2_status: Optional[str] = None
    main_mcb_status: Optional[str] = None
    fsds_mcb_status: Optional[str] = None
    battery_status: Optional[str] = None
    countdown_timer: Optional[int] = None

    model_config = {"from_attributes": True}


class TelemetryQuery(BaseModel):
    """Query parameters for fetching historical telemetry."""

    from_time: Optional[datetime] = None
    to_time: Optional[datetime] = None
    limit: int = 1000
    interval: Optional[str] = None  # e.g., '1m', '5m', '1h', '1d'


class DeviceTelemetrySummary(BaseModel):
    """Latest telemetry snapshot for a device — used in dashboard cards."""

    device_id: uuid.UUID
    mac_address: str
    device_name: Optional[str] = None
    is_online: bool = False
    last_seen: Optional[datetime] = None
    battery_1_voltage: Optional[float] = None
    battery_2_voltage: Optional[float] = None
    ac_1_status: Optional[str] = None
    ac_2_status: Optional[str] = None
    main_mcb_status: Optional[str] = None
    fsds_mcb_status: Optional[str] = None
    battery_status: Optional[str] = None
    countdown_timer: Optional[int] = None
