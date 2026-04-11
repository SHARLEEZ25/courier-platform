import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

async function fixRates() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    console.log('Fixing DHL Heavy Rate Bands...');
    
    // 1. Convert all DHL bands >= 30.1kg to multiplicative
    // 2. Set base_price_inr to 0 for these bands (as it's a pure weight*rate multiplier)
    const result = await sql`
      UPDATE rate_card_bands 
      SET 
        band_type = 'multiplicative',
        base_price_inr = 0
      WHERE carrier_id = 'dhl' 
        AND weight_min_kg >= 30.1
        AND band_type = 'additive'
    `;
    
    console.log(`Updated ${result.count} DHL bands to multiplicative.`);

    // Verification
    const check = await sql`
      SELECT band_type, count(*) 
      FROM rate_card_bands 
      WHERE carrier_id = 'dhl' AND weight_min_kg >= 30.1
      GROUP BY band_type
    `;
    console.log('\nVerification of band types:');
    console.table(check);

  } catch (err) {
    console.error('Error during update:', err);
  } finally {
    await sql.end();
  }
}

fixRates();
