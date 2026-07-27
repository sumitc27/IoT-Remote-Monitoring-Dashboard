"""
Pydantic schemas for Alerts — rule configuration and event responses.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# --- Alert Rule Schemas ---

class AlertRuleCreate(BaseModel):
    """Create a new alert rule for a device."""

    device_id: uuid.UUID
    metric: str = Field(
        ...,
        pattern="^(battery_1_voltage|battery_2_voltage|ac_1_status|ac_2_status)$",
        description="Telemetry metric to monitor",
    )
    operator: str = Field(
        ...,
        pattern="^(<|>|<=|>=|==)$",
        description="Comparison operator",
    )
    threshold: float = Field(..., description="Threshold value to trigger alert")
    severity: str = Field(
        "warning",
        pattern="^(info|warning|critical)$",
        description="Alert severity level",
    )


class AlertRuleUpdate(BaseModel):
    """Update an existing alert rule."""

    metric: Optional[str] = Field(
        None,
        pattern="^(battery_1_voltage|battery_2_voltage|ac_1_status|ac_2_status)$",
    )
    operator: Optional[str] = Field(None, pattern="^(<|>|<=|>=|==)$")
    threshold: Optional[float] = None
    severity: Optional[str] = Field(None, pattern="^(info|warning|critical)$")
    enabled: Optional[bool] = None


class AlertRuleResponse(BaseModel):
    """Alert rule returned by the API."""

    id: uuid.UUID
    device_id: uuid.UUID
    metric: str
    operator: str
    threshold: float
    severity: str
    enabled: bool
    created_at: datetime
    device_name: Optional[str] = None

    model_config = {"from_attributes": True}


# --- Alert Event Schemas ---

class AlertEventResponse(BaseModel):
    """Alert event returned by the API."""

    id: uuid.UUID
    rule_id: uuid.UUID
    device_id: uuid.UUID
    metric: str
    value: float
    severity: str
    message: Optional[str] = None
    acknowledged: bool
    triggered_at: datetime
    resolved_at: Optional[datetime] = None
    device_name: Optional[str] = None

    model_config = {"from_attributes": True}


class AlertEventAcknowledge(BaseModel):
    """Acknowledge an alert event."""

    acknowledged: bool = True


class AlertStats(BaseModel):
    """Summary statistics for alerts."""

    total_rules: int
    active_rules: int
    total_events: int
    unacknowledged: int
    critical_count: int
    warning_count: int
    info_count: int
