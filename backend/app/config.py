"""
IoT Remote Monitoring Dashboard — Backend Configuration

Loads settings from environment variables (.env file).
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # --- App ---
    APP_NAME: str = "IoT Remote Monitoring Dashboard"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # --- Database ---
    DATABASE_URL: str = "postgresql+asyncpg://iotdash:iotdash_dev@localhost:5433/iotdash_db"

    # --- MQTT ---
    MQTT_BROKER_HOST: str = "j18eff7a.ala.asia-southeast1.emqxsl.com"
    MQTT_BROKER_PORT: int = 8883
    MQTT_USERNAME: str = ""
    MQTT_PASSWORD: str = ""
    MQTT_TOPIC_PATTERN: str = "test/devices/+/power"
    MQTT_USE_TLS: bool = True

    # --- JWT Auth ---
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # --- CORS ---
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # --- Device Offline Detection ---
    DEVICE_OFFLINE_TIMEOUT: int = 120  # Seconds without data before marking offline
    DEVICE_OFFLINE_CHECK_INTERVAL: int = 30  # How often to check for offline devices

    model_config = {
        "env_file": "../.env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }


settings = Settings()
