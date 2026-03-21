# Uniex Courier — Claude Context

## What This Project Is
Uniex is an **international courier aggregator** based in India. Customers visit the website, get live shipping quotes (DHL, FedEx, UPS), book a shipment, and track it. Uniex staff handle pickup, inscan, outscan, and handoff to carriers.

## Tech Stack
- **Frontend:** React + Vite + TypeScript + Tailwind + shadcn/ui + TanStack Query
- **Backend:** Hono (Node.js) — deployed on Render
- **Database:** Supabase (Postgres)
- **Auth:** BetterAuth
- **Deployment:** Render (frontend + backend as separate services)

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

## Current Status (as of March 2026)

### Done & Working
- Website (Home, About, Services, Contact pages)
- Rate calculator — live quotes from DHL, FedEx, UPS with GST, FSC, discount
- Membership plans page (Silver ₹299/yr, Gold ₹1499/yr) — prices from DB
- Chat widget present (no real AI logic yet)
- Tracking page UI — timeline view, status badges (no real data yet)

### Built but Broken
- **Auth (login/signup)** — UI done, BetterAuth backend written, returns error on Render. THIS IS THE #1 BLOCKER.
- **Booking flow** — multi-step form UI complete, backend route exists, blocked by auth
- **Membership checkout** — UI done (UPI/card/net banking tabs), blocked by auth
- **Contact form** — UI done, no backend, submissions go nowhere
- **Tracking backend** — route exists, no real tracking events in DB yet

### Not Built Yet
- Payment gateway (Razorpay) — UI screens exist, no real processor connected
- Order history page — backend API exists, no frontend screen
- Admin / Ops panel — nothing built
- Email notifications — no booking confirmations, no tracking alerts
- WhatsApp notifications — no automated messages
- Lead capture system
- AI chat with real logic
- NDR handling
- Remarketing / post-delivery emails

## API Routes
- `POST /api/rates` — calculate shipping quotes
- `GET /api/tracking/:trackingId` — tracking by number or booking ref
- `POST /api/bookings` — create booking (blocked by auth)
- `GET /api/pincode/:pincode` — check serviceability
- `/api/membership/*` — plans + subscribe
- `/api/auth/*` — BetterAuth routes

## Key Decisions Made

### Admin Panel — Use Supabase for Now
- **Decision:** Do NOT build a custom admin panel yet. Use the Supabase Table Editor directly to manage bookings, update statuses, and insert tracking events during early operations.
- **Why:** Auth is broken. Booking isn't working. Building admin on a broken foundation wastes time. Early volume will be low — Supabase is enough.
- **Phase 2 plan:** Once core flow works (auth → booking → payment → tracking), build a minimal `/admin` ops panel inside this same repo. Just 3 screens: bookings list, update status, add tracking event. No separate repo needed.

### Build Order (Priority)
1. Fix Auth (BetterAuth on Render) — unblocks everything
2. Fix Booking flow (depends on auth)
3. Connect Razorpay payment gateway (depends on booking)
4. Email + WhatsApp notifications (depends on booking + payment)
5. Real tracking events (depends on booking)
6. Order history page (depends on auth + booking)
7. Admin / Ops panel (after all above working)

## Supabase Tables (known)
- `bookings` — booking_ref, carrier_id, status, tracking_number, sender/receiver info, pricing breakdown
- `tracking_events` — tracking_number, event_code, description, location, event_at
- `membership_plans` — id, name, price_inr, discount_pct, duration_months
- `membership_subscriptions` — user_id, plan_id, starts_at, expires_at, is_active
- `rate_cards` — carrier rates per zone/weight
- `serviceable_pincodes` — pincode serviceability + surcharges

## Booking Status Flow
`pending` → `confirmed` → `picked_up` → `in_transit` → `delivered` (or `cancelled`)

## Notes
- Carriers supported: DHL, FedEx, UPS (Aramex type exists in code but not in rate cards)
- Item types: university, excess, docs, food, clothing, medicine, jewellery, electronics, cosmetics, gifts, sports, pooja, commercial, other
- Membership gives discount_pct off base rate
- Rate engine does a single Supabase round-trip (optimized in recent commit)
