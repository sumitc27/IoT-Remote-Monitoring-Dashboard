"""
Pydantic schemas for Device — request validation and response serialization.
"""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# --- Response schemas ---

class DeviceResponse(BaseModel):
    """Full device representation returned by the API."""

    id: uuid.UUID
    mac_address: str
    name: Optional[str] = None
    device_type: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    firmware_ver: Optional[str] = None
    is_online: bool = False
    last_seen: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DeviceSummary(BaseModel):
    """Compact device info for grid/list views."""

    id: uuid.UUID
    mac_address: str
    name: Optional[str] = None
    device_type: Optional[str] = None
    location: Optional[str] = None
    is_online: bool = False
    last_seen: Optional[datetime] = None

    model_config = {"from_attributes": True}


# --- Request schemas ---

class DeviceCreate(BaseModel):
    """Schema for registering a new device."""

    mac_address: str = Field(..., min_length=12, max_length=17)
    name: Optional[str] = Field(None, max_length=255)
    device_type: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    firmware_ver: Optional[str] = Field(None, max_length=50)


class DeviceUpdate(BaseModel):
    """Schema for updating an existing device."""

    name: Optional[str] = Field(None, max_length=255)
    device_type: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    firmware_ver: Optional[str] = Field(None, max_length=50)
