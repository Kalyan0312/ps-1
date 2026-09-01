# Development Setup Guide

## Prerequisites
- **Node.js**: v18+ (tested with v24.19)
- **Python**: 3.10+ (tested with 3.14)
- **PostgreSQL + PostGIS**: Local install or Docker Compose

---

## 1. Quick Start

### A. Start Database (Docker)
```bash
docker compose -f database/docker-compose.yml up -d
```

### B. Start Backend Server
```powershell
# Install dependencies
pip install -r backend/requirements.txt

# Start FastAPI server with live reload
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation available at:
- Swagger UI: `http://127.0.0.1:8000/api/v1/docs`
- Health Endpoint: `http://127.0.0.1:8000/api/v1/health`

### C. Start Frontend Application
```powershell
# Install node packages
npm install

# Start Vite dev server
npm run dev
```
Frontend accessible at: `http://localhost:5173`

---

## 2. Using Automated Scripts
- `.\scripts\start-backend.ps1` — Starts the backend server
- `.\scripts\start-frontend.ps1` — Starts the frontend dev server
- `.\scripts\start-dev.ps1` — Runs both in parallel
