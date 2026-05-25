# Uniex Courier — International Shipping Aggregator

A full-stack platform for international courier booking. Customers get live shipping quotes from DHL, FedEx, and UPS, book shipments, and track deliveries. A built-in admin panel handles the full ops workflow: pickup assignment, inscan, outscan, and NDR management.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Framer Motion |
| Backend | Hono (Node.js), TypeScript |
| Database | PostgreSQL 17 (Neon, Singapore) via postgres.js |
| Auth | Firebase Auth (frontend SDK + firebase-admin on backend) |
| Testing | Vitest (unit), Playwright (E2E) |
| Deployment | Render (frontend + backend as separate web services) |

## Features

- **Multi-carrier rate engine** — live quotes from DHL, FedEx, UPS with a DB-driven pricing pipeline: base rate → margin → FSC → demand surcharge → carrier-specific extras → GST (18%)
- **Booking flow** — multi-step form with server-side rate recalculation at submission; full pricing snapshot locked at booking time
- **Admin operations panel** — 13 screens covering bookings, pickup queue, inscan, outscan, NDR handling, leads, remarketing, staff, and config
- **Shipment tracking** — timeline view with status badges
- **Membership plans** — Silver and Gold tiers with DB-driven pricing
- **Firebase Auth** — login, signup, protected routes on both frontend and backend

## Project Structure

```
uniex-courier/
├── src/                    # React frontend
│   ├── pages/              # Customer-facing pages + admin panel
│   ├── components/         # Shared UI components
│   ├── hooks/              # TanStack Query hooks
│   └── lib/                # Firebase client, utilities
├── server/                 # Hono API server
│   ├── routes/             # Route handlers (rates, bookings, tracking, admin…)
│   ├── services/
│   │   └── rate-engine/    # Multi-carrier pricing logic
│   ├── db/                 # Schema, migrations, seed data
│   └── config/             # DB connection, Firebase Admin SDK
├── admin-calculator/       # Standalone admin rate-verification tool (Alpine.js)
└── docs/                   # Handover docs, rate engine flowchart
```

## Getting Started

```bash
# Install dependencies
npm install

# Start the frontend dev server (http://localhost:5173)
npm run dev

# Start the backend API server — separate terminal (uses tsx watch)
npm run server:dev

# Seed the database
npm run db:seed
```

## Environment Variables

```env
# Frontend (.env)
VITE_API_URL=http://localhost:3000

# Backend (.env)
DATABASE_URL=postgres://...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
DHL_API_KEY=...
FEDEX_API_KEY=...
UPS_API_KEY=...
```

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/rates/calculate` | Live shipping quotes (DHL / FedEx / UPS) |
| POST | `/api/bookings` | Create booking (auth required) |
| GET | `/api/bookings` | List user bookings (auth required) |
| GET | `/api/tracking/:id` | Tracking by AWB or booking ref |
| GET | `/api/pincode/:pincode` | Pickup serviceability check |
| GET | `/api/membership/plans` | Available membership tiers |

## Running Tests

```bash
npm run test          # Vitest unit tests
npm run test:watch    # Vitest in watch mode
npx playwright test   # Playwright E2E tests
```

## Deployment

Frontend and backend are deployed as separate Render web services. Database is hosted on Neon (Postgres 17, `ap-southeast-1`).

Build commands:
```bash
npm run build          # Frontend (outputs to dist/)
npm run server:build   # Backend (tsc compile)
npm run server:start   # Run compiled backend
```
