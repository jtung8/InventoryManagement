.PHONY: dev dev-frontend dev-backend build stop clean logs

# Start all services (frontend + backend + postgres)
dev:
	docker compose up --build

# Start frontend (also starts backend + postgres due to depends_on)
dev-frontend:
	docker compose up --build frontend

# Start backend + postgres only (no frontend)
dev-backend:
	docker compose up --build backend postgres

# Build all images without starting containers
build:
	docker compose build

# Stop all running containers
stop:
	docker compose down

# Stop all containers AND delete postgres data volume
clean:
	docker compose down -v

# Tail logs from all services
logs:
	docker compose logs -f
