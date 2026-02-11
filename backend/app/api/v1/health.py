"""Health and readiness check endpoints."""

from fastapi import APIRouter

from app.schemas.health import HealthResponse, ReadyResponse

router = APIRouter(tags=["health"])


@router.get("/healthz", response_model=HealthResponse)
async def healthz() -> HealthResponse:
    """Liveness probe - is the process running?"""
    return HealthResponse(status="healthy")


@router.get("/readyz", response_model=ReadyResponse)
async def readyz() -> ReadyResponse:
    """Readiness probe - can the app serve traffic?"""
    # TODO: Check DB connection when database is connected (Phase 1, Step 6)
    return ReadyResponse(status="ready", database="not_connected")
