import uuid
import logging
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.audit import audit_logger
from app.schemas.pricing import (
    PricingCalculateRequest,
    PricingCalculateResponse,
    AppliedFactorItem,
    PriceRuleCreateRequest,
    PriceRuleUpdateRequest,
    PriceRuleResponse,
    PricingConfigResponse,
    PricingConfigUpdateRequest
)

router = APIRouter()
logger = logging.getLogger(__name__)


# Cooperative Approved Base Rates per Service Category
COOPERATIVE_BASE_RATES = {
    "cat-electrician": {"name": "Electrician", "base_rate": 250.00, "floor": 200.00},
    "electrician": {"name": "Electrician", "base_rate": 250.00, "floor": 200.00},
    "cat-plumber": {"name": "Plumber", "base_rate": 250.00, "floor": 200.00},
    "plumber": {"name": "Plumber", "base_rate": 250.00, "floor": 200.00},
    "cat-carpenter": {"name": "Carpenter", "base_rate": 300.00, "floor": 220.00},
    "carpenter": {"name": "Carpenter", "base_rate": 300.00, "floor": 220.00},
    "cat-painter": {"name": "Painter", "base_rate": 220.00, "floor": 180.00},
    "painter": {"name": "Painter", "base_rate": 220.00, "floor": 180.00},
    "cat-cleaning": {"name": "Cleaning", "base_rate": 200.00, "floor": 160.00},
    "cleaning": {"name": "Cleaning", "base_rate": 200.00, "floor": 160.00},
    "cat-care": {"name": "Care", "base_rate": 280.00, "floor": 220.00},
    "care": {"name": "Care", "base_rate": 280.00, "floor": 220.00},
    "cat-driver": {"name": "Driver", "base_rate": 240.00, "floor": 190.00},
    "driver": {"name": "Driver", "base_rate": 240.00, "floor": 190.00},
    "cat-gardening": {"name": "Gardening", "base_rate": 200.00, "floor": 160.00},
    "gardening": {"name": "Gardening", "base_rate": 200.00, "floor": 160.00},
    "cat-technician": {"name": "Technician", "base_rate": 350.00, "floor": 250.00},
    "technician": {"name": "Technician", "base_rate": 350.00, "floor": 250.00},
}

# Global Cooperative Pricing Configuration
PRICING_CONFIG = {
    "max_multiplier_cap": 1.75, # Strict maximum surge cap of 1.75x
    "worker_payout_percent": 85.0, # 85% direct wage guarantee
    "cooperative_fee_percent": 10.0, # 10% cooperative operational reserve
    "welfare_contribution_percent": 5.0, # 5% worker healthcare, accident & emergency fund
    "minimum_wage_floor_enforced": True
}

# Configured Rule-Based Factors
PRICE_RULES_STORE = [
    {
        "id": "rule-weather-rain",
        "factor_type": "weather",
        "name": "Monsoon / Heavy Rain Allowance",
        "description": "Compensates workers for adverse weather travel and difficult working conditions.",
        "multiplier": 1.15, # +15%
        "is_active": True,
        "condition_value": "rain",
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "rule-weather-storm",
        "factor_type": "weather",
        "name": "Severe Storm / Cyclone Warning",
        "description": "Hazard allowance during severe weather conditions.",
        "multiplier": 1.25, # +25%
        "is_active": True,
        "condition_value": "storm",
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "rule-festival-diwali",
        "factor_type": "festival",
        "name": "Cooperative Holiday & Festival Premium",
        "description": "Ensures holiday wage premium on major cultural festivals (Diwali, Pongal, Eid, etc.).",
        "multiplier": 1.20, # +20%
        "is_active": True,
        "condition_value": "festival",
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "rule-time-night",
        "factor_type": "time",
        "name": "Late Night Shift Premium (10 PM – 6 AM)",
        "description": "Fair compensation for unsocial late-night emergency repairs.",
        "multiplier": 1.25, # +25%
        "is_active": True,
        "condition_value": "22-6",
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "rule-day-weekend",
        "factor_type": "day",
        "name": "Weekend Saturday / Sunday Surge",
        "description": "Cooperative weekend peak availability adjustment.",
        "multiplier": 1.10, # +10%
        "is_active": True,
        "condition_value": "weekend",
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "rule-demand-peak",
        "factor_type": "demand",
        "name": "High Localized Demand Zone",
        "description": "Zone-based capacity equilibrium allowance.",
        "multiplier": 1.15, # +15%
        "is_active": True,
        "condition_value": "high",
        "created_at": "2026-01-15T10:00:00Z"
    },
    {
        "id": "rule-urgency-emergency",
        "factor_type": "urgency",
        "name": "Emergency 15-Minute Priority Dispatch",
        "description": "Instant mobilization priority incentive for workers.",
        "multiplier": 1.20, # +20%
        "is_active": True,
        "condition_value": "urgent",
        "created_at": "2026-01-15T10:00:00Z"
    }
]


# ==============================================================================
# 1. CORE DETERMINISTIC RULE EVALUATION ENGINE
# ==============================================================================

@router.post(
    "/calculate",
    response_model=PricingCalculateResponse,
    summary="Calculate cooperative rule-based pricing with complete value breakdown"
)
async def calculate_pricing(payload: PricingCalculateRequest):
    # 1. Resolve Base Rate
    key = payload.service_id.strip().lower()
    cat_info = COOPERATIVE_BASE_RATES.get(key)
    if not cat_info:
        # Fallback search by substring
        match = next((v for k, v in COOPERATIVE_BASE_RATES.items() if k in key or key in k), None)
        if match:
            cat_info = match
        else:
            cat_info = {"name": payload.service_id.capitalize(), "base_rate": 250.00, "floor": 200.00}

    base_price = payload.custom_base_rate if payload.custom_base_rate is not None else cat_info["base_rate"]
    service_name = cat_info["name"]

    # 2. Evaluate Applied Factors
    factors = payload.factors
    applied_factors: List[AppliedFactorItem] = []
    total_multiplier_delta = 0.0

    if factors:
        # Weather Factor
        weather_val = (factors.weather or "none").lower()
        if weather_val in ["rain", "storm", "heatwave"]:
            rule = next((r for r in PRICE_RULES_STORE if r["is_active"] and r["factor_type"] == "weather" and r["condition_value"] == weather_val), None)
            if rule:
                weight = rule["multiplier"] - 1.0
                surcharge_amt = round(base_price * weight, 2)
                applied_factors.append(AppliedFactorItem(
                    id=rule["id"],
                    factor_type=rule["factor_type"],
                    name=rule["name"],
                    description=rule["description"],
                    multiplier_weight=rule["multiplier"],
                    surcharge_amount=surcharge_amt
                ))
                total_multiplier_delta += weight

        # Festival Factor
        if factors.is_festival:
            rule = next((r for r in PRICE_RULES_STORE if r["is_active"] and r["factor_type"] == "festival"), None)
            if rule:
                weight = rule["multiplier"] - 1.0
                surcharge_amt = round(base_price * weight, 2)
                applied_factors.append(AppliedFactorItem(
                    id=rule["id"],
                    factor_type=rule["factor_type"],
                    name=rule["name"],
                    description=rule["description"],
                    multiplier_weight=rule["multiplier"],
                    surcharge_amount=surcharge_amt
                ))
                total_multiplier_delta += weight

        # Time Factor (e.g. Night hours 22:00 - 06:00)
        hour = factors.scheduled_hour
        if hour is None:
            # Check current local hour if not explicitly scheduled
            hour = datetime.now().hour
        
        if hour >= 22 or hour < 6:
            rule = next((r for r in PRICE_RULES_STORE if r["is_active"] and r["factor_type"] == "time" and r["condition_value"] == "22-6"), None)
            if rule:
                weight = rule["multiplier"] - 1.0
                surcharge_amt = round(base_price * weight, 2)
                applied_factors.append(AppliedFactorItem(
                    id=rule["id"],
                    factor_type=rule["factor_type"],
                    name=rule["name"],
                    description=rule["description"],
                    multiplier_weight=rule["multiplier"],
                    surcharge_amount=surcharge_amt
                ))
                total_multiplier_delta += weight

        # Day of Week Factor (e.g. Weekend)
        day = (factors.day_of_week or "").lower()
        if not day:
            day = datetime.now().strftime("%A").lower()
        
        if day in ["saturday", "sunday"]:
            rule = next((r for r in PRICE_RULES_STORE if r["is_active"] and r["factor_type"] == "day" and r["condition_value"] == "weekend"), None)
            if rule:
                weight = rule["multiplier"] - 1.0
                surcharge_amt = round(base_price * weight, 2)
                applied_factors.append(AppliedFactorItem(
                    id=rule["id"],
                    factor_type=rule["factor_type"],
                    name=rule["name"],
                    description=rule["description"],
                    multiplier_weight=rule["multiplier"],
                    surcharge_amount=surcharge_amt
                ))
                total_multiplier_delta += weight

        # Demand Factor
        demand = (factors.demand_level or "normal").lower()
        if demand in ["high", "peak"]:
            rule = next((r for r in PRICE_RULES_STORE if r["is_active"] and r["factor_type"] == "demand"), None)
            if rule:
                weight = rule["multiplier"] - 1.0
                surcharge_amt = round(base_price * weight, 2)
                applied_factors.append(AppliedFactorItem(
                    id=rule["id"],
                    factor_type=rule["factor_type"],
                    name=rule["name"],
                    description=rule["description"],
                    multiplier_weight=rule["multiplier"],
                    surcharge_amount=surcharge_amt
                ))
                total_multiplier_delta += weight

        # Urgency Factor
        if factors.is_urgent:
            rule = next((r for r in PRICE_RULES_STORE if r["is_active"] and r["factor_type"] == "urgency"), None)
            if rule:
                weight = rule["multiplier"] - 1.0
                surcharge_amt = round(base_price * weight, 2)
                applied_factors.append(AppliedFactorItem(
                    id=rule["id"],
                    factor_type=rule["factor_type"],
                    name=rule["name"],
                    description=rule["description"],
                    multiplier_weight=rule["multiplier"],
                    surcharge_amount=surcharge_amt
                ))
                total_multiplier_delta += weight

    # 3. Multiplier Cap Enforcement
    total_multiplier_raw = round(1.0 + total_multiplier_delta, 3)
    max_cap = PRICING_CONFIG["max_multiplier_cap"]
    
    multiplier_cap_enforced = total_multiplier_raw > max_cap
    total_multiplier_applied = min(total_multiplier_raw, max_cap)

    # 4. Surcharge & Floor Price Calculation
    calculated_price = round(base_price * total_multiplier_applied, 2)
    
    # Floor Rule: Price is NEVER below base price
    final_price = max(base_price, calculated_price)
    surcharge = round(final_price - base_price, 2)

    # 5. Cooperative Value Split
    w_percent = PRICING_CONFIG["worker_payout_percent"]
    c_percent = PRICING_CONFIG["cooperative_fee_percent"]
    wf_percent = PRICING_CONFIG["welfare_contribution_percent"]

    worker_earning = round(final_price * (w_percent / 100.0), 2)
    cooperative_fee = round(final_price * (c_percent / 100.0), 2)
    # Remaining goes cleanly to welfare pool to ensure 100% exact penny balance
    welfare_contribution = round(final_price - worker_earning - cooperative_fee, 2)

    return PricingCalculateResponse(
        service_name=service_name,
        service_id=payload.service_id,
        base_price=base_price,
        applied_factors=applied_factors,
        total_multiplier_raw=total_multiplier_raw,
        total_multiplier_applied=total_multiplier_applied,
        multiplier_cap=max_cap,
        multiplier_cap_enforced=multiplier_cap_enforced,
        surcharge=surcharge,
        worker_earning=worker_earning,
        worker_payout_percent=w_percent,
        cooperative_fee=cooperative_fee,
        cooperative_fee_percent=c_percent,
        welfare_contribution=welfare_contribution,
        welfare_contribution_percent=wf_percent,
        final_price=final_price,
        base_floor_guaranteed=True
    )


# ==============================================================================
# 2. ADMIN PRICING RULES MANAGEMENT ENDPOINTS
# ==============================================================================

@router.get(
    "/rules",
    response_model=List[PriceRuleResponse],
    summary="List all cooperative pricing rules"
)
async def list_pricing_rules():
    return [PriceRuleResponse(**r) for r in PRICE_RULES_STORE]


@router.post(
    "/rules",
    response_model=PriceRuleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new cooperative pricing rule"
)
async def create_pricing_rule(payload: PriceRuleCreateRequest, request: Request):
    new_rule = {
        "id": f"rule-{payload.factor_type}-{uuid.uuid4().hex[:4]}",
        "factor_type": payload.factor_type,
        "name": payload.name,
        "description": payload.description,
        "multiplier": payload.multiplier,
        "is_active": payload.is_active,
        "condition_value": payload.condition_value,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    PRICE_RULES_STORE.append(new_rule)

    # Security Audit Log
    client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
    audit_logger.log_event(
        event_type="PRICING_RULE_CREATED",
        actor_role="admin",
        action="CREATE_PRICING_RULE",
        target_resource_type="pricing_rule",
        target_resource_id=new_rule["id"],
        details={"name": payload.name, "factor_type": payload.factor_type, "multiplier": payload.multiplier},
        client_ip=client_ip
    )

    return PriceRuleResponse(**new_rule)


@router.put(
    "/rules/{rule_id}",
    response_model=PriceRuleResponse,
    summary="Update or toggle an existing pricing rule"
)
async def update_pricing_rule(rule_id: str, payload: PriceRuleUpdateRequest, request: Request):
    rule = next((r for r in PRICE_RULES_STORE if r["id"] == rule_id), None)
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Price rule {rule_id} not found")

    old_values = {k: rule[k] for k in ("name", "multiplier", "is_active") if k in rule}

    if payload.name is not None:
        rule["name"] = payload.name
    if payload.description is not None:
        rule["description"] = payload.description
    if payload.multiplier is not None:
        rule["multiplier"] = payload.multiplier
    if payload.is_active is not None:
        rule["is_active"] = payload.is_active
    if payload.condition_value is not None:
        rule["condition_value"] = payload.condition_value

    # Security Audit Log
    client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
    audit_logger.log_event(
        event_type="PRICING_RULE_UPDATED",
        actor_role="admin",
        action="UPDATE_PRICING_RULE",
        target_resource_type="pricing_rule",
        target_resource_id=rule_id,
        details={"before": old_values, "after": {"name": rule["name"], "multiplier": rule["multiplier"], "is_active": rule["is_active"]}},
        client_ip=client_ip
    )

    return PriceRuleResponse(**rule)


@router.delete(
    "/rules/{rule_id}",
    summary="Delete a pricing rule"
)
async def delete_pricing_rule(rule_id: str, request: Request):
    global PRICE_RULES_STORE
    rule = next((r for r in PRICE_RULES_STORE if r["id"] == rule_id), None)
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Price rule {rule_id} not found")

    # Security Audit Log
    client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
    audit_logger.log_event(
        event_type="PRICING_RULE_DELETED",
        actor_role="admin",
        action="DELETE_PRICING_RULE",
        target_resource_type="pricing_rule",
        target_resource_id=rule_id,
        details={"name": rule.get("name"), "factor_type": rule.get("factor_type"), "multiplier": rule.get("multiplier")},
        client_ip=client_ip
    )

    PRICE_RULES_STORE = [r for r in PRICE_RULES_STORE if r["id"] != rule_id]
    return {"message": f"Rule {rule_id} removed successfully"}


# ==============================================================================
# 3. GLOBAL PRICING CONFIGURATION ENDPOINTS
# ==============================================================================

@router.get(
    "/config",
    response_model=PricingConfigResponse,
    summary="Get global cooperative pricing configuration and caps"
)
async def get_pricing_config():
    return PricingConfigResponse(**PRICING_CONFIG)


@router.put(
    "/config",
    response_model=PricingConfigResponse,
    summary="Update global pricing caps and dividend allocations"
)
async def update_pricing_config(payload: PricingConfigUpdateRequest, request: Request):
    old_config = {k: PRICING_CONFIG[k] for k in PRICING_CONFIG}

    if payload.max_multiplier_cap is not None:
        PRICING_CONFIG["max_multiplier_cap"] = payload.max_multiplier_cap
    if payload.worker_payout_percent is not None:
        PRICING_CONFIG["worker_payout_percent"] = payload.worker_payout_percent
    if payload.cooperative_fee_percent is not None:
        PRICING_CONFIG["cooperative_fee_percent"] = payload.cooperative_fee_percent
    if payload.welfare_contribution_percent is not None:
        PRICING_CONFIG["welfare_contribution_percent"] = payload.welfare_contribution_percent

    # Security Audit Log
    client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
    audit_logger.log_event(
        event_type="PRICING_CONFIG_UPDATED",
        actor_role="admin",
        action="UPDATE_GLOBAL_PRICING_CONFIG",
        target_resource_type="pricing_config",
        target_resource_id="cfg-global",
        details={"before": old_config, "after": {k: PRICING_CONFIG[k] for k in PRICING_CONFIG}},
        client_ip=client_ip
    )

    # ─── Phase 11: Broadcast pricing change to all connected clients ──────────
    import asyncio
    from app.services.realtime import emit_pricing_changed
    asyncio.ensure_future(emit_pricing_changed(PRICING_CONFIG, rules_updated=False))

    return PricingConfigResponse(**PRICING_CONFIG)

