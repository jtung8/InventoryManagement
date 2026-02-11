"""Central v1 API router. Sub-routers are included here."""

from fastapi import APIRouter

from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.products import router as products_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.forecasts import router as forecasts_router
from app.api.v1.imports import router as imports_router

api_router = APIRouter()

api_router.include_router(dashboard_router)
api_router.include_router(products_router)
api_router.include_router(recommendations_router)
api_router.include_router(forecasts_router)
api_router.include_router(imports_router)
