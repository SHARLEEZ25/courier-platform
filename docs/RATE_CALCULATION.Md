Uniex Courier — Rate Calculation Instructions
For: Claude Code (Antigravity) implementation reference
Sources: DHL2026.pdf · FDX_EXPORT_2026.pdf · UPS2026.pdf · Client pricing text
Every step is tagged by source. Do not assume anything not tagged as PDF or client text.

Source tags:
PDF
directly stated in rate card PDF  
client text
from client pricing message  
DB config
stored in surcharge_config table, editable by admin  
assumed
not in any document — confirm with client before coding
Common rules — apply to all three carriers
1
Chargeable weight PDF
DHL PDF states: "Rates are rounded up to the nearest 0.5kg. Each piece weight is rounded up to the nearest 0.5kg."
Same rule appears in FedEx and UPS PDFs.

chargeable_kg = Math.ceil(actual_kg * 2) / 2
// 1.1 → 1.5 | 2.0 → 2.0 | 3.3 → 3.5 | 5.0 → 5.0
Volumetric weight: All three PDFs state the carrier charges the higher of actual or volumetric weight. Since Uniex does not collect dimensions, this risk must be absorbed by margin. Show disclaimer on quote page: "Final price is indicative. Confirmed after weight verification at our office."
2
GST 18% client text PDF
Client pricing text explicitly states GST 18%. DHL and FedEx PDFs also state "Fuel Surcharge & Goods and Services Tax will be charged, as applicable."

Applied on the full taxable subtotal (base + margin + fuel + demand surcharges).
Hardcoded at 18%. Not editable by admin. No exceptions.
DHL Express — Step-by-step
Source: DHL2026_1.pdf — PID code INB01PRKR/TDE WSL26L6T2 — Rate card as of 01-Jan-2026

1
Determine shipment type PDF
PDF has two separate rate tables:
Table A — "Documents up to 2.0 KG": for document-only shipments, weight ≤ 2.0kg
Table B — "Non-documents from 0.5 KG & Documents from 2.5 KG": for all non-document shipments (any weight), and document shipments over 2.5kg
Customer must declare at booking: Document or Non-document. This selects which table to use.
2
Look up destination zone PDF
DHL uses Zones 1–14. Zone is determined by destination country.
Zone list from PDF (pages 5–8). Key mappings:
Zone	Countries (examples)
1	UAE, Bangladesh, Bhutan, Maldives, Nepal, Sri Lanka
2	Hong Kong, Malaysia, Singapore, Thailand
3	China
4	Bahrain, Jordan, Kuwait, Oman, Pakistan, Qatar, Saudi Arabia
5	Brunei, Cambodia, Indonesia, Japan, Laos, Macau, Myanmar, Philippines, South Korea, Taiwan, Vietnam
6	New Zealand, Papua New Guinea
7	Austria, Czech Rep., Denmark, France, Germany, Hungary, Ireland, Italy, Luxembourg, Netherlands, Poland, Portugal, Romania, Slovakia, Spain, Sweden, Switzerland, UK
8	Belarus, Bulgaria, Cyprus, Estonia, Gibraltar, Greece, Greenland, Guernsey, Iceland, Israel, Jersey, Latvia, Lithuania, Malta, Norway, Slovenia, Turkey
9	Canada, Guam, Marshall Islands, Mexico, N. Mariana Islands, Puerto Rico, Virgin Islands (US)
10	Most of Central & South America (Argentina, Bolivia, Brazil, Chile, Colombia, Ecuador, Peru, Uruguay, Venezuela, etc.)
11	Most of Africa, Central Asia, Middle East (not listed above), Afghanistan, Albania, Algeria, Angola, Armenia, etc.
12	USA
13	Ghana, Kenya, Mauritius, Mozambique, Nigeria, South Africa, Sudan, Tanzania, Zimbabwe
14	Australia
Build a complete country → zone JSON lookup table from the full list on pages 5–8 of DHL2026_1.pdf. The table above is a summary — the PDF has every country.
3
Look up base rate from rate table PDF
Using shipment type (Step 1), zone (Step 2), and chargeable weight:

For weights up to 30kg: look up the exact row in the rate table. Rows go in 0.5kg increments up to 30kg.

For weights above 30kg: PDF switches to a per-kg multiplier. The table shows:
Weight bracket	How to calculate
30.1 – 50 kg	rate = multiplier[zone] × chargeable_kg
50.1 – 70 kg	rate = multiplier[zone] × chargeable_kg
70.1 – 100 kg	rate = multiplier[zone] × chargeable_kg
100.1 – 300 kg	rate = multiplier[zone] × chargeable_kg
300.1 – 500 kg	rate = multiplier[zone] × chargeable_kg
500.1 – 9999 kg	rate = multiplier[zone] × chargeable_kg
Multiplier values per zone and bracket are in pages 1–4 of DHL2026_1.pdf. Seed all values into the DB rate table.
DHL hard limits (from PDF): Max 3,000kg total shipment, max 1,000kg per piece, max 300cm length. Block booking at form level if any of these are exceeded.
4
Apply margin client text DB config
Client text states: "Above rates + Margin Variable 10 to 30%" and "Minimum selling price" concept.

with_margin = base_rate × (1 + margin_pct / 100)
// margin_pct read from surcharge_config table, key = 'margin_pct', carrier = 'dhl'
Never quote below base rate. If with_margin is somehow less than base_rate, throw an error.
5
Apply fuel surcharge client text PDF DB config
Client text: "Fuel SURCHARGE 30 to 40%". DHL PDF: "Fuel Surcharge will be charged as applicable."
DHL publishes FSC monthly at dhl.co.in. Admin updates in settings page.

with_fuel = with_margin × (1 + fuel_surcharge_pct / 100)
// fuel_surcharge_pct from surcharge_config, key = 'fuel_surcharge_pct', carrier = 'dhl'
// Default seed value: 35 (midpoint of 30–40%)
6
Apply demand surcharge (if active) client text PDF DB config
Client text: "Demand or war SURCHARGE per kg price like Rs 150 per kg."
DHL PDF: "Demand Surcharge applies during a period of high demand, determined by DHL at its own discretion." Published at mydhl.express.dhl/in/en/ship/surcharges/demandsurcharge.html

if (demand_active) {
  demand_amount = demand_per_kg × chargeable_kg
  subtotal = with_fuel + demand_amount
} else {
  subtotal = with_fuel
}
// demand_active and demand_per_kg from surcharge_config, carrier = 'dhl'
// Default: demand_active = false, demand_per_kg = 0
7
Add optional premium services PDF
DHL PDF explicitly states:
Premium 9:00 — add Rs 3,000 flat to the DHL Express Worldwide rate
Premium 12:00 — add Rs 1,000 flat to the DHL Express Worldwide rate
These are added to subtotal before GST. Customer selects at booking (Standard / 12pm / 9am).
Hardcoded values — not editable by admin.
if (service === 'premium_900') subtotal += 3000
if (service === 'premium_1200') subtotal += 1000
8
Apply GST 18% client text PDF
final_price = subtotal × 1.18
gst_amount = subtotal × 0.18
// Show both final_price and gst_amount in the quote breakdown
9
Display to customer
Show a clear price breakdown:
Base shipping rate
Margin (do not show — hide from customer, internal only)
Fuel surcharge (show as line item)
Demand surcharge if active (show as line item)
Premium service if selected (show as line item)
GST 18% (show as line item)
Total payable
Disclaimer required on every DHL quote: "Final price is indicative. Confirmed after weight verification at our office. Customs duties and taxes at destination are the customer's responsibility."
FedEx International Export — Step-by-step
Source: FDX_EXPORT__2026.pdf — India FedEx International Export — Rate card as of 01-Jan-2026

1
Determine shipment type and service PDF
FedEx PDF has two separate rate tables:
Pak table — for envelope/document shipments (small, flat). Weight up to 2.5kg (limited brackets).
Package table — for all box/parcel shipments. Covers full weight range.
Customer must declare at booking: Pak (document envelope) or Package. This selects which table.

Also ask: service type. FedEx has IP (International Priority) and IPF. The country zone chart has two columns — IP and IPF — and some countries have different zones for each. Customer or default to IP unless otherwise specified.
2
Look up destination zone PDF
FedEx uses Zones A–Q. Zone determined by destination country from the zone chart (pages 8–12 of PDF). Use the IP column unless customer selects IPF.

Key zone mappings from PDF:
Zone	Countries (examples)
A (AA)	United Arab Emirates
B	Bangladesh, Bhutan, Maldives, Nepal, Pakistan, Singapore, Sri Lanka
C	Afghanistan, Egypt, Iran, Iraq, Jordan, Lebanon, Myanmar, Saudi Arabia, Syria, Turkmenistan, Yemen
D	China, Hong Kong SAR, Thailand
E	Australia, Brunei, Cambodia, Cook Islands, East Timor, Fiji, Indonesia, Japan, Laos, Macau, Malaysia, Micronesia, Mongolia, New Caledonia, New Zealand, Philippines, South Korea, Taiwan, Vietnam and most Pacific Islands
F	Belgium, Denmark, France, Germany, Italy, Luxembourg, Netherlands, Spain, Switzerland, UK and most of Western Europe
G (GG)	Mexico, USA (Rest of Country)
H	Japan (IPF column may differ)
I	Albania, Austria, Bosnia, Bulgaria, Croatia, Czech Rep., Estonia, Finland, Georgia, Greece, Hungary, Ireland, Israel, Kazakhstan, Kosovo, Kyrgyzstan, Latvia, Lithuania, Macedonia, Malta, Moldova, Monaco, Montenegro, Norway, Poland, Portugal, Romania, Russia, Serbia, Slovakia, Slovenia, Sweden, Turkey, Ukraine, Uzbekistan
J	Most of Central & South America, Caribbean (Argentina, Brazil, Chile, Colombia, Jamaica, Jamaica, Panama, Peru, Uruguay, Venezuela, etc.)
K	South Africa
L	Canada
M	Bahrain, Kuwait, Oman, Qatar
N	Central African Rep., Chad, Djibouti, Eritrea, Ethiopia, Kenya, Mauritius, Sudan, Tanzania, Uganda
O	Algeria, Cote D'Ivoire, Ghana, Libya, Morocco, Nigeria, Seychelles
P	Botswana, Lesotho, Namibia, Rwanda, Swaziland, Zambia, Zimbabwe
Q	Most of West & Central Africa (Benin, Burkina Faso, Cameroon, Cape Verde, Congo, Equatorial Guinea, Gabon, Gambia, Guinea, Madagascar, Mali, Mauritania, Mozambique, Niger, Reunion, Senegal, Sierra Leone, Togo, Tunisia, etc.)
Build full country → zone JSON from pages 8–12 of FDX_EXPORT__2026.pdf. Store both IP and IPF zone per country where they differ.
3
Look up base rate from rate table PDF
Use the correct table (Pak or Package) from Step 1.
Find the row matching chargeable weight, column matching zone.
Rate table rows go in 0.5kg increments for lower weights, then 1kg increments at higher weights (check PDF).
For weights above 44.5kg the Pak table ends — only Package table applies above that weight.
4
Apply margin client text DB config
with_margin = base_rate × (1 + margin_pct / 100)
// margin_pct from surcharge_config, carrier = 'fedex'
5
Apply fuel surcharge PDF DB config
FedEx PDF footer states: "Fuel Surcharge & Goods and Services Tax will be charged, as applicable."
FedEx publishes FSC monthly. Admin updates in settings page.
with_fuel = with_margin × (1 + fuel_surcharge_pct / 100)
// fuel_surcharge_pct from surcharge_config, carrier = 'fedex'
6
Apply peak surcharge (if active) PDF DB config
FedEx PDF footer states: "Peak surcharge, Fuel surcharge & GST applicable."
Peak surcharge is seasonal — FedEx announces it. Admin toggles it on/off in settings.
if (peak_active) {
  subtotal = with_fuel + peak_amount
} else {
  subtotal = with_fuel
}
// peak_active and peak_amount from surcharge_config, carrier = 'fedex'
7
Apply demand surcharge (if active) client text DB config
Client text specifies demand/war surcharge as per-kg. Config toggle, off by default.
if (demand_active) subtotal += demand_per_kg × chargeable_kg
// from surcharge_config, carrier = 'fedex'
8
Apply GST 18% PDF
final_price = subtotal × 1.18
gst_amount = subtotal × 0.18
9
Display to customer
Show breakdown: base rate · fuel surcharge · peak surcharge if active · demand surcharge if active · GST · total.
Disclaimer required: "Final price is indicative. Confirmed after weight verification. Customs duties and taxes at destination are the customer's responsibility."
UPS — Step-by-step
Source: UPS2026.pdf — Rate card as of 2026

1
Determine shipment type PDF
UPS PDF has two separate rate tables:
Document table — for document-only shipments
Package table — for all parcel/box shipments
Customer declares at booking: Document or Package.
2
Validate weight limits PDF
UPS PDF states: "This service not applicable if weight of box is more than 70 kg."
Block the booking at form level if weight > 70kg. Show error: "UPS does not accept single packages over 70kg. Please contact us for a custom quote."

Also from PDF: "INR 9450++ if Maximum weight per package increase by 70 Kg" — this surcharge applies if somehow a package exceeds 70kg (e.g. declared wrong). Hardcoded surcharge, auto-add if weight input is exactly 70kg as a warning flag.
3
Look up destination zone PDF
UPS rate table uses Zones 1–10 plus explicit named country columns. The named columns in the PDF are:
USA
Canada
Australia
New Zealand
Singapore
Poland, Czech Rep., Hungary, Romania
Germany
New Caledonia, Mauritius, Maldives
For these named countries: use their dedicated column directly, not a zone number.
For all other countries: look up the zone number (1–10) from the zone chart on page 5 and 7 of UPS2026.pdf.

Key zone mappings from PDF:
Zone	Countries
1	Bangladesh, Nepal, Sri Lanka, UAE
2	Hong Kong, Macau, Malaysia, Taiwan, Thailand, Vietnam
3	Bahrain, China, Indonesia, Japan, Jordan, Kuwait, Lebanon, Oman, Philippines, Qatar, Saudi Arabia, South Korea, Yemen
4	Andorra, Denmark, France, Italy, Luxembourg, Netherlands, San Marino, Spain, Switzerland, UK
5	Mexico, Puerto Rico
6	Austria, Finland, Greece, Guernsey, Ireland, Jersey, Norway, Portugal, Sweden
7	Rest of World
8	Albania, Angola, Armenia, Azerbaijan, Belarus, Bosnia, Cape Verde, Croatia, Estonia, Georgia, Greenland, Kazakhstan, Kyrgyzstan, Kosovo, Latvia, Lithuania, Macedonia, Mayotte, Moldova, Montenegro, Russia, Serbia, Slovenia, Syria, Tajikistan, Ukraine, Uzbekistan
9	South China (specific region)
10	Niger, US Virgin Islands, Grenada, Guatemala, Djibouti, Curacao, Paraguay, Gambia, Aruba, Guyana, Costa Rica, Congo, Reunion, American Samoa, Martinique, Trinidad & Tobago, Haiti, Bolivia, Bermuda, Seychelles, Uruguay, St Lucia, Bahamas, Guadeloupe, Cameroon, British Virgin Island, Panama, Cote D Ivoire, Sierra Leone, Suriname, Jamaica, Argentina
4
Look up base rate from rate table PDF
Use shipment type (Document or Package), zone or named country column, and chargeable weight.
Rate table rows go in 0.5kg increments up to 20kg, then per-kg rates for heavier brackets.

For named country columns: read directly from that column instead of a zone column. Same row logic applies.
5
Apply margin client text DB config
with_margin = base_rate × (1 + margin_pct / 100)
// margin_pct from surcharge_config, carrier = 'ups'
6
Apply fuel surcharge and surge fees PDF DB config
UPS PDF states: "Rates are Excluding SURGE FEES, FSC & GST" — meaning these are always added on top.
FSC and surge fees are published by UPS. Admin updates in settings page.
with_fuel = with_margin × (1 + fuel_surcharge_pct / 100)
if (surge_active) with_fuel += surge_amount
subtotal = with_fuel
// from surcharge_config, carrier = 'ups'
7
Apply demand surcharge (if active) client text DB config
if (demand_active) subtotal += demand_per_kg × chargeable_kg
8
Add UPS fixed surcharges based on booking options PDF
All values below are from UPS2026.pdf. All hardcoded — not editable by admin.

A. US inbound surcharge — auto, no customer choice
if (destination === 'US') subtotal += 230
// PDF: "US INBOUND SURCHARGE FOR USA 230++ PER SHIPMENT EXTRA"
B. Remote area surcharge — staff flags at booking
if (remote_area_flagged) {
  remote_charge = Math.max(57 × chargeable_kg, 3150)
  subtotal += remote_charge
}
// PDF: "Rs. 57++ per kg with a minimum of Rs. 3150++"
C. Formal clearance by UPS — customer selects yes/no
if (formal_clearance_selected) subtotal += 3150
// PDF: "Formal Clearance by UPS -3150+gst"
// Note: GST on this fee is included in the final GST step
D. DDP delivery — customer selects DDP or DDU
if (delivery_type === 'DDP') subtotal += 1050
// PDF: "INR 1050++ will be charged for DDP Delivery"
// Duty + VAT + disbursement charged separately at destination — not calculable upfront
E. Signature delivery — customer selects yes/no
if (signature_required) subtotal += 368
// PDF: "INR 368++ will be charged for Signature delivery"
F. Girth surcharge — since dimensions not collected, staff flags post-booking
if (girth_exceeds_400cm) subtotal += 9450
// PDF: "INR 9450++ if Grith is more than 400 Cms"
// Also: min 40kg chargeable weight if girth > 300cm (L+2W+2H)
// PDF: "Min 40 kgs chargeable weight applicable on Grith >300 cms"
G. Prohibited item — customer must declare at booking
Add a mandatory checkbox at booking: "I confirm this shipment does not contain any prohibited items."
If carrier flags a prohibited item, UPS charges Rs 26,565 + GST.
PDF: "INR 26565+gst Extra on Prohibited Item Fee"
This is a liability fee — customer accepts responsibility by ticking the checkbox.
H. Shipping charge correction audit fee — staff applies manually, not in calculator
// PDF: "INR 147.00 Per shipment or 8% of the total amount of shipping charges correction, whichever is greater"
// Applied by UPS after weight correction. Staff passes through to customer. Not part of quote.
9
Waived charges — do NOT implement PDF
UPS PDF explicitly states these are not applicable for this rate card (waived per Uniex's contract):
No Additional Handling Surcharge
No Extended Area Surcharge
No Address Correction
No Residential Delivery Area Surcharge
Do not build these into the calculator. Do not show them to the customer.
10
Apply GST 18% PDF
final_price = subtotal × 1.18
gst_amount = subtotal × 0.18
11
Display to customer
Show breakdown: base rate · fuel/surge · demand if active · US inbound if USA · selected add-ons (remote area / formal clearance / DDP / signature) · GST · total.
Disclaimer required on every UPS quote:
"UPS final chargeable weight is confirmed 5–6 days after pickup and may differ from declared weight. Customs duties and taxes at destination are the customer's responsibility. In DDU shipments, if the consignee refuses to pay duties, charges will be billed back to the sender."
Things not stated in any document — confirm before implementing
!
Items that need client confirmation assumed
Volumetric divisor: PDFs say volumetric weight applies but do not state the divisor. Industry standard for air freight is L×B×H÷5000. Confirm with DHL/FedEx/UPS account manager before implementing.
Order of margin vs fuel surcharge: PDFs do not state whether FSC is applied on base rate alone or on base+margin. Confirm with client — this changes the final number.
Exact margin % per carrier: Client text says 10–30% variable. Get specific % for DHL, FedEx, UPS before seeding the DB defaults.
Discount code logic: Client text mentions "Apply Discount code Concept" — no detail given. Confirm discount structure before building.
Generated from DHL2026.pdf · FDX_EXPORT_2026.pdf · UPS2026.pdf · Client pricing text · Uniex Courier · March 2026