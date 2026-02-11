"""FastAPI application entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import API_V1_PREFIX, CORS_ORIGINS
from app.api.v1.router import api_router
from app.api.v1.health import router as health_router

app = FastAPI(
    title="InventoryPilot API",
    description="Inventory management and forecasting API for local retailers",
    version="0.1.0",
)

# CORS - allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoints at root level (infrastructure concern, not versioned)
app.include_router(health_router)

# Versioned API routes
app.include_router(api_router, prefix=API_V1_PREFIX)
