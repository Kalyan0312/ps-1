from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class DatabaseHealth(BaseModel):
    status: str
    connected: bool
    latency_ms: Optional[float] = None
    database_name: Optional[str] = None
    postgis_available: bool = False
    postgis_version: Optional[str] = None
    error_message: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    project: str
    version: str
    environment: str
    timestamp: datetime
    database: DatabaseHealth
    services: Dict[str, Any]
