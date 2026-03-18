/**
 * Database seeder — 2026 rate cards
 *
 * Run with:  npm run db:seed
 *
 * Requires in .env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Does NOT require BetterAuth vars.
 *
 * Safe to re-run: uses upsert (ON CONFLICT DO NOTHING semantics via ignoreDuplicates).
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { ALL_ZONES } from './seeds/zones.js';
import { DHL_STEPS, DHL_BANDS } from './seeds/dhl.js';
import { FEDEX_STEPS, FEDEX_BANDS } from './seeds/fedex.js';
import { UPS_STEPS, UPS_BANDS } from './seeds/ups.js';

// ─── Supabase client (service-role, no BetterAuth deps) ───────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Batch upsert helper ───────────────────────────────────────────────────────

const BATCH = 500;

async function upsertBatch<T extends object>(
  table: string,
  rows: T[],
  label: string,
  onConflict: string,
): Promise<void> {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await db.from(table).upsert(chunk, { onConflict, ignoreDuplicates: true });
    if (error) throw new Error(`${label} chunk ${i}–${i + chunk.length}: ${error.message}`);
    inserted += chunk.length;
    process.stdout.write(`\r  ${label}: ${inserted}/${rows.length}`);
  }
  console.log(`\r  ${label}: ${rows.length} rows OK`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n=== Uniex DB seed — 2026 rate cards ===\n');

  // 1. Carriers (idempotent)
  console.log('Upserting carriers...');
  const { error: carrierErr } = await db.from('carriers').upsert([
    { id: 'dhl',   display_name: 'DHL Express' },
    { id: 'fedex', display_name: 'FedEx International' },
    { id: 'ups',   display_name: 'UPS Worldwide' },
  ], { onConflict: 'id', ignoreDuplicates: true });
  if (carrierErr) throw new Error(`carriers: ${carrierErr.message}`);
  console.log('  carriers: 3 rows OK');

  // 2. Zone mappings → carrier_zones
  console.log('\nSeeding carrier_zones...');
  await upsertBatch('carrier_zones', ALL_ZONES.map(z => ({
    carrier_id:          z.carrier_id,
    origin_country:      z.origin_country,
    destination_country: z.destination_country,
    zone_code:           z.zone_code,
  })), 'carrier_zones', 'carrier_id,origin_country,destination_country,effective_from');

  // 3. Rate card steps → rate_card_steps
  const allSteps = [...DHL_STEPS, ...FEDEX_STEPS, ...UPS_STEPS];
  console.log('\nSeeding rate_card_steps...');
  await upsertBatch('rate_card_steps', allSteps, 'rate_card_steps', 'carrier_id,zone_code,shipment_type,weight_kg');

  // 4. Rate card bands → rate_card_bands
  const allBands = [...DHL_BANDS, ...FEDEX_BANDS, ...UPS_BANDS];
  console.log('\nSeeding rate_card_bands...');
  await upsertBatch('rate_card_bands', allBands, 'rate_card_bands', 'carrier_id,zone_code,shipment_type,weight_min_kg');

  console.log('\n=== Seed complete ===\n');
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
