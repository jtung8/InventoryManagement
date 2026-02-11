"""In-memory seed data for Phase 0 (no database).

The seed products mirror the frontend mockAtRiskProducts so the dashboard
renders identically whether data comes from the API or the client fallback.

TODO: Replace all functions in this module with database queries
      when DB is connected (Phase 1, Step 6).
"""

from __future__ import annotations

# Total SKUs in the fictional catalog (shown on the "Total SKUs" metric card).
# The at-risk table only shows the 6 products below.
SEED_TOTAL_SKUS = 847

# ---------------------------------------------------------------------------
# Temporary in-memory store for uploaded CSV data.
# Keyed by csv_type ("inventory_snapshot", "sales_history").
# Data is lost on server restart.
# TODO: Replace with database persistence (Phase 1, Step 6).
# ---------------------------------------------------------------------------
_uploaded_store: dict[str, list[dict]] = {}


def store_uploaded_rows(csv_type: str, rows: list[dict]) -> None:
    """Save validated rows in memory. Overwrites previous upload of same type."""
    _uploaded_store[csv_type] = rows


def get_uploaded_rows(csv_type: str) -> list[dict] | None:
    """Return uploaded rows for a csv_type, or None if nothing was uploaded."""
    rows = _uploaded_store.get(csv_type)
    return rows if rows else None


def _normalize_uploaded_row(row: dict, index: int) -> dict:
    """Convert a raw uploaded inventory_snapshot row dict into the product
    dict format that the rest of the codebase expects.

    Applies the same placeholder heuristics as the frontend for computed
    fields (days_until_stockout, lead_time_days, recommended_qty).
    """
    sku = (row.get("sku") or "").strip() or f"ROW-{index + 1}"
    name = (row.get("name") or "").strip() or sku
    category = (row.get("category") or "").strip() or "Uncategorized"

    try:
        available = int(row.get("available", 0))
    except (ValueError, TypeError):
        available = 0

    try:
        unit_cost = float(row.get("unit_cost", 0))
    except (ValueError, TypeError):
        unit_cost = 0.0

    # Placeholder heuristics (same as frontend transformUploadedData)
    days_until_stockout = 3 if available <= 5 else 7
    lead_time_days = 14
    recommended_qty = max(0, 50 - available)

    return {
        "id": sku,
        "sku": sku,
        "name": name,
        "category": category,
        "available": available,
        "days_until_stockout": days_until_stockout,
        "lead_time_days": lead_time_days,
        "recommended_qty": recommended_qty,
        "unit_cost": unit_cost,
    }

SEED_PRODUCTS: list[dict] = [
    {
        "id": "1",
        "sku": "TEE-BLK-M",
        "name": "Essential Cotton Tee - Black",
        "category": "Tops",
        "available": 12,
        "days_until_stockout": 3,
        "lead_time_days": 14,
        "recommended_qty": 150,
        "unit_cost": 8.50,
    },
    {
        "id": "2",
        "sku": "JNS-IND-32",
        "name": "Slim Fit Jeans - Indigo",
        "category": "Bottoms",
        "available": 8,
        "days_until_stockout": 2,
        "lead_time_days": 21,
        "recommended_qty": 75,
        "unit_cost": 24.00,
    },
    {
        "id": "3",
        "sku": "HDY-GRY-L",
        "name": "Oversized Hoodie - Heather Grey",
        "category": "Outerwear",
        "available": 5,
        "days_until_stockout": 4,
        "lead_time_days": 18,
        "recommended_qty": 100,
        "unit_cost": 18.75,
    },
    {
        "id": "4",
        "sku": "DRS-FLR-S",
        "name": "Floral Midi Dress",
        "category": "Dresses",
        "available": 3,
        "days_until_stockout": 1,
        "lead_time_days": 28,
        "recommended_qty": 60,
        "unit_cost": 32.00,
    },
    {
        "id": "5",
        "sku": "SNK-WHT-10",
        "name": "Canvas Sneakers - White",
        "category": "Footwear",
        "available": 18,
        "days_until_stockout": 5,
        "lead_time_days": 30,
        "recommended_qty": 80,
        "unit_cost": 28.50,
    },
    {
        "id": "6",
        "sku": "BAG-CAN-TN",
        "name": "Canvas Tote Bag - Tan",
        "category": "Accessories",
        "available": 25,
        "days_until_stockout": 6,
        "lead_time_days": 14,
        "recommended_qty": 120,
        "unit_cost": 12.00,
    },
]


def get_products() -> list[dict]:
    """Return products: uploaded inventory data if available, else seed data.

    TODO: Replace with database query (Phase 1, Step 6).
    """
    uploaded = get_uploaded_rows("inventory_snapshot")
    if uploaded is not None:
        return [_normalize_uploaded_row(row, i) for i, row in enumerate(uploaded)]
    return list(SEED_PRODUCTS)


def get_total_skus() -> int:
    """Return the total SKU count.

    Uses actual uploaded row count when uploaded data exists,
    otherwise returns the hardcoded seed catalog size.
    """
    uploaded = get_uploaded_rows("inventory_snapshot")
    if uploaded is not None:
        return len(uploaded)
    return SEED_TOTAL_SKUS


def get_product_by_id(product_id: str) -> dict | None:
    """Return a single product by id or sku, or None if not found.

    Searches uploaded data first, then seed data.
    TODO: Replace with database query (Phase 1, Step 6).
    """
    for p in get_products():
        if p["id"] == product_id or p["sku"] == product_id:
            return dict(p)
    return None


def get_seed_recommendations() -> list[dict]:
    """Generate recommendation objects from seed products.

    Uses the same placeholder heuristics as the frontend:
    - avg_weekly_demand and lead_time_demand are rough estimates
    - safety_stock = avg_weekly_demand * 1.5
    - reorder_point = lead_time_demand + safety_stock
    """
    # TODO: Replace with database query (Phase 1, Step 6)
    recs = []
    for p in SEED_PRODUCTS:
        available = p["available"]
        lead_time_days = p["lead_time_days"]
        recommended_qty = p["recommended_qty"]
        unit_cost = p["unit_cost"]
        days_until_stockout = p["days_until_stockout"]

        # Rough heuristic: pretend weekly demand ~ recommended_qty / 4
        avg_weekly_demand = round(recommended_qty / 4, 1)
        lead_time_demand = round(avg_weekly_demand * (lead_time_days / 7), 1)
        safety_stock = round(avg_weekly_demand * 1.5, 1)
        reorder_point = round(lead_time_demand + safety_stock, 1)

        recs.append({
            "id": f"rec-{p['id']}",
            "product_id": p["id"],
            "sku": p["sku"],
            "name": p["name"],
            "avg_weekly_demand": avg_weekly_demand,
            "lead_time_demand": lead_time_demand,
            "safety_stock": safety_stock,
            "reorder_point": reorder_point,
            "recommended_order_qty": recommended_qty,
            "days_left": days_until_stockout,
            "unit_cost": unit_cost,
            "explanation": {
                "summary": (
                    f"{p['name']} has {available} units on hand with "
                    f"~{days_until_stockout} days until stockout. "
                    f"Lead time is {lead_time_days} days."
                ),
                "method": "placeholder_heuristic",
            },
        })
    return recs
