# Uniex Courier — Developer Handover
**Last updated:** 3 April 2026
**Prepared by:** Claude Code (initial build)
**For:** Incoming developer taking over remaining features

---

## 1. What This Project Is

Uniex is an international courier aggregator based in India. Customers get live shipping quotes (DHL, FedEx, UPS), book a shipment, and track it. Uniex staff handle pickup → inscan → outscan → handoff to the carrier.

**Live URLs**
- Frontend: `https://uniex-refresh-glow-2.onrender.com`
- Backend API: `https://uniex-refresh-glow-1.onrender.com`

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind + shadcn/ui + TanStack Query |
| Backend | Hono (Node.js) — `server/` directory, deployed on Render |
| Database | Neon (Postgres 17) — connected via `postgres.js` |
| Auth | Firebase Auth — `firebase-admin` on backend, Firebase SDK on frontend |
| Tracking | AfterShip — API key obtained, integration fully built |
| Deployment | Render — two separate Web Services (frontend + backend) |

**Important — things that were replaced and no longer exist:**
- Supabase — fully replaced by Neon. Ignore any `supabase.ts` file you find in `server/config/` — it is dead code.
- BetterAuth — fully replaced by Firebase Auth. Ignore `better-auth.ts` — dead code.
- Do not use `auth.users` table references — there is no such table. User IDs are Firebase UIDs stored as plain `TEXT`.

---

## 3. Local Setup

### Prerequisites
- Node.js 20+
- Access to the Neon database (get `DATABASE_URL` from the client or from Render env vars)
- Firebase service account credentials (get from client's Firebase Console)
- AfterShip API key (client already has this)

### Steps

```bash
# 1. Clone the repo
git clone <repo-url>
cd uniex-refresh-glow

# 2. Install dependencies (single package.json — frontend + backend share node_modules)
npm install

# 3. Create your .env file (see Section 4 for all variables)
cp .env.example .env   # if it exists, otherwise create manually

# 4. Seed the database (safe to re-run — all ON CONFLICT DO NOTHING)
npm run db:seed

# 5. Start the backend (port 3001)
npm run server:dev

# 6. In a second terminal, start the frontend (port 8080)
npm run dev
```

Frontend runs on `http://localhost:8080`, backend on `http://localhost:3001`.

---

## 4. Environment Variables

### Backend `.env` (place in project root)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon connection string — get from console.neon.tech or Render env vars. Must include `?sslmode=require`. |
| `FIREBASE_PROJECT_ID` | Yes | From Firebase Console → Project Settings. e.g. `uniex-xxxxx` |
| `FIREBASE_CLIENT_EMAIL` | Yes | Service account email from Firebase Console → Service Accounts |
| `FIREBASE_PRIVATE_KEY` | Yes | Service account private key. In `.env` file, keep the `\n` literal newlines as-is. |
| `FRONTEND_URL` | Yes | In production: `https://uniex-refresh-glow-2.onrender.com`. Locally: `http://localhost:8080` |
| `AFTERSHIP_API_KEY` | Yes (for tracking) | AfterShip admin API key — starts with `asat_`. Get from AfterShip dashboard → Settings → API Keys. |
| `AFTERSHIP_WEBHOOK_SECRET` | Yes (for tracking) | A secret string you set in AfterShip dashboard → Notifications → Webhooks. Must match exactly. |
| `PORT` | No | Defaults to `3001` |
| `NODE_ENV` | No | `development` or `production`. Defaults to `development`. |

### Frontend env

The frontend uses Vite. Variables must be prefixed with `VITE_`. Check `src/lib/firebase.ts` for what Firebase config values it needs — these come from the Firebase project's web app config (not the service account).

---

## 5. Project Structure

```
uniex-refresh-glow/
├── src/                        # React frontend
│   ├── pages/                  # One file per route
│   ├── components/             # Shared UI components
│   ├── hooks/                  # TanStack Query hooks (data fetching)
│   ├── lib/                    # firebase.ts, utils
│   └── types/                  # Shared TypeScript types
│
├── server/                     # Hono backend
│   ├── index.ts                # Entry point — starts the HTTP server
│   ├── app.ts                  # Hono app factory — middleware + routes registered here
│   ├── config/
│   │   ├── db.ts               # postgres.js SQL client (use this for all DB queries)
│   │   ├── env.ts              # Zod-validated env — import `env` from here, never process.env directly
│   │   └── firebase-admin.ts   # Firebase Admin SDK init
│   ├── routes/                 # Route definitions — thin, just maps paths to controllers
│   ├── controllers/            # Business logic handlers
│   ├── services/
│   │   ├── aftership.ts        # AfterShip API client
│   │   └── rate-engine/        # Full pricing pipeline (see Section 7)
│   ├── db/
│   │   ├── schema.neon.sql     # Full DB schema — run once in Neon SQL Editor
│   │   ├── seed.ts             # Seeder entry point
│   │   ├── seeds/              # dhl.ts, fedex.ts, ups.ts, zones.ts
│   │   └── queries/            # All DB query functions
│   ├── middleware/
│   │   ├── auth.middleware.ts  # requireAuth — verifies Firebase ID token
│   │   └── rate-limit.middleware.ts
│   └── types/                  # db.types.ts, api.types.ts, rate-engine.types.ts
│
├── docs/
│   ├── HANDOVER.md             # This file
│   ├── RATE_CALCULATION.md     # Full rate engine logic with source references
│   ├── RATE_ENGINE_PLAN.md     # Original implementation plan
│   └── rate-cards/             # 2026 PDF rate cards from DHL, FedEx, UPS
│
├── CLAUDE.md                   # AI assistant context (also useful for devs)
└── PROJECT_STATUS.md           # Current build status — keep this updated
```

---

## 6. API Routes Reference

All routes are prefixed `/api`. Backend base URL in production: `https://uniex-refresh-glow-1.onrender.com`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Health check — returns `{ok, db, ping_ms}` |
| POST | `/api/rates/calculate` | No | Get live shipping quotes |
| POST | `/api/bookings` | Firebase token | Create a booking |
| GET | `/api/bookings` | Firebase token | List user's bookings |
| PATCH | `/api/bookings/:id/tracking` | Firebase token | Assign AWB/tracking number to booking |
| GET | `/api/tracking/:trackingId` | No | Track by booking ref (UNX-...) or AWB number |
| POST | `/api/tracking/webhook` | HMAC sig | AfterShip calls this on every carrier scan |
| POST | `/api/tracking/webhook/test` | No (dev only) | Simulate a tracking event without a real shipment |
| GET | `/api/pincode/:pincode` | No | Check if pincode is serviceable + get pickup surcharge |
| GET | `/api/membership/plans` | No | List Silver / Gold plans |
| POST | `/api/membership/subscribe` | Firebase token | Subscribe to a plan |

**How auth works:** Protected routes expect `Authorization: Bearer <firebase-id-token>` header. The `requireAuth` middleware in `server/middleware/auth.middleware.ts` verifies this against Firebase Admin SDK and attaches the UID to `c.var.uid`.

---

## 7. Rate Engine

The pricing pipeline lives in `server/services/rate-engine/`. Every quote goes through these steps in order:

1. Resolve chargeable weight → `max(actual_kg, volumetric_kg)`. Volumetric = L×W×H ÷ 5000.
2. Look up zone code for origin→destination pair in `carrier_zones`
3. Look up base rate from `rate_card_steps` (exact weight breakpoints) or `rate_card_bands` (per-kg for heavy)
4. Apply item type discount (from `item_type_discounts` — e.g. university docs get 50% off)
5. Apply membership discount if user is an active member
6. Apply margin % (from `surcharge_config` — currently 20% for all carriers, not confirmed final)
7. Add FSC (from `fuel_surcharges` — update monthly)
8. Add demand surcharge if active (from `surcharge_config`)
9. Add carrier-specific extras: DHL premium delivery windows / FedEx peak / UPS fixed charges
10. Add pickup surcharge (from `pickup_zones` by pincode)
11. Add packaging + insurance if selected
12. Add GST (18%)

Full detail with exact formulas and source references: `docs/RATE_CALCULATION.md`

**Things not confirmed by client yet — do not treat as final:**
- Margin % (currently 20% for all carriers)
- Volumetric divisor (currently 5000 — industry standard assumed)
- FedEx IPF zone chart (currently IPF zones = IP zones — placeholder)

---

## 8. Database

**Neon Project:** `unix` · ID `falling-night-64411631` · Region: Singapore (ap-southeast-1)
**Console:** console.neon.tech — use this as the admin panel for now (see Section 10)

### Tables

| Table | Rows (approx) | Purpose |
|---|---|---|
| `carriers` | 4 | DHL, FedEx, UPS, Aramex. Aramex has no rate data — never quoted. |
| `carrier_zones` | 445 | Maps origin→destination country pairs to zone codes per carrier. DHL/UPS: `service_type='standard'`. FedEx: `'IP'` and `'IPF'` rows. |
| `rate_card_steps` | 2,910 | Exact price per weight breakpoint per zone. Primary rate lookup table. |
| `rate_card_bands` | 210 | Per-kg rates for heavy shipments (DHL + UPS). |
| `rate_card_slabs` | 0 | Legacy table — unused. Ignore it. |
| `fuel_surcharges` | 4 | FSC % per carrier. **Update monthly** — insert a new row for the new month. |
| `surcharge_config` | 13 | Margin %, demand surcharge, FedEx peak, UPS surge — all toggleable per carrier. |
| `item_type_discounts` | 14 | Discount % per item type (e.g. university = 50%, docs = 15%). |
| `pickup_zones` | 190 | Indian pincodes with pickup surcharges. TN = ₹0, metros = ₹200, north = ₹300–400. |
| `bookings` | grows | One row per booking. Full pricing snapshot locked at booking time. |
| `tracking_events` | grows | One row per tracking milestone. CASCADE DELETE from bookings. |
| `membership_plans` | 2 | Silver ₹299/yr, Gold ₹1,499/yr. |
| `user_memberships` | grows | Active member records per Firebase UID. |

### Schema changes

To change the schema: edit `server/db/schema.neon.sql`, then run the relevant `ALTER TABLE` or `CREATE TABLE` statement directly in the Neon SQL Editor. Do not drop and recreate tables in production — write migrations manually.

### Updating FSC (monthly task)

Insert a new row into `fuel_surcharges`:
```sql
INSERT INTO fuel_surcharges (carrier_id, fsc_percent, effective_from)
VALUES ('dhl', 30.00, '2026-04-01'),
       ('fedex', 28.00, '2026-04-01'),
       ('ups', 27.50, '2026-04-01');
```
The rate engine always picks the row with the latest `effective_from` that is `<= today`.

---

## 9. AfterShip Tracking — Go-Live Checklist

The integration is 100% built and tested. To make it live:

1. **Render env vars** — add to the backend service:
   - `AFTERSHIP_API_KEY` = your `asat_...` key
   - `AFTERSHIP_WEBHOOK_SECRET` = a secret string you choose

2. **AfterShip dashboard** — Settings → Notifications → Webhooks:
   - URL: `https://uniex-refresh-glow-1.onrender.com/api/tracking/webhook`
   - Event: `tracking_update`
   - Secret: same value as `AFTERSHIP_WEBHOOK_SECRET`

3. **How it works end-to-end:**
   - Staff assigns AWB to a booking via `PATCH /api/bookings/:id/tracking`
   - Backend auto-registers the tracking number with AfterShip
   - AfterShip polls the carrier and pushes events to the webhook
   - Webhook writes events to `tracking_events` and advances `bookings.status`
   - Customer sees live updates on the Track page

**Testing without a real shipment** (dev only):
```bash
curl -X POST http://localhost:3001/api/tracking/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"tracking_number":"TEST123","tag":"InTransit","message":"Arrived at hub","location":"Chennai, India"}'
```

---

## 10. How Staff Operate Right Now (No Admin Panel)

Until the admin/ops panel is built, staff use the **Neon table editor** (console.neon.tech) directly:

- **Update booking status:** Edit the `status` column in the `bookings` table
- **Assign tracking number:** Use the API (`PATCH /api/bookings/:id/tracking`) or edit `tracking_number` directly in Neon
- **Add manual tracking event:** Insert a row into `tracking_events`
- **View bookings:** Query `bookings` table in Neon

---

## 11. What's Left to Build

See `PROJECT_STATUS.md` for the full current status. Summary:

### Build now (unblocked)

**Order history page (frontend)**
- Backend: `GET /api/bookings` — already works, returns the user's bookings
- Need: a `/orders` page in `src/pages/` for logged-in users, listing past bookings with status badges and a link to the tracking page
- Pattern to follow: look at how `useTracking` hook in `src/hooks/useTracking.ts` fetches and displays data

**Ops panel — Phase 1 (internal staff tool)**
- A simple password-protected internal page (or a separate small app) for staff to:
  - See bookings list (filterable by status)
  - Update booking status (pending → confirmed → picked_up etc.)
  - Assign carrier AWB to a booking (triggers AfterShip registration automatically)
- API routes already exist — just need a UI
- Keep it simple: no fancy design needed, it's staff-only

**Contact form backend**
- `src/pages/Contact.tsx` has the form UI but submissions go nowhere
- Need: `POST /api/contact` route that emails `uniexanr@gmail.com` or writes to a DB table
- Easy job once an email provider is chosen (Resend recommended — simple API, generous free tier)

### Blocked on client

| Feature | Blocked on |
|---|---|
| Razorpay payment | Client's Razorpay API credentials |
| FedEx IPF zone chart | PDF from FedEx account manager |
| Final margin % | Client decision (currently 20% placeholder) |
| Volumetric divisor | Carrier confirmation (currently ÷5000) |

### After payment works

- Email notifications (booking confirmation, tracking updates, delivered)
- WhatsApp notifications
- Membership checkout (UI done — just needs Razorpay)

### After all above

- Full admin/ops panel (bookings list + status update + add tracking event)
- NDR handling (FailedAttempt → flag booking → notify staff + customer)
- Remarketing email (10% off after delivery)

---

## 12. Key Decisions & Why

**Single repo for frontend + backend**
Both live in the same repo. Frontend is `src/`, backend is `server/`. They share `package.json` and `node_modules`. This was a deliberate choice to simplify early-stage development. If you need to split them later, it's straightforward.

**No admin panel yet**
Deliberately skipped. Volume at launch will be low. Staff uses Neon table editor directly. Build the ops panel only after payment + tracking are live — that's when the workflow needs automation.

**margin_inr is internal — never show to customer**
The `margin_inr` column in `bookings` is Uniex's profit margin. It must never appear in any customer-facing screen, email, or API response.

**Firebase UID stored as TEXT, no foreign key**
User IDs in `bookings` and `user_memberships` are Firebase UIDs (TEXT like `uid_abc123`). There is no `users` table. Do not add one unless specifically asked — Firebase is the source of truth for user identity.

**rate_card_slabs is legacy — ignore**
The table exists but is unused by the rate engine. Do not write code that reads from it.

**Aramex is in carriers but never quoted**
The `aramex` row exists in `carriers` but has no zone or rate data. The rate engine will never return an Aramex quote. Don't remove the row — the client may want to add Aramex later.

---

## 13. Contacts

| Role | Contact |
|---|---|
| Client (Uniex) | uniexanr@gmail.com · +91 9600879666 |
| Neon DB | console.neon.tech — project: `unix` |
| Firebase | Firebase Console — project credentials from client |
| AfterShip | aftership.com — API key from client |
| Render | render.com — deployment platform, access from client |
