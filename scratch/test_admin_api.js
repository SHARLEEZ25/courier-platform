async function testApi() {
  try {
    const res = await fetch('http://localhost:3001/api/admin/base-rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weight_kg: 100.5,
        country: 'Czech Republic',
        carrier: 'dhl',
        shipment_type: 'package'
      })
    });
    const data = await res.json();
    console.log('API Response:', data);
  } catch (err) {
    console.error('API Error:', err.message);
  }
}

testApi();
