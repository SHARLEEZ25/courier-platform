# Uniex Courier — DB Test Plan (Before Backend Work)
> Run all queries in **Neon SQL Editor** against project `unix` (falling-night-64411631, ap-southeast-1).
> Purpose: confirm the DB is in a known-good state before building Ops Panel Phase 1, Order History, and Razorpay.

---

## 1. Table Row Counts — Baseline Health Check

Run this first. Confirm every table matches expected row counts.

```sql
SELECT
  relname AS table_name,
  n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY relname;
```

**Expected counts (from PROJECT_STATUS.md):**

| Table | Expected Rows |
|---|---|
| `carriers` | 4 |
| `carrier_zones` | 445 |
| `rate_card_steps` | 2,910 |
| `rate_card_bands` | 210 |
| `rate_card_slabs` | 0 — legacy, unused |
| `fuel_surcharges` | 4 |
| `surcharge_config` | 13 |
| `item_type_discounts` | 14 |
| `pickup_zones` | 190 |
| `bookings` | 2 |
| `tracking_events` | 2 |
| `membership_plans` | 2 |
| `user_memberships` | 0 |

> If `rate_card_steps` is not 2,910 or `carrier_zones` is not 445, the seed is corrupted — re-run `npm run db:seed` before anything else.

---

## 2. Carrier Seed Integrity

### 2a. All 4 carriers present
```sql
SELECT id, display_name, is_active FROM carriers ORDER BY id;
```
Expect: dhl, fedex, ups, aramex all present.

### 2b. Aramex has zero rate data (must never appear in quotes)
```sql
SELECT COUNT(*) FROM rate_card_steps WHERE carrier_id = 'aramex';
SELECT COUNT(*) FROM carrier_zones WHERE carrier_id = 'aramex';
```
Expect: both return 0.

---

## 3. Zone Coverage Tests

### 3a. DHL — must have zones 1–14
```sql
SELECT DISTINCT zone_code
FROM carrier_zones
WHERE carrier_id = 'dhl'
ORDER BY zone_code::int;
```
Expect: 14 distinct zone codes (1 through 14).

### 3b. FedEx — must have both IP and IPF service_type
```sql
SELECT service_type, COUNT(DISTINCT zone_code) AS zones, COUNT(*) AS rows
FROM carrier_zones
WHERE carrier_id = 'fedex'
GROUP BY service_type;
```
Expect: 2 rows — IP and IPF.

### 3c. UPS — zones 1–10 plus named country columns
```sql
SELECT DISTINCT zone_code
FROM carrier_zones
WHERE carrier_id = 'ups'
ORDER BY zone_code;
```
Expect: zones 1–10 plus: USA, Canada, Australia, New Zealand, Singapore, Germany, Poland, New Caledonia.

### 3d. Critical country spot-checks (from PDFs)
```sql
-- DHL: UAE = Zone 1, USA = Zone 12, Australia = Zone 14
SELECT carrier_id, destination_country, zone_code
FROM carrier_zones
WHERE carrier_id = 'dhl'
  AND destination_country IN ('United Arab Emirates', 'United States', 'Australia')
ORDER BY destination_country;

-- FedEx: UAE = Zone A (IP), USA = Zone G (IP)
SELECT carrier_id, destination_country, zone_code, service_type
FROM carrier_zones
WHERE carrier_id = 'fedex'
  AND destination_country IN ('United Arab Emirates', 'United States')
ORDER BY destination_country, service_type;

-- UPS: UAE = Zone 1, USA = named 'USA'
SELECT carrier_id, destination_country, zone_code
FROM carrier_zones
WHERE carrier_id = 'ups'
  AND destination_country IN ('United Arab Emirates', 'United States')
ORDER BY destination_country;
```
If any of these resolve to wrong zones, every quote for those destinations is mispriced.

---

## 4. Rate Card Integrity Tests

### 4a. Each carrier has both document and package steps
```sql
SELECT carrier_id, shipment_type, COUNT(*) AS step_count
FROM rate_card_steps
GROUP BY carrier_id, shipment_type
ORDER BY carrier_id, shipment_type;
```
Expect: 6 rows (dhl-document, dhl-package, fedex-document, fedex-package, ups-document, ups-package). No aramex rows.

### 4b. Rate steps go in 0.5kg increments — spot check DHL Zone 1
```sql
SELECT weight_kg, price_inr
FROM rate_card_steps
WHERE carrier_id = 'dhl'
  AND zone_code = '1'
  AND shipment_type = 'package'
ORDER BY weight_kg
LIMIT 20;
```
Expect: rows at 0.5, 1.0, 1.5, 2.0 ... with price_inr increasing as weight increases.

### 4c. No zero or negative prices
```sql
SELECT carrier_id, zone_code, shipment_type, weight_kg, price_inr
FROM rate_card_steps
WHERE price_inr <= 0;
```
Expect: 0 rows.

### 4d. Heavy weight bands present for DHL and UPS (above 30kg)
```sql
SELECT carrier_id, zone_code, weight_min_kg, weight_max_kg, price_per_kg, band_type
FROM rate_card_bands
WHERE carrier_id IN ('dhl', 'ups')
ORDER BY carrier_id, zone_code, weight_min_kg
LIMIT 20;
```
Expect: multiple rows. band_type = 'multiplicative' for DHL and UPS (confirmed from PDFs).

### 4e. UPS has no rate data above 70kg
```sql
SELECT COUNT(*) FROM rate_card_steps WHERE carrier_id = 'ups' AND weight_kg > 70;
```
Expect: 0.

### 4f. 0.5kg rounding produces a valid lookup (1.1kg → 1.5kg row)
```sql
SELECT weight_kg, price_inr
FROM rate_card_steps
WHERE carrier_id = 'dhl'
  AND zone_code = '12'
  AND shipment_type = 'package'
  AND weight_kg = 1.5;
```
Expect: 1 row with valid price.

---

## 5. Fuel Surcharge Tests

### 5a. All carriers have a current FSC row
```sql
SELECT carrier_id, fsc_percent, effective_from, effective_to
FROM fuel_surcharges
ORDER BY carrier_id;
```
Expect: dhl 29.5%, fedex 27%, ups 26.5%, aramex 24%. effective_to = NULL for all.

### 5b. No overlapping active FSC rows (ambiguous lookup)
```sql
SELECT carrier_id, COUNT(*) AS active_rows
FROM fuel_surcharges
WHERE effective_to IS NULL
GROUP BY carrier_id;
```
Expect: each carrier has exactly 1 active row.

---

## 6. Surcharge Config Tests

### 6a. All 13 config rows present
```sql
SELECT carrier_id, key, value_num, value_bool
FROM surcharge_config
ORDER BY carrier_id, key;
```
Expect exactly 13 rows:

| carrier_id | key | value |
|---|---|---|
| dhl | demand_active | false |
| dhl | demand_per_kg | 0 |
| dhl | margin_pct | 20 |
| fedex | demand_active | false |
| fedex | demand_per_kg | 0 |
| fedex | margin_pct | 20 |
| fedex | peak_active | false |
| fedex | peak_amount | 0 |
| ups | demand_active | false |
| ups | demand_per_kg | 0 |
| ups | margin_pct | 20 |
| ups | surge_active | false |
| ups | surge_amount | 0 |

NOTE: margin_pct = 20 is a placeholder. Client has not confirmed per-carrier margins.

### 6b. No row with both value columns NULL (corruption)
```sql
SELECT * FROM surcharge_config
WHERE value_num IS NULL AND value_bool IS NULL;
```
Expect: 0 rows.

---

## 7. Item Type Discounts Tests

### 7a. All 14 item types with correct discounts
```sql
SELECT item_type_id, display_name, discount_pct
FROM item_type_discounts
ORDER BY discount_pct DESC;
```
Expect: university = 0.5, docs = 0.15, excess = 0.1, rest = 0.

### 7b. No discount_pct outside 0–1 range
```sql
SELECT * FROM item_type_discounts WHERE discount_pct < 0 OR discount_pct > 1;
```
Expect: 0 rows.

---

## 8. Pickup Zone Tests

### 8a. Tamil Nadu pincodes have zero surcharge
```sql
SELECT COUNT(*) FROM pickup_zones WHERE tier = 'tn' AND surcharge_inr != 0;
```
Expect: 0.

### 8b. Surcharge tiers are in correct ranges
```sql
SELECT tier, MIN(surcharge_inr), MAX(surcharge_inr), COUNT(*)
FROM pickup_zones
GROUP BY tier;
```
Expect: tn = 0–0, metro = 200–250, north = 300–400.

### 8c. Key pincode spot-checks
```sql
SELECT pincode, city_name, surcharge_inr, tier
FROM pickup_zones
WHERE pincode IN ('600001', '400001', '110001', '560001');
```
Expect: Chennai = 0, Mumbai = 200, Delhi = 200, Bengaluru = 200.

---

## 9. Booking Table Tests

### 9a. Test booking is intact
```sql
SELECT
  booking_ref, status, carrier_id,
  actual_weight_kg, chargeable_weight_kg,
  base_rate_inr, margin_inr, fsc_inr, gst_inr, total_inr,
  tracking_number
FROM bookings
ORDER BY created_at;
```
Expect: UNX-2026-473925 with status = 'delivered', tracking_number = 'ITD-0-12345678'.

### 9b. Pricing math is consistent on the test booking
```sql
SELECT
  booking_ref,
  subtotal_inr,
  total_inr,
  ROUND((subtotal_inr * 1.18), 2) AS calculated_total
FROM bookings
WHERE booking_ref = 'UNX-2026-473925';
```
Expect: total_inr matches calculated_total within Rs 0.01.

### 9c. No NULL in critical pricing columns
```sql
SELECT booking_ref FROM bookings
WHERE base_rate_inr IS NULL
   OR subtotal_inr IS NULL
   OR gst_inr IS NULL
   OR total_inr IS NULL;
```
Expect: 0 rows.

### 9d. Status values are within allowed set
```sql
SELECT DISTINCT status FROM bookings;
```
Expect: only values from: pending, confirmed, picked_up, in_transit, delivered, cancelled.

---

## 10. Tracking Events Tests

### 10a. Events exist and are joined to the right booking
```sql
SELECT
  b.booking_ref,
  te.event_code,
  te.description,
  te.event_at
FROM tracking_events te
JOIN bookings b ON b.id = te.booking_id
ORDER BY te.event_at;
```
Expect: 2 rows linked to UNX-2026-473925 — InTransit then Delivered.

### 10b. Forward-only: InTransit is before Delivered
```sql
SELECT event_code, event_at
FROM tracking_events te
JOIN bookings b ON b.id = te.booking_id
WHERE b.booking_ref = 'UNX-2026-473925'
ORDER BY event_at;
```
Expect: InTransit timestamp < Delivered timestamp.

### 10c. Cascade delete test (throwaway booking)
```sql
-- Step 1: Insert throwaway booking
INSERT INTO bookings (
  booking_ref, carrier_id, origin_country, destination_country,
  actual_weight_kg, chargeable_weight_kg, item_type_id,
  base_rate_inr, subtotal_inr, gst_inr, total_inr,
  sender_name, sender_mobile, pickup_pincode, pickup_address,
  pickup_city, pickup_state, pickup_date, pickup_slot,
  receiver_name, receiver_mobile, delivery_address,
  delivery_city, delivery_state, delivery_zip
) VALUES (
  'TEST-CASCADE-DELETE', 'dhl', 'India', 'United States',
  1.0, 1.0, 'other', 1000, 1200, 216, 1416,
  'Test Sender', '9999999999', '600001', '123 Test St',
  'Chennai', 'Tamil Nadu', CURRENT_DATE, 'morning',
  'Test Receiver', '8888888888', '456 Test Ave',
  'New York', 'NY', '10001'
);

-- Step 2: Add event to it
INSERT INTO tracking_events (booking_id, tracking_number, event_code, description, event_at)
SELECT id, 'TEST-TRK-001', 'InfoReceived', 'Test event', now()
FROM bookings WHERE booking_ref = 'TEST-CASCADE-DELETE';

-- Step 3: Delete the booking
DELETE FROM bookings WHERE booking_ref = 'TEST-CASCADE-DELETE';

-- Step 4: Confirm tracking event was cascade-deleted
SELECT COUNT(*) FROM tracking_events WHERE tracking_number = 'TEST-TRK-001';
-- Expect: 0
```

---

## 11. Membership Tests

### 11a. Both plans seeded correctly
```sql
SELECT id, name, price_inr, discount_pct, duration_months
FROM membership_plans;
```
Expect: silver Rs299 10%, gold Rs1499 15%, both 12 months.

### 11b. No active memberships yet
```sql
SELECT COUNT(*) FROM user_memberships WHERE is_active = true;
```
Expect: 0.

---

## 12. Rate Calculation Smoke Tests (Pure SQL)

Manually simulate what the rate engine does, to verify data independently of code.

### 12a. DHL — 1kg Document to UAE
```sql
-- Zone
SELECT zone_code FROM carrier_zones
WHERE carrier_id = 'dhl'
  AND destination_country = 'United Arab Emirates'
  AND service_type = 'standard';
-- Expect: '1'

-- Base rate
SELECT price_inr FROM rate_card_steps
WHERE carrier_id = 'dhl'
  AND zone_code = '1'
  AND shipment_type = 'document'
  AND weight_kg = 1.0;
-- Expect: > 0

-- FSC
SELECT fsc_percent FROM fuel_surcharges
WHERE carrier_id = 'dhl' AND effective_to IS NULL;
-- Expect: 29.5

-- Margin
SELECT value_num FROM surcharge_config
WHERE carrier_id = 'dhl' AND key = 'margin_pct';
-- Expect: 20

-- Manual check: base * 1.20 * 1.295 * 1.18 = final
-- Cross-check against the rate engine API for the same inputs
```

### 12b. UPS — 5kg Package to USA
```sql
-- Zone (should be named 'USA', not a number)
SELECT zone_code FROM carrier_zones
WHERE carrier_id = 'ups'
  AND destination_country = 'United States';
-- Expect: 'USA'

-- Base rate
SELECT price_inr FROM rate_card_steps
WHERE carrier_id = 'ups'
  AND zone_code = 'USA'
  AND shipment_type = 'package'
  AND weight_kg = 5.0;
-- Expect: > 0
-- Note: backend also adds Rs 230 US inbound surcharge on top
```

### 12c. FedEx — check if IP and IPF zones actually differ
```sql
SELECT destination_country, service_type, zone_code
FROM carrier_zones
WHERE carrier_id = 'fedex'
  AND destination_country = 'Japan'
ORDER BY service_type;
-- If IP and IPF are identical for all countries, the IPF placeholder
-- from HANDOVER.md is still unresolved. Flag to client.
```

---

## 13. Constraint Tests

### 13a. Duplicate booking_ref is rejected
```sql
INSERT INTO bookings (
  booking_ref, carrier_id, origin_country, destination_country,
  actual_weight_kg, chargeable_weight_kg, item_type_id,
  base_rate_inr, subtotal_inr, gst_inr, total_inr,
  sender_name, sender_mobile, pickup_pincode, pickup_address,
  pickup_city, pickup_state, pickup_date, pickup_slot,
  receiver_name, receiver_mobile, delivery_address,
  delivery_city, delivery_state, delivery_zip
) VALUES (
  'UNX-2026-473925', 'dhl', 'India', 'United States',
  1.0, 1.0, 'other', 1000, 1200, 216, 1416,
  'Test', '9999999999', '600001', '123 Test St',
  'Chennai', 'Tamil Nadu', CURRENT_DATE, 'morning',
  'Receiver', '8888888888', '456 Ave', 'New York', 'NY', '10001'
);
-- Expect: ERROR unique_violation on booking_ref
```

### 13b. Invalid status is rejected
```sql
UPDATE bookings SET status = 'lost' WHERE booking_ref = 'UNX-2026-473925';
-- Expect: ERROR check_violation
ROLLBACK;
```

### 13c. updated_at trigger advances on any UPDATE
```sql
SELECT updated_at FROM bookings WHERE booking_ref = 'UNX-2026-473925';
UPDATE bookings SET status = 'delivered' WHERE booking_ref = 'UNX-2026-473925';
SELECT updated_at FROM bookings WHERE booking_ref = 'UNX-2026-473925';
-- Expect: second timestamp is more recent
```

### 13d. Duplicate zone entry is rejected
```sql
INSERT INTO carrier_zones
  (carrier_id, origin_country, destination_country, zone_code, service_type)
VALUES ('dhl', 'India', 'United Arab Emirates', '1', 'standard');
-- Expect: ERROR unique_violation
```

---

## 14. Index Verification

```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename IN (
  'rate_card_steps', 'rate_card_bands', 'carrier_zones',
  'bookings', 'tracking_events', 'user_memberships'
)
ORDER BY tablename, indexname;
```

All 11 indexes must be present:
- rate_card_steps: idx_rcs_carrier_zone, idx_rcs_lookup_optimized
- rate_card_bands: idx_rcb_carrier_zone, idx_rcb_lookup_optimized
- carrier_zones: idx_cz_route
- bookings: idx_bookings_user, idx_bookings_ref, idx_bookings_tracking
- tracking_events: idx_tracking_events_booking, idx_tracking_events_number
- user_memberships: idx_user_memberships_user

---

## Pass Criteria Summary

| # | Area | Pass Condition |
|---|---|---|
| 1 | Row counts | All 13 tables match expected counts |
| 2 | Carrier seed | 4 carriers; Aramex has 0 rate data |
| 3 | Zone coverage | DHL zones 1–14, FedEx has IP+IPF, UPS has named columns + zones 1–10 |
| 4 | Zone spot-checks | UAE/USA/Australia resolve to correct zones per PDFs |
| 5 | Rate card steps | No zero prices, 0.5kg increment structure intact |
| 6 | Rate card bands | DHL + UPS heavy brackets present, band_type = multiplicative |
| 7 | FSC | Exactly 1 active row per carrier, no overlaps |
| 8 | Surcharge config | All 13 keys present, no NULL-NULL rows |
| 9 | Item type discounts | 14 rows, all discount_pct in 0–1 range |
| 10 | Pickup zones | TN = Rs0, metro = Rs200–250, north = Rs300–400 |
| 11 | Bookings | Test booking intact, pricing math consistent |
| 12 | Tracking events | 2 rows, InTransit before Delivered, cascade delete works |
| 13 | Memberships | Silver Rs299 / Gold Rs1499, zero active memberships |
| 14 | Constraints | Unique + CHECK constraints reject bad data, trigger fires |
| 15 | Indexes | All 11 indexes present |

Do not begin Ops Panel Phase 1, Order History, or Razorpay backend work until all 15 pass.
Any mismatch in rate_card_steps or carrier_zones means quotes are wrong — and once a booking is placed, the price snapshot is locked in forever.
