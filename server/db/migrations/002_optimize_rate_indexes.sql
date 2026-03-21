-- ============================================================
-- Migration 002 — Optimize Rate Card Indexes
-- Improves performance for queries that omit zone_code (filtered in memory)
-- ============================================================

-- Composite index for rate_card_steps (carrier, type, weight)
-- Primary key already covers (carrier, zone, type, weight), 
-- but this index helps when zone_code is not in the WHERE clause.
CREATE INDEX IF NOT EXISTS idx_rcs_lookup_optimized
  ON rate_card_steps (carrier_id, shipment_type, weight_kg);

-- Composite index for rate_card_bands (carrier, type, weight_min)
-- Helps with the heavy shipment lookup range queries.
CREATE INDEX IF NOT EXISTS idx_rcb_lookup_optimized
  ON rate_card_bands (carrier_id, shipment_type, weight_min_kg);

-- Index for carrier_zones (origin, destination)
-- Though carrier_id is already indexed, this helps with route-first lookups.
CREATE INDEX IF NOT EXISTS idx_cz_route
  ON carrier_zones (origin_country, destination_country);
