# Uniex — Project Status
**Date:** 18 March 2026
**Platform:** uniex-refresh-glow-2.onrender.com (frontend) · uniex-refresh-glow-1.onrender.com (backend)

---

## What's Live & Working

### Rate Calculator
- User can enter destination, weight, and item type
- Live quotes returned from DHL, FedEx, and UPS
- Prices include base rate + fuel surcharge + GST
- Delivery days shown per carrier per route

### Membership Plans Page
- Silver (₹299/year) and Gold (₹1,499/year) plans displayed
- Prices pulled live from database
- Savings calculator works
- Plan details and feature comparison visible

### Static Pages
- Home, About, Services, Contact — all live
- WhatsApp button, chat widget present

---

## What's Built but Not Yet Working

### User Auth (Signup / Login)
- UI is fully designed
- Backend code written using BetterAuth
- **Not working** — returns error on Render, needs fix

### Booking Flow
- Multi-step form UI is complete (sender, receiver, dimensions, weight)
- Backend route exists
- **Not working** — blocked by auth not working

### Tracking Page
- UI is built (timeline view, status badges)
- Backend route exists
- **Not working** — no real tracking data in database yet

### Membership Checkout
- Payment form UI is complete (UPI, card, net banking tabs)
- Backend subscribe route exists
- **Not working** — blocked by auth not working

### Contact Form
- Form UI is complete
- **Not working** — no backend, submissions go nowhere

---

## Not Built Yet

### Payment Gateway
- Card, UPI, net banking UI screens are designed
- No actual payment processor connected (Razorpay needed)
- No money can be collected currently

### Order History
- No page built for users to view past shipments
- Backend API exists but no frontend screen

### Admin Panel
- Nothing built
- Needed to: manage bookings, update rates, view customers, change order status

### Email Notifications
- No booking confirmation emails
- No tracking update alerts to customers

### WhatsApp Notifications
- No automated messages on booking confirmation or status change

---

## Build Order (What to Do Next)

| Priority | Feature | Depends On |
|---|---|---|
| 1 | Fix Auth (login/signup) | — |
| 2 | Fix Booking flow | Auth |
| 3 | Payment gateway (Razorpay) | Booking |
| 4 | Email + WhatsApp notifications | Booking + Payment |
| 5 | Tracking ID (real events) | Booking |
| 6 | Order history page | Auth + Booking |
| 7 | Admin panel | All of the above |
