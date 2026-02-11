"""Pydantic model for Product - used across dashboard, products, and recommendations."""

from pydantic import BaseModel, ConfigDict, Field


class Product(BaseModel):
    """A product with inventory status and reorder info.

    Uses explicit Field aliases for multi-word keys so JSON output uses
    camelCase (matching the frontend), while Python code uses snake_case.
    """

    model_config = ConfigDict(populate_by_name=True)

    id: str
    sku: str
    name: str
    category: str
    available: int
    days_until_stockout: int = Field(alias="daysUntilStockout")
    lead_time_days: int = Field(alias="leadTimeDays")
    recommended_qty: int = Field(alias="recommendedQty")
    unit_cost: float = Field(alias="unitCost")
