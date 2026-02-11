# Handoff Document — ForeStock.ai MVP

> **Last updated**: 2026-02-10
> **Current phase**: Phase 0 — Local Demo (Step 1 complete + UI rebrand complete)
> **Brand**: Rebranded from "InventoryPilot" to **ForeStock.ai**

---

## What's Been Built

### Rebrand & Design System Overhaul (Latest Session)

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

---

## Backend (Step 2 — Complete, in `hungry-mclaren` worktree)

Full FastAPI backend built in the `hungry-mclaren` worktree (uncommitted, needs merge):

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

### Dashboard Updates (in hungry-mclaren)
- 3-tier data source: API first → localStorage fallback → mock data
- `isLoading` / `apiError` states with `useEffect` for API fetch
- Dismissible API error banner
- Empty state when no products from any source

### Dependencies
- `backend/requirements.txt`: fastapi, uvicorn, pydantic, python-multipart, python-dotenv
- `backend/.env.example`: documented env vars

**Status**: Fully functional but uncommitted in `hungry-mclaren`. Needs to be merged into `feature/josh` → `main`.

---

## Next Steps

### Immediate — Merge backend
- [ ] Commit and merge `hungry-mclaren` backend work into `feature/josh` → `main`

### Step 3: Docker Compose Local (Phase 0 final)
- [ ] `docker-compose.yml` with frontend + backend + postgres
- [ ] `Dockerfile` for backend
- [ ] Verify `docker-compose up` works end-to-end

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
| `backend/app/main.py` | FastAPI entrypoint (in hungry-mclaren) |
| `backend/app/api/v1/` | All API route modules (in hungry-mclaren) |
| `backend/app/services/seed_data.py` | In-memory seed data (in hungry-mclaren) |
| `backend/app/services/csv_validator.py` | CSV validation service (in hungry-mclaren) |
| `frontend/web/src/lib/api.ts` | Frontend API client (in hungry-mclaren) |
| `frontend/web/src/lib/types.ts` | Shared TypeScript types (in hungry-mclaren) |

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

### Backend (from hungry-mclaren worktree)
1. `cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
2. `uvicorn app.main:app --reload --port 8000`
3. `curl http://localhost:8000/healthz` → `{"status":"healthy"}`
4. `curl http://localhost:8000/readyz` → `{"status":"ready","database":"not_connected"}`
5. `curl http://localhost:8000/api/v1/dashboard/summary` → metrics + products JSON
6. `curl -F "file=@template.csv" http://localhost:8000/api/v1/imports/upload` → accepted/rejected rows

---

## Timeline Reference

| Day | Task | Status |
|-----|------|--------|
| Day 1 | Dashboard route + filter/search | ✅ Done |
| Day 2 | Imports UI: upload CSV → preview | ✅ Done |
| Day 3 | CSV templates + Getting Started banner | ✅ Done |
| Day 4 | LocalStorage pipeline (imports → dashboard) | ✅ Done |
| Day 5 | UI rebrand to ForeStock.ai + glass design | ✅ Done |
| Day 6 | FastAPI backend + all API endpoints + seed data | ✅ Done (in hungry-mclaren, needs merge) |
| Day 6 | Frontend API client + dashboard API integration | ✅ Done (in hungry-mclaren, needs merge) |
| Next | Docker Compose (Step 3) | ⏳ Next |
