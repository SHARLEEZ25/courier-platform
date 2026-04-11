import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

async function checkRates() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    console.log('Connected to DB');

    console.log('\n--- DHL Zone 7 Multiplier Rates (100+ kg) ---');
    const bands = await sql`
      SELECT * FROM rate_card_bands 
      WHERE carrier_id = 'dhl' AND zone_code = '7' AND shipment_type = 'package'
      ORDER BY weight_min_kg DESC
    `;
    console.table(bands);

    console.log('\n--- Band Types for Heavy Weights (30.1+ kg) ---');
    const allBands = await sql`
      SELECT carrier_id, band_type, weight_min_kg, price_per_kg, base_price_inr 
      FROM rate_card_bands 
      WHERE weight_min_kg >= 30.1
      GROUP BY carrier_id, band_type, weight_min_kg, price_per_kg, base_price_inr
      ORDER BY carrier_id, weight_min_kg
    `;
    console.table(allBands);

    console.log('\n--- Surcharge Config for DHL ---');
    const surcharges = await sql`
      SELECT * FROM surcharge_config WHERE carrier_id = 'dhl'
    `;
    console.table(surcharges);

    console.log('\n--- Fuel Surcharges for DHL ---');
    const fsc = await sql`
      SELECT * FROM fuel_surcharges WHERE carrier_id = 'dhl' ORDER BY effective_from DESC LIMIT 1
    `;
    console.table(fsc);

  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

checkRates();
