# ---- Stage 1: Install dependencies ----
FROM python:3.12-slim AS builder

WORKDIR /build

COPY requirements.txt .

RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# ---- Stage 2: Production runtime ----
FROM python:3.12-slim

# Create non-root user for security
RUN groupadd --gid 1001 appuser && \
    useradd --uid 1001 --gid appuser --shell /bin/bash --create-home appuser

WORKDIR /app

# Copy only the virtual environment from builder (not the build tools)
COPY --from=builder /opt/venv /opt/venv

# Copy application source code
COPY app/ ./app/

# Put venv on PATH so "uvicorn" is found without full path
ENV PATH="/opt/venv/bin:$PATH"

# Print logs immediately (don't buffer stdout/stderr)
ENV PYTHONUNBUFFERED=1

# Switch to non-root user
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
