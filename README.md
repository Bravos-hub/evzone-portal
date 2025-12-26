## EVzone Portal (Aggregator & CPMS)

A role-based admin/ops portal built with **Vite + React + TypeScript**, using **Tailwind CSS** for styling and **mocked data** to simulate real analytics dashboards (Admin, Operator, Owners, Site Owners, Station roles, Technicians).

### Highlights
- **Role-based navigation (RBAC)** with route guards
- **Dashboard layouts per role** with realistic mocked KPIs, tables, queues, and maps
- **Global theming** via Tailwind tokens + a typed theme object
- **Data layer** wired with `@tanstack/react-query` (mock repositories today; ready for real APIs later)

---

## Quick Start

### Prerequisites
- Node.js (LTS recommended)
- npm (comes with Node)

### Install
```bash
npm install
```

### Run (dev)
```bash
npm run dev
```

App runs at `http://localhost:5173/`.

### Build (production)
```bash
npm run build
```

### Preview build
```bash
npm run preview
```

---

## Scripts
- **`npm run dev`**: start Vite dev server
- **`npm run build`**: typecheck + build production bundle
- **`npm run preview`**: preview the production build locally
- **`npm run lint`**: run ESLint

---

## Project Structure

```text
src/
  app/                  App shell, layouts, providers, routing
  core/                 Auth, scope, config, shared domain types
  data/                 Mock DB + repository interfaces + react-query keys
  features/             Role-based features and dashboards
  pages/                Auth, errors, landing, onboarding
  ui/
    components/         Reusable UI components (Card, Header, Sidebar, maps)
    theme.ts            Typed theme tokens (aligned with Tailwind + CSS)
    theme/              Theme provider/hook (context)
styles.css              Tailwind layers + component primitives (.btn, .card, .table…)
```

---

## Dashboard Layouts (Wireframes)

These Mermaid diagrams describe **what each dashboard contains and how it is arranged** (high-level UI “shape”), not routing.

### Admin Overview (`/admin`)
```mermaid
flowchart TB
  subgraph A["Admin Overview"]
    direction TB
    K["KPI Row (4-up)<br/>Total stations | Incidents 24h | Revenue 30d | SLA"] --> M
    M["Main Row (2 cols)<br/>Left: World metrics map (choropleth + metric switch)<br/>Right: Region distribution table"] --> W
    W["Worldwide Alerts<br/>Incidents list | Dispatch queue | Compliance queue"] --> F
    F["Bottom Row (2 cols)<br/>Left: Financial & settlement (payment exceptions + exports)<br/>Right: Governance & reliability (audit + health + comms)"]
  end
```

### Admin Stations (`/admin/stations`)
```mermaid
flowchart TB
  subgraph S["Admin Stations"]
    direction TB
    FLT["Filters Bar<br/>Search | Region | Org | Type | Status | Bulk actions"] --> SUM
    SUM["Summary Chips<br/>Counts: total | online | degraded | offline | incidents | avg health"] --> TOP
    TOP["Top Row (2 cols)<br/>Left: Station Map (heatmap + dots + tooltip)<br/>Right: Watchlist (degraded | repeat incidents | heartbeat gaps)"] --> TBL
    TBL["Stations Table<br/>Select | Status pill | Health/Utilization | Row actions"] --> DRW
    DRW["Station Drawer (right)<br/>Overview | Assets | Incidents | Config + quick actions"]
  end
```

### Generic Role Dashboard Pattern (Operator / Owner / Manager / Attendant / Technician)
```mermaid
flowchart TB
  subgraph R["Role Dashboard (Pattern)"]
    direction TB
    K2["KPI Row<br/>Role-specific KPIs"] --> G
    G["Primary Grid<br/>Left: Performance/Activity<br/>Right: Queue/Alerts"] --> B
    B["Secondary Grid<br/>Tables | Panels | Quick actions"] --> X
    X["Detail Views<br/>Drawers/modals as needed"]
  end
```

---

## Auth & Data (Reference Diagrams)

### Auth & RBAC Flow
```mermaid
sequenceDiagram
  participant UI as UI
  participant Auth as authStore
  participant Guard as RequireRole
  participant Router as Router

  UI->>Auth: login(role,name,capability)
  Auth-->>UI: user set
  UI->>Router: navigate(/)
  Router->>Guard: check user + role
  alt allowed
    Guard-->>Router: allow
    Router-->>UI: render DashboardLayout + page
  else denied
    Guard-->>Router: redirect /errors/unauthorized
    Router-->>UI: UnauthorizedPage
  end
```

### Data Layer (Mock Today, API Tomorrow)
```mermaid
flowchart LR
  Page["Feature page"] --> RQ["react-query"]
  RQ --> Repo["Repository interface"]
  Repo --> Mock["mockDb/*"]
  Repo -. future .-> API["Real API"]
```

---

## Theming & UI System

### Where the theme lives
- **Tailwind tokens**: `tailwind.config.cjs`
- **Global CSS primitives**: `src/styles.css` (`@layer components` defines `.btn`, `.card`, `.panel`, `.table`, `.pill`, etc.)
- **Typed theme object**: `src/ui/theme.ts`
- **Theme provider + hook**: `src/ui/theme/provider.tsx`

### Usage
To access the theme anywhere:
```ts
import { useTheme } from '@/ui/theme/provider'

const t = useTheme()
console.log(t.colors.accent.DEFAULT)
```

Note: There is both a **file** `src/ui/theme.ts` and a **folder** `src/ui/theme/`. The provider/hook is imported from `@/ui/theme/provider`.

---

## Dashboards & Mock Analytics

Dashboards are implemented under `src/features/<role>/...` and use mocked datasets to simulate:
- KPIs (stations, sessions, revenue, SLA, incidents)
- Queues (incidents, dispatches, compliance items)
- Tables and drill-downs
- Real “map feel” components:
  - **`WorldChoroplethMap`**: real world country outlines (TopJSON) shaded by region metrics (composite or per-metric)
  - **`StationsHeatMap`**: world map + station dots (status/health/incidents hover details)

Mock data lives in `src/data/mockDb/*` and some pages keep self-contained mocks for UI prototyping.

---

## Adding Real APIs Later

Recommended path:
1. Keep the **repository interfaces** in `src/data/repositories/interfaces/*`.
2. Implement API-backed repositories (e.g., `src/data/repositories/http/*`).
3. Replace mock calls behind the same interfaces without changing pages.

---

## Contributing

### Commit hygiene
- Keep commits focused and descriptive.
- Run `npm run build` before pushing.

### Line endings (Windows)
You may see warnings about `LF` ↔ `CRLF`. They’re generally safe on Windows unless you enforce strict LF via `.gitattributes`.

---

## License

Proprietary / internal by default unless you add a LICENSE file.


