# Rate Engine — Implementation Plan
Branch: `claude/rate-calculation-logic`
Source: `docs/RATE_CALCULATION.Md` analysis
Date: 2026-03-31

---

## What's Already Correct
- Chargeable weight: 0.5kg rounding (`Math.ceil(raw * 2) / 2`) ✅
- Volumetric weight: DIM divisor 5000 (unconfirmed with client — assumed) ✅
- GST 18% hardcoded ✅
- Zone lookup from `carrier_zones` table ✅
- Rate card steps + bands DB structure ✅
- FSC fetched from `fuel_surcharges` table ✅

---

## Priority Order

### P1 — Add `surcharge_config` table ✅ Done
### P2 — Add margin step to rate engine ✅ Done
### P3 — Add demand surcharge toggle ✅ Done
### P4 — DHL premium service selector ✅ Done
### P5 — FedEx peak surcharge + IP/IPF zone support ✅ Done
### P6 — UPS fixed charges + weight validation ✅ Done
### P7 — Update `bookings` table columns ✅ Done
### P8 — Frontend booking form updates ✅ Done
New DB table. Stores per-carrier, admin-editable: margin_pct, demand_active, demand_per_kg, peak_active (FedEx), peak_amount (FedEx), surge_active (UPS), surge_amount (UPS).

Seed defaults:
- DHL: margin_pct=20, demand_active=false, demand_per_kg=0
- FedEx: margin_pct=20, demand_active=false, demand_per_kg=0, peak_active=false, peak_amount=0
- UPS: margin_pct=20, demand_active=false, demand_per_kg=0, surge_active=false, surge_amount=0

### P2 — Add margin step to rate engine
Correct order per PDF: `base → margin → FSC → demand → [carrier extras] → GST`
Currently FSC is applied on `discountedBase` with no margin step at all.
```ts
with_margin = base_rate × (1 + margin_pct / 100)
```
FSC must be applied on `with_margin`, not on raw base.
Add `marginInr`, `marginPct` to `RateResult`.
Hide margin from customer-facing breakdown.

### P3 — Add demand surcharge toggle (all carriers)
When `demand_active = true`: add `demand_per_kg × chargeable_kg` before GST.
Add `demandSurchargeInr` to `RateResult`.
Config from `surcharge_config` table.

### P4 — DHL premium service selector
Input: `dhlService?: 'standard' | 'premium_900' | 'premium_1200'`
- `premium_900` → +₹3,000 flat before GST
- `premium_1200` → +₹1,000 flat before GST
Hardcoded values (not DB). Add `premiumServiceInr` to `RateResult`.

### P5 — FedEx peak surcharge + IP/IPF zone support
- Add `service_type TEXT DEFAULT 'standard'` column to `carrier_zones` (FedEx rows: 'IP' or 'IPF')
- Input: `fedexService?: 'IP' | 'IPF'`
- Peak surcharge: flat amount from `surcharge_config` when `peak_active = true`
- Add `peakSurchargeInr` to `RateResult`.

### P6 — UPS fixed charges + weight validation
All hardcoded per PDF:

| Charge | Amount | Trigger |
|---|---|---|
| US inbound surcharge | ₹230 | destination = USA (auto) |
| Remote area | max(57×kg, 3150) | staff flags at booking |
| Formal clearance | ₹3,150 | customer selects |
| DDP delivery | ₹1,050 | customer selects |
| Signature delivery | ₹368 | customer selects |
| Girth surcharge | ₹9,450 | staff flags post-booking |
| Surge fee | from surcharge_config | always added if active |

Weight block: reject UPS quote if `weightKg > 70`.
Min 40kg chargeable if girth > 300cm (post-booking, staff flags).

Input additions:
```ts
upsOptions?: { formalClearance?: boolean; ddp?: boolean; signature?: boolean }
```
Add `usInboundInr`, `upsFixedInr` to `RateResult`.

### P7 — Update `bookings` table columns
New columns for pricing snapshot:
- `margin_inr`, `demand_surcharge_inr`, `premium_service_inr`, `peak_surcharge_inr`
- `us_inbound_inr`, `ups_fixed_inr`
- `dhl_service` TEXT, `fedex_service` TEXT
- `ups_formal_clearance` BOOL, `ups_delivery_type` TEXT, `ups_signature` BOOL, `ups_remote_area` BOOL

### P8 — Frontend booking form updates
- DHL service selector (Standard / 12pm / 9am) on rate quote
- UPS option checkboxes (formal clearance / DDP / signature)
- Correct disclaimer per carrier on quote page
- UPS weight guard: block quote if weight > 70kg
- Hide margin in breakdown (show fuel, demand, premium, GST, total only)
- DHL hard limits: max 3000kg total, max 1000kg/piece, max 300cm length

---

## Items Needing Client Confirmation (do not implement until confirmed)
1. **Exact margin %** per carrier — "10–30% variable" is too vague. Need specific %.
2. **FSC order**: does FSC apply on `base` or `base+margin`? (Currently plan: base+margin, per doc)
3. **Volumetric divisor**: 5000 assumed — confirm with carrier account managers.
4. **Discount code logic** — mentioned but unspecified. No structure to implement.
