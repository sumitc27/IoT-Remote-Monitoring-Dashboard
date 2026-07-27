-- ====================================
-- IoT Remote Monitoring Dashboard — Database Init
-- ====================================
-- This script runs automatically when the TimescaleDB container starts for the first time.
-- It enables the TimescaleDB extension and creates the initial schema.

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Placeholder: tables will be created via Alembic migrations in Phase 1
-- This file ensures the extensions are ready.

SELECT 'IoT Dashboard database initialized successfully' AS status;
