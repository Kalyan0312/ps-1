# Cooperative Gig Services Platform — Architecture

## 1. System Overview
The Cooperative Gig Services Platform is a worker-owned gig marketplace platform providing real-time dispatch, fair pricing, spatial radius search, speech-to-text accessibility, time-series demand forecasting, and community dividend distributions.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                      │
│   Worker App (Voice/Gigs)  │  Customer App  │  Admin Portal │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / WebSocket (Proxy)
┌──────────────────────────────▼──────────────────────────────┐
│                  FastAPI Application Server                 │
│  - REST API (/api/v1)        - WebSocket Real-time Gateway  │
│  - JWT & Cooperative Auth    - Health & Telemetry Engine    │
│  - Geospatial Dispatcher     - STT & Forecasting Connectors │
└──────────────┬──────────────────────────────┬───────────────┘
               │ AsyncPG (SQLAlchemy 2.0)     │
┌──────────────▼──────────────┐ ┌─────────────▼───────────────┐
│     PostgreSQL + PostGIS    │ │      External Services      │
│  - EPSG:4326 Geo Indexes    │ │  - Google Cloud STT         │
│  - Worker/Customer Spatial  │ │  - Razorpay / UPI Gateway   │
│  - Escrow & Cooperative Log │ │  - Firebase Cloud Messaging │
└─────────────────────────────┘ └─────────────────────────────┘
```

## 2. Technology Stack
- **Frontend**: Vite, React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI, Uvicorn, SQLAlchemy 2.0 (Async), asyncpg, GeoAlchemy2, Pydantic Settings, Alembic.
- **Database**: PostgreSQL 16 with PostGIS 3.4 extensions (`postgis`, `postgis_topology`, `fuzzystrmatch`, `uuid-ossp`).
- **Spatial Indexing**: PostGIS Geometry (`Point`, `SRID=4326`), `ST_DWithin`, `ST_DistanceSphere`.
- **Speech**: Google Cloud Speech-to-Text.
- **Forecasting**: Time-series regression & Prophet demand analytics.
- **Payments**: UPI gateway (Razorpay) with escrow-based releases.
- **Real-Time**: WebSockets for live worker location and order status streaming.

## 3. Directory Layout
```
Cooperative-Gig-Platform/
├── backend/                  # FastAPI backend server
│   ├── app/                  # Application core, api routers, models, schemas
│   │   ├── api/              # API endpoints (/api/v1)
│   │   ├── core/             # Configuration & Database async engine
│   │   ├── models/           # SQLAlchemy & PostGIS models
│   │   ├── schemas/          # Pydantic validation models
│   │   └── main.py           # FastAPI entry point
│   ├── alembic/              # Async database migrations
│   ├── alembic.ini           # Alembic config
│   └── requirements.txt      # Python dependencies
├── database/                 # Database initialization & Docker config
│   ├── docker-compose.yml    # PostgreSQL + PostGIS container
│   └── init-scripts/         # PostGIS SQL extension initialization
├── docs/                     # Architectural and operational docs
│   ├── ARCHITECTURE.md
│   └── SETUP.md
├── scripts/                  # Development automation scripts (PowerShell)
│   ├── start-dev.ps1
│   ├── start-backend.ps1
│   └── start-frontend.ps1
├── src/                      # React TypeScript frontend
│   ├── components/           # UI and layout components
│   ├── pages/                # Views (Dashboard, Health, Portals)
│   ├── services/             # API client services
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example              # Environment variables template
├── .env                      # Local environment configuration
├── package.json              # Frontend dependencies
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite bundler configuration
```
