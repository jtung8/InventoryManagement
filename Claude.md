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
- Add features not in the current phase
```

---

## 1. Scope Guardrails

### January MVP (IN SCOPE)

| Feature | Reason |
|---------|--------|
| ECS Fargate deployment | Fast to deploy, cost-effective, containerization talking point |
| SQS + EventBridge async pipeline | DevOps "systems" differentiator |
| Simple forecasting (moving average) | Pipeline matters more than algorithm |
| AI chat with router pattern | Makes it an "AI SaaS" |
| CloudWatch observability | Lean, sufficient for portfolio |
| GitHub Actions CI/CD | Industry standard |

### January MVP (OUT OF SCOPE)

| Excluded | Reason |
|----------|--------|
| EKS + Argo CD | Deferred to February (platform maturity phase) |
| LightGBM/XGBoost | Use moving average; upgrade later |
| Prometheus + Grafana | CloudWatch is sufficient |
| User authentication | Adds complexity, not needed for demo |
| Multi-tenant support | Single-user MVP is fine |
| CSV AI column mapping | Deferred to post-MVP |
| Purchase order generation | Nice-to-have, not core |

### February Upgrades (DEFERRED)

| Feature | Notes |
|---------|-------|
| ECS → EKS migration | Platform maturity talking point |
| Argo CD GitOps | "Git push triggers deploy" demo |
| LightGBM/XGBoost | ML model upgrade |
| Prometheus + Grafana | Optional, only if needed |

**AI Chat Constraints:**
- AI chat is a **query router + formatter only**
- It classifies user intent into 3-4 fixed categories
- It calls existing API endpoints (never queries DB directly)
- No "agent brain" or free-form database access

**If you're tempted to add something not listed in the current phase, don't.**

---

## 2. System Architecture

### January Architecture (ECS-first)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│  FRONTEND: Next.js 16 (App Router, TypeScript)                  │
│  - Landing page, Dashboard, AI Chat Assistant                   │
│  - Hosted on: ECS Fargate (behind ALB)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼────────────────────────────────────┐
│  BACKEND: FastAPI (Python 3.11+)                                │
│  - REST endpoints, Forecasting, AI chat                         │
│  - Hosted on: ECS Fargate (behind ALB)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ SQLAlchemy
┌────────────────────────────▼────────────────────────────────────┐
│  DATABASE: AWS RDS PostgreSQL                                   │
│  - Local: PostgreSQL via Docker Compose                         │
│  - Production: AWS RDS PostgreSQL                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ASYNC PIPELINE (Forecasting)                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │ EventBridge │ -> │    SQS      │ -> │   Worker    │          │
│  │ (daily)     │    │ (+ DLQ)     │    │ (ECS Task)  │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│  - Triggers forecast jobs on schedule                           │
│  - Worker runs moving average, writes to DB                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  OBSERVABILITY: CloudWatch Logs + Metrics + Alarms              │
│  - ALB 5xx errors, ECS task restarts, SQS queue age             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CI/CD: GitHub Actions → ECR → ECS                              │
│  - PR: lint/test/build                                          │
│  - main: build → push ECR → deploy ECS                          │
│  - Uses OIDC → AWS IAM role (no long-lived keys)                │
└─────────────────────────────────────────────────────────────────┘
```

### February Architecture (EKS + GitOps)

```
┌─────────────────────────────────────────────────────────────────┐
│  UPGRADE: ECS → EKS + Argo CD                                   │
│  - Argo CD syncs from kubernetes/ directory                     │
│  - GitHub Actions updates image tags                            │
│  - "Git push triggers automatic deployment"                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Build Order (January)

**Target: End of January = Live app on AWS + async forecasting + AI chat**

### Phase 0 — Local Demo (Week 1)

```
Step 1: UI Flows + Mock Data
    └── Integrate landing page components into page.tsx
    └── Build Dashboard page (metrics cards, at-risk table, charts)
    └── Build Imports page (CSV upload UI + preview)
    └── Demo: "Here's what the product looks like"

Step 2: Minimal FastAPI Backend
    └── /healthz, /readyz
    └── /api/v1/dashboard/summary, /api/v1/recommendations
    └── Hard-coded/seed data is fine
    └── Demo: "Frontend talks to real API"

Step 3: Docker Compose Local
    └── frontend + backend + postgres containers
    └── Demo: "Runs anywhere with docker-compose up"
```

### Phase 1 — Live on AWS (Week 2)

```
Step 4: GitHub Actions CI/CD
    └── PR: Lint (ESLint + Ruff), type-check, build
    └── main: Build → Push to ECR → Deploy to ECS
    └── Uses OIDC → AWS IAM role (no long-lived keys)
    └── Demo: "Every push is validated and deployed"

Step 5: ECS Fargate + ALB
    └── Frontend + Backend as ECS services
    └── Application Load Balancer for routing
    └── Demo: "App accessible via public URL"

Step 6: RDS PostgreSQL
    └── Backend connects to RDS
    └── Seed data loaded
    └── Demo: "Real database in production"

Step 7: Async Pipeline (SQS + EventBridge)
    └── SQS queue for forecast jobs (+ DLQ)
    └── EventBridge rule triggers daily
    └── Worker task runs moving average forecast
    └── Demo: "Nightly forecast job runs automatically"

Step 8: CloudWatch Observability
    └── Logs from ECS tasks
    └── Alarms: ALB 5xx, ECS restarts, SQS queue age
    └── Demo: "I can see errors and get alerted"
```

### Phase 1.5 — AI SaaS (Week 3)

```
Step 9: AI Chat Widget
    └── Floating UI component (opens/closes, shows messages)
    └── Demo: "Chat interface exists"

Step 10: /api/v1/ai/chat Endpoint
    └── Intent classification (Claude API)
    └── Router pattern: 4 fixed intents
    └── Calls existing API endpoints, formats response
    └── Demo: "Ask questions in natural language"

Step 11: Polish + Demo Prep
    └── Connect chat to real forecast/recommendation data
    └── End-to-end flow works
    └── Demo: "AI explains demand patterns and reorder actions"
```

### Phase 2 — Platform Maturity (February)

```
Step 12: EKS Migration
    └── Move from ECS to EKS
    └── Demo: "Running on Kubernetes"

Step 13: Argo CD GitOps
    └── Argo CD syncs from kubernetes/ directory
    └── GitHub Actions updates image tags
    └── Demo: "Git push triggers automatic deployment"

Step 14: ML Model Upgrade (Optional)
    └── Replace moving average with LightGBM/XGBoost
    └── Demo: "Production-grade forecasting"
```

---

## 4. Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16, TypeScript, Tailwind, Shadcn/ui | User interface |
| Backend | FastAPI, Python 3.11+, Pydantic v2 | API & business logic |
| Database (Local) | PostgreSQL 15 via Docker | Local development |
| Database (Prod) | AWS RDS PostgreSQL | Production data |
| AI | Claude API (Anthropic SDK) | Chat assistant (fixed intents) |
| Async Jobs | SQS + EventBridge | Forecast pipeline |
| Compute | AWS ECS Fargate | Container hosting (January) |
| Load Balancer | AWS ALB | Traffic routing |
| Observability | CloudWatch Logs/Metrics/Alarms | Monitoring (January) |
| Containers | Docker, Docker Compose | Local dev & packaging |
| CI/CD | GitHub Actions → ECR → ECS | Build, test, deploy |
| Cloud | AWS (ECS, ECR, RDS, SQS, EventBridge, ALB) | Production infrastructure |

### February Additions
| Layer | Technology | Purpose |
|-------|------------|---------|
| Compute | AWS EKS | Kubernetes (upgrade from ECS) |
| CD/GitOps | Argo CD | Automated deployments |
| ML | LightGBM/XGBoost | Advanced forecasting (optional) |

---

## 5. Core Features (Phased)

### Phase 0 — Local Demo (Week 1)

| Feature | Description | Done When |
|---------|-------------|-----------|
| Landing Page | Hero, features, CTA sections | Components integrated, looks polished |
| Dashboard | Metrics cards, at-risk table, charts | Shows mock data, filter/search works |
| Imports Page | CSV upload UI + preview | Can upload CSV and see preview table |
| Basic API | `/healthz`, `/readyz`, `/api/v1/dashboard/summary`, `/api/v1/recommendations` | Frontend displays real API data |
| Docker Compose | frontend + backend + postgres | `docker-compose up` works |

### Phase 1 — Live on AWS (Week 2)

| Feature | Description | Done When |
|---------|-------------|-----------|
| GitHub Actions CI/CD | Lint + build + push ECR + deploy ECS | Green checks, auto-deploy on main |
| ECS Fargate | Frontend + Backend services | App accessible via ALB URL |
| RDS PostgreSQL | Production database | Backend connects, seed data loaded |
| Async Pipeline | SQS + EventBridge + Worker | Daily forecast job runs |
| CloudWatch | Logs + Alarms | Can see logs, alarms configured |

### Phase 1.5 — AI SaaS (Week 3)

| Feature | Description | Done When |
|---------|-------------|-----------|
| Chat Widget | Floating UI component | Opens/closes, shows messages |
| /api/v1/ai/chat | Intent classification + response | Returns formatted answers |
| Fixed Intents | 4 supported query types | All intents work correctly |
| Real Data | Chat uses forecast/recommendation data | End-to-end demo works |

### Phase 2 — Platform Maturity (February)

| Feature | Description | Done When |
|---------|-------------|-----------|
| EKS Migration | Move from ECS to EKS | App runs on Kubernetes |
| Argo CD | GitOps deployment | Git push triggers redeploy |
| ML Upgrade | LightGBM/XGBoost (optional) | Better forecast accuracy |

---

## 6. API Design

### Base URL
```
/api/v1/...
```

### Health & Metrics (Phase 0)
```
GET  /healthz              → { "status": "healthy" }
GET  /readyz               → { "status": "ready", "database": "connected" }
```

### Dashboard (Phase 0)
```
GET  /api/v1/dashboard/summary    → Dashboard metrics + at-risk products list
```

### Recommendations (Phase 0)
```
GET  /api/v1/recommendations              → List all recommendations
GET  /api/v1/recommendations/{product_id} → Single recommendation detail
```

### Products (Phase 0)
```
GET  /api/v1/products                     → List products (with ?sort=, ?limit=)
GET  /api/v1/products/{id}                → Single product
```

### Imports (Phase 0)
```
GET  /api/v1/templates/{type}             → Download CSV template (products|inventory|sales)
POST /api/v1/imports/upload               → Upload CSV, returns preview
```

### Forecasts (Phase 1)
```
GET  /api/v1/forecasts                    → List forecasts
POST /api/v1/forecasts/trigger            → Manually trigger forecast job (enqueues to SQS)
```

### AI Chat (Phase 1.5)
```
POST /api/v1/ai/chat                      → { "message": "..." } → { "response": "..." }
```

**Endpoints NOT in MVP:**
- ~~POST /api/v1/imports/map-columns~~ (AI mapping deferred)
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

forecasts
├── id (UUID, PK)
├── product_id (UUID, FK)
├── forecast_date (DATE)
├── predicted_demand (DECIMAL)
├── method (VARCHAR)           -- "moving_average" or "lightgbm" later
├── created_at (TIMESTAMP)

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
CREATE INDEX idx_forecasts_product_date ON forecasts(product_id, forecast_date);
```

---

## 8. DevOps Pipeline

### CI/CD Flow (GitHub Actions)

```
Push to any branch (PR)
    ├── Lint (ESLint + Ruff)
    ├── Type Check (tsc + mypy)
    └── Build Docker Images

Push to main
    ├── Build & Push to ECR (tagged with commit SHA)
    └── Deploy to ECS Fargate
```

**Key Decision:** CI uses **GitHub OIDC → AWS IAM role** (no long-lived AWS keys).

### AWS Resources (January)

```
ECS Cluster
├── frontend-service (Fargate)
├── backend-service (Fargate)
└── forecast-worker (Fargate, triggered by SQS)

ALB (Application Load Balancer)
├── / → frontend-service
└── /api/* → backend-service

RDS PostgreSQL
└── inventorypilot database

SQS
├── forecast-jobs (main queue)
└── forecast-jobs-dlq (dead letter queue)

EventBridge
└── daily-forecast-trigger (cron: 0 2 * * *)

ECR
├── inventorypilot-frontend
└── inventorypilot-backend

CloudWatch
├── Log groups for ECS tasks
├── Alarm: ALB 5xx > 5% for 5 min
├── Alarm: ECS task restart count
└── Alarm: SQS queue age > 1 hour
```

### February Additions (EKS + Argo CD)

```
EKS Cluster
├── frontend deployment
├── backend deployment
└── forecast-worker deployment

Argo CD
└── Syncs from kubernetes/ directory

GitHub Actions (updated)
└── Updates image tags in kubernetes/overlays/staging/
```

---

## 9. Observability (CloudWatch)

### January Setup

```
CloudWatch Logs
├── /ecs/inventorypilot-frontend
├── /ecs/inventorypilot-backend
└── /ecs/inventorypilot-worker

CloudWatch Alarms
├── ALB 5xx error rate > 5% for 5 minutes
├── ECS task restart count > 3 in 10 minutes
├── SQS message age > 1 hour
└── RDS connections > 80% of max
```

### Done Checklist

- [ ] ECS tasks logging to CloudWatch
- [ ] ALB 5xx alarm configured
- [ ] SQS queue age alarm configured
- [ ] Can view logs in AWS Console

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
    └── "forecast"        → GET /api/v1/forecasts?product_id={id}
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
| "What's the forecast for SKU-1234?" | forecast | GET /forecasts?product_id={id} |

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
│   │   │   └── (dashboard)/      # Dashboard routes
│   │   ├── components/           # React components
│   │   │   ├── landing/          # Landing page components
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   └── ai/               # AI chat components
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
│   │   │   └── forecasting.py    # Moving average logic
│   │   └── database/             # DB connection & session
│   ├── worker/                   # SQS worker for forecasts
│   │   └── forecast_worker.py
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── infrastructure/               # AWS infrastructure (Terraform or CDK)
│   ├── ecs/                      # ECS task definitions
│   ├── rds/                      # RDS configuration
│   └── sqs/                      # SQS + EventBridge
│
├── kubernetes/                   # K8s manifests (February)
│   ├── base/                     # Base manifests
│   └── overlays/                 # Environment-specific
│       └── staging/              # Staging overrides
│
├── .github/workflows/            # CI/CD pipelines
│   ├── ci.yml                    # Lint, test, build
│   └── deploy.yml                # Build, push ECR, deploy ECS
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

# AWS (after infrastructure is set up)
make deploy           # Deploy to ECS
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
AWS_REGION=us-east-1
SQS_FORECAST_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/...
```

---

## 15. Quick Reference

### Forecasting Formula (Moving Average)
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

### Interview Pitch
> "I built an AI-powered inventory management SaaS. The backend runs on ECS Fargate with an async forecasting pipeline using SQS and EventBridge. The AI assistant uses Claude to help users understand demand patterns and reorder recommendations. I'm currently evolving the deployment to GitOps with EKS and Argo CD."

---

## 16. File Creation Checklist

When creating a new file, Claude Code should:

- [ ] Check which Phase this feature belongs to
- [ ] Verify prerequisites from earlier phases are complete
- [ ] Explain what the file does and why it's needed
- [ ] Show where it fits in the directory structure
- [ ] Include all necessary imports
- [ ] Add appropriate type hints/annotations
- [ ] Include error handling where appropriate
- [ ] Follow existing patterns from similar files
- [ ] Note any related files that may need updates
