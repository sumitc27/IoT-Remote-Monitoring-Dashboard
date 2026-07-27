"""
AlertRule model — configurable threshold rules for triggering alerts.

Each rule monitors a specific metric on a device and fires when the
metric crosses the defined threshold.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AlertRule(Base):
    """Alert rule — defines a condition that triggers an alert event."""

    __tablename__ = "alert_rules"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    device_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("devices.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    metric: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # e.g., 'battery_1_voltage', 'battery_2_voltage'
    operator: Mapped[str] = mapped_column(
        String(5), nullable=False
    )  # '<', '>', '<=', '>=', '=='
    threshold: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[str] = mapped_column(
        String(20), default="warning"
    )  # 'info', 'warning', 'critical'
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    device = relationship("Device", backref="alert_rules", lazy="selectin")
    events = relationship("AlertEvent", back_populates="rule", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<AlertRule {self.metric} {self.operator} {self.threshold} ({self.severity})>"
