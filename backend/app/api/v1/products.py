"""Products endpoints."""

from fastapi import APIRouter, HTTPException, Query

from app.schemas.product import Product
from app.services.seed_data import get_products, get_product_by_id

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[Product])
async def list_products(
    sort: str = Query("sku", description="Field to sort by (sku, name, category)"),
    limit: int = Query(50, ge=1, le=500, description="Max results to return"),
) -> list[Product]:
    """List all products with optional sort and limit.

    TODO: Replace with database query (Phase 1, Step 6).
    """
    raw = get_products()

    # Sort by requested field if it exists on the product dict
    if raw and sort in raw[0]:
        raw.sort(key=lambda p: p.get(sort, ""))

    raw = raw[:limit]

    return [
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
        for p in raw
    ]


@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str) -> Product:
    """Get a single product by ID or SKU.

    TODO: Replace with database query (Phase 1, Step 6).
    """
    p = get_product_by_id(product_id)
    if p is None:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found")

    return Product(
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
