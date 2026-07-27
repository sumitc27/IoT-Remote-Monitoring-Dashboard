"""
Telemetry model — stores time-series sensor data from IoT devices.

This table is converted to a TimescaleDB hypertable for efficient
time-series queries, compression, and retention policies.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Telemetry(Base):
    """Time-series telemetry data from IoT devices."""

    __tablename__ = "telemetry"

    # TimescaleDB hypertables need a time column as part of the primary key
    time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        primary_key=True,
        default=lambda: datetime.now(timezone.utc),
    )
    device_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("devices.id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    )

    # Sensor readings
    battery_1_voltage: Mapped[float | None] = mapped_column(Float, nullable=True)
    battery_2_voltage: Mapped[float | None] = mapped_column(Float, nullable=True)
    ac_1_status: Mapped[str | None] = mapped_column(String(3), nullable=True)
    ac_2_status: Mapped[str | None] = mapped_column(String(3), nullable=True)

    def __repr__(self) -> str:
        return f"<Telemetry device={self.device_id} time={self.time}>"
