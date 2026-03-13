**ForeStock.ai**

Demand forecasting and reorder planning for small retailers.

---

## What is ForeStock.ai?

ForeStock.ai helps small retailers avoid stockouts before they happen.

Upload your inventory CSV and instantly see which products are at risk, when you need to reorder (lead-time aware), and what it will cost — so you know **what to order, when, and at what price** before you run out.

**Target users:** Boutiques, streetwear brands, and small multi-SKU shops with supplier lead times and limited cash.

---

## Features

- **At-risk detection** — Identifies products that will stock out based on current velocity and lead times
- **Reorder recommendations** — Lead-time-aware quantities with safety stock calculations
- **Cash impact visibility** — See the dollar cost of reorder recommendations before committing
- **CSV import with validation** — Upload inventory snapshots or sales history; get instant feedback on accepted/rejected rows with clear error messages
- **Export reorder plan** — Download a CSV with SKU, recommended quantity, unit cost, and reorder cost
- **Dashboard** — Metrics cards, at-risk product table, search, and filtering
- **Drag-and-drop uploads** — Drop CSV files directly onto the import page

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      User Browser                        │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼─────────────────────────────────┐
│  Frontend — Next.js 16 (App Router, TypeScript, Tailwind)│
│  Port 3000                                               │
└────────────────────────┬─────────────────────────────────┘
                         │ REST API
┌────────────────────────▼─────────────────────────────────┐
│  Backend — FastAPI (Python 3.12, Pydantic v2)            │
│  Port 8000                                               │
└────────────────────────┬─────────────────────────────────┘
                         │ SQLAlchemy
┌────────────────────────▼─────────────────────────────────┐
│  Database — PostgreSQL 15                                │
│  Port 5432                                               │
└──────────────────────────────────────────────────────────┘
```

All three services run via Docker Compose for local development.

---

## Tech Stack


| Layer      | Technology                                               |
| ---------- | -------------------------------------------------------- |
| Frontend   | Next.js 16, React 19, TypeScript 5, Tailwind CSS v4      |
| Backend    | FastAPI, Python 3.12, Pydantic v2, Uvicorn               |
| Database   | PostgreSQL 15                                            |
| Containers | Docker (multi-stage builds), Docker Compose              |
| CI/CD      | GitHub Actions (ESLint, Ruff, TypeScript, Docker builds) |
| Linting    | ESLint (frontend), Ruff (backend)                        |


---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- (Optional) Node.js 20+ and Python 3.12+ for local development without Docker

### Run with Docker Compose

```bash
git clone https://github.com/jtung8/InventoryManagement.git
cd InventoryManagement
docker compose up --build
```


| Service            | URL                                                      |
| ------------------ | -------------------------------------------------------- |
| Frontend           | [http://localhost:3000](http://localhost:3000)           |
| Backend API        | [http://localhost:8000](http://localhost:8000)           |
| API Docs (Swagger) | [http://localhost:8000/docs](http://localhost:8000/docs) |


### Run without Docker

**Frontend:**

```bash
cd frontend/web
npm install
npm run dev
```

**Backend:**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Makefile Commands

```bash
make dev              # Start all services
make dev-frontend     # Frontend + dependencies only
make dev-backend      # Backend + PostgreSQL only
make build            # Build images without starting
make stop             # Stop all containers
make clean            # Stop + delete database volume
make logs             # Tail logs from all services
```

---

## API Endpoints

```
GET  /healthz                          → Health check
GET  /readyz                           → Readiness check (database connection)

GET  /api/v1/dashboard/summary         → Dashboard metrics + at-risk products
GET  /api/v1/products                  → List products
GET  /api/v1/products/{id}             → Single product
GET  /api/v1/recommendations           → Reorder recommendations
GET  /api/v1/recommendations/{id}      → Single recommendation detail
GET  /api/v1/forecasts                 → Demand forecasts
POST /api/v1/imports/upload            → Upload and validate CSV
```

---

## CI/CD

Every pull request and push to `main` triggers a [GitHub Actions workflow](.github/workflows/ci.yml) with three parallel jobs:


| Job          | What it checks                                                           |
| ------------ | ------------------------------------------------------------------------ |
| **Frontend** | ESLint, TypeScript type-check (`tsc --noEmit`), Next.js production build |
| **Backend**  | Ruff lint, Ruff format verification                                      |
| **Docker**   | Builds both Docker images (runs after frontend + backend pass)           |


---

## Project Structure

```
InventoryManagement/
├── frontend/web/              # Next.js application
│   ├── src/app/               # App Router pages (landing, dashboard, imports)
│   ├── src/components/        # React components
│   ├── src/lib/               # API client, types, utilities
│   ├── public/                # Static assets + CSV templates
│   └── Dockerfile             # 3-stage build (deps → build → runtime)
│
├── backend/                   # FastAPI application
│   ├── app/api/v1/            # Versioned API routes
│   ├── app/schemas/           # Pydantic request/response models
│   ├── app/services/          # Business logic (CSV validation, forecasting)
│   └── Dockerfile             # 2-stage build (builder → runtime)
│
├── .github/workflows/         # CI/CD pipeline
│   └── ci.yml                 # Unified lint + build + Docker validation
│
├── docker-compose.yml         # Local development (3 services)
└── Makefile                   # Dev commands
```

---

## Roadmap

- Landing page with product overview
- Dashboard with at-risk detection and search/filter
- CSV import with validation and drag-and-drop
- FastAPI backend with all REST endpoints
- Docker Compose local environment
- GitHub Actions CI/CD pipeline
- AWS deployment (ECS Fargate + ALB)
- RDS PostgreSQL (production database)
- Async forecasting pipeline (SQS + EventBridge)
- AI chat assistant (intent-based query routing)
- CloudWatch observability (logs, alarms)

---

## License

This project is not currently licensed for redistribution.