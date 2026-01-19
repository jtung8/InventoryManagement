# Handoff Document - InventoryPilot MVP

> **Last updated**: 2025-01-19
> **Current phase**: Phase 0 — Local Demo (Step 1 nearly complete)

---

## What's Been Built

### Imports Page (`/imports`)
**File**: `frontend/web/src/app/imports/page.tsx`

- CSV file upload with drag-and-drop UI
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

1. **Upload flow**: Upload CSV → Preview → Save to localStorage → Navigate to Dashboard
2. **Dashboard reads uploaded data**: Transforms CSV into table rows with correct column mapping
3. **Metrics update**: Total SKUs, At Risk count, Reorder Cost, Potential Revenue all compute from uploaded data
4. **Search/filter**: Works on uploaded data
5. **Race condition handling**: Fast file switching doesn't cause stale data overwrites
6. **Same file re-upload**: Can re-upload same file after editing it externally

---

## What's NOT Done Yet (Remaining Step 1 Tasks)

Per CLAUDE.md Build Order, Step 1 still needs:

### 1. "Getting Started" Banner (3-step onboarding)
**Location**: Could go on Dashboard or Imports page
**Design**:
- Step 1: "Upload inventory CSV"
- Step 2: "Review your data"
- Step 3: "View recommendations"
- Should show current progress and link to next step

### 2. CSV Template Download Link on Imports Page
**Task**: Add a "Download template" link on the Imports page pointing to:
`/templates/inventorypilot-template-inventory-snapshot.csv`

**Suggested placement**: Above the upload dropzone or in a helper text area

### 3. Landing Page Integration
**Status**: Landing page components exist but need verification they're integrated into `page.tsx`
**Check**: `frontend/web/src/app/page.tsx`

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
| `frontend/web/src/app/imports/page.tsx` | Imports page |
| `frontend/web/src/app/(dashboard)/dashboard/page.tsx` | Dashboard page |
| `frontend/web/public/templates/inventorypilot-template-inventory-snapshot.csv` | CSV template |

---

## What Didn't Work / Lessons Learned

1. **useEffect + setState for localStorage**: Caused linter warnings about cascading renders. Fixed by using lazy initializer pattern with `useState(() => ...)` instead.

2. **document.getElementById for file input**: Anti-pattern in React. Use `useRef<HTMLInputElement>` instead.

3. **FileReader race conditions**: Without a load ID guard, rapidly switching files could cause stale callbacks to overwrite newer data. Fixed with `loadIdRef.current` counter.

4. **Static metrics object**: Originally computed from mock data only. Refactored to `useMemo` that computes from `activeProducts`.

5. **Three separate CSV templates**: Simplified to single "inventory snapshot" template for MVP since we only need one upload flow.

---

## Next Steps After Step 1

**Step 2: Minimal FastAPI Backend**
- `/healthz`, `/readyz`
- `/api/v1/dashboard/summary`
- `/api/v1/recommendations`
- `POST /api/v1/imports/upload` with column validation

**Step 3: Docker Compose Local**
- frontend + backend + postgres containers
- `docker-compose up` should work

---

## How to Test Current State

1. Start dev server: `cd frontend/web && npm run dev`
2. Go to `http://localhost:3000/imports`
3. Upload the template CSV or any CSV with columns: sku, name, category, available, unit_cost
4. Verify "Saved at ..." appears
5. Click "Go to Dashboard"
6. Verify "Data source: Uploaded CSV" shows
7. Verify table shows your uploaded data
8. Verify metrics update based on your data
9. Test search and category filter
