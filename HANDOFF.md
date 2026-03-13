# Handoff Document — ForeStock.ai MVP

> **Last updated**: 2026-03-12
> **Current phase**: Phase 1 — Live on AWS (Step 4 COMPLETE)
> **Brand**: ForeStock.ai (rebranded from InventoryPilot)
> **Days 1–8**: All complete. Phase 0 done + CI/CD pipeline live.
> **Next**: Phase 1, Step 5 — ECS Fargate + ALB

---

## What's Been Built

### GitHub Actions CI/CD (Latest Session — Step 4)

Unified CI workflow (`.github/workflows/ci.yml`) that validates every PR and push to `main`. Replaces the previous `web-ci.yml` (frontend-only).

**3 parallel jobs:**

| Job | Steps | ~Time |
|-----|-------|-------|
| **Frontend** | checkout → setup-node 20 → npm ci → ESLint → tsc --noEmit → next build | ~90s |
| **Backend** | checkout → setup-python 3.12 → pip install → ruff check → ruff format --check | ~30s |
| **Docker Build** | checkout → docker build frontend → docker build backend (runs after frontend+backend pass) | ~120s |

**Key features:**
- `concurrency` block cancels superseded runs (push-push-push only finishes the last one)
- `permissions: contents: read` (principle of least privilege)
- npm + pip caching for faster repeat runs
- Docker job gated behind `needs: [frontend, backend]`

**New files created:**
- `.github/workflows/ci.yml` — unified CI workflow
- `backend/requirements-dev.txt` — dev dependencies (ruff), separate from production
- `backend/pyproject.toml` — ruff config (target py312, line-length 88, E/W/F/I/B/UP rules, E501 ignored)
- `.gitignore` — root gitignore (worktrees, cache, .env, __pycache__)

**Files modified:**
- `frontend/web/package.json` — added `"type-check": "tsc --noEmit"` script
- `backend/app/api/v1/imports.py` — B904 fix (exception chaining: `from None`, `from exc`)
- `backend/app/services/csv_validator.py` — B905 fix (`zip(..., strict=True)`)
- 5 other backend files reformatted by `ruff check --fix` and `ruff format`

**Deleted:**
- `.github/workflows/web-ci.yml` — replaced by unified ci.yml

**Status:** Merged to `main`. CI passes all 3 jobs. ✅

---

### Rebrand & Design System Overhaul

The entire frontend was rebranded to **ForeStock.ai** with a premium soft-SaaS dark aesthetic:

**Design tokens** (`globals.css`):
```
--bg:          #0B0F1A   deep charcoal-navy
--surface:     #141922   card / panel base
--surface2:    #1C2333   elevated surface
--border:      #2A3040   subtle dividers
--text:        #E8ECF1   primary text
--muted:       #7B8BA3   secondary / helper text
--accent:      #2DD4BF   teal brand accent
--accentHover: #14B8A6   teal hover
--focus:       #2DD4BF   focus ring
```

**Global utilities added**:
- `.glass` — frosted glass card (backdrop-filter blur + semi-transparent bg + border)
- `.btn-accent` / `.btn-secondary` — button styles with hover glow, active scale, focus-visible
- `.reveal` / `.reveal.visible` — scroll-based opacity+translate animation via IntersectionObserver
- `.focus-ring` — consistent focus-visible outline for accessibility
- `prefers-reduced-motion` respected (animations disabled)
- Custom scrollbar styling

**Font**: Switched from Geist Sans to **Inter** (geometric sans, closest available to Satoshi)

### Shared SiteHeader Component
**File**: `frontend/web/src/components/ui/SiteHeader.tsx`

- ForeStock.ai wordmark: bar-chart SVG icon + "fore" (white) + "stock" (teal pill) + ".ai" (muted)
- Sticky header with blur backdrop (`bg-[var(--bg)]/80 backdrop-blur-md`)
- Nav links: Dashboard, Imports
- Configurable CTA button (props: `ctaLabel`, `ctaHref`)
- Used on all three pages (/, /imports, /dashboard)

### Landing Page (`/`)
**File**: `frontend/web/src/app/page.tsx`

Self-contained page (no longer imports from `components/landing/`). Sections:

1. **Hero**:
   - Eyebrow: "Inventory intelligence"
   - Headline: "Avoid stockouts before they happen."
   - Subhead: Value prop paragraph about CSV upload + at-risk visibility
   - Email capture form (frontend-only, no backend)
   - Primary CTA: "Try the demo" → `/imports`
   - Secondary CTA: "See dashboard" → `/dashboard`
   - Decorative radial glow behind hero

2. **Dashboard Preview**:
   - Glassy card with 4 metric tiles (Total SKUs, At Risk, Reorder Cost, Revenue at Risk)
   - Mini at-risk table with 4 sample rows (SKU, product, stock, stockout badge)

3. **Integrations Row**:
   - 6 text pills: Shopify, Amazon, Square, WooCommerce, QuickBooks, CSV Upload

4. **How It Works**:
   - 3-step flow: Upload CSV → See what's at risk → Export reorder plan

5. **FAQ**:
   - 7-item accordion (custom-built, no library)
   - CSS grid animation for open/close
   - Topics: data requirements, forecasting method, integrations, security, at-risk definition, CSV export, pricing

6. **Footer**:
   - ForeStock.ai brand + copyright + nav links + disclaimer

All sections except Hero use `RevealSection` (IntersectionObserver scroll animation).

### Imports Page (`/imports`)
**File**: `frontend/web/src/app/imports/page.tsx`

Full redesign with glass UI. All original functionality preserved:

- **SiteHeader** with CTA → Dashboard
- **Page header**: "Import data" + helper text
- **Compact stepper** (glass card): 3 steps with active/soon badges
- **Template download card** (glass): prominent with Download button
- **Dropzone** (glass card):
  - Drag-and-drop with visual `isDragOver` state (border highlight + tinted bg)
  - Click-to-upload fallback
  - File type hint: "CSV only, Max 5 MB"
  - Required headers hint below dropzone
- **File status bar** (glass): filename, size, row count, "Parsed locally" green chip, Remove button
- **Error states**: structured with icon + title + description (import failed, save error)
- **Preview table** (glass card): sticky header, row limit selector, row count display
- **CTA**: centered "Go to dashboard" accent button after successful parse
- PapaParse parsing, localStorage persistence, race condition guard — all unchanged

### Dashboard Page (`/dashboard`)
**File**: `frontend/web/src/app/(dashboard)/dashboard/page.tsx`

Minimal changes — added SiteHeader, updated colors to CSS variables:

- **SiteHeader** with CTA → "Import CSV"
- Wrapped content in `max-w-6xl` container
- Metric cards use `.glass` class instead of hardcoded `bg-[#1E293B]`
- Table and filter inputs use CSS variables (`var(--accent)`, `var(--border)`, etc.)
- Data source label: "Uploaded CSV" or "Demo data"
- All logic unchanged: column mapping, search, filter, metrics computation

### CSV Template
**File**: `frontend/web/public/templates/inventorypilot-template-inventory-snapshot.csv`

Unchanged. Headers: `sku,name,category,available,unit_cost`

### Docker Compose (Step 3 — Complete)

Full containerization for local development:

**Backend Dockerfile** (`backend/Dockerfile`):
- 2-stage build: `python:3.12-slim` builder → runtime
- Virtual env isolation, non-root `appuser`, `PYTHONUNBUFFERED=1`
- Runs: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

**Frontend Dockerfile** (`frontend/web/Dockerfile`):
- 3-stage build: deps (npm ci) → builder (next build) → runner (standalone server)
- `node:20-alpine` base, non-root `nextjs` user
- `NEXT_PUBLIC_API_URL` passed as build ARG (baked into JS at build time)
- Copies `public/` and `.next/static/` manually (standalone doesn't include them)

**Docker Compose** (`docker-compose.yml`):
- 3 services: `postgres` (15-alpine), `backend`, `frontend`
- Postgres: named volume `pgdata`, healthcheck with `pg_isready`
- Backend: waits for postgres healthy, CORS + DATABASE_URL env vars
- Frontend: build arg `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Ports: 3000 (frontend), 8000 (backend), 5432 (postgres)

**Makefile**: `make dev`, `make stop`, `make build`, `make clean`, `make logs`

**Config change** (`frontend/web/next.config.ts`):
- Added `output: "standalone"` for Docker-compatible builds

**.dockerignore files**: `backend/.dockerignore` and `frontend/web/.dockerignore`

**Networking**: Browser hits `localhost:3000` (frontend) and `localhost:8000` (backend API). Backend reaches postgres at `postgres:5432` (Docker internal DNS). Frontend API calls happen in the browser, not server-side.

**Not yet verified**: `docker compose up --build` end-to-end (Docker Desktop was not running during implementation).

---

## What Works

1. **Full rebrand**: ForeStock.ai branding on all pages (header, title, footer, metadata)
2. **Landing page**: Hero + dashboard preview + integrations + how-it-works + FAQ + footer
3. **Scroll animations**: Sections fade in on scroll, respects `prefers-reduced-motion`
4. **Glass UI**: All cards use frosted glass aesthetic with backdrop-filter
5. **Upload flow**: Upload CSV → Preview → Save to localStorage → Navigate to Dashboard
6. **Dashboard reads uploaded data**: Column mapping, metrics computation, search/filter
7. **Race condition handling**: `loadIdRef` prevents stale FileReader callbacks
8. **Drag-and-drop**: Imports page supports drag-and-drop with visual feedback
9. **Accessibility**: focus-visible states on all interactive elements, keyboard nav, ARIA attributes
10. **Template download**: Available from imports page
11. **Docker Compose**: `docker compose up --build` starts frontend + backend + postgres (pending verification)
12. **CI pipeline**: Every PR validates frontend (lint + type-check + build), backend (ruff lint + format), and Docker image builds
13. **Backend lint-clean**: All ruff checks pass (E/W/F/I/B/UP rules), all files formatted

---

## Completed Tasks

| Task | Status |
|------|--------|
| Landing page with Hero + How It Works | ✅ Done |
| Getting Started banner on Imports | ✅ Done |
| CSV template download link | ✅ Done |
| Helper note under uploader | ✅ Done |
| Dashboard reads uploaded data | ✅ Done |
| Metrics compute from active data | ✅ Done |
| **Rebrand to ForeStock.ai** | ✅ Done |
| **Design system overhaul (dark glass SaaS)** | ✅ Done |
| **Shared SiteHeader component** | ✅ Done |
| **Landing page rebuild (Hero, Preview, Integrations, FAQ)** | ✅ Done |
| **Imports page premium redesign** | ✅ Done |
| **Dashboard branding update** | ✅ Done |
| **Scroll-reveal animation** | ✅ Done |
| **Font switch to Inter** | ✅ Done |
| **Backend Dockerfile (2-stage build)** | ✅ Done |
| **Frontend Dockerfile (3-stage standalone)** | ✅ Done |
| **docker-compose.yml (3 services)** | ✅ Done |
| **Makefile (dev commands)** | ✅ Done |
| **next.config.ts standalone output** | ✅ Done |
| **.dockerignore files (backend + frontend)** | ✅ Done |
| **GitHub Actions CI workflow (ci.yml)** | ✅ Done |
| **Backend linting setup (ruff + pyproject.toml)** | ✅ Done |
| **Frontend type-check script** | ✅ Done |
| **Backend code lint-clean (ruff check + format)** | ✅ Done |
| **Root .gitignore** | ✅ Done |
| **Deleted web-ci.yml (replaced by ci.yml)** | ✅ Done |

---

## Backend (Step 2 — Complete, in `hungry-mclaren` worktree)

Full FastAPI backend (merged from `hungry-mclaren` worktree):

### FastAPI App (`backend/app/`)
- **`main.py`** — App entrypoint, CORS middleware, versioned router
- **`config.py`** — Environment config (`CORS_ORIGINS`, `API_V1_PREFIX`)

### API Routes (`backend/app/api/v1/`)
| File | Endpoints |
|------|-----------|
| `health.py` | `GET /healthz`, `GET /readyz` |
| `dashboard.py` | `GET /api/v1/dashboard/summary` (metrics + products) |
| `products.py` | `GET /api/v1/products` (sort, limit), `GET /api/v1/products/{id}` |
| `recommendations.py` | `GET /api/v1/recommendations` (at_risk filter), `GET /{id}` |
| `imports.py` | `POST /api/v1/imports/upload` (CSV validation + preview) |
| `forecasts.py` | `POST /trigger` (stub), `GET /runs/latest` (stub) |
| `router.py` | Aggregates all route modules |

### Schemas (`backend/app/schemas/`)
- Pydantic v2 models with camelCase aliases for all endpoints
- `health.py`, `dashboard.py`, `product.py`, `recommendation.py`, `imports.py`, `forecast.py`

### Services (`backend/app/services/`)
- **`seed_data.py`** — In-memory seed data matching frontend mock data, `store_uploaded_rows()` for uploaded CSVs
- **`csv_validator.py`** — Auto-detects CSV type (inventory_snapshot vs sales_history), per-field validators, accepted/rejected row tracking

### Frontend API Client (`frontend/web/src/lib/`)
- **`types.ts`** — Shared TypeScript types (Product, DashboardMetrics, Recommendation, etc.)
- **`api.ts`** — Typed API client (`apiGet`, `apiPost`, `apiPostFile`), 10s timeout, `ApiResult<T>` discriminated union

### Dashboard Updates (merged)
- 3-tier data source: API first → localStorage fallback → mock data
- `isLoading` / `apiError` states with `useEffect` for API fetch
- Dismissible API error banner
- Empty state when no products from any source

### Dependencies
- `backend/requirements.txt`: fastapi, uvicorn, pydantic, python-multipart, python-dotenv
- `backend/.env.example`: documented env vars

**Status**: Merged into `main`.

---

## Next Steps

### Phase 1, Step 5: ECS Fargate + ALB
- [ ] Frontend + Backend as ECS Fargate services
- [ ] Application Load Balancer for routing (`/` → frontend, `/api/*` → backend)
- [ ] App accessible via public URL

### Phase 1, Step 6: RDS PostgreSQL
- [ ] Backend connects to RDS instead of in-memory seed data
- [ ] Seed data loaded into production database

### Phase 1, Step 7: Async Pipeline (SQS + EventBridge)
- [ ] SQS queue for forecast jobs (+ DLQ)
- [ ] EventBridge rule triggers daily
- [ ] Worker task runs moving average forecast
- [ ] `forecast_runs` table tracks run status

### Deploy Workflow (ci.yml extension or deploy.yml)
- [ ] Main workflow: build → push to ECR → deploy to ECS
- [ ] Uses OIDC → AWS IAM role (no long-lived keys)

### Cleanup
- [ ] Delete unused `frontend/web/src/components/landing/` directory (Navbar, Hero, Features, CTA, Footer — no longer imported)

---

## localStorage Payload Shape

Unchanged:
```ts
{
  schemaVersion: 1,
  source: "imports-page",
  filename: string,
  savedAt: string (ISO),
  headers: string[],
  rows: string[][],
  totalRows: number
}
```

Key: `inventorypilot:uploadedRows`

---

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project spec, build order, data models |
| `frontend/web/src/app/globals.css` | Design tokens, glass/button/animation utilities |
| `frontend/web/src/app/layout.tsx` | Root layout (Inter font, ForeStock.ai metadata) |
| `frontend/web/src/components/ui/SiteHeader.tsx` | Shared brand header (wordmark + nav + CTA) |
| `frontend/web/src/app/page.tsx` | Landing page (Hero, Preview, Integrations, FAQ, Footer) |
| `frontend/web/src/app/imports/page.tsx` | Imports page (glass stepper, dropzone, preview) |
| `frontend/web/src/app/(dashboard)/dashboard/page.tsx` | Dashboard page |
| `frontend/web/public/templates/inventorypilot-template-inventory-snapshot.csv` | CSV template |
| `backend/app/main.py` | FastAPI entrypoint (merged) |
| `backend/app/api/v1/` | All API route modules (merged) |
| `backend/app/services/seed_data.py` | In-memory seed data (merged) |
| `backend/app/services/csv_validator.py` | CSV validation service (merged) |
| `frontend/web/src/lib/api.ts` | Frontend API client (merged) |
| `frontend/web/src/lib/types.ts` | Shared TypeScript types (merged) |
| `docker-compose.yml` | 3-service orchestration (frontend + backend + postgres) |
| `Makefile` | Dev commands (`make dev`, `make stop`, `make build`, etc.) |
| `backend/Dockerfile` | 2-stage Python build (builder → runtime) |
| `frontend/web/Dockerfile` | 3-stage Next.js build (deps → builder → runner) |
| `backend/.dockerignore` | Excludes __pycache__, .venv, .env from Docker builds |
| `frontend/web/.dockerignore` | Excludes node_modules, .next from Docker builds |
| `.github/workflows/ci.yml` | Unified CI: frontend lint/type-check/build + backend lint/format + Docker builds |
| `backend/requirements-dev.txt` | Dev-only pip dependencies (ruff) — not in production image |
| `backend/pyproject.toml` | Ruff linter/formatter configuration |
| `.gitignore` | Root gitignore (worktrees, cache, .env, __pycache__) |

---

## Lessons Learned

1. **useEffect + setState for localStorage**: Caused linter warnings about cascading renders. Fixed by using lazy initializer pattern with `useState(() => ...)` instead.

2. **document.getElementById for file input**: Anti-pattern in React. Use `useRef<HTMLInputElement>` instead.

3. **FileReader race conditions**: Without a load ID guard, rapidly switching files could cause stale callbacks to overwrite newer data. Fixed with `loadIdRef.current` counter.

4. **Static metrics object**: Originally computed from mock data only. Refactored to `useMemo` that computes from `activeProducts`.

5. **Three separate CSV templates**: Simplified to single "inventory snapshot" template for MVP since we only need one upload flow.

6. **Worktree dev server confusion**: When using git worktrees, the Next.js dev server runs from whichever directory it was started in. If changes aren't showing, check `lsof -i :3000` to verify the server is running from the correct worktree.

7. **Tailwind v4 theming**: No `tailwind.config.ts` — Tailwind v4 uses `@theme inline` block in `globals.css` for custom theme tokens.

8. **CSS variable approach vs hardcoded hex**: Moving to CSS variables (`var(--accent)`) makes rebrand/theming changes trivial and keeps the codebase consistent.

9. **Separate dev dependencies from production**: `requirements-dev.txt` keeps linting tools (ruff) out of the Docker production image. CI installs both files; Dockerfile only installs `requirements.txt`.

10. **Disable E501 when using ruff format**: The formatter handles line length but intentionally leaves long strings alone (for readability). The E501 lint rule flags those same strings, creating a conflict. The ruff team recommends disabling E501 when using the formatter.

11. **Exception chaining in Python (B904)**: When re-raising inside `except` blocks, use `from exc` (to preserve the original error for debugging) or `from None` (to suppress it when it's not useful to the caller). Without this, Python shows both tracebacks, which can be confusing.

12. **`git add .` hazards**: Always have a root `.gitignore` before running `git add .`. Without one, Claude Code worktrees, `__pycache__`, `.ruff_cache`, and auto-generated files get staged accidentally.

---

## How to Test

### Frontend only
1. Start dev server: `cd frontend/web && npm run dev`
2. Go to `http://localhost:3000` — verify ForeStock.ai landing page with hero, dashboard preview, integrations row, FAQ accordion, footer
3. Scroll down — sections should fade in (scroll-reveal animation)
4. Click "Try the demo" → navigates to `/imports`
5. Verify glass stepper, template download card, dropzone
6. Download template CSV
7. Upload a CSV (drag-and-drop or click) — verify preview table + "Parsed locally" chip
8. Click "Go to dashboard" → navigates to `/dashboard`
9. Verify SiteHeader with ForeStock.ai wordmark on all pages
10. Verify glass metric cards, updated table colors
11. Test search and category filter
12. Check keyboard navigation (Tab through interactive elements, verify focus rings)

### Backend (standalone)
1. `cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
2. `uvicorn app.main:app --reload --port 8000`
3. `curl http://localhost:8000/healthz` → `{"status":"healthy"}`
4. `curl http://localhost:8000/readyz` → `{"status":"ready","database":"not_connected"}`
5. `curl http://localhost:8000/api/v1/dashboard/summary` → metrics + products JSON
6. `curl -F "file=@template.csv" http://localhost:8000/api/v1/imports/upload` → accepted/rejected rows

### Docker Compose (all services)
1. Open Docker Desktop
2. `make dev` (or `docker compose up --build`)
3. Wait for all 3 services to start (first build downloads base images ~400MB)
4. `curl http://localhost:8000/healthz` → `{"status":"healthy"}`
5. Browser at `http://localhost:3000` → ForeStock.ai landing page
6. Navigate: landing → imports → upload CSV → dashboard
7. `make stop` (or `docker compose down`) to shut down
8. `make clean` to also delete postgres data volume

---

## Timeline Reference

| Day | Task | Status |
|-----|------|--------|
| Day 1 | Dashboard route + filter/search | ✅ Done |
| Day 2 | Imports UI: upload CSV → preview | ✅ Done |
| Day 3 | CSV templates + Getting Started banner | ✅ Done |
| Day 4 | LocalStorage pipeline (imports → dashboard) | ✅ Done |
| Day 5 | UI rebrand to ForeStock.ai + glass design | ✅ Done |
| Day 6 | FastAPI backend + all API endpoints + seed data | ✅ Done (merged) |
| Day 6 | Frontend API client + dashboard API integration | ✅ Done (merged) |
| Day 7 | Docker Compose (Step 3) — Dockerfiles, compose, Makefile | ✅ Done |
| Day 8 | GitHub Actions CI/CD (Step 4) — ci.yml, ruff, type-check | ✅ Done (merged) |
| Next | Phase 1, Step 5 — ECS Fargate + ALB | ⏳ Pending |
| Next | Verify `docker compose up` end-to-end | ⏳ Pending |
