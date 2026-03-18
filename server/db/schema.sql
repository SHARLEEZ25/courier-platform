-- ============================================================
-- Uniex Courier — Supabase SQL Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ============================================================
-- CARRIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS carriers (
  id           TEXT PRIMARY KEY,        -- 'dhl' | 'fedex' | 'ups' | 'aramex'
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
-- Maps origin+destination → zone code per carrier.
-- origin_country is always 'India' for Uniex outbound.
-- ============================================================
CREATE TABLE IF NOT EXISTS carrier_zones (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id          TEXT NOT NULL REFERENCES carriers(id),
  origin_country      TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  zone_code           TEXT NOT NULL,   -- 'Z1' … 'Z6'
  effective_from      DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to        DATE,            -- NULL = currently active
  UNIQUE (carrier_id, origin_country, destination_country, effective_from)
);

-- DHL Zones from India
INSERT INTO carrier_zones (carrier_id, origin_country, destination_country, zone_code) VALUES
  -- Zone 1: Middle East
  ('dhl','India','UAE','Z1'),
  ('dhl','India','Saudi Arabia','Z1'),
  ('dhl','India','Qatar','Z1'),
  ('dhl','India','Kuwait','Z1'),
  ('dhl','India','Bahrain','Z1'),
  ('dhl','India','Oman','Z1'),
  -- Zone 2: Southeast Asia
  ('dhl','India','Singapore','Z2'),
  ('dhl','India','Malaysia','Z2'),
  ('dhl','India','Hong Kong','Z2'),
  ('dhl','India','Japan','Z2'),
  ('dhl','India','South Korea','Z2'),
  -- Zone 3: Europe
  ('dhl','India','UK','Z3'),
  ('dhl','India','Germany','Z3'),
  ('dhl','India','France','Z3'),
  ('dhl','India','Netherlands','Z3'),
  ('dhl','India','Italy','Z3'),
  ('dhl','India','Spain','Z3'),
  ('dhl','India','Belgium','Z3'),
  ('dhl','India','Ireland','Z3'),
  ('dhl','India','Sweden','Z3'),
  ('dhl','India','Norway','Z3'),
  ('dhl','India','Denmark','Z3'),
  ('dhl','India','Switzerland','Z3'),
  ('dhl','India','Austria','Z3'),
  ('dhl','India','Portugal','Z3'),
  -- Zone 4: North America
  ('dhl','India','USA','Z4'),
  ('dhl','India','Canada','Z4'),
  -- Zone 5: Oceania
  ('dhl','India','Australia','Z5'),
  ('dhl','India','New Zealand','Z5'),
  -- Zone 6: Africa / Rest
  ('dhl','India','South Africa','Z6'),
  ('dhl','India','Nigeria','Z6'),
  ('dhl','India','Kenya','Z6'),
  ('dhl','India','China','Z6')
ON CONFLICT DO NOTHING;

-- FedEx Zones from India
INSERT INTO carrier_zones (carrier_id, origin_country, destination_country, zone_code) VALUES
  ('fedex','India','UAE','Z1'),
  ('fedex','India','Saudi Arabia','Z1'),
  ('fedex','India','Qatar','Z1'),
  ('fedex','India','Kuwait','Z1'),
  ('fedex','India','Bahrain','Z1'),
  ('fedex','India','Oman','Z1'),
  ('fedex','India','Singapore','Z2'),
  ('fedex','India','Malaysia','Z2'),
  ('fedex','India','Hong Kong','Z2'),
  ('fedex','India','Japan','Z2'),
  ('fedex','India','South Korea','Z2'),
  ('fedex','India','UK','Z3'),
  ('fedex','India','Germany','Z3'),
  ('fedex','India','France','Z3'),
  ('fedex','India','Netherlands','Z3'),
  ('fedex','India','Italy','Z3'),
  ('fedex','India','Spain','Z3'),
  ('fedex','India','Belgium','Z3'),
  ('fedex','India','Ireland','Z3'),
  ('fedex','India','Sweden','Z3'),
  ('fedex','India','Norway','Z3'),
  ('fedex','India','Denmark','Z3'),
  ('fedex','India','Switzerland','Z3'),
  ('fedex','India','Austria','Z3'),
  ('fedex','India','Portugal','Z3'),
  ('fedex','India','USA','Z4'),
  ('fedex','India','Canada','Z4'),
  ('fedex','India','Australia','Z5'),
  ('fedex','India','New Zealand','Z5'),
  ('fedex','India','South Africa','Z6'),
  ('fedex','India','Nigeria','Z6'),
  ('fedex','India','Kenya','Z6'),
  ('fedex','India','China','Z6')
ON CONFLICT DO NOTHING;

-- UPS Zones from India
INSERT INTO carrier_zones (carrier_id, origin_country, destination_country, zone_code) VALUES
  ('ups','India','UAE','Z1'),
  ('ups','India','Saudi Arabia','Z1'),
  ('ups','India','Qatar','Z1'),
  ('ups','India','Kuwait','Z1'),
  ('ups','India','Bahrain','Z1'),
  ('ups','India','Oman','Z1'),
  ('ups','India','Singapore','Z2'),
  ('ups','India','Malaysia','Z2'),
  ('ups','India','Hong Kong','Z2'),
  ('ups','India','Japan','Z2'),
  ('ups','India','South Korea','Z2'),
  ('ups','India','UK','Z3'),
  ('ups','India','Germany','Z3'),
  ('ups','India','France','Z3'),
  ('ups','India','Netherlands','Z3'),
  ('ups','India','Italy','Z3'),
  ('ups','India','Spain','Z3'),
  ('ups','India','Belgium','Z3'),
  ('ups','India','Ireland','Z3'),
  ('ups','India','Sweden','Z3'),
  ('ups','India','Norway','Z3'),
  ('ups','India','Denmark','Z3'),
  ('ups','India','Switzerland','Z3'),
  ('ups','India','Austria','Z3'),
  ('ups','India','Portugal','Z3'),
  ('ups','India','USA','Z4'),
  ('ups','India','Canada','Z4'),
  ('ups','India','Australia','Z5'),
  ('ups','India','New Zealand','Z5'),
  ('ups','India','South Africa','Z6'),
  ('ups','India','Nigeria','Z6'),
  ('ups','India','Kenya','Z6'),
  ('ups','India','China','Z6')
ON CONFLICT DO NOTHING;

-- Aramex Zones from India (strong in Middle East)
INSERT INTO carrier_zones (carrier_id, origin_country, destination_country, zone_code) VALUES
  ('aramex','India','UAE','Z1'),
  ('aramex','India','Saudi Arabia','Z1'),
  ('aramex','India','Qatar','Z1'),
  ('aramex','India','Kuwait','Z1'),
  ('aramex','India','Bahrain','Z1'),
  ('aramex','India','Oman','Z1'),
  ('aramex','India','Singapore','Z2'),
  ('aramex','India','Malaysia','Z2'),
  ('aramex','India','Hong Kong','Z2'),
  ('aramex','India','Japan','Z3'),
  ('aramex','India','South Korea','Z3'),
  ('aramex','India','UK','Z3'),
  ('aramex','India','Germany','Z3'),
  ('aramex','India','France','Z3'),
  ('aramex','India','Netherlands','Z3'),
  ('aramex','India','Italy','Z3'),
  ('aramex','India','Spain','Z3'),
  ('aramex','India','Belgium','Z3'),
  ('aramex','India','Ireland','Z3'),
  ('aramex','India','Sweden','Z4'),
  ('aramex','India','Norway','Z4'),
  ('aramex','India','Denmark','Z4'),
  ('aramex','India','Switzerland','Z3'),
  ('aramex','India','Austria','Z3'),
  ('aramex','India','Portugal','Z3'),
  ('aramex','India','USA','Z4'),
  ('aramex','India','Canada','Z4'),
  ('aramex','India','Australia','Z5'),
  ('aramex','India','New Zealand','Z5'),
  ('aramex','India','South Africa','Z5'),
  ('aramex','India','Nigeria','Z5'),
  ('aramex','India','Kenya','Z5'),
  ('aramex','India','China','Z3')
ON CONFLICT DO NOTHING;

-- ============================================================
-- RATE CARD SLABS
-- Weight brackets with price_inr (minimum charge) and
-- price_per_kg for that slab.
-- weight_min_kg inclusive, weight_max_kg exclusive (NULL = no upper limit).
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_card_slabs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id     TEXT         NOT NULL REFERENCES carriers(id),
  zone_code      TEXT         NOT NULL,
  weight_min_kg  NUMERIC(8,3) NOT NULL,
  weight_max_kg  NUMERIC(8,3),           -- NULL = no upper limit
  price_inr      NUMERIC(10,2) NOT NULL, -- minimum charge (for 0-0.5 slab)
  price_per_kg   NUMERIC(10,2) NOT NULL, -- rate per kg within slab
  effective_from DATE         NOT NULL DEFAULT CURRENT_DATE,
  effective_to   DATE,
  CONSTRAINT valid_weight CHECK (weight_min_kg >= 0),
  UNIQUE (carrier_id, zone_code, weight_min_kg, effective_from)
);

-- ── DHL Rate Cards ──────────────────────────────────────────
-- Z1 (Middle East) - cheapest
INSERT INTO rate_card_slabs (carrier_id, zone_code, weight_min_kg, weight_max_kg, price_inr, price_per_kg) VALUES
  ('dhl','Z1', 0,    0.5,   900,  0),
  ('dhl','Z1', 0.5,  10,    0,    380),
  ('dhl','Z1', 10,   25,    0,    340),
  ('dhl','Z1', 25,   NULL,  0,    300);
-- Z2 (SE Asia)
INSERT INTO rate_card_slabs (carrier_id, zone_code, weight_min_kg, weight_max_kg, price_inr, price_per_kg) VALUES
  ('dhl','Z2', 0,    0.5,   1100, 0),
  ('dhl','Z2', 0.5,  10,    0,    450),
  ('dhl','Z2', 10,   25,    0,    410),
  ('dhl','Z2', 25,   NULL,  0,    370);
-- Z3 (Europe)
INSERT INTO rate_card_slabs (carrier_id, zone_code, weight_min_kg, weight_max_kg, price_inr, price_per_kg) VALUES
  ('dhl','Z3', 0,    0.5,   1200, 0),
  ('dhl','Z3', 0.5,  10,    0,    580),
  ('dhl','Z3', 10,   25,    0,    530),
  ('dhl','Z3', 25,   NULL,  0,    480);
-- Z4 (North America)
INSERT INTO rate_card_slabs (carrier_id, zone_code, weight_min_kg, weight_max_kg, price_inr, price_per_kg) VALUES
  ('dhl','Z4', 0,    0.5,   1400, 0),
  ('dhl','Z4', 0.5,  10,    0,    650),
  ('dhl','Z4', 10,   25,    0,    600),
  ('dhl','Z4', 25,   NULL,  0,    550);
-- Z5 (Oceania)
INSERT INTO rate_card_slabs (carrier_id, zone_code, weight_min_kg, weight_max_kg, price_inr, price_per_kg) VALUES
  ('dhl','Z5', 0,    0.5,   1600, 0),
  ('dhl','Z5', 0.5,  10,    0,    720),
  ('dhl','Z5', 10,   25,    0,    670),
  ('dhl','Z5', 25,   NULL,  0,    620);
-- Z6 (Africa / Rest)
INSERT INTO rate_card_slabs (carrier_id, zone_code, weight_min_kg, weight_max_kg, price_inr, price_per_kg) VALUES
  ('dhl','Z6', 0,    0.5,   1800, 0),
  ('dhl','Z6', 0.5,  10,    0,    820),
  ('dhl','Z6', 10,   25,    0,    760),
  ('dhl','Z6', 25,   NULL,  0,    700);

-- ── FedEx Rate Cards ─────────────────────────────────────────
INSERT INTO rate_card_slabs (carrier_id, zone_code, weight_min_kg, weight_max_kg, price_inr, price_per_kg) VALUES
  ('fedex','Z1', 0, 0.5, 950, 0),  ('fedex','Z1', 0.5, 10, 0, 400),  ('fedex','Z1', 10, 25, 0, 360),  ('fedex','Z1', 25, NULL, 0, 320),
  ('fedex','Z2', 0, 0.5, 1150, 0), ('fedex','Z2', 0.5, 10, 0, 470),  ('fedex','Z2', 10, 25, 0, 430),  ('fedex','Z2', 25, NULL, 0, 390),
  ('fedex','Z3', 0, 0.5, 1250, 0), ('fedex','Z3', 0.5, 10, 0, 600),  ('fedex','Z3', 10, 25, 0, 550),  ('fedex','Z3', 25, NULL, 0, 500),
  ('fedex','Z4', 0, 0.5, 1450, 0), ('fedex','Z4', 0.5, 10, 0, 670),  ('fedex','Z4', 10, 25, 0, 620),  ('fedex','Z4', 25, NULL, 0, 570),
  ('fedex','Z5', 0, 0.5, 1650, 0), ('fedex','Z5', 0.5, 10, 0, 740),  ('fedex','Z5', 10, 25, 0, 690),  ('fedex','Z5', 25, NULL, 0, 640),
  ('fedex','Z6', 0, 0.5, 1850, 0), ('fedex','Z6', 0.5, 10, 0, 840),  ('fedex','Z6', 10, 25, 0, 780),  ('fedex','Z6', 25, NULL, 0, 720);

-- ── UPS Rate Cards ───────────────────────────────────────────
INSERT INTO rate_card_slabs (carrier_id, zone_code, weight_min_kg, weight_max_kg, price_inr, price_per_kg) VALUES
  ('ups','Z1', 0, 0.5, 920, 0),  ('ups','Z1', 0.5, 10, 0, 390),  ('ups','Z1', 10, 25, 0, 350),  ('ups','Z1', 25, NULL, 0, 310),
  ('ups','Z2', 0, 0.5, 1120, 0), ('ups','Z2', 0.5, 10, 0, 460),  ('ups','Z2', 10, 25, 0, 420),  ('ups','Z2', 25, NULL, 0, 380),
  ('ups','Z3', 0, 0.5, 1220, 0), ('ups','Z3', 0.5, 10, 0, 570),  ('ups','Z3', 10, 25, 0, 520),  ('ups','Z3', 25, NULL, 0, 470),
  ('ups','Z4', 0, 0.5, 1420, 0), ('ups','Z4', 0.5, 10, 0, 640),  ('ups','Z4', 10, 25, 0, 590),  ('ups','Z4', 25, NULL, 0, 540),
  ('ups','Z5', 0, 0.5, 1620, 0), ('ups','Z5', 0.5, 10, 0, 710),  ('ups','Z5', 10, 25, 0, 660),  ('ups','Z5', 25, NULL, 0, 610),
  ('ups','Z6', 0, 0.5, 1820, 0), ('ups','Z6', 0.5, 10, 0, 810),  ('ups','Z6', 10, 25, 0, 750),  ('ups','Z6', 25, NULL, 0, 690);

-- ── Aramex Rate Cards ────────────────────────────────────────
INSERT INTO rate_card_slabs (carrier_id, zone_code, weight_min_kg, weight_max_kg, price_inr, price_per_kg) VALUES
  ('aramex','Z1', 0, 0.5, 850, 0),  ('aramex','Z1', 0.5, 10, 0, 360),  ('aramex','Z1', 10, 25, 0, 320),  ('aramex','Z1', 25, NULL, 0, 280),
  ('aramex','Z2', 0, 0.5, 1050, 0), ('aramex','Z2', 0.5, 10, 0, 430),  ('aramex','Z2', 10, 25, 0, 390),  ('aramex','Z2', 25, NULL, 0, 350),
  ('aramex','Z3', 0, 0.5, 1180, 0), ('aramex','Z3', 0.5, 10, 0, 550),  ('aramex','Z3', 10, 25, 0, 500),  ('aramex','Z3', 25, NULL, 0, 450),
  ('aramex','Z4', 0, 0.5, 1380, 0), ('aramex','Z4', 0.5, 10, 0, 620),  ('aramex','Z4', 10, 25, 0, 570),  ('aramex','Z4', 25, NULL, 0, 520),
  ('aramex','Z5', 0, 0.5, 1550, 0), ('aramex','Z5', 0.5, 10, 0, 690),  ('aramex','Z5', 10, 25, 0, 640),  ('aramex','Z5', 25, NULL, 0, 590),
  ('aramex','Z6', 0, 0.5, 1750, 0), ('aramex','Z6', 0.5, 10, 0, 790),  ('aramex','Z6', 10, 25, 0, 730),  ('aramex','Z6', 25, NULL, 0, 670);

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

-- March 2026 FSC values
INSERT INTO fuel_surcharges (carrier_id, fsc_percent, effective_from) VALUES
  ('dhl',    29.50, '2026-03-01'),
  ('fedex',  27.00, '2026-03-01'),
  ('ups',    26.50, '2026-03-01'),
  ('aramex', 24.00, '2026-03-01')
ON CONFLICT DO NOTHING;

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
  tier          TEXT         NOT NULL  -- 'tn' | 'metro' | 'north'
);

-- Tamil Nadu pincodes (no surcharge — home territory)
INSERT INTO pickup_zones (pincode, city_name, surcharge_inr, tier) VALUES
  ('600001','Chennai',        0,   'tn'),
  ('600002','Chennai',        0,   'tn'),
  ('600003','Chennai',        0,   'tn'),
  ('600004','Chennai',        0,   'tn'),
  ('600005','Chennai',        0,   'tn'),
  ('600006','Chennai',        0,   'tn'),
  ('600007','Chennai',        0,   'tn'),
  ('600008','Chennai',        0,   'tn'),
  ('600009','Chennai',        0,   'tn'),
  ('600010','Chennai',        0,   'tn'),
  ('600011','Chennai',        0,   'tn'),
  ('600012','Chennai',        0,   'tn'),
  ('600013','Chennai',        0,   'tn'),
  ('600014','Chennai',        0,   'tn'),
  ('600015','Chennai',        0,   'tn'),
  ('600016','Chennai',        0,   'tn'),
  ('600017','Chennai',        0,   'tn'),
  ('600018','Chennai',        0,   'tn'),
  ('600019','Chennai',        0,   'tn'),
  ('600020','Chennai',        0,   'tn'),
  ('600028','Chennai',        0,   'tn'),
  ('600029','Chennai',        0,   'tn'),
  ('600030','Chennai',        0,   'tn'),
  ('600031','Chennai',        0,   'tn'),
  ('600032','Chennai',        0,   'tn'),
  ('600033','Chennai',        0,   'tn'),
  ('600034','Chennai',        0,   'tn'),
  ('600035','Chennai',        0,   'tn'),
  ('600036','Chennai',        0,   'tn'),
  ('600037','Chennai',        0,   'tn'),
  ('600038','Chennai',        0,   'tn'),
  ('600039','Chennai',        0,   'tn'),
  ('600040','Chennai',        0,   'tn'),
  ('600041','Chennai',        0,   'tn'),
  ('600042','Chennai',        0,   'tn'),
  ('600044','Chennai',        0,   'tn'),
  ('600045','Chennai',        0,   'tn'),
  ('600046','Chennai',        0,   'tn'),
  ('600047','Chennai',        0,   'tn'),
  ('600050','Chennai',        0,   'tn'),
  ('600051','Chennai',        0,   'tn'),
  ('600052','Chennai',        0,   'tn'),
  ('600053','Chennai',        0,   'tn'),
  ('600054','Chennai',        0,   'tn'),
  ('600055','Chennai',        0,   'tn'),
  ('600056','Chennai',        0,   'tn'),
  ('600057','Chennai',        0,   'tn'),
  ('600058','Chennai',        0,   'tn'),
  ('600059','Chennai',        0,   'tn'),
  ('600060','Chennai',        0,   'tn'),
  ('600061','Chennai',        0,   'tn'),
  ('600062','Chennai',        0,   'tn'),
  ('600063','Chennai',        0,   'tn'),
  ('600064','Chennai',        0,   'tn'),
  ('600065','Chennai',        0,   'tn'),
  ('600066','Chennai',        0,   'tn'),
  ('600067','Chennai',        0,   'tn'),
  ('600068','Chennai',        0,   'tn'),
  ('600069','Chennai',        0,   'tn'),
  ('600070','Chennai',        0,   'tn'),
  ('600071','Chennai',        0,   'tn'),
  ('600072','Chennai',        0,   'tn'),
  ('600073','Chennai',        0,   'tn'),
  ('600074','Chennai',        0,   'tn'),
  ('600075','Chennai',        0,   'tn'),
  ('600076','Chennai',        0,   'tn'),
  ('600077','Chennai',        0,   'tn'),
  ('600078','Chennai',        0,   'tn'),
  ('600079','Chennai',        0,   'tn'),
  ('600080','Chennai',        0,   'tn'),
  ('600081','Chennai',        0,   'tn'),
  ('600082','Chennai',        0,   'tn'),
  ('600083','Chennai',        0,   'tn'),
  ('600084','Chennai',        0,   'tn'),
  ('600085','Chennai',        0,   'tn'),
  ('600086','Chennai',        0,   'tn'),
  ('600087','Chennai',        0,   'tn'),
  ('600088','Chennai',        0,   'tn'),
  ('600089','Chennai',        0,   'tn'),
  ('600090','Chennai',        0,   'tn'),
  ('600091','Chennai',        0,   'tn'),
  ('600092','Chennai',        0,   'tn'),
  ('600093','Chennai',        0,   'tn'),
  ('600094','Chennai',        0,   'tn'),
  ('600095','Chennai',        0,   'tn'),
  ('600096','Chennai',        0,   'tn'),
  ('600097','Chennai',        0,   'tn'),
  ('600098','Chennai',        0,   'tn'),
  ('600099','Chennai',        0,   'tn'),
  ('600100','Chennai',        0,   'tn'),
  ('600101','Chennai',        0,   'tn'),
  ('600102','Chennai',        0,   'tn'),
  ('600103','Chennai',        0,   'tn'),
  ('600104','Chennai',        0,   'tn'),
  ('600105','Chennai',        0,   'tn'),
  ('600106','Chennai',        0,   'tn'),
  ('600107','Chennai',        0,   'tn'),
  ('600108','Chennai',        0,   'tn'),
  ('600109','Chennai',        0,   'tn'),
  ('600110','Chennai',        0,   'tn'),
  ('600111','Chennai',        0,   'tn'),
  ('600112','Chennai',        0,   'tn'),
  ('600113','Chennai',        0,   'tn'),
  ('600114','Chennai',        0,   'tn'),
  ('600115','Chennai',        0,   'tn'),
  ('600116','Chennai',        0,   'tn'),
  ('600117','Chennai',        0,   'tn'),
  ('600118','Chennai',        0,   'tn'),
  ('600119','Chennai',        0,   'tn'),
  ('600120','Chennai',        0,   'tn'),
  -- Other TN cities
  ('641001','Coimbatore',     0,   'tn'),
  ('641002','Coimbatore',     0,   'tn'),
  ('641003','Coimbatore',     0,   'tn'),
  ('641004','Coimbatore',     0,   'tn'),
  ('641005','Coimbatore',     0,   'tn'),
  ('641006','Coimbatore',     0,   'tn'),
  ('641007','Coimbatore',     0,   'tn'),
  ('641008','Coimbatore',     0,   'tn'),
  ('641009','Coimbatore',     0,   'tn'),
  ('641010','Coimbatore',     0,   'tn'),
  ('625001','Madurai',        0,   'tn'),
  ('625002','Madurai',        0,   'tn'),
  ('625003','Madurai',        0,   'tn'),
  ('625004','Madurai',        0,   'tn'),
  ('625005','Madurai',        0,   'tn'),
  ('625006','Madurai',        0,   'tn'),
  ('625007','Madurai',        0,   'tn'),
  ('625008','Madurai',        0,   'tn'),
  ('625009','Madurai',        0,   'tn'),
  ('625010','Madurai',        0,   'tn'),
  ('620001','Tiruchirappalli',0,   'tn'),
  ('620002','Tiruchirappalli',0,   'tn'),
  ('620003','Tiruchirappalli',0,   'tn'),
  ('620004','Tiruchirappalli',0,   'tn'),
  ('620005','Tiruchirappalli',0,   'tn'),
  ('620006','Tiruchirappalli',0,   'tn'),
  ('620007','Tiruchirappalli',0,   'tn'),
  ('620008','Tiruchirappalli',0,   'tn'),
  ('620009','Tiruchirappalli',0,   'tn'),
  ('620010','Tiruchirappalli',0,   'tn'),
  ('627001','Tirunelveli',    0,   'tn'),
  ('627002','Tirunelveli',    0,   'tn'),
  ('627003','Tirunelveli',    0,   'tn'),
  ('627004','Tirunelveli',    0,   'tn'),
  ('627005','Tirunelveli',    0,   'tn'),
  ('627006','Tirunelveli',    0,   'tn'),
  ('627007','Tirunelveli',    0,   'tn'),
  ('627008','Tirunelveli',    0,   'tn'),
  ('627009','Tirunelveli',    0,   'tn'),
  ('627010','Tirunelveli',    0,   'tn'),
  ('632001','Vellore',        0,   'tn'),
  ('632002','Vellore',        0,   'tn'),
  ('632003','Vellore',        0,   'tn'),
  ('632004','Vellore',        0,   'tn'),
  ('632005','Vellore',        0,   'tn'),
  ('632006','Vellore',        0,   'tn'),
  ('632007','Vellore',        0,   'tn'),
  ('632008','Vellore',        0,   'tn'),
  ('632009','Vellore',        0,   'tn'),
  ('632010','Vellore',        0,   'tn'),
  -- Metro cities (small surcharge)
  ('110001','New Delhi',      200, 'metro'),
  ('110002','New Delhi',      200, 'metro'),
  ('110003','New Delhi',      200, 'metro'),
  ('110004','New Delhi',      200, 'metro'),
  ('110005','New Delhi',      200, 'metro'),
  ('400001','Mumbai',         200, 'metro'),
  ('400002','Mumbai',         200, 'metro'),
  ('400003','Mumbai',         200, 'metro'),
  ('400004','Mumbai',         200, 'metro'),
  ('400005','Mumbai',         200, 'metro'),
  ('560001','Bengaluru',      200, 'metro'),
  ('560002','Bengaluru',      200, 'metro'),
  ('560003','Bengaluru',      200, 'metro'),
  ('560004','Bengaluru',      200, 'metro'),
  ('560005','Bengaluru',      200, 'metro'),
  ('500001','Hyderabad',      200, 'metro'),
  ('500002','Hyderabad',      200, 'metro'),
  ('500003','Hyderabad',      200, 'metro'),
  ('500004','Hyderabad',      200, 'metro'),
  ('500005','Hyderabad',      200, 'metro'),
  ('700001','Kolkata',        200, 'metro'),
  ('700002','Kolkata',        200, 'metro'),
  ('700003','Kolkata',        200, 'metro'),
  ('700004','Kolkata',        200, 'metro'),
  ('700005','Kolkata',        200, 'metro'),
  -- North India (higher surcharge)
  ('208001','Kanpur',         400, 'north'),
  ('226001','Lucknow',        400, 'north'),
  ('302001','Jaipur',         400, 'north'),
  ('380001','Ahmedabad',      300, 'north'),
  ('411001','Pune',           250, 'metro')
ON CONFLICT (pincode) DO NOTHING;

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES auth.users(id),  -- nullable for guest
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
  fsc_inr               NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_inr          NUMERIC(10,2) NOT NULL DEFAULT 0,
  pickup_surcharge_inr  NUMERIC(10,2) NOT NULL DEFAULT 0,
  packaging_inr         NUMERIC(10,2) NOT NULL DEFAULT 0,
  insurance_inr         NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal_inr          NUMERIC(10,2) NOT NULL,
  gst_inr               NUMERIC(10,2) NOT NULL,
  total_inr             NUMERIC(10,2) NOT NULL,
  -- Sender
  sender_name           TEXT NOT NULL,
  sender_mobile         TEXT NOT NULL,
  sender_email          TEXT,
  pickup_pincode        CHAR(6) NOT NULL,
  pickup_address        TEXT NOT NULL,
  pickup_city           TEXT NOT NULL DEFAULT '',
  pickup_state          TEXT NOT NULL DEFAULT '',
  pickup_date           DATE NOT NULL,
  pickup_slot           TEXT NOT NULL,
  -- Receiver
  receiver_name         TEXT NOT NULL,
  receiver_mobile       TEXT NOT NULL,
  receiver_email        TEXT,
  delivery_address      TEXT NOT NULL,
  delivery_city         TEXT NOT NULL,
  delivery_state        TEXT NOT NULL,
  delivery_zip          TEXT NOT NULL,
  num_pieces            SMALLINT NOT NULL DEFAULT 1,
  contents_desc         TEXT,
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
  user_id    UUID NOT NULL REFERENCES auth.users(id),
  plan_id    TEXT NOT NULL REFERENCES membership_plans(id),
  starts_at  DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_at DATE NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_memberships_user ON user_memberships(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

-- Users can read their own bookings
DROP POLICY IF EXISTS bookings_select ON bookings;
CREATE POLICY bookings_select ON bookings
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS bookings_insert ON bookings;
CREATE POLICY bookings_insert ON bookings
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Users can read their own memberships
DROP POLICY IF EXISTS memberships_select ON user_memberships;
CREATE POLICY memberships_select ON user_memberships
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS memberships_insert ON user_memberships;
CREATE POLICY memberships_insert ON user_memberships
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Tracking events: read-only for authenticated users
DROP POLICY IF EXISTS tracking_select ON tracking_events;
CREATE POLICY tracking_select ON tracking_events
  FOR SELECT USING (true);  -- enforced at API layer by tracking number
