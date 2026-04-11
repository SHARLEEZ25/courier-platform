
import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

const migration = `
-- Migration 003: address fields overhaul
ALTER TABLE bookings RENAME COLUMN sender_name TO sender_company;
ALTER TABLE bookings RENAME COLUMN pickup_address TO pickup_address_1;
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS pickup_address_2  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sender_telephone  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sender_kyc        TEXT NOT NULL DEFAULT '';

ALTER TABLE bookings RENAME COLUMN receiver_name TO receiver_company;
ALTER TABLE bookings RENAME COLUMN delivery_address TO delivery_address_1;
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS delivery_address_2  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS receiver_telephone   TEXT NOT NULL DEFAULT '';

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS shipper_reference   TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS special_instruction TEXT NOT NULL DEFAULT '';
`;

async function runMigration() {
  try {
    console.log('Running migration 003...');
    // We run each statement separately to avoid issues with some drivers and multiple commands
    // Actually postgres.js can run multiple, but RENAME might fail if rerun, so we wrap in try-catch per block
    
    const statements = migration.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const stmt of statements) {
      try {
        console.log(`Executing: ${stmt.substring(0, 50)}...`);
        await sql.unsafe(stmt);
      } catch (e) {
        if (e.message.includes('already exists') || e.message.includes('does not exist')) {
          console.warn(`[Skipped/Info] ${e.message}`);
        } else {
          throw e;
        }
      }
    }
    
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
