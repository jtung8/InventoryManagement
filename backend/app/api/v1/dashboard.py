"""Dashboard endpoints."""

from fastapi import APIRouter

from app.schemas.dashboard import DashboardMetrics, DashboardSummaryResponse
from app.schemas.product import Product
from app.services.seed_data import get_products, get_total_skus

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
async def dashboard_summary() -> DashboardSummaryResponse:
    """Return dashboard metrics and at-risk products list.

    TODO: Replace seed data with database queries (Phase 1, Step 6).
    """
    raw_products = get_products()

    products = [
        Product(
            id=p["id"],
            sku=p["sku"],
            name=p["name"],
            category=p["category"],
            available=p["available"],
            days_until_stockout=p["days_until_stockout"],
            lead_time_days=p["lead_time_days"],
            recommended_qty=p["recommended_qty"],
            unit_cost=p["unit_cost"],
        )
        for p in raw_products
    ]

    # Same formulas the frontend uses for its metric cards
    reorder_cost = sum(p.recommended_qty * p.unit_cost for p in products)
    potential_revenue = reorder_cost * 2.5  # ~2.5x markup for retail

    metrics = DashboardMetrics(
        total_skus=get_total_skus(),
        at_risk_skus=len(products),
        reorder_cost=reorder_cost,
        potential_revenue=potential_revenue,
    )

    return DashboardSummaryResponse(metrics=metrics, products=products)
