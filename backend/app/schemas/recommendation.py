"""Pydantic model for Recommendation."""

from pydantic import BaseModel, ConfigDict, Field


class Recommendation(BaseModel):
    """A reorder recommendation for a single product."""

    model_config = ConfigDict(populate_by_name=True)

    id: str
    product_id: str = Field(alias="productId")
    sku: str
    name: str
    avg_weekly_demand: float = Field(alias="avgWeeklyDemand")
    lead_time_demand: float = Field(alias="leadTimeDemand")
    safety_stock: float = Field(alias="safetyStock")
    reorder_point: float = Field(alias="reorderPoint")
    recommended_order_qty: int = Field(alias="recommendedOrderQty")
    days_left: float = Field(alias="daysLeft")
    unit_cost: float = Field(alias="unitCost")
    explanation: dict[str, str]
