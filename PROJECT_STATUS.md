# Uniex — Project Status
**Last updated:** 2 April 2026
**Platform:** uniex-refresh-glow-2.onrender.com (frontend) · uniex-refresh-glow-1.onrender.com (backend)

---

## What's Live & Working

| Feature | Notes |
|---|---|
| Firebase Auth (login / signup) | Token verified on backend via firebase-admin |
| Rate calculator | Full 2026 PDF spec — DHL, FedEx, UPS. Pipeline: base → discount → margin → FSC → demand → carrier extras → GST |
| DHL premium delivery windows | Standard / 12pm / 9am — customer selects at quote |
| UPS fixed charges | Formal clearance, DDP, signature, US inbound — customer selects at quote |
| UPS 70kg block | System excludes UPS from quotes above 70kg |
| Surcharge config table | Margin %, demand, peak, surge all DB-configurable per carrier |
| Booking flow | Multi-step form, server-side price recalculation, full pricing snapshot locked to DB |
| Membership plans page | Silver ₹299/yr · Gold ₹1,499/yr — live from DB |
| Tracking page UI | Timeline view, status badges — UI complete, no real data yet |
| Static pages | Home, About, Services, Contact |
| DB schema | All 13 tables live on Neon, 2,910 rate card rows seeded and verified against 2026 PDFs |

---

## What's Built but Not Yet Working

| Feature | Why it's not working |
|---|---|
| Tracking — real data | AfterShip webhook not built. Tracking page UI exists but shows no live events. |
| Payment gateway (Razorpay) | UI screens designed. Blocked — waiting on client's Razorpay credentials. |
| Membership checkout | UI done (UPI / card / net banking). Blocked — same Razorpay dependency. |
| Contact form | Form UI done. No backend route — submissions go nowhere. |
| Order history page | `GET /api/bookings` backend works. No frontend screen built yet. |

---

## Not Built Yet

### Tier 1 — Unblocked, Build Next

| Feature | What it is | Est. effort |
|---|---|---|
| Sentry + health check endpoint | `GET /api/health` + Sentry error monitoring. Must-have before go-live. Without this you find out something crashed when a customer complains. | 30 min |
| AfterShip webhook | `POST /api/tracking/webhook` — AfterShip calls this on every carrier scan. Writes to `tracking_events`, updates `bookings.status`, triggers delivered/NDR logic. | 2–3 hrs |
| Ops panel — Phase 1 staff form | Internal form for staff to update booking status: pickup assigned → collected → inscan → weight verified → outscan (AWB assigned). This triggers AfterShip registration. Without this, staff edits Neon directly for every booking. | 1 day |
| Order history page (frontend) | Screen for logged-in customers to see past bookings and click into tracking. Backend already works. | 1 day |

### Tier 2 — Blocked on Client

| Feature | Blocked on |
|---|---|
| Razorpay payment gateway | Client Razorpay account + API credentials |
| FedEx IPF zone chart | Actual IPF zone PDF from FedEx account manager (currently using IP zones as placeholder) |
| Final margin % per carrier | Client confirmed "10–30% variable" — needs specific % for DHL, FedEx, UPS |
| Volumetric weight divisor | Currently assumed ÷5000 — needs confirmation from each carrier's account manager |

### Tier 3 — After Payment Works

| Feature | What it is |
|---|---|
| Email notifications | Booking confirmation, tracking update alerts, delivered notification |
| WhatsApp notifications | Same triggers as email — booking confirmed, status updates, delivered |
| Membership checkout | UI done — just needs Razorpay connected |

### Tier 4 — After Tier 3

| Feature | What it is |
|---|---|
| Admin / Ops panel (full) | Three screens: bookings list with search/filter, update status + assign AWB, add manual tracking event. Tier 1 ops form is the stripped-down early version of this. |
| Contact form backend | Route that emails Uniex or writes submissions to DB |
| Tracking UI — two-section timeline | Split into "Uniex Processing" (Phase 1) and "Carrier Tracking" (Phase 2 via AfterShip) with visual handoff between them |

### Tier 5 — Not Started, No Timeline

| Feature | Notes |
|---|---|
| NDR handling | Detect AfterShip FailedAttempt tag → flag booking → notify staff + customer → coordinate re-delivery |
| Remarketing email | 10% off email auto-sent when `bookings.status = delivered`. Requires email system from Tier 3 first. |
| AI chat with real logic | Widget UI is present, no intelligence. Separate project. |
| Lead capture system | Capture visitor details before they book. Tied to AI chat widget. |

---

## Build Order Right Now

| Priority | Feature | Status |
|---|---|---|
| 1 | Sentry + health check endpoint | Build immediately |
| 2 | AfterShip webhook endpoint | Build immediately |
| 3 | Ops panel — Phase 1 staff form | Build immediately |
| 4 | Order history page (frontend) | Build immediately |
| 5 | Razorpay payment gateway | Waiting on client credentials |
| 6 | Email + WhatsApp notifications | After payment |
| 7 | Full admin / ops panel | After email/WhatsApp |
| 8 | NDR + remarketing | After full ops panel |

---

## How Tracking Works (Once Built)

Two phases — both feed into the same customer-facing timeline:

**Phase 1 — Uniex internal (Steps 7–11 of flowchart)**
Staff actions written manually to `tracking_events` via the ops panel:
Pickup assigned → Package collected → Received at office → Weight verified → Handed to carrier (AWB assigned)

**Phase 2 — Carrier tracking via AfterShip (Steps 12–13 of flowchart)**
Triggered the moment staff assigns the AWB. AfterShip watches the number and pushes every carrier scan to the webhook → written to `tracking_events` automatically.
Delivered → triggers 10% off remarketing email.
FailedAttempt → triggers NDR flow.

Customer sees both phases as one unified timeline on the Track page.

---

## Database (Neon)

**Project:** unix · `falling-night-64411631` · Singapore (ap-southeast-1)
**Full schema doc:** `docs/DB_SCHEMA_HANDOVER.md`

| Table | Rows | Notes |
|---|---|---|
| carriers | 4 | DHL, FedEx, UPS, Aramex (Aramex has no rate data — never quoted) |
| carrier_zones | 445 | DHL 109 + FedEx 230 (IP + IPF) + UPS 106 |
| rate_card_steps | 2,910 | All 3 carriers, doc + package |
| rate_card_bands | 210 | DHL + UPS heavy brackets |
| rate_card_slabs | 0 | Legacy, unused — ignore |
| fuel_surcharges | 4 | March 2026 FSC per carrier — update monthly |
| surcharge_config | 13 | Margin 20% (unconfirmed), all surcharges off |
| item_type_discounts | 14 | All item types seeded |
| pickup_zones | 190 | TN free · metros ₹200–250 · north ₹300–400 |
| bookings | 0 | Live operational |
| tracking_events | 0 | Live operational — empty until AfterShip + ops panel built |
| membership_plans | 2 | Silver ₹299 · Gold ₹1,499 |
| user_memberships | 0 | Live operational |

---

## Known Issues / Tech Debt

- Contact form submissions go nowhere (no backend)
- Membership checkout blocked on Razorpay
- No booking confirmation email sent to customer after booking
- `bookings.status` stays `pending` forever — no way to update without going into Neon directly
- No automated pickup assignment workflow
- `rate_card_slabs` table exists but unused — can be dropped in a future cleanup migration
- FedEx IPF zones are a copy of IP zones — placeholder until real IPF zone chart received
- Margin % (currently 20%) not confirmed by client — do not treat as final
