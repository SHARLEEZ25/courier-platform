
import { calculateRates } from "./server/services/rate-engine/index.js";

async function test() {
  const input = {
    origin: "India",
    destination: "USA",
    weightKg: 10,
    shipmentType: "package",
    itemType: "docs",
    dims: { l: 50, w: 50, h: 50 }, // 125000 / 5000 = 25 kg
    packaging: "none",
    insurance: false,
  };

  const results = await calculateRates(input);
  const result = results[0];
  console.log(`Actual Weight: ${input.weightKg}kg`);
  console.log(`Dimensions: ${input.dims.l}x${input.dims.w}x${input.dims.h}`);
  console.log(`Chargeable Weight: ${result.chargeableWeightKg}kg`);
  console.log(`Volumetric Weight: ${result.volumetricWeightKg}kg`);
  console.log(`Total Price: ${result.totalInr}`);
  
  const input2 = {
    ...input,
    dims: undefined
  };
  const results2 = await calculateRates(input2);
  const result2 = results2[0];
  console.log(`\nWithout Dims - Chargeable Weight: ${result2.chargeableWeightKg}kg`);
  console.log(`Without Dims - Total Price: ${result2.totalInr}`);
}

test().catch(console.error);
