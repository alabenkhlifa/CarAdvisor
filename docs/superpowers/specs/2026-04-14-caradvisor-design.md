# CarAdvisor — Design Specification

## Context

CarAdvisor is a web application that helps users in Tunisia and Germany find and compare cars (new and used) based on their budget and preferences. It combines rule-based filtering with AI-powered conversational recommendations via Groq's free API tier. The project is built as a monorepo with a NestJS backend, React frontend, and PostgreSQL database, all containerized with Docker Compose for deployment on a single OVH VPS.

**Problem:** Car buyers in Tunisia and Germany lack a unified, easy-to-use tool that adapts to their local market, currency, and available inventory. Existing sites are fragmented, market-specific, and don't offer intelligent recommendations.

**Solution:** A mobile-first website where anonymous users select their market, fill out a quick preference form, and get AI-guided car recommendations through a chat interface — with side-by-side comparison capabilities.

---

## Markets & Data

### Supported Markets (Launch)

| Market | Code | Currency | Condition | Data Source |
|--------|------|----------|-----------|-------------|
| Tunisia | `tn` | TND | New + Used | CSV (`/data/tn_cars.csv`), updated daily via GitHub |
| Germany | `de` | EUR | Used | CSV (`/data/de_cars.csv`), scraped from AutoScout24 |

US market deferred to a future phase.

### Data Pipeline

- CSV files live in `/data` within the monorepo
- NestJS CRON job runs daily at 3:00 AM
- Pipeline: Read CSV → Parse/validate → Match/create brand+model → Upsert vehicles (dedup by `source_id`) → Mark missing vehicles as `is_available=false` → Log to `import_logs`
- Each import run is logged with row counts and errors

---

## Architecture

### System Overview

Single OVH VPS running Docker Compose with 4 services:

- **nginx** (port 80/443) — Reverse proxy, serves React static build, routes `/api/*` to NestJS
- **api** (port 3000) — NestJS backend with REST API, CRON jobs, Groq integration
- **web** (port 5173 dev only) — React/Vite dev server (prod: static build served by Nginx)
- **db** (port 5432) — PostgreSQL 16 with persistent volume

### Monorepo Structure

```
CarAdvisor/
├── backend/           # NestJS API
│   ├── src/modules/   # vehicles, markets, brands, chat, import
│   ├── src/common/    # filters, pipes, interceptors
│   ├── src/config/    # env config
│   ├── test/
│   └── Dockerfile
├── frontend/          # React SPA
│   ├── src/pages/     # Landing, Home, Recommendations, Compare, CarDetail
│   ├── src/components/
│   ├── src/hooks/
│   ├── src/services/  # API client
│   ├── src/i18n/      # en.json, fr.json
│   ├── src/store/     # localStorage management
│   └── Dockerfile
├── shared/            # Shared TypeScript types
│   └── types/         # vehicle.ts, market.ts, chat.ts
├── data/              # CSV data files (git-synced)
├── nginx/             # nginx.conf
├── docker-compose.yml
└── docker-compose.dev.yml
```

---

## Database Schema

### Tables

**brands**
- `id` (PK), `name`, `logo_url`, `country`, `created_at`, `updated_at`

**models**
- `id` (PK), `brand_id` (FK→brands), `name`, `body_type` (enum: sedan/suv/hatchback/minivan/coupe/convertible/wagon/pickup), `fuel_types` (text[]), `year_start`, `year_end`, `created_at`, `updated_at`

**markets**
- `id` (PK), `code` (unique: tn/de/us), `name`, `currency`, `locale`, `is_active`, `created_at`, `updated_at`

**vehicles** (main table)
- `id` (PK), `model_id` (FK→models), `market_id` (FK→markets)
- `trim_name`, `year`, `condition` (enum: new/used), `price` (decimal)
- `mileage_km` (null if new), `fuel_type`, `transmission`, `engine_size`, `horsepower`
- `color`, `features` (JSONB), `image_url`, `source_url`, `source_id` (dedup key)
- `is_available` (bool), `listed_at`, `created_at`, `updated_at`

**chat_sessions**
- `id` (PK, UUID), `session_token` (unique), `market_id` (FK→markets)
- `preferences` (JSONB), `messages` (JSONB array), `created_at`, `updated_at`, `expires_at` (30-day TTL)

**import_logs**
- `id` (PK), `market_code`, `filename`, `rows_processed`, `rows_inserted`, `rows_updated`, `errors` (JSONB), `started_at`, `completed_at`

---

## API Design

### REST Endpoints

**Markets**
- `GET /api/markets` — List active markets

**Vehicles**
- `GET /api/vehicles?market=tn&condition=new&min_price=X&max_price=X&body_type=suv&fuel=petrol&sort=price&page=1` — Search/filter with pagination
- `GET /api/vehicles/:id` — Full vehicle details
- `POST /api/vehicles/compare` — Body: `{ ids: [1,2,3] }` → side-by-side data

**Brands & Models**
- `GET /api/brands?market=tn` — Brands available in a market
- `GET /api/brands/:id/models` — Models for a brand

**AI Chat**
- `POST /api/chat` — Body: `{ message, session_token?, preferences }` → Streamed Groq response
- `GET /api/chat/:session_token/history` — Retrieve chat history

### Recommendation Pipeline

Three-stage process:

1. **Filter (SQL):** Query vehicles matching user's market, budget range, condition, body type, fuel type, and transmission preferences. Returns 10-50 candidates.
2. **Score (Server):** Weighted ranking — price fit (30%), feature match (25%), fuel economy (20%), year/mileage (15%), popularity (10%). Selects top 5-10.
3. **Explain (Groq LLM):** System prompt with top candidates JSON + user preferences → streamed natural language recommendations with per-car pros/cons.

---

## Frontend

### Tech Stack

- React 18 + Vite
- TailwindCSS (light theme)
- react-router-dom v6
- react-i18next (English + French)
- Groq response streaming via fetch + ReadableStream

### Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing | Market selection (Tunisia / Germany) |
| `/home` | Home | Quick preference form (budget slider, condition, body type, fuel, transmission) |
| `/recommendations` | Recommendations | AI chat panel + results grid with compare checkboxes |
| `/compare` | Compare | Side-by-side specs table with AI summary |
| `/car/:id` | Car Detail | Full specs, photos, similar cars, source link |

### localStorage Keys

| Key | Value | Purpose |
|-----|-------|---------|
| `ca_market` | `"tn"` / `"de"` | Selected market |
| `ca_lang` | `"en"` / `"fr"` | UI language |
| `ca_preferences` | `{ budget, fuel, body... }` | Last search preferences |
| `ca_session` | UUID string | Chat session token |
| `ca_favorites` | `[vehicle_id, ...]` | Bookmarked cars |

Clear All button in footer/settings resets all keys.

### Mobile-First Design

- Designed for 375px+ viewport first, scales up for tablet/desktop
- Chat panel: bottom sheet on mobile, sidebar on desktop
- Results: single-column cards on mobile, grid on desktop
- Light theme throughout (no dark mode)

---

## Internationalization

- Two languages: English (default) and French
- Translation files: `frontend/src/i18n/en.json` and `fr.json`
- Language selector in header, persisted in `ca_lang`
- AI chat responses: Groq system prompt includes user's language preference so responses match
- Currency formatting: Intl.NumberFormat with market's locale/currency

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 10, TypeORM, @nestjs/schedule, class-validator, Groq SDK |
| Frontend | React 18, Vite, TailwindCSS, react-i18next, react-router-dom |
| Database | PostgreSQL 16, TypeORM migrations, JSONB columns |
| Infrastructure | Docker Compose, Nginx, OVH VPS (cheapest tier) |
| AI | Groq free tier (Llama/Mixtral models) |
| Testing | Jest (backend), Vitest (frontend), Supertest (E2E) |
| CI/CD | GitHub Actions |

---

## Agentic Coding Harness

### CLAUDE.md Configuration

The project CLAUDE.md will contain:
- Project overview and architecture description
- Build and run commands (docker compose, npm scripts)
- Code conventions (NestJS module pattern, React hooks, shared types)
- Database info (TypeORM entities, migration commands)
- Testing commands and patterns
- Available MCP servers and their purpose

### MCP Servers

- **chrome-devtools** — Live browser testing, screenshots, performance auditing during frontend development
- **jira** — Task tracking integration (if using Jira)

### Development Workflow

- `docker compose -f docker-compose.dev.yml up` — Start all services with hot reload
- Backend and frontend both support hot reload in dev mode
- Shared types consumed via TypeScript path aliases (`@shared/types`) in both backend and frontend tsconfigs
- TypeORM migrations for schema changes

---

## Hosting & Deployment

### OVH VPS

- Cheapest VPS tier (Starter or equivalent)
- Ubuntu 24.04 LTS
- Docker + Docker Compose installed
- Nginx handles SSL via Let's Encrypt (certbot)
- Domain pointing to VPS IP

### Deployment Flow

1. Push to `main` branch
2. GitHub Actions: build Docker images, run tests
3. SSH into VPS, `git pull`, `docker compose up -d --build`
4. Nginx serves the updated app

---

## Verification Plan

1. **Data pipeline:** Import a sample CSV, verify vehicles appear in database with correct brand/model hierarchy
2. **API:** Hit each endpoint with curl/Postman, verify correct filtering and pagination
3. **Recommendation:** Submit preferences → verify filter → score → Groq pipeline returns streamed recommendations
4. **Frontend:** Load each page on mobile viewport (375px), verify responsive layout
5. **Comparison:** Select 2-3 cars, verify side-by-side table renders correctly
6. **i18n:** Switch language, verify all strings update including AI responses
7. **localStorage:** Set preferences, close browser, reopen — verify persistence. Test clear button.
8. **Docker:** `docker compose up` from clean state, verify all 4 services start and communicate
9. **CRON:** Trigger import job manually, verify logs and data updates
