/* ── PNR Parser (adapted from open-pnr, MIT license) ── */

const AIRLINE_NAMES = {
  AA: 'American Airlines', AC: 'Air Canada', AF: 'Air France',
  AM: 'Aeroméxico', AR: 'Aerolíneas Argentinas', AV: 'Avianca',
  AZ: 'ITA Airways', BA: 'British Airways', CM: 'Copa Airlines',
  DL: 'Delta Air Lines', EK: 'Emirates', G3: 'GOL Linhas Aéreas',
  IB: 'Iberia', JJ: 'LATAM Brasil', JL: 'Japan Airlines',
  KL: 'KLM', LA: 'LATAM Airlines', LH: 'Lufthansa',
  LP: 'LATAM Perú', LU: 'LATAM Express', ME: 'Middle East Airlines',
  NH: 'ANA', NZ: 'Air New Zealand', OS: 'Austrian',
  OZ: 'Asiana Airlines', PY: 'Surinam Airways', QR: 'Qatar Airways',
  SK: 'SAS', SQ: 'Singapore Airlines', TK: 'Turkish Airlines',
  TP: 'TAP Air Portugal', UA: 'United Airlines', UX: 'Air Europa',
  VH: 'Amaszonas Uruguay', XL: 'LATAM Ecuador', '4C': 'LATAM Colombia',
  '2K': 'Avianca Ecuador', AD: 'Azul Linhas Aéreas', H2: 'Sky Airline',
};

const AIRPORT_NAMES = {
  MVD: 'Montevideo', EZE: 'Buenos Aires', GRU: 'São Paulo',
  GIG: 'Río de Janeiro', PTY: 'Ciudad de Panamá', MIA: 'Miami',
  JFK: 'Nueva York', LAX: 'Los Ángeles', ORD: 'Chicago',
  ATL: 'Atlanta', IAH: 'Houston', DFW: 'Dallas',
  BOG: 'Bogotá', SCL: 'Santiago de Chile', LIM: 'Lima',
  CUN: 'Cancún', HAV: 'La Habana', PUJ: 'Punta Cana',
  SDQ: 'Santo Domingo', SJO: 'San José', GUA: 'Ciudad de Guatemala',
  MAD: 'Madrid', BCN: 'Barcelona', LHR: 'Londres',
  CDG: 'París', AMS: 'Ámsterdam', FCO: 'Roma',
  MXP: 'Milán', LIS: 'Lisboa', FRA: 'Fráncfort',
  ZRH: 'Zúrich', VIE: 'Viena', IST: 'Estambul',
  DXB: 'Dubái', DOH: 'Doha', SYD: 'Sídney',
  NRT: 'Tokio', ICN: 'Seúl', PEK: 'Pekín',
  HKG: 'Hong Kong', SIN: 'Singapur', BKK: 'Bangkok',
  CCS: 'Caracas', UIO: 'Quito', ASU: 'Asunción',
  CBB: 'Cochabamba', LPB: 'La Paz', VVI: 'Santa Cruz',
  AEP: 'Buenos Aires (Aeroparque)', COR: 'Córdoba', MDZ: 'Mendoza',
  BRC: 'Bariloche', USH: 'Ushuaia', IGR: 'Iguazú',
  BUE: 'Buenos Aires', ROS: 'Rosario', TUC: 'Tucumán',
  FOR: 'Fortaleza', SSA: 'Salvador', REC: 'Recife',
  CWB: 'Curitiba', POA: 'Porto Alegre', FLN: 'Florianópolis',
  BSB: 'Brasilia', CNF: 'Belo Horizonte', MCO: 'Orlando',
  FLL: 'Fort Lauderdale', TPA: 'Tampa', BOS: 'Boston',
  YYZ: 'Toronto', YVR: 'Vancouver', CZM: 'Cozumel',
  SJU: 'San Juan PR', AUA: 'Aruba', BGI: 'Barbados',
  MBJ: 'Montego Bay', KIN: 'Kingston', NAS: 'Nassau',
};

const MONTH_MAP = {
  JAN: 'ene', FEB: 'feb', MAR: 'mar', APR: 'abr',
  MAY: 'may', JUN: 'jun', JUL: 'jul', AUG: 'ago',
  SEP: 'sep', OCT: 'oct', NOV: 'nov', DEC: 'dic',
};

function formatPnrDate(dateStr) {
  if (!dateStr) return '';
  const day = dateStr.slice(0, 2);
  const monthKey = dateStr.slice(2, 5).toUpperCase();
  const month = MONTH_MAP[monthKey] || dateStr.slice(2, 5).toLowerCase();
  return `${parseInt(day, 10)} ${month}`;
}

function formatTime(t) {
  if (!t || t.length < 4) return t;
  return `${t.slice(0, 2)}:${t.slice(2, 4)}`;
}

function getAirlineName(code) {
  return AIRLINE_NAMES[code?.toUpperCase()] || code;
}

function getAirportName(code) {
  return AIRPORT_NAMES[code?.toUpperCase()]
    ? `${AIRPORT_NAMES[code.toUpperCase()]} - ${code.toUpperCase()}`
    : code?.toUpperCase() || '';
}

function parseSegmentLine(line) {
  const isAmadeus = /^[0-9]{1,2}\s\s/.test(line);

  const timeMatch = line.match(/[0-9]{4}[\s]{1,2}[0-9]{4}/);
  if (!timeMatch) return null;
  const [departureTime, arrivalTime] = timeMatch[0].split(/\s{1,2}/);

  let airlineCode, flightNo;
  if (isAmadeus) {
    const m = line.match(/[A-Z0-9]{2}\s?[A-Z0-9]{3,4}\s[A-Z]/);
    if (!m) return null;
    airlineCode = m[0].slice(0, 2).trim();
    flightNo = m[0].slice(0, 6).trim().replace(/\s+/, '');
  } else {
    const m = line.trim().match(/^[0-9]{1,2}\s[A-Z0-9]{2}\s?[A-Z0-9]{4,5}\s/);
    if (!m) return null;
    const [, ...parts] = m[0].trim().split(' ');
    const fn = parts.join(' ');
    airlineCode = fn.slice(0, 2);
    flightNo = fn.slice(0, -1).trim();
  }

  const dateAirportMatch = line.match(/[0-9]{2}[A-Z]{3}\s\d[\s\*][A-Z]{6}/);
  if (!dateAirportMatch) return null;
  const [departureDate, , airportsPair] = dateAirportMatch[0].split(/[\s\*]/);
  const departureAirport = airportsPair.slice(0, 3);
  const arrivalAirport = airportsPair.slice(3);

  let arrivalDate;
  if (isAmadeus) {
    const m = line.match(/\d{4}\s\d{4}\s{2}\d{2}[A-Z]{3}/);
    arrivalDate = m ? m[0].split(/\s\s/).pop() : departureDate;
  } else {
    const m = line.match(/\d{4}\s\s\d{4}\s{3}\d{2}[A-Z]{3}/);
    arrivalDate = m ? m[0].split(/\s{3}/).pop() : departureDate;
  }

  return {
    airline: airlineCode,
    flight_no: flightNo,
    depart_date: departureDate,
    depart_time: departureTime,
    arrive_date: arrivalDate,
    arrive_time: arrivalTime,
    depart_airport: departureAirport,
    arrive_airport: arrivalAirport,
  };
}

export function parsePnr(pnrText) {
  if (!pnrText?.trim()) return [];
  const segments = [];
  const segmentRegex = /^[0-9]{1,2}[\s]{1,2}.+\s[0-9]{2}[A-Z]{3}\s.+\s[0-9]{4}\s\s?[0-9]{4}/;

  for (const rawLine of pnrText.split('\n')) {
    const line = rawLine.trim();
    if (!segmentRegex.test(line)) continue;
    try {
      const seg = parseSegmentLine(line);
      if (seg) segments.push(seg);
    } catch {
      // skip unparseable line
    }
  }
  return segments;
}

export function formatSegment(seg) {
  return {
    airline: getAirlineName(seg.airline),
    airlineCode: seg.airline,
    flightNo: seg.flight_no?.replace(seg.airline, '').trim(),
    salida: `${formatPnrDate(seg.depart_date)} · ${formatTime(seg.depart_time)}`,
    llegada: `${formatPnrDate(seg.arrive_date)} · ${formatTime(seg.arrive_time)}`,
    desde: getAirportName(seg.depart_airport),
    hasta: getAirportName(seg.arrive_airport),
  };
}
