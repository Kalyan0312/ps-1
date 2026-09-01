"""
Phase 11: WebSocket Connection Manager & Real-Time Event Hub

Central in-memory pub/sub system. All events broadcast from any FastAPI
endpoint through this hub to subscribed WebSocket connections.

Event Channel Scoping:
  - broadcast       : all connected clients (admin metrics, pricing changes)
  - customer:{id}   : specific customer's booking updates
  - worker:{id}     : specific worker's job dispatch & earnings
  - admin           : admin-only channel (SOS, grievances, revenue)

Events follow a typed { event, channel, payload } envelope.
"""

import asyncio
import json
from typing import Dict, Set
from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    WebSocket connection manager with channel-based fan-out.
    Supports per-connection channel subscription.
    """

    def __init__(self):
        # channel_id -> set of websocket connections
        self.channels: Dict[str, Set[WebSocket]] = {}
        # websocket -> set of subscribed channels (for cleanup on disconnect)
        self.connections: Dict[WebSocket, Set[str]] = {}

    async def connect(self, websocket: WebSocket, channels: list[str]):
        await websocket.accept()
        self.connections[websocket] = set(channels)
        for ch in channels:
            self.channels.setdefault(ch, set()).add(websocket)
        logger.info(f"WS connected: channels={channels}, total_clients={len(self.connections)}")

    def disconnect(self, websocket: WebSocket):
        subscribed = self.connections.pop(websocket, set())
        for ch in subscribed:
            self.channels.get(ch, set()).discard(websocket)
        logger.info(f"WS disconnected. Remaining clients: {len(self.connections)}")

    async def _send_safe(self, websocket: WebSocket, message: dict):
        try:
            await websocket.send_text(json.dumps(message))
        except Exception:
            self.disconnect(websocket)

    async def broadcast_to_channel(self, channel: str, event: str, payload: dict):
        """Send an event to all connections subscribed to a specific channel."""
        message = {"event": event, "channel": channel, "payload": payload}
        targets = list(self.channels.get(channel, set()))
        if targets:
            await asyncio.gather(*[self._send_safe(ws, message) for ws in targets])

    async def broadcast_to_all(self, event: str, payload: dict):
        """Broadcast an event to every connected client."""
        message = {"event": event, "channel": "broadcast", "payload": payload}
        targets = list(self.connections.keys())
        if targets:
            await asyncio.gather(*[self._send_safe(ws, message) for ws in targets])


# ─── Global singleton shared across all FastAPI endpoints ───────────────────
manager = ConnectionManager()


# ─── Typed Event Emitters ────────────────────────────────────────────────────

async def emit_booking_created(booking: dict):
    """Customer creates booking → Worker receives job request + Admin booking count updates."""
    await manager.broadcast_to_channel(
        f"worker:{booking['worker']['id']}", "booking.created", booking
    )
    await manager.broadcast_to_channel("admin", "admin.booking_count_update", {
        "booking_id": booking["id"],
        "booking_reference": booking["booking_reference"],
        "service": booking["service"]["name"],
        "amount": booking["price"]["final_price"]
    })


async def emit_worker_accepted(booking_id: str, customer_id: str, worker: dict, booking: dict):
    """Worker accepts → Customer sees Assigned status instantly."""
    await manager.broadcast_to_channel(
        f"customer:{customer_id}", "booking.status_changed", {
            "booking_id": booking_id,
            "status": "confirmed",
            "worker": worker,
            "message": f"Your worker {worker['full_name']} has accepted your request!",
            "eta_minutes": booking.get("eta_minutes", 15)
        }
    )


async def emit_status_changed(booking: dict, customer_id: str):
    """Worker changes status → Customer sees it instantly."""
    await manager.broadcast_to_channel(
        f"customer:{customer_id}", "booking.status_changed", {
            "booking_id": booking["id"],
            "status": booking["status"],
            "worker": booking.get("worker"),
            "eta_minutes": booking.get("eta_minutes"),
            "message": _status_message(booking["status"], booking.get("worker"))
        }
    )


async def emit_booking_completed(booking: dict, customer_id: str, worker_id: str):
    """Worker completes → Customer gets completion + Worker earnings update + Admin revenue update."""
    final_price = booking["price"]["final_price"]
    worker_earning = booking["price"]["worker_share"]
    cooperative_fee = booking["price"]["cooperative_share"]
    welfare_contribution = booking["price"]["welfare_share"]

    # → Customer: job done
    await manager.broadcast_to_channel(
        f"customer:{customer_id}", "booking.completed", {
            "booking_id": booking["id"],
            "booking_reference": booking["booking_reference"],
            "message": "Your service is complete! Your escrow payment has been released.",
            "invoice_ready": True,
            "total_paid": final_price
        }
    )

    # → Worker: earnings updated instantly
    await manager.broadcast_to_channel(
        f"worker:{worker_id}", "worker.earnings_updated", {
            "booking_id": booking["id"],
            "new_earning": worker_earning,
            "message": f"₹{worker_earning:.2f} credited directly to your cooperative account!",
            "welfare_credited": welfare_contribution
        }
    )

    # → Admin: revenue and welfare update
    await manager.broadcast_to_channel("admin", "admin.revenue_update", {
        "booking_id": booking["id"],
        "total_revenue": final_price,
        "cooperative_fee": cooperative_fee,
        "welfare_contribution": welfare_contribution,
        "worker_earning": worker_earning
    })


async def emit_sos_alert(sos_payload: dict, sender_role: str, sender_id: str):
    """SOS → Admin gets priority alert immediately."""
    await manager.broadcast_to_channel("admin", "sos.priority_alert", {
        "sender_role": sender_role,
        "sender_id": sender_id,
        "priority": "CRITICAL",
        **sos_payload
    })
    # Also broadcast to all admins regardless of channel
    await manager.broadcast_to_all("sos.priority_alert", {
        "sender_role": sender_role,
        "priority": "CRITICAL",
        **sos_payload
    })


async def emit_grievance_filed(grievance: dict):
    """Grievance → Admin queue updates instantly."""
    await manager.broadcast_to_channel("admin", "admin.grievance_queue_update", {
        "grievance_id": grievance["id"],
        "subject": grievance.get("subject"),
        "filed_by": grievance.get("filed_by"),
        "priority": grievance.get("priority", "normal")
    })


async def emit_rating_updated(worker_id: str, new_rating: float, review_count: int):
    """Rating → Worker's profile rating updates in real-time."""
    await manager.broadcast_to_channel(
        f"worker:{worker_id}", "worker.rating_updated", {
            "worker_id": worker_id,
            "new_rating": new_rating,
            "review_count": review_count,
            "message": f"Your rating has been updated to {new_rating} ★"
        }
    )


async def emit_pricing_changed(config: dict, rules_updated: bool = False):
    """Admin changes pricing → All clients notified, next booking uses new pricing."""
    await manager.broadcast_to_all("pricing.config_updated", {
        "max_multiplier_cap": config.get("max_multiplier_cap"),
        "worker_payout_percent": config.get("worker_payout_percent"),
        "rules_updated": rules_updated,
        "message": "Cooperative pricing rules updated. All new bookings will use the new rates."
    })


def _status_message(status: str, worker: dict | None) -> str:
    worker_name = worker["full_name"] if worker else "Your worker"
    messages = {
        "confirmed": f"{worker_name} has been assigned to your booking.",
        "worker_en_route": f"{worker_name} is on the way! GPS tracking active.",
        "in_progress": f"{worker_name} has started work at your location.",
        "completed": "Job completed successfully. Escrow payment released.",
        "cancelled": "Booking has been cancelled. Refund initiated.",
    }
    return messages.get(status, f"Status updated to: {status.replace('_', ' ')}")
