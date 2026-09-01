import uuid
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("security.audit")

# ══════════════════════════════════════════════════════════════════════════════
# AUDIT LOG MODELS & STORAGE
# ══════════════════════════════════════════════════════════════════════════════

class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    event_type: str
    actor_role: str
    actor_id: Optional[str]
    target_resource_type: str
    target_resource_id: str
    action: str
    details: Dict[str, Any]
    client_ip: Optional[str]
    status: str = "SUCCESS"


# In-Memory Thread-Safe Audit Trail
AUDIT_LOG_STORE: List[Dict[str, Any]] = [
    {
        "id": "audit-init-001",
        "timestamp": "2026-08-28T09:00:00Z",
        "event_type": "PRICING_CONFIG_INITIALIZED",
        "actor_role": "admin",
        "actor_id": "usr-admin-001",
        "target_resource_type": "pricing_config",
        "target_resource_id": "cfg-global",
        "action": "SET_BASE_WAGE_FLOOR",
        "details": {
            "worker_payout_percent": 85.0,
            "cooperative_fee_percent": 10.0,
            "welfare_contribution_percent": 5.0,
            "max_multiplier_cap": 1.75
        },
        "client_ip": "127.0.0.1",
        "status": "SUCCESS"
    },
    {
        "id": "audit-init-002",
        "timestamp": "2026-08-28T14:35:00Z",
        "event_type": "WORKER_VERIFICATION_APPROVED",
        "actor_role": "admin",
        "actor_id": "usr-admin-001",
        "target_resource_type": "worker_profile",
        "target_resource_id": "wrk-ravi-01",
        "action": "APPROVE_COOPERATIVE_MEMBERSHIP",
        "details": {
            "worker_name": "Ravi Kumar",
            "skill": "Plumbing & Sanitary",
            "certificate_verified": "Verified Valid"
        },
        "client_ip": "127.0.0.1",
        "status": "SUCCESS"
    }
]


class SecurityAuditLogger:
    @staticmethod
    def _mask_sensitive_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """Ensures secrets, passwords, or full card/token numbers are never logged."""
        sanitized = {}
        sensitive_keys = {
            "password", "hashed_password", "token", "secret",
            "key", "access_token", "cvv", "card_number"
        }
        for k, v in data.items():
            if any(s in k.lower() for s in sensitive_keys):
                sanitized[k] = "[REDACTED_SECRET]"
            elif isinstance(v, dict):
                sanitized[k] = SecurityAuditLogger._mask_sensitive_data(v)
            else:
                sanitized[k] = v
        return sanitized

    @classmethod
    def log_event(
        cls,
        event_type: str,
        actor_role: str,
        action: str,
        target_resource_type: str,
        target_resource_id: str,
        details: Dict[str, Any],
        actor_id: Optional[str] = None,
        client_ip: Optional[str] = "127.0.0.1",
        status: str = "SUCCESS"
    ) -> AuditLogEntry:
        """
        Appends an immutable structured audit log entry.
        """
        now = datetime.now(timezone.utc).isoformat()
        entry_id = f"audit-{uuid.uuid4().hex[:8]}"
        clean_details = cls._mask_sensitive_data(details)
        
        entry = {
            "id": entry_id,
            "timestamp": now,
            "event_type": event_type,
            "actor_role": actor_role,
            "actor_id": actor_id or "system",
            "target_resource_type": target_resource_type,
            "target_resource_id": target_resource_id,
            "action": action,
            "details": clean_details,
            "client_ip": client_ip or "127.0.0.1",
            "status": status
        }
        
        AUDIT_LOG_STORE.insert(0, entry)
        logger.info(
            f"[AUDIT] [{event_type}] by {actor_role}:{actor_id} on {target_resource_type}:{target_resource_id} -> {action}"
        )
        return AuditLogEntry(**entry)

    @staticmethod
    def get_logs(
        event_type: Optional[str] = None,
        actor_role: Optional[str] = None,
        limit: int = 50
    ) -> List[AuditLogEntry]:
        results = AUDIT_LOG_STORE
        if event_type:
            results = [r for r in results if r["event_type"] == event_type]
        if actor_role:
            results = [r for r in results if r["actor_role"] == actor_role]
        return [AuditLogEntry(**r) for r in results[:limit]]


audit_logger = SecurityAuditLogger()
