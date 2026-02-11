"""Pydantic models for forecast endpoints."""

from pydantic import BaseModel, ConfigDict, Field


class ForecastTriggerResponse(BaseModel):
    """Response from POST /api/v1/forecasts/trigger."""

    status: str
    message: str


class ForecastRunResponse(BaseModel):
    """Response from GET /api/v1/forecasts/runs/latest."""

    model_config = ConfigDict(populate_by_name=True)

    id: str
    started_at: str = Field(alias="startedAt")
    completed_at: str | None = Field(default=None, alias="completedAt")
    status: str
    method: str
    rows_processed: int = Field(alias="rowsProcessed")
    error_message: str | None = Field(default=None, alias="errorMessage")
