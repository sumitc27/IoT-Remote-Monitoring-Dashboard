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

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for TimescaleDB)
- [Python 3.11+](https://www.python.org/) (for backend)
- [Node.js 18+](https://nodejs.org/) (for frontend)

### 1. Clone & Setup Environment

```bash
git clone <your-repo-url>
cd IoT-Remote-Monitoring-Dashboard
cp .env.example .env
# Edit .env with your MQTT credentials
```

### 2. Start Database

```bash
docker compose up -d
```

### 3. Run Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 4. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard available at: http://localhost:5173

## 📊 Current Version

**v0.1-scaffold** — Project scaffolding and monorepo structure.

## 📝 License

Private — Internal Use

## 👥 Authors

- Development Team