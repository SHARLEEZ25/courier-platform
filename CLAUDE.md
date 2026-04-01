# Uniex Courier — Claude Context

## What This Project Is
Uniex is an **international courier aggregator** based in India. Customers visit the website, get live shipping quotes (DHL, FedEx, UPS), book a shipment, and track it. Uniex staff handle pickup, inscan, outscan, and handoff to carriers.

## Tech Stack
- **Frontend:** React + Vite + TypeScript + Tailwind + shadcn/ui + TanStack Query
- **Backend:** Hono (Node.js) — deployed on Render
- **Database:** Neon (Postgres 17) — connected via postgres.js (`server/config/db.ts`)
- **Auth:** Firebase Auth — firebase-admin on backend (`server/config/firebase-admin.ts`), firebase SDK on frontend (`src/lib/firebase.ts`)
- **Deployment:** Render (frontend + backend as separate Render Web Services)
- **Tracking integration:** AfterShip (API key obtained, integration not yet built)

> NOTE: Earlier versions of this project used Supabase + BetterAuth. Both have been fully replaced. Ignore any references to Supabase RLS, BetterAuth, or `auth.users` — they are gone.

## Client's Intended Full Flow (from flowchart)
1. Visitor enters website
2. AI greets customer (chat widget)
3. Lead captured
4. Customer enters shipment details
5. AI calculates courier rate (DHL / FedEx / UPS — best rates)
6. Customer books courier
7. Pickup assigned to staff / agents
8. Pickup completed
9. Inscan to office
10. Payment / Weight / Remote validation
11. Outscan to vendors (carriers)
12. Tracking Automation API updates status
13. Delivered / Delivery attempted / No Delivery (NDR)
14. Remarketing — 10% off email sent after delivery

## Current Status (as of 1 April 2026)

### Done & Working
- Website (Home, About, Services, Contact pages)
- Auth — Firebase Auth fully working (login, signup, token verification on backend)
- Rate calculator — live quotes from DHL, FedEx, UPS with correct pricing pipeline:
  base rate → item discount → margin → FSC → demand surcharge → carrier extras → GST
- Margin, demand surcharge, peak surcharge, surge fees all DB-configurable via `surcharge_config`
- DHL premium delivery windows (9am / 12pm) — customer selects at quote
- UPS fixed charges (formal clearance, DDP, signature, US inbound) — customer selects at quote
- UPS 70kg weight block
- Booking flow — multi-step form, server-side rate recalculation, saved to DB
- Membership plans page (Silver ₹299/yr, Gold ₹1,499/yr) — prices from DB
- Chat widget present (no real AI logic yet)
- Tracking page UI — timeline view, status badges (no real data yet)

### Built but Not Yet Working
- **Payment gateway (Razorpay)** — UI screens done, no real processor connected. Blocked on Razorpay API credentials from client.
- **AfterShip tracking** — API key obtained, integration not built. No live tracking events in DB.
- **Membership checkout** — UI done (UPI/card/net banking tabs), blocked on Razorpay.
- **Contact form** — UI done, no backend, submissions go nowhere.
- **Order history page** — backend API exists (`GET /api/bookings`), no frontend screen.

### Not Built Yet
- Admin / Ops panel (use Neon table editor for now — see decision below)
- Email notifications (no booking confirmations, no tracking alerts)
- WhatsApp notifications
- Lead capture system
- AI chat with real logic
- NDR handling
- Remarketing / post-delivery emails

## API Routes
- `POST /api/rates/calculate` — calculate shipping quotes
- `GET /api/tracking/:trackingId` — tracking by AWB number or booking_ref
- `POST /api/bookings` — create booking (requires Firebase auth token)
- `GET /api/bookings` — list user bookings (requires Firebase auth token)
- `GET /api/pincode/:pincode` — check pickup serviceability
- `GET /api/membership/plans` — list membership plans
- `POST /api/membership/subscribe` — subscribe to plan
- `/api/auth/*` — Firebase Auth pass-through routes

## Key Decisions Made

### Admin Panel — Use Neon Table Editor for Now
- **Decision:** Do NOT build a custom admin panel yet. Use the Neon table editor (console.neon.tech) directly to manage bookings, update statuses, and insert tracking events during early operations.
- **Why:** Volume will be low at launch. Building an admin panel before core payment and tracking are working is wasted effort.
- **Phase 2 plan:** Once payment + tracking are live, build a minimal `/admin` ops panel inside this same repo. Three screens only: bookings list, update status, add tracking event. No separate repo.

### Build Order (Remaining)
1. AfterShip tracking integration (real events) — API key is ready
2. Order history page (frontend) — backend already exists
3. Razorpay payment gateway — blocked on API credentials from client
4. Email + WhatsApp notifications — after payment confirmed
5. Admin / Ops panel — after all above are working

### Rate Engine — Surcharge Config
- `surcharge_config` table stores per-carrier: margin %, demand surcharge toggle/amount, FedEx peak toggle/amount, UPS surge toggle/amount
- FSC (fuel surcharge) lives separately in `fuel_surcharges` table — updated monthly
- **Margin is currently 20% for all carriers** — client has not confirmed final percentages. Do not assume this is final.
- FedEx IPF zones are currently identical to IP zones — needs updating when client's carrier account manager provides IPF-specific zone PDF

## Neon Database
- Project: `unix` · ID: `falling-night-64411631` · Region: ap-southeast-1 (Singapore)
- Connection via `DATABASE_URL` env var (postgres.js, SSL required)
- Schema file: `server/db/schema.neon.sql`
- Seeder: `npm run db:seed` — safe to re-run (all ON CONFLICT DO NOTHING)
- Full schema doc: `docs/DB_SCHEMA_HANDOVER.md`

## Tables (13 total)
- `carriers` — dhl, fedex, ups, aramex (aramex has no rate cards)
- `carrier_zones` — 445 rows. DHL/UPS use service_type='standard'. FedEx has IP and IPF rows.
- `rate_card_steps` — 2,910 rows. Exact price per weight breakpoint per zone.
- `rate_card_bands` — 210 rows. Per-kg pricing for heavy shipments (DHL + UPS).
- `rate_card_slabs` — legacy table, unused, ignore it
- `fuel_surcharges` — monthly FSC per carrier. Update every month.
- `surcharge_config` — margin, demand, peak, surge flags per carrier. Admin-editable.
- `item_type_discounts` — 14 item types with discount percentages
- `pickup_zones` — 190 Indian pincodes with pickup surcharges (TN free, metros ₹200–250)
- `bookings` — one row per customer booking, full pricing snapshot locked at booking time
- `tracking_events` — one row per tracking milestone per booking
- `membership_plans` — Silver ₹299, Gold ₹1,499
- `user_memberships` — active member records per Firebase UID

## Booking Status Flow
`pending` → `confirmed` → `picked_up` → `in_transit` → `delivered` (or `cancelled`)

## Notes & Gotchas
- `rate_card_slabs` table exists in DB but is unused by the rate engine — ignore it
- Aramex is in the `carriers` table but has no zone or rate data — will never appear in quotes
- Volumetric weight divisor is 5000 (industry standard assumed) — not confirmed by carrier account managers yet
- UPS max 70 kg per package — system blocks UPS quotes above this at engine level
- `margin_inr` in bookings is internal — never display to customer
- Membership discount stacks on top of item type discount (both applied before margin)
- `tracking_events` has CASCADE DELETE from bookings — deleting a booking deletes all its events
