# Uniex Courier — Developer Handover Guide
**Date:** 1 April 2026
**Handing over from:** Initial build team
**Stack:** React + Vite + Hono + Neon Postgres + Firebase Auth · Deployed on Render

---

## 1. Getting It Running Locally

```bash
git clone <repo-url>
cd uniex-refresh-glow
npm install

cp .env.example .env
# Fill in the 3 required vars (see Section 2)

npm run dev        # starts both frontend (port 8080) and backend (port 3001)
```

That's it. No Docker. No separate database setup — it connects to the live Neon instance.

If you want to reseed the DB (safe to re-run, all upserts):
```bash
npm run db:seed
```

---

## 2. Environment Variables — What You Actually Need

Get these from the person handing over (or the respective consoles):

| Variable | Where to find it | Required? |
|---|---|---|
| `DATABASE_URL` | Neon Console → Project `unix` → Connection Details | YES |
| `FIREBASE_PROJECT_ID` | Firebase Console → Project Settings → General | YES |
| `FIREBASE_CLIENT_EMAIL` | Firebase Console → Project Settings → Service Accounts → Generate key | YES |
| `FIREBASE_PRIVATE_KEY` | Same JSON as above — paste the full key including `-----BEGIN...END-----` | YES |
| `VITE_FIREBASE_API_KEY` and other `VITE_FIREBASE_*` | Firebase Console → Project Settings → Your apps → Web app | YES (frontend) |
| `AFTERSHIP_API_KEY` | AfterShip Dashboard → Developers → API Keys | Not needed until AfterShip work starts |
| `VITE_API_URL` | Leave empty in dev. Set to Render backend URL in production only | Production only |

On Render, all these are already set in the dashboard. Do not change them without checking with the client first.

> `FIREBASE_PRIVATE_KEY` on Render must be stored as a multi-line secret env var. The `\n` in the key must be real newlines, not escaped. This is already configured correctly — don't touch it unless you're recreating the service.

---

## 3. What Is Actually Working Right Now

| Feature | Status | Notes |
|---|---|---|
| Auth (login / signup) | Working | Firebase Auth end-to-end |
| Rate calculator | Working | DHL, FedEx, UPS with correct 2026 pricing |
| Booking flow | Working | Saves to DB, shows confirmation |
| Membership plans page | Working | Live from DB |
| Static pages | Working | Home, About, Services, Contact |
| Tracking page UI | Partial | UI built, no real data |
| Membership checkout | Partial | UI built, no payment processor |
| Contact form | Partial | UI only, submissions go nowhere |
| Payment (Razorpay) | Not built | Blocked on API credentials from client |
| AfterShip tracking | Not built | API key is ready, integration not started |
| Order history page | Not built | Backend API exists, no frontend screen |
| Email notifications | Not built | |
| Admin / Ops panel | Not built | Use Neon table editor for now |

---

## 4. What to Work On First

In this order:

**4a. AfterShip tracking integration** — API key is already in `.env`. The plan:
- When a booking is confirmed and gets a tracking number, push it to AfterShip via their API
- Set up an AfterShip webhook endpoint (`POST /api/tracking/webhook`) to receive events
- Write incoming events to the `tracking_events` table
- The tracking page UI is already built — it will just start working once real data is in the table
- See `server/services/aftership.ts` — a stub already exists

**4b. Order history page** — `GET /api/bookings` already works on the backend. Just needs a frontend screen. Simple list of the user's bookings with status and total.

**4c. Razorpay** — Blocked on API credentials from the client (Razorpay account not yet set up). Once credentials arrive: integrate on the payment step of the booking flow and membership checkout. Both UI screens are already built.

**4d. Email notifications** — After payment works, send booking confirmation email. Use Resend or NodeMailer. Template already has all the data it needs in the booking row.

**4e. Admin / Ops panel** — Minimal. Three screens only: bookings list + update status + add tracking event. Route `/admin`. Single role check (Firebase custom claim or hardcoded email check is fine for V1).

---

## 5. The Database

**Neon project:** `unix` · `falling-night-64411631` · Region: ap-southeast-1

**Schema:** `server/db/schema.neon.sql` — source of truth
**Full schema doc:** `docs/DB_SCHEMA_HANDOVER.md` — read this first

Key tables you'll touch most:
- `bookings` — the operational core. Never recalculate pricing — it's locked at booking time.
- `tracking_events` — insert one row per tracking milestone. AfterShip webhook will do this automatically once built.
- `surcharge_config` — margin %, demand surcharge toggles. Update via Neon editor until admin panel is built.
- `fuel_surcharges` — insert a new row every month when carriers publish updated FSC.

**Do not:**
- Edit `rate_card_steps` or `rate_card_bands` manually — run `npm run db:seed` after updating the seed files
- Delete from `bookings` without knowing it will cascade-delete all `tracking_events` for that booking
- Touch `rate_card_slabs` — it's a legacy table that does nothing

---

## 6. How Deployment Works

Two Render services — both auto-deploy on push to `main`:

| Service | Type | Root dir | Build command | Start command |
|---|---|---|---|---|
| Frontend | Static site | `/` | `npm run build` | — |
| Backend | Web service | `/` | `npm run build:server` | `node dist/server/index.js` |

All environment variables are set in the Render dashboard. Do not put secrets in the repo.

The backend URL the frontend calls is set via `VITE_API_URL`. In production this is already pointing to the correct Render backend URL.

---

## 7. Landmines — Read This Before You Touch Anything

**Rate engine margin:** Currently 20% for all carriers. The client has not confirmed final percentages. Do not hardcode or adjust until the client explicitly confirms per-carrier margin numbers. It's in `surcharge_config` table, key = `margin_pct`.

**FedEx IPF zones:** Currently identical to IP zones (placeholder). When the client's FedEx account manager provides the IPF zone chart, update the FedEx IPF rows in `carrier_zones`.

**Volumetric weight divisor:** Using ÷5000 (industry standard). Not confirmed by any carrier. If a carrier account manager says it's different, change it in `server/services/rate-engine/weight-calc.ts`, line 2: `const DIM_DIVISOR = 5000`.

**Margin is internal:** `margin_inr` column in `bookings` and `marginInr` in `RateResult` are never shown to customers. Do not display them in any customer-facing screen.

**Aramex:** Exists in the `carriers` table and `CARRIERS` schema array. Has no zone or rate data. Will never appear in quotes. Don't spend time on it unless the client requests it.

**`rate_card_slabs`:** A legacy table from an earlier version. Completely unused. Ignore it.

**UPS 70 kg block:** UPS refuses packages over 70 kg per their rate card. The rate engine already blocks UPS from appearing in quotes above this weight. Don't remove this check.

**Neon region:** The DB is in Singapore (ap-southeast-1). The backend is on Render — pick a Render region close to Singapore if you ever need to recreate the backend service.

---

## 8. Key Files to Know

```
server/
  config/
    db.ts                    — Neon postgres.js client (DATABASE_URL)
    firebase-admin.ts        — Firebase Admin SDK init
    env.ts                   — Typed env var loader with validation
  services/
    rate-engine/
      index.ts               — Core rate calculator (read the comment block at top)
      weight-calc.ts         — Chargeable weight + volumetric
      fsc.ts                 — Fuel surcharge helpers
      zone-resolver.ts       — Zone → delivery days lookup
    aftership.ts             — AfterShip API stub (not yet wired up)
  routes/
    bookings.routes.ts       — POST /api/bookings, GET /api/bookings
    rates.routes.ts          — POST /api/rates/calculate
    tracking.routes.ts       — GET /api/tracking/:id
    membership.routes.ts     — plans + subscribe
  middleware/
    auth.middleware.ts       — requireAuth (Firebase token verification)

src/
  context/AuthContext.tsx    — Firebase auth state, token, user object
  lib/firebase.ts            — Firebase client SDK init
  pages/
    RateBreakdown.tsx        — Rate quote + booking flow (main user journey)
    Booking.tsx              — Alternative booking entry point
  hooks/
    useRates.ts              — TanStack Query wrapper for rate calculation
    useBooking.ts            — TanStack Query mutation for creating booking
  types/
    api.ts                   — All frontend TypeScript types (keep in sync with server types)

docs/
  RATE_CALCULATION.Md        — Full pricing spec from PDF rate cards (source of truth for rate logic)
  RATE_ENGINE_PLAN.md        — Implementation decisions and what's done/pending
  DB_SCHEMA_HANDOVER.md      — Full database schema with row counts and maintenance guide
```

---

## 9. Things That Need Client Input Before You Build Them

These cannot be implemented without confirmation — do not assume:

1. **Exact margin % per carrier** — "10–30% variable" was stated. Get specific numbers for DHL, FedEx, UPS.
2. **Razorpay credentials** — account must be created and API keys shared.
3. **FSC calculation base** — does FSC apply on `base rate` or `base + margin`? Currently on `base + margin` per spec interpretation. Confirm.
4. **Volumetric weight divisor** — confirm ÷5000 with each carrier's account manager.
5. **FedEx IPF zone chart** — needed from the FedEx account manager to correctly differentiate IP vs IPF pricing.
6. **Discount code structure** — client mentioned "Apply Discount code Concept" but gave no detail. Confirm before building.

---

## 10. Who Knows What

| Topic | Who to ask |
|---|---|
| Carrier rate cards (DHL / FedEx / UPS) | Client — they hold the 2026 PDFs |
| Razorpay account setup | Client |
| AfterShip account + API key | Client (key already in .env) |
| Firebase project + Neon project access | Client — they own both |
| Render service config + env vars | Client — they own the Render account |
| Rate engine logic decisions | `docs/RATE_CALCULATION.Md` + `docs/RATE_ENGINE_PLAN.md` |
| Database schema | `docs/DB_SCHEMA_HANDOVER.md` |
