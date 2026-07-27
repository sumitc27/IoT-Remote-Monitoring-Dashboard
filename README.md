# 🔌 IoT Remote Monitoring Dashboard

A professional, real-time IoT platform for remotely monitoring ESP32 sensor nodes over MQTT. Built for tracking battery voltages, AC mains status, and device health across distributed edge deployments.

## 🏗️ Architecture

```
ESP32 Nodes → EMQX (MQTT/TLS) → FastAPI Backend → React Dashboard
                                      ↕
                                  TimescaleDB
```

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Edge Devices | ESP32-S3 + SIM7670 (4G LTE) |
| Message Broker | EMQX Cloud (MQTT + TLS) |
| Backend | Python FastAPI + Uvicorn |
| Database | PostgreSQL + TimescaleDB |
| Frontend | React + Vite |
| Charts | Apache ECharts |
| Deployment | Docker Compose |

## 📁 Project Structure

```
├── firmware/        # ESP32 C++ code (PlatformIO)
├── backend/         # FastAPI Python service
├── frontend/        # React + Vite dashboard
├── infrastructure/  # Database & broker configs
└── docs/            # Documentation & archived prototypes
```

## 🚀 Deployment

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/)

### 1. Setup Environment
```bash
git clone <your-repo-url>
cd IoT-Remote-Monitoring-Dashboard
cp .env.production.example .env
# Edit .env with your secure credentials
```

### 2. Deploy Full Stack
```bash
docker-compose up -d --build
```
This single command spins up:
- TimescaleDB (Port 5433 mapped locally)
- FastAPI Backend (Internal)
- React Frontend (Internal)
- Nginx Reverse Proxy (Port 80)

The application will be accessible at `http://localhost`. API docs at `http://localhost/docs`.

### Development Setup
For local development without Dockerizing the app code (running just the database):
```bash
docker-compose up -d timescaledb
# Run backend locally
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
# Run frontend locally
cd frontend && npm install && npm run dev
```

## 📊 Current Version

**v1.0-production** — Production-ready deployment with Docker, Nginx, and full alerting engine.

## 📝 License

Private — Internal Use

## 👥 Authors

- Development Team