# InventoryPilot MVP Execution Plan (Codex Reference)

This doc is the **execution contract** for shipping InventoryPilot fast while integrating:
- Docker
- Kubernetes
- AWS EKS
- AWS RDS (Postgres)
- Argo CD (GitOps)
- GitHub Actions (CI + image build/push)
- ECR (container registry)

It is designed to produce a **legit-looking, portfolio-ready MVP** that aligns with ARCHITECTURE.md.

---

## 1) Non-Negotiable Definition of Done

### Product (what users see)
- Landing page at `/` is polished and consistent (already started)
- Dashboard exists at `/dashboard` and looks real:
  - Metric cards (Total SKUs, At Risk, Order Qty)
  - At-risk table with search/filter
  - Loading + error states (even with mock/early API)
- Imports page exists (basic CSV upload UI)
  - Upload accepts a CSV file and shows a small preview table (mock data)

### API (what powers the product)
FastAPI exposes and documents endpoints (OpenAPI `/docs`):
- `GET /api/healthz`
- `GET /api/dashboard/summary`
- `GET /api/products`
- `POST /api/sales/import-csv` (minimal parsing accepted)
- `GET /api/recommendations` (simple heuristic + explanation fields)

### Infra (what makes it legit)
- Frontend + backend build as Docker images
- Images pushed to ECR
- EKS cluster exists
- RDS Postgres exists and is used by backend
- Kubernetes manifests deploy frontend/backend and connect backend → RDS
- Argo CD syncs manifests from GitHub repo
- GitHub Actions runs:
  - CI (lint/build)
  - Build & Push Docker images to ECR (on main)

---

## 2) Operating Mode (CRITICAL): 1 File Per Change

**Codex rule: every change modifies ONE file only.**
- One file edited → one commit.
- If a step requires multiple files, split it into multiple commits.

**Commit format**
- `type(scope): short summary`
Examples:
- `feat(web): add /dashboard route scaffold`
- `feat(web): add MetricCard component`
- `feat(api): add healthz endpoint`
- `chore(docker): add backend Dockerfile`
- `ci: add web ci workflow`

**Verification after every commit**
- If the change touches frontend: `npm run dev` (or `npm run build` if appropriate)
- If backend: run `uvicorn` and hit `/api/healthz`
- If docker: `docker build` or `docker-compose up`
- If k8s: `kubectl apply --dry-run=client -f <file>` (or real apply once ready)

---

## 3) Build Order (Do NOT reorder)

1) Frontend dashboard + imports work with mock data
2) Backend returns hard-coded JSON
3) Frontend fetches backend locally
4) Docker images build locally
5) Push images to ECR
6) EKS cluster + RDS provisioned
7) Deploy to EKS once manually
8) Install Argo CD and switch to GitOps
9) GitHub Actions builds/pushes images and updates deploy refs

---

## 4) Repo Layout (Target)
```md
```
InventoryManagement/
  frontend/web/                # Next.js App Router
  backend/                     # FastAPI app
  docker-compose.yml
  kubernetes/                  # manifests Argo CD syncs
    base/
      frontend/
      backend/
    envs/
      staging/
  .github/workflows/
    web-ci.yml
    build-images.yml
  MVP.md
  ARCHITECTURE.md
  README.md
```
```

---

## 5) Milestones (each milestone is many small “1-file” commits)

### Milestone A — Frontend Dashboard + Imports (Mock Data)
Goal: `/dashboard` looks real, and `/dashboard/imports` can upload + preview a CSV and load it into the dashboard as mock data.
- Add `/dashboard` route
- Add `MetricCard` component
- Add `AtRiskTable` component
- Add search/filter with `useState` and `.filter()`
- Use a single mock data module for now
- Add `/dashboard/imports` route
- Add CSV upload input with `FileReader`
- Parse CSV into rows (PapaParse preferred; basic split acceptable)
- Show a preview table (first 5–10 rows)
- Save parsed rows to localStorage (e.g., inventorypilot:uploadedRows)
- Update /dashboard to read from localStorage first, falling back to the static mock module

✅ Done when: typing in a search box filters table rows, the imports page previews uploaded CSV data, and the dashboard can render metrics/table from the uploaded mock data.

---

### Milestone B — FastAPI Skeleton + OpenAPI
Goal: Backend runs locally and returns hard-coded JSON.
- Add `backend/app/main.py`
- Add:
  - `/api/healthz`
  - `/api/dashboard/summary`
  - `/api/products`

✅ Done when: `http://localhost:8000/docs` works and endpoints return JSON.

---

### Milestone C — Frontend → Backend Integration (Local)
Goal: Dashboard uses real API responses (even if still hard-coded backend).
- Add `frontend/web/src/lib/api.ts` fetch wrapper
- Update dashboard to fetch:
  - `dashboard/summary`
  - `products`
- Add loading and error UI states

✅ Done when: the dashboard values change based on API JSON.

---

### Milestone D — Dockerize + Compose (Local Full Stack)
Goal: one command runs the stack locally.
- Add `frontend/web/Dockerfile`
- Add `backend/Dockerfile`
- Add or update `docker-compose.yml`
  - frontend
  - backend
  - postgres (local dev only)

✅ Done when: `docker-compose up --build` runs web + api.

---

### Milestone E — AWS Setup + ECR Push
Goal: images are in ECR (this enables EKS deploy).
- Create AWS account + enable MFA
- Install tooling: awscli, kubectl, eksctl, helm
- Create ECR repos:
  - `inventorypilot-frontend`
  - `inventorypilot-backend`
- Push images to ECR:
  - tag strategy: `:sha-<commit>` or `:latest` (prefer sha tags)

✅ Done when: ECR shows both images.

---

### Milestone F — EKS + RDS (Minimal, Correct)
Goal: backend in EKS can reach RDS securely.

**EKS**
- Create cluster (eksctl)
- Create managed node group

**RDS Postgres**
- Create RDS Postgres instance
- Ensure VPC/network compatibility with EKS
- Security groups:
  - allow inbound TCP 5432 to RDS from EKS node security group

✅ Done when: a pod in the cluster can connect to RDS host:5432.

---

### Milestone G — Kubernetes Manifests + First Deploy (Manual)
Goal: deploy app on EKS with kubectl first (before Argo).
- `kubernetes/base/backend/`
  - Deployment + Service
  - Secret for DATABASE_URL
- `kubernetes/base/frontend/`
  - Deployment + Service
  - env var `NEXT_PUBLIC_API_URL` points to backend service/ingress URL

✅ Done when: frontend is reachable and can call backend.

---

### Milestone H — Argo CD GitOps
Goal: Argo CD syncs from GitHub.
- Install Argo CD (namespace `argocd`)
- Add Argo `Application` pointing at:
  - repoURL
  - path: `kubernetes/envs/staging`
- Sync works (manual or automated)

✅ Done when: pushing a manifest change updates the cluster via Argo.

---

### Milestone I — GitHub Actions (CI + Build/Push)
Goal: main branch runs CI and publishes images.

- `web-ci.yml`
  - install, lint, build (frontend/web)

- `build-images.yml`
  - build frontend/backend images
  - login to ECR
  - push images with sha tag
  - update the deploy reference in repo (image tag update in staging manifests)

✅ Done when: push to main → images update → Argo rolls out.

---

## 6) Minimal Forecasting Logic (MVP-Professional, Not ML)

Note: the Milestone A CSV upload is frontend-only mock data; later it maps cleanly to POST /api/sales/import-csv when the backend is implemented.

Use a transparent heuristic that supports explainability in UI:
- avg_daily = (sales over last N days) / N
- lead_time_demand = avg_daily * lead_time_days
- safety_stock = 0.15 * lead_time_demand (or small constant)
- reorder_point = lead_time_demand + safety_stock
- recommended_qty = max(0, reorder_point - available)

API returns:
- recommended_qty
- days_left
- explanation fields (so UI can show “Why recommend X?”)

This is aligned with ARCHITECTURE.md and looks professional because it’s consistent + explainable.

---

## 7) Professional UI Requirements (Minimum Bar)

To look “legit” for LinkedIn, the MVP must include:
- Consistent typography and spacing (Tailwind / shadcn)
- A real dashboard layout (header + cards + table)
- Loading state (skeleton or “Loading…”)
- Error state (small banner)
- No obvious placeholder nonsense (“Lorem ipsum” is okay once, not everywhere)
- A clean README + screenshots/gif

---

## 8) Environment Variables (MVP)

Frontend:
- `NEXT_PUBLIC_API_URL`

Backend:
- `DATABASE_URL`
- `CORS_ORIGINS`

DB creds:
- stored in Kubernetes Secret (MVP), rotate later.

---

## 9) Evidence (What to show on LinkedIn)

When done, prepare:
- 30–60s demo video: landing → dashboard → filtered table → API docs → Argo sync page
- screenshot of:
  - Argo CD application synced
  - EKS workloads running
  - RDS instance (no credentials shown)
- link to GitHub repo + live URL
- a short architecture diagram (ARCHITECTURE.md already has it)
