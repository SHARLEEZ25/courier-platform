import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function checkZones() {
  console.log("Checking UPS and DHL zones for USA...");
  const rows = await sql`
    SELECT carrier_id, destination_country, zone_code, service_type
    FROM carrier_zones
    WHERE destination_country = 'USA'
  `;
  console.table(rows);
  
  console.log("\nChecking UPS and DHL rates for 2.5kg USA...");
  // DHL Z12 is 2323
  // UPS USA is 1667
  const rates = await sql`
    SELECT carrier_id, zone_code, price_inr
    FROM rate_card_steps
    WHERE weight_kg = 2.5 AND shipment_type = 'package'
      AND zone_code IN ('12', 'USA', 'Z4', 'G')
  `;
  console.table(rates);
  
  await sql.end();
}

checkZones();
