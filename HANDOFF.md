# Handoff Document - InventoryPilot MVP

> **Last updated**: 2025-02-04
> **Current phase**: Phase 0 — Local Demo (Step 1 complete, Day 5 next)

---

## What's Been Built

### Landing Page (`/`)
**File**: `frontend/web/src/app/page.tsx`

- **Navbar**: Brand "InventoryPilot" + "Upload CSV" CTA → `/imports`
- **Hero section**:
  - Eyebrow: "Inventory clarity in seconds"
  - Headline: "Upload a CSV. See what's at risk."
  - Primary CTA: "Upload CSV" → `/imports`
  - Secondary CTA: "View Demo Dashboard" → `/dashboard`
- **How It Works section**: 3-step flow with cyan numbered circles
  - Step 1: Upload your CSV
  - Step 2: Preview your data
  - Step 3: See your dashboard
- **Footer**: Brand + copyright

### Imports Page (`/imports`)
**File**: `frontend/web/src/app/imports/page.tsx`

- **Getting Started Banner**: 3-step onboarding
  - Step 1 (active): Upload an Inventory Snapshot CSV
  - Step 2 (coming next): Upload Sales History for forecasting
  - Step 3 (coming next): Review reorder recommendations on Dashboard
- **Download Templates section**: Link to CSV template
- **CSV file upload** with drag-and-drop UI
- **Helper note** under uploader with recommended headers
- PapaParse for CSV parsing with `skipEmptyLines: true`
- Table preview with configurable row limit (10/25/50/200)
- Clear button to reset upload state
- Race condition guard using `loadIdRef` (prevents stale FileReader callbacks)
- localStorage persistence of parsed CSV data to `inventorypilot:uploadedRows`
- "Saved at ..." indicator on successful save
- Save error warning (amber) if localStorage quota exceeded
- "Go to Dashboard" link appears after successful save

**localStorage payload shape**:
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

### Dashboard Page (`/dashboard`)
**File**: `frontend/web/src/app/(dashboard)/dashboard/page.tsx`

- Reads uploaded data from localStorage on mount (lazy initializer pattern)
- Falls back to mock data if no upload exists
- Shows "Data source: Uploaded CSV" or "Data source: Mock data"
- "Back to Imports" and "Change CSV" navigation links
- Transforms CSV rows into Product objects using column mapping
- Column aliases supported (case-insensitive):
  - `sku`: sku
  - `name`: name, product, product_name, title
  - `category`: category, type
  - `available`: available, on_hand, stock, qty_available
  - `unitCost`: unit_cost, cost, unitcost
- Placeholder heuristics for computed fields:
  - `leadTimeDays`: 14 (constant)
  - `daysUntilStockout`: `available <= 5 ? 3 : 7`
  - `recommendedQty`: `Math.max(0, 50 - available)`
- Metrics computed from active data source (uploaded or mock)
- Search and category filter work on uploaded data

### CSV Template
**File**: `frontend/web/public/templates/inventorypilot-template-inventory-snapshot.csv`

Single consolidated template for MVP with headers:
```
sku,name,category,available,unit_cost
```

Accessible at: `/templates/inventorypilot-template-inventory-snapshot.csv`

---

## What Works

1. **Landing page**: Hero with value prop + CTAs + How It Works section
2. **Upload flow**: Upload CSV → Preview → Save to localStorage → Navigate to Dashboard
3. **Dashboard reads uploaded data**: Transforms CSV into table rows with correct column mapping
4. **Metrics update**: Total SKUs, At Risk count, Reorder Cost, Potential Revenue all compute from uploaded data
5. **Search/filter**: Works on uploaded data
6. **Race condition handling**: Fast file switching doesn't cause stale data overwrites
7. **Same file re-upload**: Can re-upload same file after editing it externally
8. **Template download**: Users can download CSV template from Imports page

---

## Step 1 Tasks (COMPLETE)

| Task | Status |
|------|--------|
| Landing page with Hero + How It Works | ✅ Done |
| Getting Started banner on Imports | ✅ Done |
| CSV template download link | ✅ Done |
| Helper note under uploader | ✅ Done |
| Dashboard reads uploaded data | ✅ Done |
| Metrics compute from active data | ✅ Done |

---

## Next Steps (Day 5: UI Polish)

Per timeline, Day 5 focuses on **loading/empty/error states**:

### Dashboard
- [ ] Loading spinner while reading localStorage
- [ ] Empty state if no products
- [ ] Error state if data is malformed

### Imports
- [ ] Loading state while parsing CSV (already has basic handling)
- [ ] Polish existing error states

---

## Design System Reference

From CLAUDE.md Section 12:
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

---

## Key Files to Reference

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project spec, build order, data models |
| `frontend/web/src/app/page.tsx` | Landing page |
| `frontend/web/src/app/imports/page.tsx` | Imports page |
| `frontend/web/src/app/(dashboard)/dashboard/page.tsx` | Dashboard page |
| `frontend/web/public/templates/inventorypilot-template-inventory-snapshot.csv` | CSV template |
| `frontend/web/src/components/landing/` | Landing page components (Navbar, Footer, Hero, Features, CTA) |

---

## What Didn't Work / Lessons Learned

1. **useEffect + setState for localStorage**: Caused linter warnings about cascading renders. Fixed by using lazy initializer pattern with `useState(() => ...)` instead.

2. **document.getElementById for file input**: Anti-pattern in React. Use `useRef<HTMLInputElement>` instead.

3. **FileReader race conditions**: Without a load ID guard, rapidly switching files could cause stale callbacks to overwrite newer data. Fixed with `loadIdRef.current` counter.

4. **Static metrics object**: Originally computed from mock data only. Refactored to `useMemo` that computes from `activeProducts`.

5. **Three separate CSV templates**: Simplified to single "inventory snapshot" template for MVP since we only need one upload flow.

6. **Scope creep on landing page**: Initially planned full ResuMax-style page with pricing/FAQ/testimonials. Scaled back to Hero + How It Works for Phase 0.

---

## Timeline Reference

| Day | Task | Status |
|-----|------|--------|
| Day 1 | Dashboard route + filter/search | ✅ Done |
| Day 2 | Imports UI: upload CSV → preview | ✅ Done |
| Day 3 | CSV templates + Getting Started banner | ✅ Done |
| Day 4 | LocalStorage pipeline (imports → dashboard) | ✅ Done |
| Day 5 | UI polish for demo states | ⏳ Next |
| Day 6 | FastAPI skeleton + /healthz /readyz | Pending |

---

## How to Test Current State

1. Start dev server: `cd frontend/web && npm run dev`
2. Go to `http://localhost:3000` — verify landing page loads with Hero + How It Works
3. Click "Upload CSV" — should navigate to `/imports`
4. Download template from "Download templates" section
5. Upload the template CSV or any CSV with columns: sku, name, category, available, unit_cost
6. Verify "Saved at ..." appears
7. Click "Go to Dashboard"
8. Verify "Data source: Uploaded CSV" shows
9. Verify table shows your uploaded data
10. Verify metrics update based on your data
11. Test search and category filter
