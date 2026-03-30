/* ── Airline Logo Utility ──
 * Maps IATA 2-letter codes → ICAO 3-letter codes.
 * Logos served from: https://github.com/imgmongelli/airlines-logos-dataset
 */

const IATA_TO_ICAO = {
  AA: 'AAL', AC: 'ACA', AD: 'AZU', AF: 'AFR', AM: 'AMX',
  AR: 'ARG', AV: 'AVA', AZ: 'ITY', BA: 'BAW', CM: 'CMP',
  DL: 'DAL', EK: 'UAE', EY: 'ETD', FR: 'RYR', G3: 'GLO',
  H2: 'SKU', JA: 'JAT', IB: 'IBE', JJ: 'TAM', JL: 'JAL', KL: 'KLM',
  LA: 'LAN', LH: 'DLH', LO: 'LOT', LP: 'LPE', LX: 'SWR',
  ME: 'MEA', NH: 'ANA', NZ: 'ANZ', OS: 'AUA', OZ: 'AAR',
  QR: 'QTR', SK: 'SAS', SN: 'BEL', SQ: 'SIA', TK: 'THY',
  TP: 'TAP', U2: 'EZY', UA: 'UAL', UX: 'AEA',
  VY: 'VLG', W6: 'WZZ', '4C': 'ARE',
};

const LOGO_BASE =
  'https://raw.githubusercontent.com/imgmongelli/airlines-logos-dataset/master/images/';

export function getAirlineLogo(iataCode) {
  if (!iataCode) return null;
  const icao = IATA_TO_ICAO[iataCode.toUpperCase()];
  if (!icao) return null;
  return `${LOGO_BASE}${icao}.png`;
}
