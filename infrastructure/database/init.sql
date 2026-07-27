-- ====================================
-- IoT Remote Monitoring Dashboard — Database Init
-- ====================================
-- This script runs automatically when the TimescaleDB container starts
-- for the first time. It creates extensions and the initial schema.

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================
-- Device Registry
-- =====================
CREATE TABLE IF NOT EXISTS devices (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mac_address   VARCHAR(17) UNIQUE NOT NULL,
    name          VARCHAR(255),
    device_type   VARCHAR(100),
    location      VARCHAR(255),
    description   TEXT,
    firmware_ver  VARCHAR(50),
    is_online     BOOLEAN DEFAULT FALSE,
    last_seen     TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_mac ON devices(mac_address);
CREATE INDEX IF NOT EXISTS idx_devices_online ON devices(is_online);

-- =====================
-- Telemetry (Hypertable)
-- =====================
CREATE TABLE IF NOT EXISTS telemetry (
    time               TIMESTAMPTZ NOT NULL,
    device_id          UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    battery_1_voltage  DOUBLE PRECISION,
    battery_2_voltage  DOUBLE PRECISION,
    ac_1_status        VARCHAR(3),
    ac_2_status        VARCHAR(3),
    PRIMARY KEY (time, device_id)
);

-- Convert to TimescaleDB hypertable (chunk interval: 1 day)
SELECT create_hypertable('telemetry', 'time', if_not_exists => TRUE, chunk_time_interval => INTERVAL '1 day');

CREATE INDEX IF NOT EXISTS idx_telemetry_device ON telemetry(device_id, time DESC);

-- =====================
-- Users (Authentication)
-- =====================
CREATE TABLE IF NOT EXISTS users (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username       VARCHAR(100) UNIQUE NOT NULL,
    email          VARCHAR(255) UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    role           VARCHAR(20) DEFAULT 'user',
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- =====================
-- Seed default admin user
-- Password: admin123 (bcrypt hash)
-- =====================
INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin@localhost', '$2b$12$LJ3m4ys3Lk0TSwHjfFv.e.TV1GsXMOG1v/gDe..EDAcP6R4fGznOy', 'admin')
ON CONFLICT (username) DO NOTHING;

SELECT 'IoT Dashboard database initialized successfully' AS status;
