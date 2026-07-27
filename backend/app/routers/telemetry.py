"""
Telemetry router — historical telemetry data queries.
"""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.device import Device
from app.models.telemetry import Telemetry
from app.models.user import User
from app.schemas.telemetry import TelemetryResponse
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/devices", tags=["Telemetry"])


@router.get("/{device_id}/telemetry", response_model=list[TelemetryResponse])
async def get_device_telemetry(
    device_id: uuid.UUID,
    from_time: Optional[datetime] = Query(None, alias="from", description="Start time (ISO 8601)"),
    to_time: Optional[datetime] = Query(None, alias="to", description="End time (ISO 8601)"),
    limit: int = Query(1000, ge=1, le=10000, description="Max records to return"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Query historical telemetry for a specific device.

    Defaults to the last 24 hours if no time range is specified.
    """
    # Verify device exists
    device = await db.execute(select(Device).where(Device.id == device_id))
    if not device.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Device not found")

    # Default time range: last 24 hours
    now = datetime.now(timezone.utc)
    if not from_time:
        from_time = now - timedelta(hours=24)
    if not to_time:
        to_time = now

    query = (
        select(Telemetry)
        .where(
            Telemetry.device_id == device_id,
            Telemetry.time >= from_time,
            Telemetry.time <= to_time,
        )
        .order_by(desc(Telemetry.time))
        .limit(limit)
    )

    result = await db.execute(query)
    records = result.scalars().all()
    return records


@router.get("/{device_id}/telemetry/latest", response_model=Optional[TelemetryResponse])
async def get_latest_telemetry(
    device_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the most recent telemetry reading for a device."""
    # Verify device exists
    device = await db.execute(select(Device).where(Device.id == device_id))
    if not device.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Device not found")

    query = (
        select(Telemetry)
        .where(Telemetry.device_id == device_id)
        .order_by(desc(Telemetry.time))
        .limit(1)
    )

    result = await db.execute(query)
    record = result.scalar_one_or_none()
    return record
