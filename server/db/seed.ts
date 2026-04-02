/**
 * Database seeder — 2026 rate cards
 *
 * Run with:  npm run db:seed
 *
 * Requires in .env: DATABASE_URL (Neon connection string)
 *
 * Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING.
 */

import 'dotenv/config';
import postgres from 'postgres';
import { ALL_ZONES } from './seeds/zones.js';
import { DHL_STEPS, DHL_BANDS } from './seeds/dhl.js';
import { FEDEX_STEPS, FEDEX_BANDS } from './seeds/fedex.js';
import { UPS_STEPS, UPS_BANDS } from './seeds/ups.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

const BATCH = 500;

// Batch insert using postgres.js unnest-style bulk upsert
async function upsertZones(rows: typeof ALL_ZONES): Promise<void> {
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    for (const row of chunk) {
      await sql`
        INSERT INTO carrier_zones (carrier_id, origin_country, destination_country, zone_code, service_type)
        VALUES (${row.carrier_id}, ${row.origin_country}, ${row.destination_country}, ${row.zone_code}, ${row.service_type})
        ON CONFLICT (carrier_id, origin_country, destination_country, service_type, effective_from) DO NOTHING
      `;
    }
    process.stdout.write(`\r  carrier_zones: ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }
  console.log(`\r  carrier_zones: ${rows.length} rows OK`);
}

async function upsertSteps(rows: { carrier_id: string; zone_code: string; shipment_type: string; weight_kg: number; price_inr: number }[]): Promise<void> {
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    // postgres.js bulk insert via values list
    await sql`
      INSERT INTO rate_card_steps ${sql(chunk)}
      ON CONFLICT (carrier_id, zone_code, shipment_type, weight_kg) DO NOTHING
    `;
    process.stdout.write(`\r  rate_card_steps: ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }
  console.log(`\r  rate_card_steps: ${rows.length} rows OK`);
}

async function upsertBands(rows: { carrier_id: string; zone_code: string; shipment_type: string; weight_min_kg: number; [key: string]: unknown }[]): Promise<void> {
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    await sql`
      INSERT INTO rate_card_bands ${sql(chunk)}
      ON CONFLICT (carrier_id, zone_code, shipment_type, weight_min_kg) DO NOTHING
    `;
    process.stdout.write(`\r  rate_card_bands: ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }
  console.log(`\r  rate_card_bands: ${rows.length} rows OK`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n=== Uniex DB seed — 2026 rate cards ===\n');

  // 1. Carriers (idempotent)
  console.log('Upserting carriers...');
  await sql`
    INSERT INTO carriers (id, display_name) VALUES
      ('dhl',   'DHL Express'),
      ('fedex', 'FedEx International'),
      ('ups',   'UPS Worldwide')
    ON CONFLICT (id) DO NOTHING
  `;
  console.log('  carriers: 3 rows OK');

  // 2. Zone mappings
  console.log('\nSeeding carrier_zones...');
  await upsertZones(ALL_ZONES);

  // 3. Rate card steps
  console.log('\nSeeding rate_card_steps...');
  await upsertSteps([...DHL_STEPS, ...FEDEX_STEPS, ...UPS_STEPS] as Parameters<typeof upsertSteps>[0]);

  // 4. Rate card bands
  console.log('\nSeeding rate_card_bands...');
  await upsertBands([...DHL_BANDS, ...FEDEX_BANDS, ...UPS_BANDS] as unknown as Parameters<typeof upsertBands>[0]);

  // 5. Surcharge config defaults (margin, demand, peak, surge)
  console.log('\nSeeding surcharge_config...');
  await sql`
    INSERT INTO surcharge_config (carrier_id, key, value_num, value_bool) VALUES
      ('dhl',   'margin_pct',    20,   NULL),
      ('dhl',   'demand_active', NULL, false),
      ('dhl',   'demand_per_kg', 0,    NULL),
      ('fedex', 'margin_pct',    20,   NULL),
      ('fedex', 'demand_active', NULL, false),
      ('fedex', 'demand_per_kg', 0,    NULL),
      ('fedex', 'peak_active',   NULL, false),
      ('fedex', 'peak_amount',   0,    NULL),
      ('ups',   'margin_pct',    20,   NULL),
      ('ups',   'demand_active', NULL, false),
      ('ups',   'demand_per_kg', 0,    NULL),
      ('ups',   'surge_active',  NULL, false),
      ('ups',   'surge_amount',  0,    NULL)
    ON CONFLICT (carrier_id, key) DO NOTHING
  `;
  console.log('  surcharge_config: 13 rows OK');

  console.log('\n=== Seed complete ===\n');
  await sql.end();
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
