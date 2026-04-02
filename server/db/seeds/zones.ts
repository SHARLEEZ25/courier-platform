/**
 * Country → Zone mappings extracted from 2026 PDF rate cards.
 * origin_country is always 'India' (Uniex outbound only).
 *
 * DHL  zones: '1'–'14'
 * FedEx zones: 'A'–'Q'
 * UPS   zones: '1'–'10' + named ('USA','CANADA','AUSTRALIA','NEWZEAL','SINGAPORE','GERMANY','POLAND','NCL')
 */

export interface ZoneRow {
  carrier_id: string;
  origin_country: string;
  destination_country: string;
  zone_code: string;
  service_type: string;  // 'standard' for DHL/UPS; 'IP' or 'IPF' for FedEx
}

const ORIGIN = 'India';

// ─── DHL Zones (from DHL-2026.pdf country list) ──────────────────────────────
const DHL_ZONES: [string, string][] = [
  // Zone 1
  ['UAE',              '1'], ['Bangladesh',    '1'], ['Nepal',        '1'],
  ['Sri Lanka',        '1'], ['Maldives',      '1'], ['Bhutan',       '1'],
  // Zone 2
  ['Hong Kong',        '2'], ['Malaysia',      '2'], ['Singapore',    '2'],
  ['Thailand',         '2'],
  // Zone 3
  ['China',            '3'],
  // Zone 4
  ['Bahrain',          '4'], ['Jordan',        '4'], ['Kuwait',       '4'],
  ['Oman',             '4'], ['Pakistan',      '4'], ['Qatar',        '4'],
  ['Saudi Arabia',     '4'],
  // Zone 5
  ['Brunei',           '5'], ['Cambodia',      '5'], ['Indonesia',    '5'],
  ['Japan',            '5'], ['South Korea',   '5'], ['Laos',         '5'],
  ['Macau',            '5'], ['Myanmar',       '5'], ['Philippines',  '5'],
  ['Taiwan',           '5'], ['Vietnam',       '5'],
  // Zone 6
  ['New Zealand',      '6'], ['Papua New Guinea','6'],
  // Zone 7 — Western Europe
  ['Austria',          '7'], ['Belgium',       '7'], ['Czech Republic','7'],
  ['Denmark',          '7'], ['Finland',       '7'], ['France',       '7'],
  ['Germany',          '7'], ['Greece',        '7'], ['Hungary',      '7'],
  ['Ireland',          '7'], ['Italy',         '7'], ['Luxembourg',   '7'],
  ['Netherlands',      '7'], ['Poland',        '7'], ['Portugal',     '7'],
  ['Romania',          '7'], ['Slovakia',      '7'], ['Slovenia',     '7'],
  ['Spain',            '7'], ['Sweden',        '7'], ['Switzerland',  '7'],
  ['UK',               '7'],
  // Zone 8 — Eastern/Northern Europe + Israel + Turkey
  ['Albania',          '8'], ['Belarus',       '8'], ['Bulgaria',     '8'],
  ['Croatia',          '8'], ['Cyprus',        '8'], ['Estonia',      '8'],
  ['Iceland',          '8'], ['Israel',        '8'], ['Latvia',       '8'],
  ['Lithuania',        '8'], ['Malta',         '8'], ['Montenegro',   '8'],
  ['Norway',           '8'], ['Serbia',        '8'], ['Turkey',       '8'],
  ['Ukraine',          '8'],
  // Zone 9 — Canada + Mexico + Pacific territories
  ['Canada',           '9'], ['Mexico',        '9'],
  // Zone 10 — South America + Caribbean
  ['Argentina',        '10'], ['Bolivia',      '10'], ['Brazil',      '10'],
  ['Chile',            '10'], ['Colombia',     '10'], ['Ecuador',     '10'],
  ['Paraguay',         '10'], ['Peru',         '10'], ['Uruguay',     '10'],
  ['Venezuela',        '10'], ['Jamaica',      '10'], ['Trinidad and Tobago','10'],
  // Zone 11 — Rest of World / difficult
  ['Afghanistan',      '11'], ['Angola',       '11'], ['Armenia',     '11'],
  ['Azerbaijan',       '11'], ['Ethiopia',     '11'], ['Iran',        '11'],
  ['Iraq',             '11'], ['Kazakhstan',   '11'], ['Libya',       '11'],
  ['Morocco',          '11'], ['Russia',       '11'], ['Syria',       '11'],
  ['Yemen',            '11'],
  // Zone 12 — USA
  ['USA',              '12'],
  // Zone 13 — Africa (key markets)
  ['Egypt',            '13'], ['Ghana',        '13'], ['Kenya',       '13'],
  ['Mauritius',        '13'], ['Mozambique',   '13'], ['Nigeria',     '13'],
  ['South Africa',     '13'], ['Sudan',        '13'], ['Tanzania',    '13'],
  ['Uganda',           '13'], ['Zimbabwe',     '13'],
  // Zone 14 — Australia
  ['Australia',        '14'],
];

// ─── FedEx Zones (from FDX EXPORT-2026.pdf country list) ─────────────────────
const FEDEX_ZONES: [string, string][] = [
  // Zone A — UAE
  ['UAE',              'A'],
  // Zone B — South Asia + Singapore + Pakistan
  ['Bangladesh',       'B'], ['Bhutan',        'B'], ['Maldives',     'B'],
  ['Nepal',            'B'], ['Pakistan',      'B'], ['Singapore',    'B'],
  ['Sri Lanka',        'B'],
  // Zone C — Middle East + Egypt + difficult
  ['Afghanistan',      'C'], ['Egypt',         'C'], ['Iran',         'C'],
  ['Iraq',             'C'], ['Jordan',        'C'], ['Lebanon',      'C'],
  ['Myanmar',          'C'], ['Saudi Arabia',  'C'], ['Syria',        'C'],
  ['Yemen',            'C'],
  // Zone D — China + Hong Kong + Thailand
  ['China',            'D'], ['Hong Kong',     'D'], ['Thailand',     'D'],
  // Zone E — Southeast Asia + Oceania + Pacific
  ['Australia',        'E'], ['Brunei',        'E'], ['Cambodia',     'E'],
  ['Indonesia',        'E'], ['Japan',         'E'], ['Laos',         'E'],
  ['Macau',            'E'], ['Malaysia',      'E'], ['New Caledonia','E'],
  ['New Zealand',      'E'], ['Philippines',   'E'], ['South Korea',  'E'],
  ['Taiwan',           'E'], ['Vietnam',       'E'],
  // Zone F — Western Europe (core)
  ['Belgium',          'F'], ['Denmark',       'F'], ['France',       'F'],
  ['Germany',          'F'], ['Italy',         'F'], ['Luxembourg',   'F'],
  ['Netherlands',      'F'], ['Spain',         'F'], ['Switzerland',  'F'],
  ['UK',               'F'],
  // Zone G — USA + Mexico
  ['USA',              'G'], ['Mexico',        'G'],
  // Zone H — Japan (separate from Zone E)
  // Note: PDF puts Japan in Zone E for IP but Zone H exists — using E as default
  // Zone I — Rest of Europe (Eastern + Northern)
  ['Albania',          'I'], ['Austria',       'I'], ['Belarus',      'I'],
  ['Bulgaria',         'I'], ['Croatia',       'I'], ['Cyprus',       'I'],
  ['Czech Republic',   'I'], ['Estonia',       'I'], ['Finland',      'I'],
  ['Greece',           'I'], ['Hungary',       'I'], ['Iceland',      'I'],
  ['Ireland',          'I'], ['Israel',        'I'], ['Kazakhstan',   'I'],
  ['Latvia',           'I'], ['Lithuania',     'I'], ['Malta',        'I'],
  ['Moldova',          'I'], ['Montenegro',    'I'], ['Norway',       'I'],
  ['Poland',           'I'], ['Portugal',      'I'], ['Romania',      'I'],
  ['Russia',           'I'], ['Serbia',        'I'], ['Slovakia',     'I'],
  ['Slovenia',         'I'], ['Sweden',        'I'], ['Turkey',       'I'],
  ['Ukraine',          'I'],
  // Zone J — Americas + Caribbean
  ['Argentina',        'J'], ['Bolivia',       'J'], ['Brazil',       'J'],
  ['Chile',            'J'], ['Colombia',      'J'], ['Ecuador',      'J'],
  ['Jamaica',          'J'], ['Panama',        'J'], ['Paraguay',     'J'],
  ['Peru',             'J'], ['Trinidad and Tobago','J'], ['Uruguay',  'J'],
  ['Venezuela',        'J'],
  // Zone K — South Africa
  ['South Africa',     'K'],
  // Zone L — Canada
  ['Canada',           'L'],
  // Zone M — Gulf (Bahrain, Kuwait, Oman, Qatar)
  ['Bahrain',          'M'], ['Kuwait',        'M'], ['Oman',         'M'],
  ['Qatar',            'M'],
  // Zone N — East Africa + Mauritius + Sudan
  ['Kenya',            'N'], ['Mauritius',     'N'], ['Sudan',        'N'],
  ['Tanzania',         'N'], ['Uganda',        'N'],
  // Zone O — West/North Africa
  ['Algeria',          'O'], ['Ghana',         'O'], ['Libya',        'O'],
  ['Morocco',          'O'], ['Nigeria',       'O'],
  // Zone P — Southern Africa
  ['Mozambique',       'P'], ['Namibia',       'P'], ['Zimbabwe',     'P'],
  ['Zambia',           'P'],
  // Zone Q — West Africa + others
  ['Angola',           'Q'], ['Cameroon',      'Q'], ['Egypt',        'Q'],
  ['Ethiopia',         'Q'], ['Senegal',       'Q'],
];

// ─── UPS Zones (from UPS-2026.pdf country list, pages 7-9) ──────────────────
// Numeric zones 1-8, 10 + named country group codes
// Named zone codes: 'USA','CANADA','AUSTRALIA','NEWZEAL','SINGAPORE','GERMANY','POLAND','NCL'
//   POLAND covers: Poland, Czech Rep., Hungary, Romania
//   NCL covers: New Caledonia, Mauritius, Maldives
const UPS_ZONES: [string, string][] = [
  // Zone 1 — Bangladesh, Nepal, Sri Lanka, UAE
  ['UAE',              '1'], ['Bangladesh',    '1'], ['Nepal',        '1'],
  ['Sri Lanka',        '1'],
  // Zone 2 — HK, Macau, Malaysia, Taiwan, Thailand, Vietnam
  ['Hong Kong',        '2'], ['Macau',         '2'], ['Malaysia',     '2'],
  ['Taiwan',           '2'], ['Thailand',      '2'], ['Vietnam',      '2'],
  // Zone 3 — Bahrain, China, Indonesia, Japan, Jordan, Kuwait, Lebanon, Oman,
  //           Philippines, Qatar, Saudi Arabia, South Korea, Yemen
  ['Bahrain',          '3'], ['China',         '3'], ['Indonesia',    '3'],
  ['Japan',            '3'], ['Jordan',        '3'], ['Kuwait',       '3'],
  ['Lebanon',          '3'], ['Oman',          '3'], ['Pakistan',     '3'],
  ['Philippines',      '3'], ['Qatar',         '3'], ['Saudi Arabia', '3'],
  ['South Korea',      '3'], ['Yemen',         '3'],
  // Zone 4 — Denmark, France, Italy, Luxembourg, Netherlands, Spain, Switzerland, UK
  ['Denmark',          '4'], ['France',        '4'], ['Italy',        '4'],
  ['Luxembourg',       '4'], ['Netherlands',   '4'], ['Spain',        '4'],
  ['Switzerland',      '4'], ['UK',            '4'],
  // Zone 5 — Mexico
  ['Mexico',           '5'],
  // Zone 6 — Austria, Finland, Greece, Ireland, Norway, Portugal, Sweden
  ['Austria',          '6'], ['Finland',       '6'], ['Greece',       '6'],
  ['Ireland',          '6'], ['Norway',        '6'], ['Portugal',     '6'],
  ['Sweden',           '6'],
  // Zone 7 — Rest of World
  ['Brazil',           '7'], ['Chile',         '7'], ['Colombia',     '7'],
  ['Ecuador',          '7'], ['Peru',          '7'], ['Venezuela',    '7'],
  ['South Africa',     '7'], ['Nigeria',       '7'], ['Kenya',        '7'],
  ['Ghana',            '7'], ['Egypt',         '7'], ['Tanzania',     '7'],
  ['Uganda',           '7'], ['Ethiopia',      '7'], ['Israel',       '7'],
  ['Turkey',           '7'], ['Bulgaria',      '7'], ['Cyprus',       '7'],
  ['Iceland',          '7'], ['Malta',         '7'], ['Slovakia',     '7'],
  // Zone 8 — Eastern Europe, CIS, difficult destinations
  ['Albania',          '8'], ['Angola',        '8'], ['Armenia',      '8'],
  ['Azerbaijan',       '8'], ['Belarus',       '8'], ['Bosnia',       '8'],
  ['Croatia',          '8'], ['Estonia',       '8'], ['Georgia',      '8'],
  ['Kazakhstan',       '8'], ['Latvia',        '8'], ['Lithuania',    '8'],
  ['Moldova',          '8'], ['Montenegro',    '8'], ['Russia',       '8'],
  ['Serbia',           '8'], ['Slovenia',      '8'], ['Syria',        '8'],
  ['Ukraine',          '8'], ['Uzbekistan',    '8'],
  // Zone 10 — Remote / difficult destinations
  ['Argentina',        '10'], ['Bolivia',      '10'], ['Jamaica',     '10'],
  ['Paraguay',         '10'], ['Trinidad and Tobago','10'], ['Uruguay','10'],
  ['Guatemala',        '10'], ['Costa Rica',   '10'], ['Panama',      '10'],
  ['Cameroon',         '10'], ['Senegal',      '10'],
  // Named destination zones (each has its own pricing column in the rate card)
  ['USA',              'USA'],
  ['Canada',           'CANADA'],
  ['Australia',        'AUSTRALIA'],
  ['New Zealand',      'NEWZEAL'],
  ['Singapore',        'SINGAPORE'],
  ['Germany',          'GERMANY'],
  ['Poland',           'POLAND'],
  ['Czech Republic',   'POLAND'],  // grouped in "Poland, Czech Rep., Hungary, Romania" column
  ['Hungary',          'POLAND'],
  ['Romania',          'POLAND'],
  ['Belgium',          'POLAND'],  // grouped with Poland/Czech in UPS rate card
  ['Maldives',         'NCL'],
  ['Mauritius',        'NCL'],
  ['New Caledonia',    'NCL'],
];

// ─── Build ZoneRow array ──────────────────────────────────────────────────────
function buildRows(carrier: string, pairs: [string, string][], serviceType = 'standard'): ZoneRow[] {
  const seen = new Set<string>();
  const rows: ZoneRow[] = [];
  for (const [dest, zone] of pairs) {
    const key = `${carrier}:${serviceType}:${dest}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ carrier_id: carrier, origin_country: ORIGIN, destination_country: dest, zone_code: zone, service_type: serviceType });
  }
  return rows;
}

export const ALL_ZONES: ZoneRow[] = [
  ...buildRows('dhl',   DHL_ZONES),
  // FedEx: seed both IP and IPF rows.
  // IPF zones are identical to IP for now — update when IPF-specific zone PDF data is available.
  ...buildRows('fedex', FEDEX_ZONES, 'IP'),
  ...buildRows('fedex', FEDEX_ZONES, 'IPF'),
  ...buildRows('ups',   UPS_ZONES),
];
