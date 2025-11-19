# InventoryPilot - System Architecture & Implementation Plan

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      FRONTEND LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Next.js 15 App (TypeScript + React)                      │   │
│  │  - Landing Page (Marketing site)                         │   │
│  │  - Dashboard (Authenticated app)                         │   │
│  │  - Component Library (Shadcn/ui + Tailwind)              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              │ REST API (fetch/axios)            │
└──────────────────────────────┼───────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                      BACKEND LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ FastAPI (Python 3.11+)                                   │   │
│  │  - REST API endpoints                                    │   │
│  │  - Business logic & forecasting engine                   │   │
│  │  - CSV import processing                                 │   │
│  │  - Authentication (JWT)                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              │ SQLAlchemy ORM                    │
└──────────────────────────────┼───────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                      DATABASE LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ PostgreSQL 15                                            │   │
│  │  - Products table                                        │   │
│  │  - Inventory levels table                                │   │
│  │  - Sales history table                                   │   │
│  │  - Forecasts table                                       │   │
│  │  - Recommendations table                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Docker     │  │  Kubernetes  │  │ GitHub       │           │
│  │  Containers  │  │  Cluster     │  │ Actions CI/CD│           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack Deep Dive

### **Frontend Stack**
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components
- **State Management**: React Context + hooks (zustand for complex state later)
- **Charts**: Recharts or Chart.js
- **HTTP Client**: fetch API (native) or axios

### **Backend Stack**
- **Framework**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy 2.0 / SQLModel
- **Validation**: Pydantic v2
- **Auth**: JWT tokens (python-jose)
- **CORS**: FastAPI CORS middleware

### **Database**
- **Primary DB**: PostgreSQL 15
- **Migration Tool**: Alembic

### **DevOps/Infrastructure**
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (minikube for local, cloud for prod)
- **CI/CD**: GitHub Actions
- **Cloud**: (TBD - AWS EKS, GCP GKE, or DigitalOcean Kubernetes)

---

## 3. Project Directory Structure

```
InventoryManagement/
│
├── frontend/                       # Next.js application
│   ├── app/                        # Next.js 15 app directory
│   │   ├── (marketing)/            # Landing page group
│   │   │   ├── page.tsx            # Home/landing page
│   │   │   ├── pricing/page.tsx    # Pricing page
│   │   │   └── layout.tsx          # Marketing layout
│   │   │
│   │   ├── (dashboard)/            # Dashboard group (authenticated)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx        # Main dashboard
│   │   │   ├── products/
│   │   │   │   ├── page.tsx        # Products list
│   │   │   │   └── [id]/page.tsx   # Product detail
│   │   │   ├── forecasts/
│   │   │   │   └── page.tsx        # Forecasts view
│   │   │   ├── imports/
│   │   │   │   └── page.tsx        # CSV import page
│   │   │   └── layout.tsx          # Dashboard layout
│   │   │
│   │   ├── api/                    # API routes (optional proxy)
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css             # Global styles
│   │
│   ├── components/                 # React components
│   │   ├── landing/                # Landing page components
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── CTA.tsx
│   │   │   └── Navbar.tsx
│   │   │
│   │   ├── dashboard/              # Dashboard components
│   │   │   ├── MetricCard.tsx
│   │   │   ├── AtRiskTable.tsx
│   │   │   ├── OrderQtyChart.tsx
│   │   │   ├── RecommendationCard.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── imports/                # Import flow components
│   │   │   ├── CSVUploader.tsx
│   │   │   ├── DataPreview.tsx
│   │   │   └── ImportProgress.tsx
│   │   │
│   │   └── ui/                     # Shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── table.tsx
│   │       ├── dialog.tsx
│   │       └── ...
│   │
│   ├── lib/                        # Utilities
│   │   ├── api.ts                  # API client
│   │   ├── utils.ts                # Helper functions
│   │   └── types.ts                # TypeScript types
│   │
│   ├── public/                     # Static assets
│   ├── tailwind.config.ts          # Tailwind configuration
│   ├── next.config.js              # Next.js config
│   ├── tsconfig.json               # TypeScript config
│   ├── package.json
│   └── Dockerfile                  # Frontend Docker image
│
├── backend/                        # FastAPI application
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── config.py               # Configuration
│   │   │
│   │   ├── api/                    # API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── dashboard.py        # Dashboard endpoints
│   │   │   ├── products.py         # Products CRUD
│   │   │   ├── inventory.py        # Inventory endpoints
│   │   │   ├── sales.py            # Sales import
│   │   │   ├── forecasts.py        # Forecasting endpoints
│   │   │   └── recommendations.py  # Recommendations
│   │   │
│   │   ├── models/                 # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── product.py
│   │   │   ├── inventory.py
│   │   │   ├── sales.py
│   │   │   ├── forecast.py
│   │   │   └── recommendation.py
│   │   │
│   │   ├── schemas/                # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── product.py
│   │   │   ├── dashboard.py
│   │   │   └── ...
│   │   │
│   │   ├── services/               # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── forecast_engine.py  # Forecasting logic
│   │   │   ├── recommendation.py   # Reorder calculations
│   │   │   └── csv_processor.py    # CSV parsing
│   │   │
│   │   ├── database/               # Database setup
│   │   │   ├── __init__.py
│   │   │   ├── session.py          # DB session
│   │   │   └── base.py             # Base model
│   │   │
│   │   └── utils/                  # Utilities
│   │       └── __init__.py
│   │
│   ├── alembic/                    # Database migrations
│   ├── tests/                      # Backend tests
│   ├── requirements.txt            # Python dependencies
│   ├── Dockerfile                  # Backend Docker image
│   └── .env.example                # Environment variables
│
├── kubernetes/                     # K8s manifests
│   ├── frontend-deployment.yaml
│   ├── backend-deployment.yaml
│   ├── postgres-deployment.yaml
│   ├── ingress.yaml
│   └── configmap.yaml
│
├── .github/
│   └── workflows/
│       ├── ci.yaml                 # CI pipeline
│       └── cd.yaml                 # CD pipeline
│
├── docker-compose.yml              # Local dev environment
├── ARCHITECTURE.md                 # This file
├── CLAUDE.md                       # AI assistant context
└── README.md                       # Project readme
```

---

## 4. Component Hierarchy & Data Flow

### **Landing Page Flow**
```
LandingPage (/)
├── Navbar
│   ├── Logo
│   ├── Navigation Links
│   └── CTA Button (Sign In / Get Started)
├── Hero Section
│   ├── Headline
│   ├── Subheadline
│   ├── CTA Buttons
│   └── Hero Image/Animation
├── Features Section
│   ├── Feature Card 1 (Inventory Tracking)
│   ├── Feature Card 2 (Demand Forecasting)
│   ├── Feature Card 3 (Smart Recommendations)
│   └── Feature Card 4 (Easy Imports)
├── Social Proof
│   └── Stats/Testimonials
├── CTA Section
│   ├── Final pitch
│   └── Get Started Button
└── Footer
    ├── Links
    └── Copyright
```

### **Dashboard Flow**
```
DashboardLayout (/dashboard)
├── Sidebar (persistent)
│   ├── Logo
│   ├── Navigation Menu
│   │   ├── Dashboard (active)
│   │   ├── Products
│   │   ├── Forecasts
│   │   └── Imports
│   └── User Profile
│
└── Main Content Area
    ├── Dashboard Page
    │   ├── Header
    │   │   ├── Page Title
    │   │   └── User Avatar
    │   ├── Metrics Row
    │   │   ├── MetricCard (Total SKUs: 150)
    │   │   ├── MetricCard (At Risk SKUs)
    │   │   └── MetricCard (Order Qty: $270)
    │   ├── At-Risk Products Section
    │   │   ├── Section Header
    │   │   └── AtRiskTable
    │   │       ├── Table Headers (SKU, Name, On-Hand, Days Left, Rec Qty)
    │   │       └── Table Rows
    │   │           └── Row Click → Product Detail Modal
    │   └── Chart Section
    │       └── OrderQtyChart (In/Least toggle)
    │
    ├── Product Detail Modal/Page
    │   ├── Product Info Card
    │   ├── Recommendation Breakdown
    │   │   ├── "Why Recommend X units?"
    │   │   ├── Average weekly demand
    │   │   ├── Lead time demand
    │   │   ├── Safety stock
    │   │   ├── Reorder point
    │   │   └── Calculation: 178.6 ~ 80 = 99
    │   └── Actions
    │       └── Generate PO / Dismiss
    │
    └── Import Page (/dashboard/imports)
        ├── CSV Upload Component
        │   ├── Drag & Drop Zone
        │   ├── File Selection
        │   └── Upload Button
        ├── Data Preview Table
        │   ├── Column Mapping
        │   └── Sample Rows
        ├── Import Configuration
        │   ├── Data Type Selection (Sales/Inventory/Products)
        │   └── Date Range
        └── Import Progress
            ├── Progress Bar
            └── Success/Error Messages
```

---

## 5. Data Models

### **Frontend TypeScript Types**
```typescript
// Product
interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  lead_time_days: number;
  unit_cost: number;
}

// Inventory
interface InventoryLevel {
  product_id: string;
  on_hand: number;
  allocated: number;
  available: number;
  last_updated: string;
}

// Sales
interface SalesRecord {
  id: string;
  product_id: string;
  date: string;
  quantity_sold: number;
}

// Forecast
interface Forecast {
  product_id: string;
  forecast_date: string;
  predicted_demand: number;
  confidence_interval: [number, number];
}

// Recommendation
interface Recommendation {
  product_id: string;
  product: Product;
  inventory: InventoryLevel;
  avg_weekly_demand: number;
  lead_time_demand: number;
  safety_stock: number;
  reorder_point: number;
  recommended_order_qty: number;
  days_left: number;
  explanation: RecommendationExplanation;
}

interface RecommendationExplanation {
  avg_weekly_demand: number;
  lead_time_demand: number;
  safety_stock_95: number;
  reorder_point: number;
  current_stock: number;
  calculation: string; // "178.6 ~ 80 = 99"
}

// Dashboard Summary
interface DashboardSummary {
  total_skus: number;
  at_risk_skus: number;
  total_order_qty: number;
  total_order_value: number;
  at_risk_products: Recommendation[];
}
```

### **Backend Database Schema** (simplified)
```sql
-- products table
CREATE TABLE products (
    id UUID PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    lead_time_days INTEGER DEFAULT 7,
    unit_cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- inventory_levels table
CREATE TABLE inventory_levels (
    id UUID PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    on_hand INTEGER NOT NULL,
    allocated INTEGER DEFAULT 0,
    available INTEGER GENERATED ALWAYS AS (on_hand - allocated) STORED,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- sales_history table
CREATE TABLE sales_history (
    id UUID PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    sale_date DATE NOT NULL,
    quantity_sold INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- forecasts table
CREATE TABLE forecasts (
    id UUID PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    forecast_date DATE NOT NULL,
    predicted_demand DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- recommendations table
CREATE TABLE recommendations (
    id UUID PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    avg_weekly_demand DECIMAL(10,2),
    lead_time_demand DECIMAL(10,2),
    safety_stock DECIMAL(10,2),
    reorder_point DECIMAL(10,2),
    recommended_order_qty INTEGER,
    days_left DECIMAL(5,2),
    explanation JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. API Endpoints Design

### **Dashboard**
- `GET /api/dashboard/summary` → DashboardSummary
  - Returns: total SKUs, at-risk count, order qty, at-risk products list

### **Products**
- `GET /api/products` → List[Product]
- `GET /api/products/{id}` → Product
- `POST /api/products` → Product (create)
- `PUT /api/products/{id}` → Product (update)
- `DELETE /api/products/{id}` → 204 No Content

### **Inventory**
- `GET /api/inventory` → List[InventoryLevel]
- `GET /api/inventory/{product_id}` → InventoryLevel
- `PUT /api/inventory/{product_id}` → InventoryLevel (update)

### **Sales**
- `POST /api/sales/import-csv` → ImportResult
  - Body: CSV file upload
  - Returns: { imported: 1250, errors: [] }

### **Forecasts**
- `GET /api/forecasts` → List[Forecast]
- `POST /api/forecasts/run` → { status: "success", products_forecasted: 150 }

### **Recommendations**
- `GET /api/recommendations` → List[Recommendation]
- `GET /api/recommendations/{product_id}` → Recommendation
- `POST /api/recommendations/run` → { status: "success", products_analyzed: 150 }

---

## 7. Design System & Color Scheme

Based on ResuMax inspiration (modern, clean, professional with subtle flair):

### **Color Palette**
```
Primary Colors:
- Navy/Dark Blue: #0A1628 (main backgrounds)
- Electric Blue: #3B82F6 (primary CTA, links)
- Cyan/Aqua: #06B6D4 (accents, charts)

Secondary Colors:
- Purple: #8B5CF6 (charts, highlights)
- Yellow/Gold: #F59E0B (warning/at-risk indicators)
- Green: #10B981 (success states)
- Red: #EF4444 (critical alerts)

Neutrals:
- Dark backgrounds: #0F172A, #1E293B, #334155
- Light text: #F8FAFC, #E2E8F0
- Muted text: #94A3B8, #64748B
- Borders: #334155

Dashboard specific:
- Card backgrounds: #1E293B with subtle gradient
- Hover states: #334155
- Chart colors: Blue (#3B82F6) + Purple (#8B5CF6)
```

### **Typography**
- **Headings**: Inter or Geist (modern sans-serif)
- **Body**: System fonts (Segoe UI, Roboto, etc.)
- **Monospace** (for SKUs, numbers): JetBrains Mono or Fira Code

### **Component Style Guidelines**
- **Rounded corners**: 12px for cards, 8px for buttons
- **Shadows**: Subtle, elevated feel (shadow-xl for cards)
- **Spacing**: Generous padding (p-6 for cards, p-4 for smaller elements)
- **Borders**: Minimal, use subtle borders (#334155) or shadows instead

---

## 8. MVP Feature Checklist (Week 1 Goal)

### **Must Have (Core MVP)**
✅ Landing page with hero + features
✅ Dashboard with:
  - 3 metric cards (Total SKUs, At Risk, Order Qty)
  - At-Risk Products table
  - Basic chart (In/Least toggle)
✅ Product detail view/modal with recommendation breakdown
✅ CSV import page (UI only, mock backend initially)
✅ Docker setup (frontend + backend + postgres)
✅ Basic Kubernetes manifests
✅ Responsive design (mobile-friendly)

### **Nice to Have (If time permits)**
⭕ Full CRUD for products
⭕ Real forecasting logic (vs mock data)
⭕ User authentication
⭕ GitHub Actions CI/CD
⭕ Deploy to cloud K8s cluster

### **Post-MVP (Week 2+)**
- Advanced forecasting (ML models)
- Export recommendations to CSV/PDF
- Purchase order generation
- Multi-user support
- Analytics dashboard

---

## 9. Docker & Kubernetes Strategy

### **Docker Compose (Local Dev)**
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/inventorypilot
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=inventorypilot
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### **Kubernetes Deployment Highlights**
- **Frontend**: Deployment + Service (LoadBalancer or Ingress)
- **Backend**: Deployment + Service (ClusterIP)
- **PostgreSQL**: StatefulSet + PersistentVolumeClaim
- **Ingress**: Nginx Ingress Controller for routing
- **ConfigMaps**: Environment variables
- **Secrets**: Database credentials, API keys

This gives you:
- ✅ Docker keywords (multi-stage builds, docker-compose)
- ✅ Kubernetes keywords (deployments, services, ingress, statefulsets)
- ✅ DevOps best practices (CI/CD pipeline, containerization)

---

## 10. Success Metrics for MVP

By end of Week 1, you should have:
1. ✅ Landing page live (looks professional, ResuMax-inspired design)
2. ✅ Dashboard functional with mock data
3. ✅ CSV upload UI working (backend can be mocked)
4. ✅ Recommendation breakdown view
5. ✅ Docker Compose running locally (all 3 services)
6. ✅ Basic K8s manifests ready (doesn't have to be deployed yet)
7. ✅ Codebase on GitHub with clean commit history
8. ✅ README with setup instructions

This should be enough for:
- **Resume bullet**: "Built full-stack inventory management SaaS with Next.js, FastAPI, PostgreSQL, deployed with Docker and Kubernetes"
- **Portfolio piece**: Live demo (even if mock data) + GitHub repo
- **Interview talking points**: Can discuss architecture, tech choices, K8s setup

---

## Next Steps

See `UI_IMPLEMENTATION_PLAN.md` for detailed step-by-step UI building strategy.
