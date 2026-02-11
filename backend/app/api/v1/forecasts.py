"""Forecast endpoints (stubs for Phase 0).

These endpoints return hardcoded responses so the frontend can wire to them
before SQS/EventBridge infrastructure exists.

TODO: Connect POST /trigger to SQS queue (Phase 1, Step 7).
TODO: Read GET /runs/latest from forecast_runs DB table (Phase 1, Step 7).
"""

from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.schemas.forecast import ForecastRunResponse, ForecastTriggerResponse

router = APIRouter(prefix="/forecasts", tags=["forecasts"])


@router.post("/trigger", response_model=ForecastTriggerResponse, status_code=202)
async def trigger_forecast() -> ForecastTriggerResponse:
    """Enqueue a forecast job.

    Stub: returns accepted but does not actually enqueue anything.
    TODO: Connect to SQS queue (Phase 1, Step 7).
    """
    return ForecastTriggerResponse(
        status="accepted",
        message="Forecast job queued (stub - SQS not connected)",
    )


@router.get("/runs/latest", response_model=ForecastRunResponse)
async def latest_forecast_run() -> ForecastRunResponse:
    """Return the most recent forecast run status.

    Stub: returns a hardcoded successful run so the dashboard can
    display "Last forecast: Success at ..." before real runs exist.
    TODO: Read from forecast_runs DB table (Phase 1, Step 7).
    """
    # Use a fixed timestamp so the response is deterministic in tests
    stub_time = "2026-02-05T03:00:00Z"

    return ForecastRunResponse(
        id="stub-run-001",
        started_at=stub_time,
        completed_at=stub_time,
        status="success",
        method="moving_average",
        rows_processed=847,
        error_message=None,
    )
