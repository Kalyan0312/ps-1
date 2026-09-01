"""
Phase 11: WebSocket Endpoints

ws://host/api/v1/ws/{channel}

Clients connect with one or more channels:
  - broadcast          global updates (pricing changes, platform announcements)
  - customer:{id}      customer booking updates
  - worker:{id}        worker job dispatch & earnings
  - admin              admin queue, SOS alerts, revenue

Query-param:  ?channels=customer:cust-123,broadcast
"""

import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.services.realtime import manager

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    channels: str = Query(default="broadcast", description="Comma-separated channel list")
):
    """
    Multi-channel WebSocket gateway.

    Connect with channels query param:
        ws://localhost:8000/api/v1/ws?channels=customer:cust-abc,broadcast
        ws://localhost:8000/api/v1/ws?channels=worker:wrk-xyz,broadcast
        ws://localhost:8000/api/v1/ws?channels=admin,broadcast
    """
    channel_list = [ch.strip() for ch in channels.split(",") if ch.strip()]
    if not channel_list:
        channel_list = ["broadcast"]

    await manager.connect(websocket, channel_list)
    logger.info(f"WebSocket opened on channels: {channel_list}")

    try:
        # Send immediate confirmation
        import json
        await websocket.send_text(json.dumps({
            "event": "connection.established",
            "channel": "system",
            "payload": {
                "subscribed_channels": channel_list,
                "message": "Real-time connection established. Cooperative event stream active."
            }
        }))

        # Keep connection alive and handle incoming pings
        while True:
            data = await websocket.receive_text()
            # Handle client ping-pong heartbeat
            if data == "ping":
                await websocket.send_text("pong")

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info(f"WebSocket closed for channels: {channel_list}")
