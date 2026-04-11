import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

async function checkZones() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    console.log('Checking DHL Zone Mappings...');
    const zones = await sql`
      SELECT destination_country, zone_code, service_type, count(*) 
      FROM carrier_zones 
      WHERE carrier_id = 'dhl'
      GROUP BY destination_country, zone_code, service_type
      ORDER BY destination_country ASC
      LIMIT 20
    `;
    console.table(zones);

    const czech = await sql`
      SELECT * FROM carrier_zones 
      WHERE carrier_id = 'dhl' AND destination_country ILIKE '%Czech%'
    `;
    console.log('\nCzech Republic Mapping:');
    console.table(czech);

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

checkZones();
