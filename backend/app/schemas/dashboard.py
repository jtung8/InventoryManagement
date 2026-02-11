"""Pydantic models for the dashboard summary endpoint."""

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.product import Product


class DashboardMetrics(BaseModel):
    """Metric card values shown at the top of the dashboard."""

    model_config = ConfigDict(populate_by_name=True)

    total_skus: int = Field(alias="totalSkus")
    at_risk_skus: int = Field(alias="atRiskSkus")
    reorder_cost: float = Field(alias="reorderCost")
    potential_revenue: float = Field(alias="potentialRevenue")


class DashboardSummaryResponse(BaseModel):
    """GET /api/v1/dashboard/summary response."""

    metrics: DashboardMetrics
    products: list[Product]
