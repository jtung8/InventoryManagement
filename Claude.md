# InventoryPilot - Project Reference

> **Purpose**: This file serves as the single source of truth for Claude Code when working on this project. It contains architecture decisions, coding standards, and workflow guidelines.

---

## Claude Code Guidelines

### Working Style

1. **One file at a time**: Complete work on a single file before moving to the next. This keeps changes atomic and easier to review.

2. **Plan before coding**: When asked to implement a feature, first explain:
   - What files will be created/modified
   - Why each change is needed
   - The order of operations
   - Any dependencies or prerequisites

3. **Explain as you go**: Since the user is new to coding, provide clear explanations of:
   - What each code block does
   - Why certain patterns are used
   - How pieces connect together

4. **Small, testable increments**: Break large features into smaller pieces that can be tested independently.

5. **Follow the Build Order**: Always check Section 3 (Build Order) before starting work. Don't skip ahead.

6. **Reference this file**: Before making architectural decisions, check this document for established patterns and conventions.

### Code Quality Standards

```
DO:
- Use TypeScript strict mode (frontend)
- Use Python type hints (backend)
- Write descriptive variable/function names
- Add comments for complex logic
- Follow existing patterns in the codebase

DON'T:
- Create files without explaining their purpose
- Make multiple unrelated changes at once
- Skip error handling
- Use any/unknown types without justification
- Add features not in the current tier
```

---

## 1. Scope Guardrails

**These are explicitly OUT OF SCOPE for MVP:**

| Excluded | Reason |
|----------|--------|
| User authentication | Adds complexity, not needed for demo |
| Multi-tenant support | Single-user MVP is fine |
| Advanced ML forecasting | Simple moving average is sufficient |
| CSV AI column mapping | Deferred to post-MVP |
| Database migrations in production | Seed data is fine for demo |
| Purchase order generation | Nice-to-have, not core |

**AI Chat Constraints:**
- AI chat is a **query router + formatter only**
- It classifies user intent into 3-4 fixed categories
- It calls existing API endpoints (never queries DB directly)
- No "agent brain" or free-form database access

**If you're tempted to add something not listed in the current tier, don't.**

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│  FRONTEND: Next.js 16 (App Router, TypeScript)                  │
│  - Landing page, Dashboard, AI Chat Assistant                   │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼────────────────────────────────────┐
│  BACKEND: FastAPI (Python 3.11+)                                │
│  - REST endpoints, Forecasting, AI chat, Prometheus metrics     │
└────────────────────────────┬────────────────────────────────────┘
                             │ SQLAlchemy
┌────────────────────────────▼────────────────────────────────────┐
│  DATABASE                                                       │
│  - Local: PostgreSQL via Docker Compose                         │
│  - EKS: AWS RDS PostgreSQL                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  OBSERVABILITY: Prometheus + Grafana (kube-prometheus-stack)    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE: Docker → GitHub Actions → ECR → Argo CD → EKS  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Build Order

**Follow this sequence. Always have something demoable before moving to the next step.**

```
Step 1: UI Flows + Mock Data
    └── Landing page, Dashboard, Imports page (all with mock/static data)
    └── Demo: "Here's what the product looks like"

Step 2: Minimal FastAPI Backend
    └── /healthz, /readyz, /api/v1/dashboard/summary, /api/v1/recommendations
    └── Hard-coded/seed data is fine
    └── Demo: "Frontend talks to real API"

Step 3: Docker Compose Local
    └── frontend + backend + postgres containers
    └── Demo: "Runs anywhere with docker-compose up"

Step 4: GitHub Actions CI
    └── Lint, type-check, build for both frontend and backend
    └── Demo: "Every push is validated"

Step 5: ECR + EKS Deploy
    └── Push images to ECR, deploy to EKS
    └── GitHub Actions uses OIDC → AWS IAM role (no long-lived keys)
    └── Demo: "App runs on Kubernetes"

Step 6: Argo CD GitOps
    └── Argo CD syncs from kubernetes/ directory
    └── GitHub Actions updates image tags in kubernetes/overlays/staging/
    └── Demo: "Git push triggers automatic deployment"

Step 7: Prometheus + Grafana
    └── Install kube-prometheus-stack via Helm
    └── Backend /metrics endpoint
    └── Demo: "Here's my observability dashboard"

Step 8: AI Chat
    └── Chat widget + /api/v1/ai/chat endpoint
    └── 3-4 fixed intents only
    └── Demo: "Ask questions in natural language"
```

---

## 4. Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16, TypeScript, Tailwind, Shadcn/ui | User interface |
| Backend | FastAPI, Python 3.11+, Pydantic v2 | API & business logic |
| Database (Local) | PostgreSQL 15 via Docker | Local development |
| Database (EKS) | AWS RDS PostgreSQL | Production data |
| AI | Claude API (Anthropic SDK) | Chat assistant (fixed intents) |
| Observability | Prometheus, Grafana (kube-prometheus-stack) | Metrics & dashboards |
| Containers | Docker, Docker Compose | Local dev & packaging |
| CI | GitHub Actions | Build, test, lint |
| CD/GitOps | Argo CD | Automated deployments |
| Cloud | AWS EKS, ECR, RDS | Production infrastructure |

---

## 5. Core Features (Tiered)

### Tier 1 — Product MVP (ship first)

| Feature | Description | Done When |
|---------|-------------|-----------|
| Landing Page | Hero, features, CTA sections | Looks polished, responsive |
| Dashboard | Metrics cards, at-risk table, charts | Shows mock data, filter/search works |
| Imports Page | CSV template download + file preview | Can upload CSV and see preview table |
| Basic API | `/healthz`, `/readyz`, `/api/v1/dashboard/summary`, `/api/v1/recommendations` | Frontend displays real API data |
| Docker Compose | frontend + backend + postgres | `docker-compose up` works |
| GitHub Actions CI | Lint + build for frontend and backend | Green checks on every PR |

### Tier 2 — DevOps MVP (ship second)

| Feature | Description | Done When |
|---------|-------------|-----------|
| ECR Push | Frontend + backend images to ECR | Images tagged with commit SHA |
| EKS Deploy | Deployments + Services running | App accessible via LoadBalancer/Ingress |
| Argo CD Sync | GitOps from kubernetes/ directory | Changing manifests triggers redeploy |
| RDS PostgreSQL | Production database | Backend connects to RDS on EKS |
| Prometheus + Grafana | kube-prometheus-stack Helm chart | Dashboard shows request rate, error rate, p95 latency |
| /metrics Endpoint | Prometheus scraping backend | Metrics visible in Grafana |

### Tier 3 — AI MVP (ship last)

| Feature | Description | Done When |
|---------|-------------|-----------|
| Chat Widget | Floating UI component | Opens/closes, shows messages |
| /api/v1/ai/chat | Intent classification + response | Returns formatted answers |
| Fixed Intents | 3-4 supported query types | All intents work correctly |

---

## 6. API Design

### Base URL
```
/api/v1/...
```

### Health & Metrics (Tier 1)
```
GET  /healthz              → { "status": "healthy" }
GET  /readyz               → { "status": "ready", "database": "connected" }
GET  /metrics              → Prometheus format (Tier 2)
```

### Dashboard (Tier 1)
```
GET  /api/v1/dashboard/summary    → Dashboard metrics + at-risk products list
```

### Recommendations (Tier 1)
```
GET  /api/v1/recommendations              → List all recommendations
GET  /api/v1/recommendations/{product_id} → Single recommendation detail
```

### Products (Tier 1, minimal)
```
GET  /api/v1/products                     → List products (with ?sort=, ?limit=)
GET  /api/v1/products/{id}                → Single product
```

### Imports (Tier 1, simplified)
```
GET  /api/v1/templates/{type}             → Download CSV template (products|inventory|sales)
POST /api/v1/imports/upload               → Upload CSV, returns preview (no AI mapping)
```

### AI Chat (Tier 3)
```
POST /api/v1/ai/chat                      → { "message": "..." } → { "response": "..." }
```

**Endpoints NOT in MVP:**
- ~~POST /api/v1/imports/map-columns~~ (AI mapping deferred)
- ~~POST /api/v1/imports/process~~ (full import pipeline deferred)
- ~~POST/PUT/DELETE for products~~ (read-only MVP)

---

## 7. Data Models

### Database Tables

```sql
products
├── id (UUID, PK)
├── sku (VARCHAR, UNIQUE)
├── name (VARCHAR)
├── category (VARCHAR)
├── lead_time_days (INTEGER)
├── unit_cost (DECIMAL)
└── created_at (TIMESTAMP)

inventory_levels
├── id (UUID, PK)
├── product_id (UUID, FK)
├── on_hand (INTEGER)
├── allocated (INTEGER)
├── available (GENERATED)
└── last_updated (TIMESTAMP)

sales_history
├── id (UUID, PK)
├── product_id (UUID, FK)
├── sale_date (DATE)
├── quantity_sold (INTEGER)
└── created_at (TIMESTAMP)

recommendations
├── id (UUID, PK)
├── product_id (UUID, FK)
├── avg_weekly_demand (DECIMAL)
├── lead_time_demand (DECIMAL)
├── safety_stock (DECIMAL)
├── reorder_point (DECIMAL)
├── recommended_order_qty (INTEGER)
├── days_left (DECIMAL)
├── explanation (JSONB)
└── created_at (TIMESTAMP)
```

### Key Indexes
```sql
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_sales_product_date ON sales_history(product_id, sale_date);
CREATE INDEX idx_inventory_product ON inventory_levels(product_id);
```

---

## 8. DevOps Pipeline

### CI Flow (GitHub Actions)
```
Push to any branch
    ├── Lint (ESLint + Ruff)
    ├── Type Check (tsc + mypy)
    └── Build Docker Images

Push to main
    ├── Build & Push to ECR (tagged with commit SHA)
    └── Update image tags in kubernetes/overlays/staging/
```

**Key Decision:** CI uses **GitHub OIDC → AWS IAM role** to push to ECR (no long-lived AWS keys).

### CD Flow (Argo CD)
```
Image tag updated in kubernetes/overlays/staging/
    │
    └── Argo CD detects change → Syncs to EKS cluster
```

### Kubernetes Resources (EKS)
```
Deployments:
├── frontend (Next.js)
└── backend (FastAPI)

Services:
├── frontend (LoadBalancer or Ingress)
└── backend (ClusterIP)

Other:
├── ConfigMaps (env vars)
├── Secrets (credentials, RDS connection string)
└── Ingress (routing)

NOT in EKS:
└── Postgres (using RDS instead)
```

### Database Strategy
| Environment | Database |
|-------------|----------|
| Local dev | PostgreSQL via docker-compose |
| EKS staging | AWS RDS PostgreSQL |

---

## 9. Observability

### Done =

- [ ] Prometheus is scraping backend `/metrics`
- [ ] Grafana dashboard shows:
  - Request rate (requests/sec)
  - Error rate (5xx responses)
  - p95 latency
- [ ] At least one alert rule exists (e.g., error rate > 5% for 5 minutes)

### Implementation
```
kube-prometheus-stack (Helm chart)
├── Prometheus (scrapes /metrics)
├── Grafana (dashboards)
└── Alertmanager (alerts)
```

---

## 10. AI Chat Specification

### Architecture (Router Pattern)
```
User Message
    │
    ▼
Intent Classification (Claude API)
    │
    ├── "running_low"     → GET /api/v1/recommendations?at_risk=true
    ├── "why_at_risk"     → GET /api/v1/recommendations/{product_id}
    ├── "what_to_order"   → GET /api/v1/recommendations?limit=10
    └── "top_sellers"     → GET /api/v1/products?sort=sales_velocity&limit=5
    │
    ▼
Format Response (Claude API)
    │
    ▼
Return to User
```

### Supported Intents (MVP)

| User Says | Intent | API Call |
|-----------|--------|----------|
| "What products are running low?" | running_low | GET /recommendations?at_risk=true |
| "Why is SKU-1234 at risk?" | why_at_risk | GET /recommendations/{id} |
| "What should I order this week?" | what_to_order | GET /recommendations?limit=10 |
| "Show me top sellers" | top_sellers | GET /products?sort=sales_velocity&limit=5 |

### Hard Rules
- AI **never** queries database directly
- AI **only** calls existing API endpoints
- AI **only** supports the 4 intents above
- Unsupported queries get a polite "I can help with X, Y, Z" response

---

## 11. Directory Structure

```
InventoryManagement/
├── frontend/web/                 # Next.js application
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   │   ├── page.tsx          # Landing page (/)
│   │   │   ├── (marketing)/      # Marketing routes
│   │   │   └── (dashboard)/      # Authenticated routes
│   │   ├── components/           # React components
│   │   │   ├── landing/          # Landing page components
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   └── ai/               # AI chat components (Tier 3)
│   │   └── lib/                  # Utilities & API client
│   ├── Dockerfile
│   └── package.json
│
├── backend/                      # FastAPI application
│   ├── app/
│   │   ├── main.py               # App entrypoint
│   │   ├── config.py             # Environment config
│   │   ├── api/v1/               # Versioned API routes
│   │   ├── models/               # SQLAlchemy models
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── services/             # Business logic
│   │   └── database/             # DB connection & session
│   ├── alembic/                  # Database migrations
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── kubernetes/                   # K8s manifests for Argo CD
│   ├── base/                     # Base manifests
│   └── overlays/                 # Environment-specific
│       └── staging/              # Staging overrides
│
├── observability/                # Local observability config
│   ├── prometheus/prometheus.yml
│   └── grafana/dashboards/
│
├── .github/workflows/            # CI/CD pipelines
│   ├── ci.yml                    # Lint, test, build
│   └── build-push.yml            # Build & push to ECR
│
├── docker-compose.yml            # Local development
├── Makefile                      # Dev commands
└── README.md
```

---

## 12. Design System

### Colors
```
Primary:    #3B82F6 (Blue - CTAs, links)
Secondary:  #06B6D4 (Cyan - accents)
Background: #0A1628 (Dark navy)
Cards:      #1E293B (Slate)
Success:    #10B981 (Green)
Warning:    #F59E0B (Amber)
Error:      #EF4444 (Red)
Text:       #F8FAFC (Light)
Muted:      #94A3B8 (Gray)
```

### Component Patterns
```
- Rounded corners: 8-12px
- Card padding: p-6
- Shadows: shadow-lg on cards
- Borders: Minimal, use #334155 when needed
```

---

## 13. Development Commands

```bash
# Local development
make dev              # Start all services (docker-compose up)
make dev-frontend     # Start only frontend
make dev-backend      # Start only backend

# Testing
make test             # Run all tests
make lint             # Run all linters

# Database
make db-seed          # Seed with sample data

# Docker
make build            # Build all images
make push             # Push to ECR
```

---

## 14. Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/inventorypilot
ANTHROPIC_API_KEY=sk-ant-...
CORS_ORIGINS=http://localhost:3000
```

---

## 15. Quick Reference

### Forecasting Formula
```
avg_weekly_demand = sum(last_4_weeks_sales) / 4
lead_time_demand = avg_weekly_demand * (lead_time_days / 7)
safety_stock = avg_weekly_demand * safety_factor (1.5)
reorder_point = lead_time_demand + safety_stock
recommended_qty = reorder_point - current_stock (if positive)
days_left = current_stock / (avg_weekly_demand / 7)
```

### Health Check Responses
```json
// GET /healthz
{ "status": "healthy" }

// GET /readyz
{ "status": "ready", "database": "connected" }
```

---

## 16. File Creation Checklist

When creating a new file, Claude Code should:

- [ ] Check which Tier this feature belongs to
- [ ] Verify prerequisites from earlier tiers are complete
- [ ] Explain what the file does and why it's needed
- [ ] Show where it fits in the directory structure
- [ ] Include all necessary imports
- [ ] Add appropriate type hints/annotations
- [ ] Include error handling where appropriate
- [ ] Follow existing patterns from similar files
- [ ] Note any related files that may need updates
