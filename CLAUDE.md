# CarAdvisor

Car recommendation website helping users in Tunisia and Germany find and compare cars (new + used). AI-powered chat via Groq. Anonymous users, no auth.

## Architecture

Monorepo with 4 directories:
- `/backend` — NestJS 10 + TypeORM + PostgreSQL 16
- `/frontend` — React 18 + Vite + TailwindCSS (light theme, mobile-first)
- `/shared` — TypeScript types shared between backend and frontend via path aliases
- `/data` — CSV files (car listings) pulled weekly from GitHub

All services run in Docker Compose. Vite proxy forwards `/api` to the NestJS container.

## Ports

- **Backend API:** 3100 (container internal + host)
- **Frontend dev:** 5274 (container internal + host)
- **PostgreSQL:** 5433 (host) → 5432 (container)
- **Vite proxy:** `/api` → `http://api:3100` (Docker network, NOT localhost)

## Commands

```bash
# Start everything
docker compose -f docker-compose.dev.yml up --build

# Rebuild a single service
docker compose -f docker-compose.dev.yml up -d --build api
docker compose -f docker-compose.dev.yml up -d --build web

# Restart without rebuild (picks up volume-mounted src changes)
docker compose -f docker-compose.dev.yml restart api

# Seed markets (run inside api container)
docker exec caradvisor-api-1 npx ts-node -r tsconfig-paths/register src/seeds/run.ts

# Import CSV data
curl -X POST http://127.0.0.1:3100/api/import/trigger?market=tn
curl -X POST http://127.0.0.1:3100/api/import/trigger?market=de

# Full refresh (download CSVs from GitHub + import)
curl -X POST http://127.0.0.1:3100/api/import/refresh

# Check DB tables
docker exec caradvisor-db-1 psql -U caradvisor -d caradvisor -c "\dt"

# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

## Important: Docker Volume Mounts

- `./backend/src` and `./frontend/src` are volume-mounted for hot reload
- Config files (`tailwind.config.js`, `vite.config.ts`, `package.json`) are NOT mounted — changes to these require `--build`
- The Vite proxy target is `http://api:3100` (Docker service name), NOT `http://localhost:3100`

## Database

PostgreSQL 16 with TypeORM. Synchronize enabled in dev (auto-creates tables from entities).

### Tables
- **brands** — id, name (unique), logoUrl, country
- **models** — id, brandId (FK), name, bodyType (enum), fuelTypes (simple-array). Unique on [brandId, name]
- **markets** — id, code (unique: tn/de), name, currency, locale, isActive
- **vehicles** — id, modelId (FK), marketId (FK), trimName, year, condition (new/used), price, mileageKm, fuelType, transmission, engineSize, horsepower, color, features (JSONB), imageUrl, sourceUrl, sourceId. Unique on [marketId, sourceId]. Index on [marketId, condition, price]
- **chat_sessions** — id (UUID), sessionToken (unique), marketId (FK), preferences (JSONB), messages (JSONB array), expiresAt
- **import_logs** — id, marketCode, filename, rowsProcessed/Inserted/Updated, errors (JSONB), startedAt, completedAt

### Entities
All in `backend/src/entities/`. Vehicle has eager ManyToOne to Model and Market. Model has ManyToOne to Brand.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| GET | /api/markets | List active markets |
| GET | /api/vehicles?market=&condition=&minPrice=&maxPrice=&bodyType=&fuelType=&transmission=&sort=&page=&limit= | Search/filter vehicles |
| GET | /api/vehicles/:id | Vehicle detail with relations |
| POST | /api/vehicles/compare | Body: {ids: [1,2,3]} → side-by-side data |
| POST | /api/vehicles/recommend | Body: {market, minPrice, maxPrice, condition, bodyType, fuelType, transmission, sort, page, limit} → paginated scored results |
| GET | /api/brands?market= | Brands with vehicles in market |
| GET | /api/brands/:id/models | Models for a brand |
| POST | /api/chat | SSE streaming chat. Body: {message, sessionToken?, market?, language?} |
| GET | /api/chat/:sessionToken/history | Chat history |
| POST | /api/import/trigger?market= | Import CSV for one market |
| POST | /api/import/refresh | Download CSVs from GitHub + import all |

## Data Pipeline

### CSV Sources (from GitHub: alabenkhlifa/automobile-tn-scrapper)
- `de_cars.csv` — AutoScout24 Germany (used cars). Columns: id, listing_url, make, model, variant, price_eur, year, mileage_km, fuel_type, power_hp, transmission, body_type, color_exterior, features...
- `tn_used_cars.csv` — automobile.tn used cars. Columns: id, brand, model, price_tnd, year, mileage_km, fuel_type, transmission, body_type, equipment_*...
- `tn_new_cars.csv` — automobile.tn new cars. Columns: id, brand, model, trim, price_tnd, engine_cc, cv_din, fuel_type, transmission, body_type...

### Import Pipeline (`backend/src/modules/import/`)
- `CsvParserService` — reads CSV, normalizes 3 different formats (de, tn_used, tn_new) into a common `NormalizedCarRow`
- `BrandMatcherService` — find-or-create brand and model entities
- `ImportService` — orchestrates: parse → match brands → upsert vehicles (dedup by sourceId) → mark missing as unavailable → log
- `ImportCron` — weekly (Sunday 3AM): downloads CSVs from GitHub, then imports all markets
- When adding `image_url` column to CSVs, the parser already reads it

## AI Chat (Groq)

### Two-Step Pipeline Architecture
The chat uses two separate LLM calls to minimize tokens and maximize accuracy:

**Step 1: Intent Extraction** (`llama-3.1-8b-instant`, ~50 output tokens, ~0 cost)
- Extracts structured JSON from user message: `{brands, models, bodyType, fuelType, transmission, condition, minBudget, maxBudget, action}`
- Reads last 4 messages for conversation context
- Only includes brands/models the user explicitly named (never guesses)
- `response_format: { type: 'json_object' }` for reliable parsing

**Step 2: DB Query** (SQL, free)
- Uses extracted intent to build precise TypeORM query with JOINs on brand.name, model.name
- Filters by price range, body type, fuel, transmission, condition
- Returns only matching cars (max 15) in compact pipe-delimited format with vehicle IDs

**Step 3: Response Generation** (`llama-3.3-70b-versatile`, max 512 tokens, streamed SSE)
- Receives only the matching cars + system prompt
- Generates concise response with markdown links: `[Car Name](/car/ID)` — clickable in the frontend
- If message is vague, asks 2-3 clarifying questions instead of recommending
- Fallback to `llama3-70b-8192` on 429 rate limit

### Key Files
- `backend/src/modules/chat/chat.controller.ts` — SSE streaming endpoint + `queryByIntent()` (precise DB query from structured intent)
- `backend/src/modules/chat/groq.service.ts` — `extractIntent()` (fast model) + `streamChat()` (main model with fallback)
- `backend/src/modules/chat/prompts/system-prompt.ts` — system prompt with link format instructions
- `frontend/src/hooks/useChat.ts` — client-side chat state + SSE stream reader
- `frontend/src/components/chat/ChatPanel.tsx` — floating chat overlay (bottom sheet mobile, floating card desktop)
- `frontend/src/components/chat/ChatMessage.tsx` — renders markdown + internal `/car/ID` links as SPA navigation

## Frontend

### Design System
- **Fonts:** DM Serif Display (headlines) + Outfit (body) — loaded from Google Fonts in index.html
- **Colors:** cream (#FAFAF7), charcoal (#1A1A1A), terracotta (#C4553A), sage (#6B8F71), peach (#FFF0EB), warmgray (#6B6B6B), surface (#FFFFFF)
- **Theme:** Light only. Warm editorial aesthetic. No dark mode.
- **Mobile-first:** Design for 375px+, scale up with `md:`, `lg:`

### Pages
| Route | Component | Description |
|-------|-----------|-------------|
| / | Landing | Market selection (Tunisia/Germany cards) |
| /home | Home | Preference form (budget slider, condition, body type, fuel, transmission) |
| /recommendations | Recommendations | Car grid (9/page) + sort + pagination + floating chat |
| /car/:id | CarDetail | Full specs, features, source link |
| /compare?ids=1,2,3 | Compare | Side-by-side comparison table |

### State (localStorage)
Keys prefixed `ca_`: ca_market, ca_lang, ca_preferences, ca_session, ca_favorites. Clear All button in footer.

### i18n
English + French. Files: `frontend/src/i18n/en.json` and `fr.json`. Always update both when adding keys.

### Key Patterns
- API services in `src/services/` (axios for REST, fetch for SSE streaming)
- Custom hooks in `src/hooks/` (useRecommendations, useVehicle, useCompare, useChat)
- localStorage hooks in `src/store/` (useMarket, usePreferences, useLanguage, useFavorites, useSession)
- UI components in `src/components/ui/` (Button, Card, Badge, RangeSlider, Select, LoadingSpinner)

## Code Conventions

- **Backend:** NestJS module pattern (module + controller + service per feature). DTOs with class-validator.
- **Frontend:** Functional components + hooks. No class components.
- **Shared types:** Import from `@shared/types` via path alias in both tsconfigs.
- **Styling:** TailwindCSS utilities only. Use the custom theme colors/fonts. No CSS-in-JS.
- **i18n:** All user-visible text through react-i18next. Never hardcode strings.
- **AI:** Groq SDK — never use Anthropic/OpenAI SDKs for the chat feature.

## Hosting

Planned: cheapest OVH VPS, single Docker Compose (api + db + nginx). React build served by Nginx. SSL via Let's Encrypt.

## TODO / Not Yet Built

- Phase 7: Tests (Jest backend, Vitest frontend), GitHub Actions CI, production nginx config, error boundaries
- Car images: `image_url` column ready in parser, needs to be added to the Python scraper CSVs
- US market: deferred (no data source yet)
- Groq chat: could benefit from caching repeated queries
