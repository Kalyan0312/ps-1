# Cooperative Gig Services Platform

A modern, worker-owned cooperative gig platform featuring real-time spatial dispatching with PostGIS, voice job search with Google Speech-to-Text, predictive demand analytics, and cooperative dividend distribution.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons
- **Backend**: FastAPI + SQLAlchemy 2.0 (Async) + asyncpg + GeoAlchemy2 + Pydantic Settings
- **Database**: PostgreSQL 16 + PostGIS 3.4
- **Real-time**: WebSockets

## Quick Start

### 1. Database
```bash
docker compose -f database/docker-compose.yml up -d
```

### 2. Backend
```bash
pip install -r backend/requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend
```bash
npm install
npm run dev
```

### 4. Health Check
Open `http://127.0.0.1:8000/api/v1/health` or view the live telemetry on the dashboard at `http://localhost:5173`.
