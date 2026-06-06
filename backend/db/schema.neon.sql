-- ============================================================
-- Uniex Courier — Neon DB Schema
-- This is the canonical, current schema (the project previously ran on
-- Supabase Postgres; that schema has been retired in favor of this one):
--   1. user_id columns are TEXT (Firebase UIDs) instead of
--      UUID REFERENCES auth.users(id)
--   2. No RLS policies (auth enforced at API layer)
--   3. rate_card_steps + rate_card_bands included (from migration 001)
--   4. All indexes included (from migration 002)
--
-- Run this ONCE in Neon SQL Editor before starting the app.
-- Then run: npm run db:seed  (after Step 2 — Neon client switch)
-- ============================================================

-- ============================================================
-- CARRIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS carriers (
  id           TEXT PRIMARY KEY,
  display_name TEXT    NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  logo_url     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO carriers (id, display_name) VALUES
  ('dhl',    'DHL Express'),
  ('fedex',  'FedEx International'),
  ('ups',    'UPS Worldwide'),
  ('aramex', 'Aramex Express')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ZONE DEFINITIONS
-- (carrier_zones rows are populated by npm run db:seed)
-- ============================================================
CREATE TABLE IF NOT EXISTS carrier_zones (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id          TEXT NOT NULL REFERENCES carriers(id),
  origin_country      TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  zone_code           TEXT NOT NULL,
  -- 'standard' for DHL/UPS; 'IP' or 'IPF' for FedEx
  service_type        TEXT NOT NULL DEFAULT 'standard',
  effective_from      DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to        DATE,
  UNIQUE (carrier_id, origin_country, destination_country, service_type, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_cz_route
  ON carrier_zones (origin_country, destination_country);

-- ============================================================
-- RATE CARD SLABS (legacy table — kept for schema compatibility)
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_card_slabs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id     TEXT         NOT NULL REFERENCES carriers(id),
  zone_code      TEXT         NOT NULL,
  weight_min_kg  NUMERIC(8,3) NOT NULL,
  weight_max_kg  NUMERIC(8,3),
  price_inr      NUMERIC(10,2) NOT NULL,
  price_per_kg   NUMERIC(10,2) NOT NULL,
  effective_from DATE         NOT NULL DEFAULT CURRENT_DATE,
  effective_to   DATE,
  CONSTRAINT valid_weight CHECK (weight_min_kg >= 0),
  UNIQUE (carrier_id, zone_code, weight_min_kg, effective_from)
);

-- ============================================================
-- RATE CARD STEPS  (exact price per weight breakpoint)
-- band_type = 'multiplicative' → price = weight × price_per_kg  (DHL + UPS)
--   DHL PDF: "Multiplier rate per 1 KG from 30.1 KG" — confirmed multiplicative.
--   Rate engine clamps to max(last_step_price, band_price) to prevent crossover underpricing.
-- band_type = 'additive'       → price = base_price_inr + (weight - weight_min_kg) × price_per_kg
-- (rows populated by npm run db:seed)
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_card_steps (
  carrier_id     TEXT         NOT NULL REFERENCES carriers(id),
  zone_code      TEXT         NOT NULL,
  shipment_type  TEXT         NOT NULL CHECK (shipment_type IN ('document', 'package')),
  weight_kg      NUMERIC(6,3) NOT NULL,
  price_inr      NUMERIC(10,2) NOT NULL,
  effective_from DATE         NOT NULL DEFAULT '2026-01-01',
  effective_to   DATE,
  PRIMARY KEY (carrier_id, zone_code, shipment_type, weight_kg)
);

CREATE INDEX IF NOT EXISTS idx_rcs_carrier_zone
  ON rate_card_steps (carrier_id, zone_code, shipment_type);

CREATE INDEX IF NOT EXISTS idx_rcs_lookup_optimized
  ON rate_card_steps (carrier_id, shipment_type, weight_kg);

-- ============================================================
-- RATE CARD BANDS  (per-kg rates for heavy shipments)
-- (rows populated by npm run db:seed)
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_card_bands (
  carrier_id     TEXT         NOT NULL REFERENCES carriers(id),
  zone_code      TEXT         NOT NULL,
  shipment_type  TEXT         NOT NULL CHECK (shipment_type IN ('document', 'package')),
  weight_min_kg  NUMERIC(8,3) NOT NULL,
  weight_max_kg  NUMERIC(8,3),
  price_per_kg   NUMERIC(10,2) NOT NULL,
  base_price_inr NUMERIC(10,2) NOT NULL DEFAULT 0,
  band_type      TEXT         NOT NULL DEFAULT 'multiplicative'
                   CHECK (band_type IN ('multiplicative', 'additive')),
  effective_from DATE         NOT NULL DEFAULT '2026-01-01',
  effective_to   DATE,
  PRIMARY KEY (carrier_id, zone_code, shipment_type, weight_min_kg)
);

CREATE INDEX IF NOT EXISTS idx_rcb_carrier_zone
  ON rate_card_bands (carrier_id, zone_code, shipment_type);

CREATE INDEX IF NOT EXISTS idx_rcb_lookup_optimized
  ON rate_card_bands (carrier_id, shipment_type, weight_min_kg);

-- ============================================================
-- FUEL SURCHARGES  (update monthly)
-- ============================================================
CREATE TABLE IF NOT EXISTS fuel_surcharges (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id     TEXT         NOT NULL REFERENCES carriers(id),
  fsc_percent    NUMERIC(5,2) NOT NULL,
  effective_from DATE         NOT NULL,
  effective_to   DATE,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (carrier_id, effective_from)
);

INSERT INTO fuel_surcharges (carrier_id, fsc_percent, effective_from) VALUES
  ('dhl',    29.50, '2026-03-01'),
  ('fedex',  27.00, '2026-03-01'),
  ('ups',    26.50, '2026-03-01'),
  ('aramex', 24.00, '2026-03-01')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SURCHARGE CONFIG  (admin-editable per carrier)
-- Stores margin, demand surcharge, peak surcharge (FedEx),
-- surge fee (UPS). FSC lives in fuel_surcharges (date-based).
-- ============================================================
CREATE TABLE IF NOT EXISTS surcharge_config (
  id           SERIAL       PRIMARY KEY,
  carrier_id   TEXT         NOT NULL REFERENCES carriers(id),
  key          TEXT         NOT NULL,
  -- key values:
  --   'margin_pct'      → value_num  (e.g. 20 = 20%)
  --   'demand_active'   → value_bool
  --   'demand_per_kg'   → value_num  (INR per kg)
  --   'peak_active'     → value_bool (FedEx only)
  --   'peak_amount'     → value_num  (INR flat, FedEx only)
  --   'surge_active'    → value_bool (UPS only)
  --   'surge_amount'    → value_num  (INR flat, UPS only)
  value_num    NUMERIC(10,4),
  value_bool   BOOLEAN,
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (carrier_id, key)
);

INSERT INTO surcharge_config (carrier_id, key, value_num, value_bool) VALUES
  -- DHL
  ('dhl', 'margin_pct',    20,   NULL),
  ('dhl', 'demand_active', NULL, false),
  ('dhl', 'demand_per_kg', 0,    NULL),
  -- FedEx
  ('fedex', 'margin_pct',    20,   NULL),
  ('fedex', 'demand_active', NULL, false),
  ('fedex', 'demand_per_kg', 0,    NULL),
  ('fedex', 'peak_active',   NULL, false),
  ('fedex', 'peak_amount',   0,    NULL),
  -- UPS
  ('ups', 'margin_pct',    20,   NULL),
  ('ups', 'demand_active', NULL, false),
  ('ups', 'demand_per_kg', 0,    NULL),
  ('ups', 'surge_active',  NULL, false),
  ('ups', 'surge_amount',  0,    NULL)
ON CONFLICT (carrier_id, key) DO NOTHING;

-- ============================================================
-- ITEM TYPE DISCOUNTS
-- ============================================================
CREATE TABLE IF NOT EXISTS item_type_discounts (
  item_type_id  TEXT         PRIMARY KEY,
  display_name  TEXT         NOT NULL,
  discount_pct  NUMERIC(5,4) NOT NULL DEFAULT 0,
  requires_docs BOOLEAN      NOT NULL DEFAULT false,
  notes         TEXT
);

INSERT INTO item_type_discounts (item_type_id, display_name, discount_pct, notes) VALUES
  ('university', 'University Express',      0.5000, 'Save 50% on university documents'),
  ('excess',     'Excess Baggage Express',  0.1000, 'Save 10% vs standard'),
  ('docs',       'Documents & Parcels',     0.1500, 'Standard document discount'),
  ('food',       'Food Products Express',   0.0500, 'Special rates for overseas students'),
  ('clothing',   'Clothing',                0.0000, NULL),
  ('medicine',   'Medicines',               0.0000, 'Prescription copy may be required'),
  ('jewellery',  'Jewellery',               0.0000, NULL),
  ('electronics','Electronics',             0.0000, 'May require customs declaration'),
  ('cosmetics',  'Cosmetics',               0.0000, NULL),
  ('gifts',      'Gifts / Personal effects',0.0000, NULL),
  ('sports',     'Sports equipment',        0.0000, NULL),
  ('pooja',      'Pooja / Religious items', 0.0000, NULL),
  ('commercial', 'Commercial goods',        0.0000, NULL),
  ('other',      'Other',                   0.0000, NULL)
ON CONFLICT (item_type_id) DO UPDATE
  SET discount_pct = EXCLUDED.discount_pct;

-- ============================================================
-- PICKUP ZONES (pincodes + surcharges)
-- ============================================================
CREATE TABLE IF NOT EXISTS pickup_zones (
  pincode       CHAR(6)      PRIMARY KEY,
  city_name     TEXT         NOT NULL,
  surcharge_inr NUMERIC(8,2) NOT NULL DEFAULT 0,
  tier          TEXT         NOT NULL
);

-- Tamil Nadu pincodes (no surcharge — home territory)
INSERT INTO pickup_zones (pincode, city_name, surcharge_inr, tier) VALUES
  ('600001','Chennai',0,'tn'),('600002','Chennai',0,'tn'),('600003','Chennai',0,'tn'),
  ('600004','Chennai',0,'tn'),('600005','Chennai',0,'tn'),('600006','Chennai',0,'tn'),
  ('600007','Chennai',0,'tn'),('600008','Chennai',0,'tn'),('600009','Chennai',0,'tn'),
  ('600010','Chennai',0,'tn'),('600011','Chennai',0,'tn'),('600012','Chennai',0,'tn'),
  ('600013','Chennai',0,'tn'),('600014','Chennai',0,'tn'),('600015','Chennai',0,'tn'),
  ('600016','Chennai',0,'tn'),('600017','Chennai',0,'tn'),('600018','Chennai',0,'tn'),
  ('600019','Chennai',0,'tn'),('600020','Chennai',0,'tn'),('600028','Chennai',0,'tn'),
  ('600029','Chennai',0,'tn'),('600030','Chennai',0,'tn'),('600031','Chennai',0,'tn'),
  ('600032','Chennai',0,'tn'),('600033','Chennai',0,'tn'),('600034','Chennai',0,'tn'),
  ('600035','Chennai',0,'tn'),('600036','Chennai',0,'tn'),('600037','Chennai',0,'tn'),
  ('600038','Chennai',0,'tn'),('600039','Chennai',0,'tn'),('600040','Chennai',0,'tn'),
  ('600041','Chennai',0,'tn'),('600042','Chennai',0,'tn'),('600044','Chennai',0,'tn'),
  ('600045','Chennai',0,'tn'),('600046','Chennai',0,'tn'),('600047','Chennai',0,'tn'),
  ('600050','Chennai',0,'tn'),('600051','Chennai',0,'tn'),('600052','Chennai',0,'tn'),
  ('600053','Chennai',0,'tn'),('600054','Chennai',0,'tn'),('600055','Chennai',0,'tn'),
  ('600056','Chennai',0,'tn'),('600057','Chennai',0,'tn'),('600058','Chennai',0,'tn'),
  ('600059','Chennai',0,'tn'),('600060','Chennai',0,'tn'),('600061','Chennai',0,'tn'),
  ('600062','Chennai',0,'tn'),('600063','Chennai',0,'tn'),('600064','Chennai',0,'tn'),
  ('600065','Chennai',0,'tn'),('600066','Chennai',0,'tn'),('600067','Chennai',0,'tn'),
  ('600068','Chennai',0,'tn'),('600069','Chennai',0,'tn'),('600070','Chennai',0,'tn'),
  ('600071','Chennai',0,'tn'),('600072','Chennai',0,'tn'),('600073','Chennai',0,'tn'),
  ('600074','Chennai',0,'tn'),('600075','Chennai',0,'tn'),('600076','Chennai',0,'tn'),
  ('600077','Chennai',0,'tn'),('600078','Chennai',0,'tn'),('600079','Chennai',0,'tn'),
  ('600080','Chennai',0,'tn'),('600081','Chennai',0,'tn'),('600082','Chennai',0,'tn'),
  ('600083','Chennai',0,'tn'),('600084','Chennai',0,'tn'),('600085','Chennai',0,'tn'),
  ('600086','Chennai',0,'tn'),('600087','Chennai',0,'tn'),('600088','Chennai',0,'tn'),
  ('600089','Chennai',0,'tn'),('600090','Chennai',0,'tn'),('600091','Chennai',0,'tn'),
  ('600092','Chennai',0,'tn'),('600093','Chennai',0,'tn'),('600094','Chennai',0,'tn'),
  ('600095','Chennai',0,'tn'),('600096','Chennai',0,'tn'),('600097','Chennai',0,'tn'),
  ('600098','Chennai',0,'tn'),('600099','Chennai',0,'tn'),('600100','Chennai',0,'tn'),
  ('600101','Chennai',0,'tn'),('600102','Chennai',0,'tn'),('600103','Chennai',0,'tn'),
  ('600104','Chennai',0,'tn'),('600105','Chennai',0,'tn'),('600106','Chennai',0,'tn'),
  ('600107','Chennai',0,'tn'),('600108','Chennai',0,'tn'),('600109','Chennai',0,'tn'),
  ('600110','Chennai',0,'tn'),('600111','Chennai',0,'tn'),('600112','Chennai',0,'tn'),
  ('600113','Chennai',0,'tn'),('600114','Chennai',0,'tn'),('600115','Chennai',0,'tn'),
  ('600116','Chennai',0,'tn'),('600117','Chennai',0,'tn'),('600118','Chennai',0,'tn'),
  ('600119','Chennai',0,'tn'),('600120','Chennai',0,'tn'),
  -- Other TN cities
  ('641001','Coimbatore',0,'tn'),('641002','Coimbatore',0,'tn'),('641003','Coimbatore',0,'tn'),
  ('641004','Coimbatore',0,'tn'),('641005','Coimbatore',0,'tn'),('641006','Coimbatore',0,'tn'),
  ('641007','Coimbatore',0,'tn'),('641008','Coimbatore',0,'tn'),('641009','Coimbatore',0,'tn'),
  ('641010','Coimbatore',0,'tn'),
  ('625001','Madurai',0,'tn'),('625002','Madurai',0,'tn'),('625003','Madurai',0,'tn'),
  ('625004','Madurai',0,'tn'),('625005','Madurai',0,'tn'),('625006','Madurai',0,'tn'),
  ('625007','Madurai',0,'tn'),('625008','Madurai',0,'tn'),('625009','Madurai',0,'tn'),
  ('625010','Madurai',0,'tn'),
  ('620001','Tiruchirappalli',0,'tn'),('620002','Tiruchirappalli',0,'tn'),
  ('620003','Tiruchirappalli',0,'tn'),('620004','Tiruchirappalli',0,'tn'),
  ('620005','Tiruchirappalli',0,'tn'),('620006','Tiruchirappalli',0,'tn'),
  ('620007','Tiruchirappalli',0,'tn'),('620008','Tiruchirappalli',0,'tn'),
  ('620009','Tiruchirappalli',0,'tn'),('620010','Tiruchirappalli',0,'tn'),
  ('627001','Tirunelveli',0,'tn'),('627002','Tirunelveli',0,'tn'),('627003','Tirunelveli',0,'tn'),
  ('627004','Tirunelveli',0,'tn'),('627005','Tirunelveli',0,'tn'),('627006','Tirunelveli',0,'tn'),
  ('627007','Tirunelveli',0,'tn'),('627008','Tirunelveli',0,'tn'),('627009','Tirunelveli',0,'tn'),
  ('627010','Tirunelveli',0,'tn'),
  ('632001','Vellore',0,'tn'),('632002','Vellore',0,'tn'),('632003','Vellore',0,'tn'),
  ('632004','Vellore',0,'tn'),('632005','Vellore',0,'tn'),('632006','Vellore',0,'tn'),
  ('632007','Vellore',0,'tn'),('632008','Vellore',0,'tn'),('632009','Vellore',0,'tn'),
  ('632010','Vellore',0,'tn'),
  -- Metro cities
  ('110001','New Delhi',200,'metro'),('110002','New Delhi',200,'metro'),
  ('110003','New Delhi',200,'metro'),('110004','New Delhi',200,'metro'),
  ('110005','New Delhi',200,'metro'),
  ('400001','Mumbai',200,'metro'),('400002','Mumbai',200,'metro'),
  ('400003','Mumbai',200,'metro'),('400004','Mumbai',200,'metro'),
  ('400005','Mumbai',200,'metro'),
  ('560001','Bengaluru',200,'metro'),('560002','Bengaluru',200,'metro'),
  ('560003','Bengaluru',200,'metro'),('560004','Bengaluru',200,'metro'),
  ('560005','Bengaluru',200,'metro'),
  ('500001','Hyderabad',200,'metro'),('500002','Hyderabad',200,'metro'),
  ('500003','Hyderabad',200,'metro'),('500004','Hyderabad',200,'metro'),
  ('500005','Hyderabad',200,'metro'),
  ('700001','Kolkata',200,'metro'),('700002','Kolkata',200,'metro'),
  ('700003','Kolkata',200,'metro'),('700004','Kolkata',200,'metro'),
  ('700005','Kolkata',200,'metro'),
  -- North India
  ('208001','Kanpur',400,'north'),
  ('226001','Lucknow',400,'north'),
  ('302001','Jaipur',400,'north'),
  ('380001','Ahmedabad',300,'north'),
  ('411001','Pune',250,'metro')
ON CONFLICT (pincode) DO NOTHING;

-- ============================================================
-- BOOKINGS
-- NOTE: user_id is TEXT (Firebase UID), not UUID — no foreign key
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               TEXT,                                    -- Firebase UID, nullable for guest
  booking_ref           TEXT NOT NULL UNIQUE,
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','confirmed','picked_up','in_transit','delivered','cancelled')),
  carrier_id            TEXT NOT NULL REFERENCES carriers(id),
  origin_country        TEXT NOT NULL,
  destination_country   TEXT NOT NULL,
  actual_weight_kg      NUMERIC(8,3) NOT NULL,
  volumetric_weight_kg  NUMERIC(8,3),
  chargeable_weight_kg  NUMERIC(8,3) NOT NULL,
  item_type_id          TEXT NOT NULL REFERENCES item_type_discounts(item_type_id),
  packaging_type        TEXT NOT NULL DEFAULT 'none'
                          CHECK (packaging_type IN ('none','standard','premium')),
  insurance_opted       BOOLEAN NOT NULL DEFAULT false,
  -- Pricing snapshot (locked at booking time)
  base_rate_inr         NUMERIC(10,2) NOT NULL,
  discount_inr          NUMERIC(10,2) NOT NULL DEFAULT 0,
  margin_inr            NUMERIC(10,2) NOT NULL DEFAULT 0,   -- internal, never shown to customer
  fsc_inr               NUMERIC(10,2) NOT NULL DEFAULT 0,
  demand_surcharge_inr  NUMERIC(10,2) NOT NULL DEFAULT 0,
  premium_service_inr   NUMERIC(10,2) NOT NULL DEFAULT 0,   -- DHL 9am/12pm upgrade
  peak_surcharge_inr    NUMERIC(10,2) NOT NULL DEFAULT 0,   -- FedEx seasonal peak
  us_inbound_inr        NUMERIC(10,2) NOT NULL DEFAULT 0,   -- UPS auto ₹230 for USA
  ups_fixed_inr         NUMERIC(10,2) NOT NULL DEFAULT 0,   -- UPS formal clearance + DDP + signature
  pickup_surcharge_inr  NUMERIC(10,2) NOT NULL DEFAULT 0,
  packaging_inr         NUMERIC(10,2) NOT NULL DEFAULT 0,
  insurance_inr         NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal_inr          NUMERIC(10,2) NOT NULL,
  gst_inr               NUMERIC(10,2) NOT NULL,
  total_inr             NUMERIC(10,2) NOT NULL,
  -- Carrier-specific booking options (locked at booking time)
  dhl_service           TEXT         NOT NULL DEFAULT 'standard'
                          CHECK (dhl_service IN ('standard', 'premium_900', 'premium_1200')),
  fedex_service         TEXT         NOT NULL DEFAULT 'IP'
                          CHECK (fedex_service IN ('IP', 'IPF')),
  ups_formal_clearance  BOOLEAN      NOT NULL DEFAULT false,
  ups_delivery_type     TEXT         NOT NULL DEFAULT 'DDU'
                          CHECK (ups_delivery_type IN ('DDU', 'DDP')),
  ups_signature         BOOLEAN      NOT NULL DEFAULT false,
  ups_remote_area       BOOLEAN      NOT NULL DEFAULT false,  -- staff-flagged post-booking
  -- Sender (Shipper)
  sender_company        TEXT NOT NULL,                          -- "Company / Name"
  sender_mobile         TEXT NOT NULL,
  sender_telephone      TEXT NOT NULL DEFAULT '',               -- landline
  sender_email          TEXT,
  sender_kyc            TEXT NOT NULL DEFAULT '',               -- KYC / document number
  pickup_pincode        CHAR(6) NOT NULL,
  pickup_address_1      TEXT NOT NULL,
  pickup_address_2      TEXT NOT NULL DEFAULT '',
  pickup_city           TEXT NOT NULL DEFAULT '',
  pickup_state          TEXT NOT NULL DEFAULT '',
  pickup_date           DATE NOT NULL,
  pickup_slot           TEXT NOT NULL,
  -- Receiver (Consignee)
  receiver_company      TEXT NOT NULL,                          -- "Company / Name"
  receiver_mobile       TEXT NOT NULL,
  receiver_telephone    TEXT NOT NULL DEFAULT '',               -- landline
  receiver_email        TEXT,
  delivery_address_1    TEXT NOT NULL,
  delivery_address_2    TEXT NOT NULL DEFAULT '',
  delivery_city         TEXT NOT NULL,
  delivery_state        TEXT NOT NULL,
  delivery_zip          TEXT NOT NULL,
  num_pieces            SMALLINT NOT NULL DEFAULT 1,
  contents_desc         TEXT,
  shipper_reference     TEXT NOT NULL DEFAULT '',
  special_instruction   TEXT NOT NULL DEFAULT '',
  -- Tracking
  tracking_number       TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user     ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ref      ON bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_tracking ON bookings(tracking_number);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRACKING EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS tracking_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  tracking_number TEXT NOT NULL,
  event_code      TEXT NOT NULL,
  description     TEXT NOT NULL,
  location        TEXT,
  event_at        TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracking_events_booking ON tracking_events(booking_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_number  ON tracking_events(tracking_number);

-- ============================================================
-- MEMBERSHIPS
-- NOTE: user_id is TEXT (Firebase UID), not UUID — no foreign key
-- ============================================================
CREATE TABLE IF NOT EXISTS membership_plans (
  id               TEXT     PRIMARY KEY,
  name             TEXT     NOT NULL,
  price_inr        NUMERIC(8,2) NOT NULL,
  discount_pct     NUMERIC(5,4) NOT NULL,
  duration_months  SMALLINT NOT NULL DEFAULT 12
);

INSERT INTO membership_plans VALUES
  ('silver', 'Silver', 299,  0.1000, 12),
  ('gold',   'Gold',   1499, 0.1500, 12)
ON CONFLICT (id) DO UPDATE
  SET price_inr    = EXCLUDED.price_inr,
      discount_pct = EXCLUDED.discount_pct;

CREATE TABLE IF NOT EXISTS user_memberships (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT NOT NULL,                                    -- Firebase UID
  plan_id    TEXT NOT NULL REFERENCES membership_plans(id),
  starts_at  DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_at DATE NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_memberships_user ON user_memberships(user_id);
