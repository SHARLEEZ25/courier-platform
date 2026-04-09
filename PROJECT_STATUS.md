# Uniex — Project Status
**Last updated:** 9 April 2026
**Platform:** uniex-refresh-glow-2.onrender.com (frontend) · uniex-refresh-glow-1.onrender.com (backend)

---

## Tests Run (2 April 2026)

| Test | Method | Result |
|---|---|---|
| AfterShip API key validity | `GET https://api.aftership.com/tracking/2024-04/trackings` with `as-api-key` header | ✅ Returned 200 — key is valid, 2 existing trackings visible |
| Health check endpoint | `GET /api/health` | ✅ Returns `{"status":"ok","db":"ok","ping_ms":~1300}` |
| Webhook — InTransit event | `POST /api/tracking/webhook/test` with `tag=InTransit`, `tracking_number=ITD-0-12345678` | ✅ Event written to `tracking_events`, booking status updated to `in_transit` |
| Webhook — Delivered event | `POST /api/tracking/webhook/test` with `tag=Delivered`, `tracking_number=ITD-0-12345678` | ✅ Event written to `tracking_events`, booking status updated to `delivered` |
| Forward-only status guard | Ran Delivered after InTransit — confirmed it advanced and did not regress | ✅ Works correctly |
| DB write confirmation | Queried `tracking_events` after webhook tests | ✅ 2 rows present, joined correctly to `UNX-2026-473925` |

**Test setup:** booking `UNX-2026-473925` (pre-existing from earlier booking flow test) had its `tracking_number` set to `ITD-0-12345678` (AfterShip's built-in testing-courier number) to act as the test target.

---

## What's Live & Working

| Feature | Notes |
|---|---|
| Firebase Auth (login / signup) | Token verified on backend via firebase-admin |
| Rate calculator | Full 2026 PDF spec — DHL, FedEx, UPS. Pipeline: base → discount → margin → FSC → demand → carrier extras → GST. Formula audited and verified (9 Apr 2026). |
| DHL premium delivery windows | Standard / 12pm / 9am — customer selects at quote |
| UPS fixed charges | Formal clearance, DDP, signature, US inbound — customer selects at quote |
| UPS 70kg block | System excludes UPS from quotes above 70kg |
| Surcharge config table | Margin %, demand, peak, surge all DB-configurable per carrier. Cache TTL reduced to 5 min (was 1 hr) so admin toggles reflect quickly. FSC cache stays at 1 hr. |
| Booking flow | Multi-step form, server-side price recalculation, full pricing snapshot locked to DB |
| Membership plans page | Silver ₹299/yr · Gold ₹1,499/yr — live from DB |
| Tracking page UI + AfterShip integration | Timeline view, status badges — UI complete. AfterShip service, webhook, and assign-tracking endpoint all built and tested. Awaiting Render env vars + AfterShip dashboard webhook config to go live. |
| Static pages | Home, About, Services, Contact |
| DB schema | All 13 tables live on Neon, 2,910 rate card rows seeded and verified against 2026 PDFs |

---

## What's Built but Not Yet Working

| Feature | Why it's not working |
|---|---|
| Tracking — live carrier data | AfterShip fully integrated (webhook, polling, assign-tracking). Pending ops config only: set `AFTERSHIP_API_KEY` + `AFTERSHIP_WEBHOOK_SECRET` on Render, register webhook URL in AfterShip dashboard. No code changes needed. |
| Payment gateway (Razorpay) | UI screens designed. Blocked — waiting on client's Razorpay credentials. |
| Membership checkout | UI done (UPI / card / net banking). Blocked — same Razorpay dependency. |
| Contact form | Form UI done. No backend route — submissions go nowhere. |
| Order history page | `GET /api/bookings` backend works. No frontend screen built yet. |

---

## Not Built Yet

### Tier 1 — Unblocked, Build Next

| Feature | What it is | Est. effort |
|---|---|---|
| Ops panel — Phase 1 staff form | Internal form for staff to update booking status: pickup assigned → collected → inscan → weight verified → outscan (AWB assigned). AWB assign triggers AfterShip registration automatically. Without this, staff edits Neon directly for every booking. | 1 day |
| Order history page (frontend) | Screen for logged-in customers to see past bookings and click into tracking. Backend (`GET /api/bookings`) already works. | 1 day |

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
| 1 | Health check endpoint | ✅ Done (2 Apr 2026) |
| 2 | AfterShip tracking integration | ✅ Done (3 Apr 2026) — webhook, polling, assign-tracking all built + tested. Ops config pending (env vars + AfterShip dashboard). |
| 3 | Ops panel — Phase 1 staff form | Build next |
| 4 | Order history page (frontend) | Build next |
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
| bookings | 2 | 1 test booking (UNX-2026-473925, status=delivered) · 1 pending |
| tracking_events | 2 | Test rows from 2 Apr 2026 webhook test — InTransit + Delivered |
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
