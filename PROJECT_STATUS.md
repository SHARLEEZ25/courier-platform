# Uniex — Project Status
**Last updated:** 1 April 2026
**Platform:** uniex-refresh-glow-2.onrender.com (frontend) · uniex-refresh-glow-1.onrender.com (backend)

---

## What's Live & Working

### Auth (Login / Signup)
- Firebase Auth end-to-end — login, signup, token passed as Bearer header
- Backend: firebase-admin `verifyIdToken`, `requireAuth` middleware
- Frontend: AuthContext, firebase SDK, protected routes

### Rate Calculator
- Live quotes from DHL, FedEx, UPS
- Full pricing pipeline per 2026 carrier PDF specs:
  `base rate → item discount → margin → FSC → demand surcharge → carrier extras → GST`
- Margin configurable per carrier via `surcharge_config` table (default 20%)
- FSC pulled monthly from `fuel_surcharges` table
- Demand surcharge toggle per carrier (off by default)
- DHL: premium delivery windows (Standard / 12pm / 9am) — customer selects at quote
- FedEx: peak surcharge toggle (off by default); IP/IPF service type support
- UPS: formal clearance, DDP, signature, US inbound surcharge — customer selects at quote
- UPS 70 kg hard block — system excludes UPS from quotes above this weight
- Pickup surcharge applied per pincode from `pickup_zones` table
- Per-carrier legal disclaimers shown on quote page

### Booking Flow
- Multi-step form: route → sender → receiver → confirm
- Server-side rate recalculation on submit (price manipulation proof)
- Booking saved to DB with full pricing snapshot locked at booking time
- BookingConfirmation page shown after submit
- Zod validation aligned between frontend and backend

### Membership Plans Page
- Silver (₹299/yr, 10% off) and Gold (₹1,499/yr, 15% off) pulled live from DB

### Static Pages
- Home, About, Services, Contact — all live
- WhatsApp button, chat widget (no AI logic)

---

## What's Built but Not Yet Working

### Tracking Page
- UI built (timeline view, status badges)
- Backend route exists (`GET /api/tracking/:id`)
- **No real data** — AfterShip integration not built. `tracking_events` table is empty.

### Membership Checkout
- Payment form UI complete (UPI / card / net banking tabs)
- Backend subscribe route exists
- **Blocked** — Razorpay not connected (waiting on client credentials)

### Contact Form
- Form UI complete, **no backend** — submissions go nowhere

### Order History Page
- Backend API exists (`GET /api/bookings`) and works
- **No frontend screen** — to be built

---

## Not Built Yet

| Feature | Blocked on | Notes |
|---|---|---|
| AfterShip tracking integration | Nothing (API key ready) | **Build this next** |
| Order history page (frontend) | Nothing (backend ready) | After AfterShip |
| Razorpay payment gateway | Client Razorpay credentials | UI screens already designed |
| Email notifications | Payment | Booking confirmation + tracking alerts |
| WhatsApp notifications | Payment | |
| Admin / Ops panel | Razorpay + tracking working | Minimal: bookings list + status update + add event |
| AI chat logic | — | Chat widget UI present, no logic |
| Lead capture | — | |
| NDR handling | — | |
| Remarketing emails | — | |

---

## Database (Neon)

**Project:** unix · `falling-night-64411631` · Singapore (ap-southeast-1)
**Full schema doc:** `docs/DB_SCHEMA_HANDOVER.md`

| Table | Rows | Notes |
|---|---|---|
| carriers | 4 | DHL, FedEx, UPS, Aramex (Aramex has no rate data) |
| carrier_zones | 445 | DHL 109 + FedEx 230 (IP+IPF) + UPS 106 |
| rate_card_steps | 2,910 | All 3 carriers, doc + package |
| rate_card_bands | 210 | DHL + UPS heavy brackets |
| rate_card_slabs | 0 | Legacy, unused |
| fuel_surcharges | 4 | March 2026 FSC per carrier |
| surcharge_config | 13 | Margin 20%, all surcharges off |
| item_type_discounts | 14 | All item types seeded |
| pickup_zones | 190 | TN 160 (free) + metro 26 + north 4 |
| bookings | 0 | Live operational |
| tracking_events | 0 | Live operational — no AfterShip yet |
| membership_plans | 2 | Silver ₹299, Gold ₹1,499 |
| user_memberships | 0 | Live operational |

Rate card data verified against 2026 PDFs:
- DHL ✅
- FedEx ✅
- UPS ✅ (corrected 28 Mar 2026 — all 18 zones now correct)

---

## Build Order (Remaining)

| Priority | Feature | Blocked on | Status |
|---|---|---|---|
| ✅ | Auth | — | Done |
| ✅ | Booking flow | Auth | Done |
| ✅ | Rate engine (full 2026 spec) | — | Done 1 Apr 2026 |
| 1 | AfterShip tracking (real events) | API key ready | **Next** |
| 2 | Order history page (frontend) | Backend ready | After AfterShip |
| 3 | Razorpay payment gateway | Client credentials | Blocked |
| 4 | Email + WhatsApp notifications | Razorpay | After payment |
| 5 | Admin / Ops panel | Tracking + payment | After above |

---

## Pending Client Confirmations (do not build until confirmed)

1. **Margin % per carrier** — currently 20% across all. Client said "10–30% variable" — need specific numbers.
2. **Razorpay API credentials** — account not yet set up by client.
3. **FedEx IPF zone chart** — IPF zones currently identical to IP. Needs carrier account manager input.
4. **FSC calculation base** — confirm FSC applies on base+margin (current assumption) or base only.
5. **Volumetric divisor** — confirm ÷5000 with each carrier's account manager.
6. **Discount code structure** — client mentioned it, gave no detail.

---

## Known Issues / Tech Debt

- Contact form submissions go nowhere (no backend route)
- Membership checkout blocked on Razorpay
- No booking confirmation email sent to customer
- Booking status stays `pending` forever until manually updated in Neon table editor
- No automated pickup assignment workflow
- `rate_card_slabs` table exists but is unused — can be dropped in a future cleanup migration
