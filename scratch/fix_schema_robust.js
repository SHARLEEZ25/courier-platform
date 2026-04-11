
import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('Running final schema fixes...');

    // Rename sender_name to sender_company if it exists
    try {
      await sql`ALTER TABLE bookings RENAME COLUMN sender_name TO sender_company`;
      console.log('Renamed sender_name to sender_company');
    } catch (e) {
      console.warn('Skip sender_name rename:', e.message);
    }

    // Rename pickup_address to pickup_address_1 if it exists
    try {
      await sql`ALTER TABLE bookings RENAME COLUMN pickup_address TO pickup_address_1`;
      console.log('Renamed pickup_address to pickup_address_1');
    } catch (e) {
      console.warn('Skip pickup_address rename:', e.message);
    }

    // Ensure new columns exist
    const addColumns = [
       'pickup_address_2 TEXT NOT NULL DEFAULT \'\'',
       'sender_telephone TEXT NOT NULL DEFAULT \'\'',
       'sender_kyc TEXT NOT NULL DEFAULT \'\'',
       'delivery_address_2 TEXT NOT NULL DEFAULT \'\'',
       'receiver_telephone TEXT NOT NULL DEFAULT \'\'',
       'shipper_reference TEXT NOT NULL DEFAULT \'\'',
       'special_instruction TEXT NOT NULL DEFAULT \'\''
    ];

    for (const col of addColumns) {
      try {
        await sql.unsafe(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ${col}`);
        console.log(`Added column: ${col.split(' ')[0]}`);
      } catch (e) {
        console.warn(`Skip add column ${col}:`, e.message);
      }
    }

    console.log('Schema fixes completed.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
