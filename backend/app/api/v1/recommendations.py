"""Recommendations endpoints."""

from fastapi import APIRouter, HTTPException, Query

from app.schemas.recommendation import Recommendation
from app.services.seed_data import get_seed_recommendations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


def _to_model(r: dict) -> Recommendation:
    return Recommendation(
        id=r["id"],
        product_id=r["product_id"],
        sku=r["sku"],
        name=r["name"],
        avg_weekly_demand=r["avg_weekly_demand"],
        lead_time_demand=r["lead_time_demand"],
        safety_stock=r["safety_stock"],
        reorder_point=r["reorder_point"],
        recommended_order_qty=r["recommended_order_qty"],
        days_left=r["days_left"],
        unit_cost=r["unit_cost"],
        explanation=r["explanation"],
    )


@router.get("", response_model=list[Recommendation])
async def list_recommendations(
    at_risk: bool | None = Query(
        None, description="If true, only return products with days_left <= 5"
    ),
    limit: int = Query(50, ge=1, le=500, description="Max results to return"),
) -> list[Recommendation]:
    """List reorder recommendations.

    TODO: Replace with database query (Phase 1, Step 6).
    """
    raw = get_seed_recommendations()

    if at_risk is True:
        raw = [r for r in raw if r["days_left"] <= 5]

    raw = raw[:limit]
    return [_to_model(r) for r in raw]


@router.get("/{product_id}", response_model=Recommendation)
async def get_recommendation(product_id: str) -> Recommendation:
    """Get recommendation for a single product by product ID or SKU.

    TODO: Replace with database query (Phase 1, Step 6).
    """
    recs = get_seed_recommendations()
    for r in recs:
        if r["product_id"] == product_id or r["sku"] == product_id:
            return _to_model(r)

    raise HTTPException(
        status_code=404,
        detail=f"Recommendation for product '{product_id}' not found",
    )
