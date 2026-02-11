"""Application configuration loaded from environment variables."""

import os


CORS_ORIGINS: list[str] = os.getenv(
    "CORS_ORIGINS", "http://localhost:3000"
).split(",")

API_V1_PREFIX: str = "/api/v1"

# TODO: Add DATABASE_URL when DB is connected (Phase 1, Step 6)
# DATABASE_URL: str = os.getenv("DATABASE_URL", "")
