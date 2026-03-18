-- ============================================================
-- Migration 001 — Real 2026 Rate Cards
-- Run in Supabase SQL Editor BEFORE running npm run db:seed
-- Safe to re-run (uses IF NOT EXISTS / DO NOTHING)
-- ============================================================

-- ── New table: exact price per weight breakpoint ─────────────
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

-- ── New table: per-kg rates for heavy shipments ───────────────
-- band_type = 'multiplicative' → price = weight × price_per_kg        (UPS style)
-- band_type = 'additive'       → price = base_price + (weight - weight_min_kg) × price_per_kg (DHL style)
CREATE TABLE IF NOT EXISTS rate_card_bands (
  carrier_id     TEXT         NOT NULL REFERENCES carriers(id),
  zone_code      TEXT         NOT NULL,
  shipment_type  TEXT         NOT NULL CHECK (shipment_type IN ('document', 'package')),
  weight_min_kg  NUMERIC(8,3) NOT NULL,
  weight_max_kg  NUMERIC(8,3),                    -- NULL = no upper limit
  price_per_kg   NUMERIC(10,2) NOT NULL,
  base_price_inr NUMERIC(10,2) NOT NULL DEFAULT 0, -- used by 'additive' bands only
  band_type      TEXT         NOT NULL DEFAULT 'multiplicative'
                   CHECK (band_type IN ('multiplicative', 'additive')),
  effective_from DATE         NOT NULL DEFAULT '2026-01-01',
  effective_to   DATE,
  PRIMARY KEY (carrier_id, zone_code, shipment_type, weight_min_kg)
);

CREATE INDEX IF NOT EXISTS idx_rcb_carrier_zone
  ON rate_card_bands (carrier_id, zone_code, shipment_type);

-- ── Clear old placeholder data (keep table structure) ────────
TRUNCATE TABLE rate_card_slabs;
TRUNCATE TABLE carrier_zones;

-- ── Ensure carriers row exists for all 3 PDF carriers ────────
INSERT INTO carriers (id, display_name) VALUES
  ('dhl',   'DHL Express'),
  ('fedex', 'FedEx International'),
  ('ups',   'UPS Worldwide')
ON CONFLICT (id) DO NOTHING;
