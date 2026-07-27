# Implementation Plan

> **Project:** IoT Remote Monitoring Dashboard\
****Date:** 2026-07-27\
****Status:** Draft — Pending Approval

---

## 1. Project Summary

It is a professional IoT SaaS platform for remotely monitoring ESP32 sensor nodes over MQTT. The system ingests real-time telemetry (battery voltages, AC mains status) from edge devices communicating via 4G LTE, stores historical data, and presents everything through a modern, responsive dashboard.

### What We Have Today

| Asset | Description |
| --- | --- |
| [new-dashboard.html](./new-dashboard.html) | Single-file prototype dashboard — connects directly to EMQX via WebSocket, displays 1 ESP32's data |
| [SIM7670_EMQX_MQTT_Working.ino](./SIM7670_EMQX_MQTT_Working.ino) | Working ESP32 firmware — reads 2 battery voltages + 2 AC mains, publishes JSON over MQTT/TLS via SIM7670 |
| [Structure.md](./Structure.md) | Architecture document with tech stack, directory structure, and data flow |

### What We're Building

A production-grade, multi-device monitoring platform with:

- ✅ Real-time dashboard for N devices
- ✅ FastAPI backend with MQTT ingestion
- ✅ TimescaleDB for historical telemetry
- ✅ Device management (add/edit/delete)
- ✅ JWT authentication
- ✅ Configurable alerts & notifications
- ✅ Docker deployment
- ✅ GitHub milestones at every phase

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EDGE DEVICES                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                         │
│  │ ESP32 #1 │  │ ESP32 #2 │  │ ESP32 #N │   (SIM7670 4G LTE)     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                         │
│       │              │              │                               │
│       └──────────────┼──────────────┘                               │
│                      ▼                                              │
│            ┌──────────────────┐                                     │
│            │   EMQX Cloud     │  (MQTT Broker, TLS on 8883)        │
│            │   Topic: test/   │                                     │
│            │   devices/+/power│                                     │
│            └────────┬─────────┘                                     │
└─────────────────────┼───────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI + Python)                        │
│                                                                     │
│  ┌─────────────────┐   ┌────────────────┐   ┌──────────────────┐   │
│  │ aiomqtt          │   │ REST API       │   │ WebSocket Server │   │
│  │ Subscriber       │──▶│ /api/devices   │   │ /ws/telemetry    │   │
│  │ (Background Task)│   │ /api/telemetry │   │ (Real-time relay)│   │
│  └────────┬─────────┘   │ /api/auth      │   └────────┬─────────┘   │
│           │              │ /api/alerts    │            │             │
│           ▼              └───────┬────────┘            │             │
│  ┌─────────────────────────────────────────────────┐   │             │
│  │              PostgreSQL + TimescaleDB            │   │             │
│  │  ┌──────────┐  ┌─────────────┐  ┌───────────┐  │   │             │
│  │  │ devices  │  │ telemetry   │  │ users     │  │   │             │
│  │  │ (registry│  │ (hypertable)│  │ (auth)    │  │   │             │
│  │  └──────────┘  └─────────────┘  └───────────┘  │   │             │
│  └─────────────────────────────────────────────────┘   │             │
└────────────────────────────────────────────────────────┼─────────────┘
                                                         │
                                                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                           │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Device Grid   │  │ Device Detail│  │ Alerts Panel             │  │
│  │ (live cards)  │  │ (ECharts)    │  │ (threshold notifications)│  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                                                                     │
│  State: Zustand  │  Charts: ECharts  │  Font: Inter                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology | Why |
| --- | --- | --- |
| **Edge** | ESP32-S3 + SIM7670 (C++) | Existing hardware with 4G cellular MQTT |
| **Broker** | EMQX Cloud | Already working, TLS, WebSocket support |
| **Backend** | Python FastAPI + Uvicorn | Async, auto Swagger docs, Pydantic validation |
| **MQTT Client** | aiomqtt | Native async, integrates with FastAPI's event loop |
| **ORM** | SQLAlchemy (async) + asyncpg | Async DB access, migration support via Alembic |
| **Database** | PostgreSQL + TimescaleDB | Single engine for both relational + time-series data |
| **Auth** | JWT (PyJWT + passlib + bcrypt) | Stateless token auth, secure password storage |
| **Frontend** | React 18 + Vite | Fast dev server, HMR, modern build tooling |
| **Charts** | Apache ECharts | GPU-accelerated, handles high-frequency time-series |
| **State** | Zustand | Minimal boilerplate, optimized for frequent updates |
| **Deploy** | Docker + Docker Compose | Reproducible dev and production environments |

---

## 4. Phased Roadmap & GitHub Milestones

Each phase ends with a tagged GitHub commit. This ensures we always have a working, deployable snapshot to roll back to.

---

### Phase 0 — Project Scaffolding & Git Setup

**Tag:** `v0.1-scaffold`\
**Estimated time:** \~2 hours

| \# | Task | Details |
| --- | --- | --- |
| 0.1 | Initialize Git | `git init`, `.gitignore` (Python, Node, env files, IDE), `README.md` |
| 0.2 | Create monorepo structure | `/firmware`, `/backend`, `/frontend`, `/infrastructure`, `/docs` |
| 0.3 | Organize existing files | ESP code → `/firmware/src/`, prototype → `/docs/prototype/` |
| 0.4 | Scaffold FastAPI backend | `pyproject.toml`, `requirements.txt`, app skeleton with health endpoint |
| 0.5 | Scaffold React frontend | `npx create-vite` with React template |
| 0.6 | Create `.env.example` | Template for `MQTT_BROKER_URL`, `MQTT_USERNAME`, `MQTT_PASSWORD`, `DATABASE_URL` |
| 0.7 | Create `docker-compose.yml` | TimescaleDB container for local development |
| 0.8 | **Commit & Tag** | `git tag v0.1-scaffold` |

**Deliverable:** Running `uvicorn` returns `{"status": "ok"}` at `/health`. React dev server renders a placeholder page.

---

### Phase 1 — Backend Core: MQTT Ingestion & Database

**Tag:** `v0.2-backend-core`\
**Estimated time:** \~6 hours

| \# | Task | Details |
| --- | --- | --- |
| 1.1 | Database models | SQLAlchemy models: `Device`, `Telemetry`, `User` |
| 1.2 | Pydantic schemas | Request/response schemas for all models |
| 1.3 | Alembic setup | `alembic init`, initial migration with all tables |
| 1.4 | TimescaleDB hypertable | `create_hypertable('telemetry', 'time')` in migration |
| 1.5 | MQTT subscriber | `aiomqtt` background task on FastAPI startup, subscribes to `test/devices/+/power` |
| 1.6 | Auto-register devices | Parse MAC from topic, upsert into `devices` table |
| 1.7 | Telemetry writer | Parse JSON payload, insert into `telemetry` hypertable |
| 1.8 | REST endpoints | `GET /api/devices`, `GET /api/devices/{id}`, `GET /api/devices/{id}/telemetry` |
| 1.9 | WebSocket relay | `/ws/telemetry` — broadcast incoming MQTT data to connected frontends |
| 1.10 | Swagger docs | Verify auto-generated docs at `/docs` |
| 1.11 | **Commit & Tag** | `git tag v0.2-backend-core` |

**Deliverable:** ESP32 publishes → backend receives → data in DB → REST API returns it → WebSocket streams it live.

---

### Phase 2 — Frontend Dashboard (Core UI)

**Tag:** `v0.3-dashboard-core`\
**Estimated time:** \~8 hours

| \# | Task | Details |
| --- | --- | --- |
| 2.1 | Design system | CSS variables (colors, spacing, shadows), dark theme, Inter font |
| 2.2 | App shell | Sidebar navigation + top header with global stats |
| 2.3 | Zustand store | `useDeviceStore` — devices map, telemetry cache, online/offline counts |
| 2.4 | WebSocket hook | `useWebSocket` — connect to `/ws/telemetry`, auto-reconnect, update store |
| 2.5 | Device grid page | Responsive card grid — each card shows device name, voltage, status color |
| 2.6 | Device card component | Battery voltage, estimated charge %, AC status dots, last-seen time |
| 2.7 | Status color logic | Green (≥12V), Amber (11-12V), Red (&lt;11V), Gray (offline &gt;60s) |
| 2.8 | Connection badge | Global MQTT/WebSocket connection indicator in header |
| 2.9 | Responsive breakpoints | Desktop (5-col), tablet (3-col), mobile (1-col) |
| 2.10 | Loading & empty states | Skeleton loaders, "No devices found" state |
| 2.11 | **Commit & Tag** | `git tag v0.3-dashboard-core` |

**Deliverable:** Open browser → see live-updating grid of all connected ESP32 devices with real-time voltage and status.

---

### Phase 3 — Device Detail View & Historical Charts

**Tag:** `v0.4-device-detail`\
**Estimated time:** \~6 hours

| \# | Task | Details |
| --- | --- | --- |
| 3.1 | Device detail page | Click a card → full-page view with device info + charts |
| 3.2 | ECharts setup | Install `echarts-for-react`, configure dark theme |
| 3.3 | Voltage history chart | Line chart with time on X-axis, voltage on Y-axis |
| 3.4 | AC status timeline | Step chart showing ON/OFF transitions over time |
| 3.5 | Time range selector | Buttons: 1h, 6h, 24h, 7d, 30d — fetches from REST API |
| 3.6 | Charge donut gauge | Circular progress — green/amber/red based on charge % |
| 3.7 | Time to 50% DoD | Calculated from voltage curve, displayed as card |
| 3.8 | Device info sidebar | MAC, name, type, location, firmware, last seen, created date |
| 3.9 | Back navigation | Breadcrumb or back button to return to dashboard grid |
| 3.10 | **Commit & Tag** | `git tag v0.4-device-detail` |

**Deliverable:** Click any device card → see rich detail page with interactive historical charts and device metadata.

---

### Phase 4 — Authentication & Device Management

**Tag:** `v0.5-auth-management`\
**Estimated time:** \~6 hours

| \# | Task | Details |
| --- | --- | --- |
| 4.1 | Auth endpoints | `POST /api/auth/login` (returns JWT), `POST /api/auth/register` (admin-only) |
| 4.2 | Password security | bcrypt hashing via passlib, minimum complexity rules |
| 4.3 | JWT middleware | FastAPI `Depends()` for protected routes, token expiry/refresh |
| 4.4 | Login page | Clean login form with validation, error messages, redirect on success |
| 4.5 | Auth store | Zustand `useAuthStore` — token storage, login/logout actions |
| 4.6 | Protected routes | React router guards — redirect to `/login` if unauthenticated |
| 4.7 | Add Device modal | Form: device name, type, location, MAC address, MQTT topic |
| 4.8 | Edit device | Inline editing or modal for updating device config |
| 4.9 | Delete device | Confirmation dialog → `DELETE /api/devices/{id}` |
| 4.10 | Seed admin user | Migration or startup script to create default admin account |
| 4.11 | **Commit & Tag** | `git tag v0.5-auth-management` |

**Deliverable:** Login required to access dashboard. Admin can add/edit/delete devices through the UI.

---

### Phase 5 — Alerts & Notifications

**Tag:** `v0.6-alerts`\
**Estimated time:** \~5 hours

| \# | Task | Details |
| --- | --- | --- |
| 5.1 | Alert rule model | `AlertRule` table: device_id, metric, operator, threshold, severity |
| 5.2 | Alert event model | `AlertEvent` table: rule_id, device_id, value, triggered_at, resolved_at |
| 5.3 | Alert evaluation | Check each incoming telemetry against active rules |
| 5.4 | Alert REST endpoints | CRUD for rules, GET for events with pagination |
| 5.5 | Alert bell component | Header icon with unread count badge |
| 5.6 | Alert dropdown panel | Recent alerts list with severity colors and timestamps |
| 5.7 | Toast notifications | In-app toast when new alert fires (via WebSocket) |
| 5.8 | Device offline detection | Mark device offline if no data received in configurable timeout |
| 5.9 | Email notifications | Optional: aiosmtplib for email delivery of critical alerts |
| 5.10 | **Commit & Tag** | `git tag v0.6-alerts` |

**Deliverable:** Set threshold rules per device → get real-time alerts in dashboard when exceeded.

---

### Phase 6 — Docker & Production Deployment

**Tag:** `v1.0-production`\
**Estimated time:** \~4 hours

| \# | Task | Details |
| --- | --- | --- |
| 6.1 | Backend Dockerfile | Multi-stage: builder (install deps) → runtime (uvicorn) |
| 6.2 | Frontend Dockerfile | Build stage (npm run build) → nginx serving static files |
| 6.3 | docker-compose.yml | Full stack: frontend, backend, timescaledb, volumes, networks |
| 6.4 | Environment config | `.env.production` template, secret management |
| 6.5 | Health checks | Backend `/health` endpoint, Docker HEALTHCHECK directives |
| 6.6 | Nginx config | Reverse proxy: `/api` → backend, `/ws` → WebSocket, `/` → frontend |
| 6.7 | README update | Setup instructions, environment variables, deployment guide |
| 6.8 | **Commit & Tag** | `git tag v1.0-production` |

**Deliverable:** `docker compose up` → entire platform running. One command to deploy anywhere.

---

## 5. API Reference

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | ❌ | Returns JWT access token |
| `POST` | `/api/auth/register` | 🔒 Admin | Create new user account |
| `POST` | `/api/auth/refresh` | 🔒 | Refresh expiring token |

### Devices

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/devices` | 🔒 | List all devices with latest status |
| `GET` | `/api/devices/{id}` | 🔒 | Single device details |
| `POST` | `/api/devices` | 🔒 Admin | Register new device |
| `PUT` | `/api/devices/{id}` | 🔒 Admin | Update device config |
| `DELETE` | `/api/devices/{id}` | 🔒 Admin | Remove device |

### Telemetry

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/devices/{id}/telemetry` | 🔒 | Historical data (query: `?from=&to=&interval=`) |
| `GET` | `/api/devices/{id}/telemetry/latest` | 🔒 | Most recent reading |

### Alerts

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/alerts` | 🔒 | List alert events (paginated) |
| `POST` | `/api/alerts/rules` | 🔒 Admin | Create alert rule |
| `GET` | `/api/alerts/rules` | 🔒 | List all alert rules |
| `DELETE` | `/api/alerts/rules/{id}` | 🔒 Admin | Delete alert rule |

### WebSocket

| Endpoint | Description |
| --- | --- |
| `ws://host/ws/telemetry` | Real-time telemetry stream (JSON frames) |
| `ws://host/ws/alerts` | Real-time alert notifications |

---

## 6. Database Schema

### `devices` (PostgreSQL)

```sql
CREATE TABLE devices (
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
```

### `telemetry` (TimescaleDB Hypertable)

```sql
CREATE TABLE telemetry (
    time               TIMESTAMPTZ NOT NULL,
    device_id          UUID REFERENCES devices(id),
    battery_1_voltage  FLOAT,
    battery_2_voltage  FLOAT,
    ac_1_status        VARCHAR(3),
    ac_2_status        VARCHAR(3)
);
SELECT create_hypertable('telemetry', 'time');
```

### `users` (PostgreSQL)

```sql
CREATE TABLE users (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username       VARCHAR(100) UNIQUE NOT NULL,
    email          VARCHAR(255) UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    role           VARCHAR(20) DEFAULT 'user',
    created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

### `alert_rules` (PostgreSQL)

```sql
CREATE TABLE alert_rules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id   UUID REFERENCES devices(id),
    metric      VARCHAR(50) NOT NULL,        -- e.g., 'battery_1_voltage'
    operator    VARCHAR(5) NOT NULL,          -- '<', '>', '<=', '>=', '=='
    threshold   FLOAT NOT NULL,
    severity    VARCHAR(20) DEFAULT 'warning', -- 'info', 'warning', 'critical'
    enabled     BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `alert_events` (PostgreSQL)

```sql
CREATE TABLE alert_events (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id      UUID REFERENCES alert_rules(id),
    device_id    UUID REFERENCES devices(id),
    metric       VARCHAR(50) NOT NULL,
    value        FLOAT NOT NULL,
    severity     VARCHAR(20) NOT NULL,
    message      TEXT,
    acknowledged BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at  TIMESTAMPTZ
);
```

---

## 7. Verification Plan

### Automated Testing

| Layer | Tool | Command |
| --- | --- | --- |
| Backend API | pytest + httpx | `cd backend && pytest` |
| Backend MQTT | pytest with mock broker | `cd backend && pytest tests/test_mqtt.py` |
| Frontend components | Vitest + React Testing Library | `cd frontend && npm test` |

### Manual Verification Checklist

- [ ] ESP32 publishes → data appears in TimescaleDB within 2 seconds

- [ ] Dashboard shows live device cards updating in real-time

- [ ] Swagger docs render correctly at `/docs`

- [ ] Device detail page shows historical charts with correct data

- [ ] Login flow works — invalid credentials show error, valid ones redirect to dashboard

- [ ] Add/Edit/Delete device works through UI

- [ ] Alert fires when voltage drops below threshold

- [ ] WebSocket reconnects automatically after network interruption

- [ ] Dashboard is responsive on mobile (320px), tablet (768px), desktop (1440px)

- [ ] `docker compose up` starts all services successfully

---

## 8. Risk & Mitigation

| Risk | Impact | Mitigation |
| --- | --- | --- |
| EMQX Cloud downtime | No live data | Backend queues last-known values, frontend shows "stale" indicator |
| ESP32 cellular connectivity loss | Gaps in telemetry | Backend marks device offline after timeout, UI shows gray status |
| High-frequency data overwhelming DB | Slow queries | TimescaleDB compression policies, data retention policies |
| WebSocket connection drops | Frontend stops updating | Auto-reconnect with exponential backoff in `useWebSocket` hook |
| Hardcoded credentials in code | Security risk | All secrets in `.env`, `.gitignore` protects env files from day 1 |

---

## 9. Git Workflow

```
main
  │
  ├── v0.1-scaffold        ← Phase 0: Monorepo + scaffolding
  ├── v0.2-backend-core    ← Phase 1: MQTT ingestion + DB + API
  ├── v0.3-dashboard-core  ← Phase 2: React dashboard + live grid
  ├── v0.4-device-detail   ← Phase 3: Detail view + charts
  ├── v0.5-auth-management ← Phase 4: Login + device CRUD
  ├── v0.6-alerts          ← Phase 5: Alert engine + notifications
  └── v1.0-production      ← Phase 6: Docker + deployment
```

Each tag represents a stable, working snapshot that can be demoed or rolled back to.

---

## 10. Next Steps

> **Immediate action upon approval:** Begin Phase 0 — initialize Git repository, create monorepo structure, scaffold FastAPI backend and React frontend, and push the first tagged commit.
