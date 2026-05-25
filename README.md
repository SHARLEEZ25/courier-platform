# Uniex Courier — International Shipping Platform

Built a full-stack multi-carrier courier aggregator — one system handling the complete shipment lifecycle from quote to delivery.

Customers get live rates, book shipments, and track deliveries. The ops team manages the entire workflow through a dedicated admin panel, all in the same application.

---

## What It Does

### Customer Side
- Live rate quotes across DHL, FedEx, and UPS — calculated in real time
- Multi-step booking flow with server-side price verification
- Shipment tracking with a milestone timeline view
- Membership plans (Silver / Gold) with subscription management

### Admin / Ops Side
- Pickup queue management and assignment
- Inscan and outscan workflow for warehouse operations
- NDR (Non-Delivery Report) handling
- Lead tracking and remarketing tools
- Staff management and system config

---

## Tech Stack

### Frontend
| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| State / Data | TanStack Query |
| Routing | React Router v6 |
| UI | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Forms | react-hook-form + Zod |

### Backend
| | |
|---|---|
| Runtime | Node.js + Hono |
| Database | PostgreSQL 17 (Neon) via postgres.js |
| Auth | Firebase Auth (SDK + firebase-admin) |
| Validation | Zod + @hono/zod-validator |
| Rate Limiting | hono-rate-limiter |
| Testing | Vitest + Playwright |

---

## System Design Highlights

- **Multi-carrier rate engine** — DB-driven pricing pipeline: base rate → margin → FSC → demand surcharge → carrier extras → GST
- **TTL-based in-memory caching** — scoped per data type: 5 min for config, 30 min for zones and rate cards, 1 hr for fuel surcharges
- **Server-side rate recalculation at booking** — price is re-derived on the backend at submission; client-side quote is never trusted
- **Firebase Auth with backend verification** — every protected route validates the Firebase ID token via firebase-admin
- **DB-driven surcharge config** — FSC %, margin %, and demand surcharge are toggled via database rows, no code deploy needed

---

## Repository Structure

**Frontend**
```
frontend/
├── src/
│   ├── pages/          Route-level views — customer flow (quote, booking, tracking) + full admin panel subtree
│   ├── components/     Page sections, shared UI, shadcn primitives (ui/)
│   ├── hooks/          TanStack Query hooks per feature + admin/ subfolder
│   ├── lib/            Firebase client, Axios instance, utilities
│   ├── context/        AuthContext — Firebase session and user state
│   └── types/          Shared TypeScript types
├── public/
└── index.html
```

**Backend**
```
backend/
├── routes/             API route handlers — rates, bookings, tracking, admin, membership, pincode
├── services/
│   ├── rate-engine/    Multi-carrier pricing logic — weight calc, FSC, GST, zone resolution
│   └── aftership.ts    AfterShip webhook integration
├── controllers/        Request handlers decoupled from routes
├── middleware/         Auth, rate-limit, and request validation
├── db/                 Schema, versioned migrations, seed data
└── config/             DB connection (postgres.js), Firebase Admin SDK, env validation
```

---

## Running Locally

This project requires environment variables for Firebase, PostgreSQL, and carrier API keys (DHL, FedEx, UPS).

Interested in running it or exploring the architecture?

**Reach out and I'll walk you through it.**

- Email: sharleez.work@gmail.com
- LinkedIn: https://www.linkedin.com/in/sharleez-tech/

---

*Built with a focus on real-world patterns: multi-carrier aggregation, ops workflow management, and a pricing engine that stays accurate without redeployments.*
