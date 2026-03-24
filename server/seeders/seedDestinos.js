/**
 * seedDestinos.js
 * Precarga países y sus 5 ciudades principales como destinos.
 * Uso: node server/seeders/seedDestinos.js
 *
 * - No borra datos existentes (usa ignoreDuplicates)
 * - Agrega la columna `imagen` si no existe (alter: true)
 */

const sequelize = require('../config/database');
const Destino = require('../models/Destino');

// Genera slug limpio a partir de texto
function slug(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// URL de imagen via Unsplash (sin API key, imágenes por keyword)
function img(query) {
  const q = encodeURIComponent(query);
  return `https://source.unsplash.com/featured/1200x600/?${q},travel`;
}

// Estructura: { pais, region, ciudades: [nombre, ...] }
const PAISES = [
  // ── AMÉRICA DEL SUR ──────────────────────────────────────────────
  { pais: 'Argentina', region: 'América del Sur', ciudades: ['Buenos Aires', 'Bariloche', 'Mendoza', 'Córdoba', 'Ushuaia'] },
  { pais: 'Bolivia', region: 'América del Sur', ciudades: ['La Paz', 'Salar de Uyuni', 'Santa Cruz', 'Sucre', 'Potosí'] },
  { pais: 'Brasil', region: 'América del Sur', ciudades: ['Río de Janeiro', 'São Paulo', 'Salvador', 'Florianópolis', 'Foz do Iguaçu'] },
  { pais: 'Chile', region: 'América del Sur', ciudades: ['Santiago', 'Torres del Paine', 'Valparaíso', 'San Pedro de Atacama', 'Puerto Natales'] },
  { pais: 'Colombia', region: 'América del Sur', ciudades: ['Bogotá', 'Cartagena', 'Medellín', 'Santa Marta', 'Cali'] },
  { pais: 'Ecuador', region: 'América del Sur', ciudades: ['Quito', 'Galápagos', 'Cuenca', 'Guayaquil', 'Baños'] },
  { pais: 'Paraguay', region: 'América del Sur', ciudades: ['Asunción', 'Ciudad del Este', 'Encarnación', 'Pilar', 'Concepción'] },
  { pais: 'Perú', region: 'América del Sur', ciudades: ['Lima', 'Cusco', 'Machu Picchu', 'Arequipa', 'Iquitos'] },
  { pais: 'Uruguay', region: 'América del Sur', ciudades: ['Montevideo', 'Punta del Este', 'Colonia del Sacramento', 'Cabo Polonio', 'Salto'] },
  { pais: 'Venezuela', region: 'América del Sur', ciudades: ['Caracas', 'Los Roques', 'Salto Ángel', 'Mérida', 'Margarita'] },
  { pais: 'Guyana', region: 'América del Sur', ciudades: ['Georgetown', 'Kaieteur', 'Lethem', 'Bartica', 'Linden'] },
  { pais: 'Surinam', region: 'América del Sur', ciudades: ['Paramaribo', 'Nieuw Nickerie', 'Lelydorp', 'Albina', 'Moengo'] },

  // ── CENTROAMÉRICA Y CARIBE ───────────────────────────────────────
  { pais: 'México', region: 'América Central y Caribe', ciudades: ['Ciudad de México', 'Cancún', 'Playa del Carmen', 'Guadalajara', 'Oaxaca'] },
  { pais: 'Guatemala', region: 'América Central y Caribe', ciudades: ['Antigua Guatemala', 'Tikal', 'Ciudad de Guatemala', 'Lago Atitlán', 'Quetzaltenango'] },
  { pais: 'Belice', region: 'América Central y Caribe', ciudades: ['Ciudad de Belice', 'Ambergris Caye', 'Placencia', 'San Ignacio', 'Caye Caulker'] },
  { pais: 'Honduras', region: 'América Central y Caribe', ciudades: ['Tegucigalpa', 'San Pedro Sula', 'Roatán', 'Copán', 'La Ceiba'] },
  { pais: 'El Salvador', region: 'América Central y Caribe', ciudades: ['San Salvador', 'Santa Ana', 'Suchitoto', 'La Libertad', 'San Miguel'] },
  { pais: 'Nicaragua', region: 'América Central y Caribe', ciudades: ['Managua', 'Granada', 'León', 'Ometepe', 'San Juan del Sur'] },
  { pais: 'Costa Rica', region: 'América Central y Caribe', ciudades: ['San José', 'La Fortuna', 'Manuel Antonio', 'Tamarindo', 'Monteverde'] },
  { pais: 'Panamá', region: 'América Central y Caribe', ciudades: ['Ciudad de Panamá', 'Bocas del Toro', 'Boquete', 'Archipiélago de San Blas', 'Santa Catalina'] },
  { pais: 'Cuba', region: 'América Central y Caribe', ciudades: ['La Habana', 'Varadero', 'Trinidad', 'Santiago de Cuba', 'Viñales'] },
  { pais: 'República Dominicana', region: 'América Central y Caribe', ciudades: ['Punta Cana', 'Santo Domingo', 'Puerto Plata', 'La Romana', 'Samaná'] },
  { pais: 'Jamaica', region: 'América Central y Caribe', ciudades: ['Montego Bay', 'Kingston', 'Negril', 'Ocho Ríos', 'Port Antonio'] },
  { pais: 'Puerto Rico', region: 'América Central y Caribe', ciudades: ['San Juan', 'Rincón', 'Vieques', 'Culebra', 'Ponce'] },
  { pais: 'Aruba', region: 'América Central y Caribe', ciudades: ['Oranjestad', 'Palm Beach', 'Eagle Beach', 'San Nicolás', 'Noord'] },
  { pais: 'Bahamas', region: 'América Central y Caribe', ciudades: ['Nassau', 'Exuma', 'Harbour Island', 'Grand Bahama', 'Eleuthera'] },
  { pais: 'Barbados', region: 'América Central y Caribe', ciudades: ['Bridgetown', 'Speightstown', 'Holetown', 'Oistins', 'Bathsheba'] },
  { pais: 'Trinidad y Tobago', region: 'América Central y Caribe', ciudades: ['Puerto España', 'Scarborough', 'San Fernando', 'Chaguanas', 'Point Fortin'] },

  // ── NORTEAMÉRICA ─────────────────────────────────────────────────
  { pais: 'Estados Unidos', region: 'América del Norte', ciudades: ['Nueva York', 'Miami', 'Las Vegas', 'Los Ángeles', 'Orlando'] },
  { pais: 'Canadá', region: 'América del Norte', ciudades: ['Toronto', 'Vancouver', 'Montreal', 'Quebec', 'Banff'] },

  // ── EUROPA ───────────────────────────────────────────────────────
  { pais: 'España', region: 'Europa', ciudades: ['Barcelona', 'Madrid', 'Sevilla', 'Granada', 'Mallorca'] },
  { pais: 'Francia', region: 'Europa', ciudades: ['París', 'Niza', 'Lyon', 'Provenza', 'Mont Saint-Michel'] },
  { pais: 'Italia', region: 'Europa', ciudades: ['Roma', 'Venecia', 'Florencia', 'Amalfi', 'Milán'] },
  { pais: 'Portugal', region: 'Europa', ciudades: ['Lisboa', 'Oporto', 'Algarve', 'Sintra', 'Madeira'] },
  { pais: 'Reino Unido', region: 'Europa', ciudades: ['Londres', 'Edimburgo', 'Liverpool', 'Bath', 'Cotswolds'] },
  { pais: 'Irlanda', region: 'Europa', ciudades: ['Dublín', 'Galway', 'Cork', 'Killarney', 'Cliffs of Moher'] },
  { pais: 'Alemania', region: 'Europa', ciudades: ['Berlín', 'Múnich', 'Hamburgo', 'Colonia', 'Heidelberg'] },
  { pais: 'Austria', region: 'Europa', ciudades: ['Viena', 'Salzburgo', 'Hallstatt', 'Innsbruck', 'Graz'] },
  { pais: 'Suiza', region: 'Europa', ciudades: ['Interlaken', 'Zúrich', 'Ginebra', 'Lucerna', 'Zermatt'] },
  { pais: 'Países Bajos', region: 'Europa', ciudades: ['Ámsterdam', 'Rotterdam', 'La Haya', 'Utrecht', 'Delft'] },
  { pais: 'Bélgica', region: 'Europa', ciudades: ['Brujas', 'Bruselas', 'Gante', 'Amberes', 'Lieja'] },
  { pais: 'Dinamarca', region: 'Europa', ciudades: ['Copenhague', 'Aarhus', 'Odense', 'Aalborg', 'Bornholm'] },
  { pais: 'Suecia', region: 'Europa', ciudades: ['Estocolmo', 'Gotemburgo', 'Malmö', 'Uppsala', 'Kiruna'] },
  { pais: 'Noruega', region: 'Europa', ciudades: ['Oslo', 'Bergen', 'Tromsø', 'Flåm', 'Lofoten'] },
  { pais: 'Finlandia', region: 'Europa', ciudades: ['Helsinki', 'Rovaniemi', 'Turku', 'Tampere', 'Laponia'] },
  { pais: 'Islandia', region: 'Europa', ciudades: ['Reikiavik', 'Aurora Boreal', 'Geysir', 'Jökulsárlón', 'Akureyri'] },
  { pais: 'Grecia', region: 'Europa', ciudades: ['Santorini', 'Mykonos', 'Atenas', 'Creta', 'Rodas'] },
  { pais: 'Croacia', region: 'Europa', ciudades: ['Dubrovnik', 'Split', 'Hvar', 'Zagreb', 'Zadar'] },
  { pais: 'Montenegro', region: 'Europa', ciudades: ['Kotor', 'Budva', 'Tivat', 'Herceg Novi', 'Bar'] },
  { pais: 'Albania', region: 'Europa', ciudades: ['Tirana', 'Saranda', 'Berat', 'Gjirokastër', 'Shkodër'] },
  { pais: 'Hungría', region: 'Europa', ciudades: ['Budapest', 'Eger', 'Pécs', 'Győr', 'Debrecen'] },
  { pais: 'República Checa', region: 'Europa', ciudades: ['Praga', 'Český Krumlov', 'Brno', 'Karlovy Vary', 'Olomouc'] },
  { pais: 'Polonia', region: 'Europa', ciudades: ['Cracovia', 'Varsovia', 'Gdansk', 'Wroclaw', 'Zakopane'] },
  { pais: 'Eslovenia', region: 'Europa', ciudades: ['Liubliana', 'Lago Bled', 'Piran', 'Maribor', 'Postojna'] },
  { pais: 'Eslovaquia', region: 'Europa', ciudades: ['Bratislava', 'Altos Tatras', 'Košice', 'Banská Bystrica', 'Bardejov'] },
  { pais: 'Rumania', region: 'Europa', ciudades: ['Bucarest', 'Brasov', 'Sinaia', 'Sibiu', 'Cluj-Napoca'] },
  { pais: 'Bulgaria', region: 'Europa', ciudades: ['Sofía', 'Plovdiv', 'Nessebar', 'Varna', 'Veliko Tarnovo'] },
  { pais: 'Turquía', region: 'Europa', ciudades: ['Estambul', 'Capadocia', 'Antalya', 'Pamukkale', 'Éfeso'] },
  { pais: 'Rusia', region: 'Europa', ciudades: ['Moscú', 'San Petersburgo', 'Kazán', 'Sochi', 'Vladivostok'] },
  { pais: 'Georgia', region: 'Europa', ciudades: ['Tiflis', 'Batumi', 'Kazbegi', 'Kutaisi', 'Sighnaghi'] },
  { pais: 'Armenia', region: 'Europa', ciudades: ['Ereván', 'Garni', 'Dilijan', 'Gyumri', 'Tatev'] },
  { pais: 'Malta', region: 'Europa', ciudades: ['La Valeta', 'Mdina', 'Gozo', 'Sliema', 'Marsaxlokk'] },
  { pais: 'Chipre', region: 'Europa', ciudades: ['Nicosia', 'Limassol', 'Paphos', 'Ayia Napa', 'Larnaca'] },

  // ── ASIA ─────────────────────────────────────────────────────────
  { pais: 'Japón', region: 'Asia', ciudades: ['Tokio', 'Kioto', 'Osaka', 'Hiroshima', 'Nara'] },
  { pais: 'China', region: 'Asia', ciudades: ['Pekín', 'Shanghái', 'Xi\'an', 'Guilin', 'Chengdu'] },
  { pais: 'India', region: 'Asia', ciudades: ['Delhi', 'Jaipur', 'Agra', 'Mumbai', 'Varanasi'] },
  { pais: 'Tailandia', region: 'Asia', ciudades: ['Bangkok', 'Chiang Mai', 'Phuket', 'Koh Samui', 'Ayutthaya'] },
  { pais: 'Vietnam', region: 'Asia', ciudades: ['Hanói', 'Hoi An', 'Ciudad Ho Chi Minh', 'Da Nang', 'Bahía de Ha Long'] },
  { pais: 'Camboya', region: 'Asia', ciudades: ['Siem Reap', 'Phnom Penh', 'Battambang', 'Sihanoukville', 'Kampot'] },
  { pais: 'Indonesia', region: 'Asia', ciudades: ['Bali', 'Lombok', 'Yogyakarta', 'Yakarta', 'Raja Ampat'] },
  { pais: 'Malasia', region: 'Asia', ciudades: ['Kuala Lumpur', 'Penang', 'Langkawi', 'Kota Kinabalu', 'Malaca'] },
  { pais: 'Singapur', region: 'Asia', ciudades: ['Singapur', 'Marina Bay', 'Sentosa', 'Orchard Road', 'Chinatown'] },
  { pais: 'Filipinas', region: 'Asia', ciudades: ['Manila', 'El Nido', 'Boracay', 'Siargao', 'Palawan'] },
  { pais: 'Nepal', region: 'Asia', ciudades: ['Katmandú', 'Pokhara', 'Everest Base Camp', 'Chitwan', 'Lumbini'] },
  { pais: 'Sri Lanka', region: 'Asia', ciudades: ['Colombo', 'Kandy', 'Sigiriya', 'Galle', 'Ella'] },
  { pais: 'Maldivas', region: 'Asia', ciudades: ['Malé', 'Atolón de Ari', 'Atolón de Baa', 'Atolón de North Malé', 'Atolón de South Malé'] },
  { pais: 'Emiratos Árabes Unidos', region: 'Asia', ciudades: ['Dubái', 'Abu Dabi', 'Sharjah', 'Ajmán', 'Ras al-Jaima'] },
  { pais: 'Qatar', region: 'Asia', ciudades: ['Doha', 'Al Wakrah', 'Al Khor', 'Lusail', 'Al Rayyan'] },
  { pais: 'Israel', region: 'Asia', ciudades: ['Tel Aviv', 'Jerusalén', 'Haifa', 'Eilat', 'Mar Muerto'] },
  { pais: 'Jordania', region: 'Asia', ciudades: ['Petra', 'Wadi Rum', 'Ammán', 'Áqaba', 'Jerash'] },
  { pais: 'Uzbekistán', region: 'Asia', ciudades: ['Samarcanda', 'Bujara', 'Jiva', 'Taskent', 'Shakhrisabz'] },
  { pais: 'Corea del Sur', region: 'Asia', ciudades: ['Seúl', 'Busan', 'Jeju', 'Gyeongju', 'Incheon'] },
  { pais: 'Myanmar', region: 'Asia', ciudades: ['Bagan', 'Yangón', 'Mandalay', 'Lago Inle', 'Ngapali'] },
  { pais: 'Laos', region: 'Asia', ciudades: ['Luang Prabang', 'Vientiane', 'Vang Vieng', 'Don Det', 'Champasak'] },
  { pais: 'Bután', region: 'Asia', ciudades: ['Timbu', 'Paro', 'Punakha', 'Bumthang', 'Wangdue Phodrang'] },

  // ── MEDIO ORIENTE ────────────────────────────────────────────────
  { pais: 'Marruecos', region: 'África', ciudades: ['Marrakech', 'Fez', 'Chefchauen', 'Casablanca', 'Essaouira'] },
  { pais: 'Egipto', region: 'África', ciudades: ['El Cairo', 'Luxor', 'Asuan', 'Hurghada', 'Sharm el-Sheij'] },

  // ── ÁFRICA ───────────────────────────────────────────────────────
  { pais: 'Sudáfrica', region: 'África', ciudades: ['Ciudad del Cabo', 'Kruger', 'Johannesburgo', 'Durban', 'Garden Route'] },
  { pais: 'Kenia', region: 'África', ciudades: ['Nairobi', 'Maasai Mara', 'Amboseli', 'Diani Beach', 'Lago Nakuru'] },
  { pais: 'Tanzania', region: 'África', ciudades: ['Zanzíbar', 'Serengeti', 'Kilimanjaro', 'Ngorongoro', 'Dar es Salam'] },
  { pais: 'Uganda', region: 'África', ciudades: ['Kampala', 'Bwindi', 'Murchison Falls', 'Lake Bunyonyi', 'Jinja'] },
  { pais: 'Ruanda', region: 'África', ciudades: ['Kigali', 'Volcanoes NP', 'Akagera', 'Nyungwe', 'Gisenyi'] },
  { pais: 'Madagascar', region: 'África', ciudades: ['Antananarivo', 'Nosy Be', 'Isalo', 'Morondava', 'Ranomafana'] },
  { pais: 'Namibia', region: 'África', ciudades: ['Windhoek', 'Etosha', 'Sossusvlei', 'Swakopmund', 'Fish River Canyon'] },
  { pais: 'Botsuana', region: 'África', ciudades: ['Maun', 'Okavango', 'Chobe', 'Gaborone', 'Central Kalahari'] },
  { pais: 'Zimbabue', region: 'África', ciudades: ['Victoria Falls', 'Harare', 'Hwange', 'Lake Kariba', 'Matobo'] },
  { pais: 'Etiopía', region: 'África', ciudades: ['Addis Abeba', 'Lalibela', 'Danakil', 'Simien Mountains', 'Axum'] },
  { pais: 'Ghana', region: 'África', ciudades: ['Accra', 'Cape Coast', 'Kumasi', 'Tamale', 'Elmina'] },
  { pais: 'Senegal', region: 'África', ciudades: ['Dakar', 'Saint-Louis', 'Casamance', 'Ziguinchor', 'Saly'] },
  { pais: 'Túnez', region: 'África', ciudades: ['Túnez', 'Sidi Bou Said', 'Djerba', 'Sousse', 'Hammamet'] },

  // ── OCEANÍA ──────────────────────────────────────────────────────
  { pais: 'Australia', region: 'Oceanía', ciudades: ['Sídney', 'Melbourne', 'Cairns', 'Gold Coast', 'Uluru'] },
  { pais: 'Nueva Zelanda', region: 'Oceanía', ciudades: ['Queenstown', 'Auckland', 'Rotorua', 'Milford Sound', 'Wellington'] },
  { pais: 'Fiyi', region: 'Oceanía', ciudades: ['Nadi', 'Mamanuca', 'Coral Coast', 'Savusavu', 'Taveuni'] },
  { pais: 'Polinesia Francesa', region: 'Oceanía', ciudades: ['Bora Bora', 'Moorea', 'Papeete', 'Huahine', 'Rangiroa'] },
  { pais: 'Tahití', region: 'Oceanía', ciudades: ['Papeete', 'Teahupo\'o', 'Papenoo', 'Papeari', 'Tautira'] },
  { pais: 'Papúa Nueva Guinea', region: 'Oceanía', ciudades: ['Port Moresby', 'Madang', 'Lae', 'Goroka', 'Alotau'] },
  { pais: 'Vanuatu', region: 'Oceanía', ciudades: ['Port Vila', 'Tanna', 'Espiritu Santo', 'Malekula', 'Ambae'] },
];

async function seedDestinos() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();

    // Agrega columna `imagen` si no existe sin borrar datos
    console.log('Sincronizando modelo (alter)...');
    await Destino.sync({ alter: true });

    let creados = 0;
    let omitidos = 0;

    for (const { pais, region, ciudades } of PAISES) {
      for (const ciudad of ciudades) {
        const nombreSlug = slug(`${ciudad}-${pais}`);
        const imagen = img(`${ciudad} ${pais}`);

        const existe = await Destino.findOne({ where: { slug: nombreSlug } });
        if (existe) {
          omitidos++;
          continue;
        }

        await Destino.create({
          nombre: ciudad,
          slug: nombreSlug,
          pais,
          region,
          imagen,
        });
        creados++;
      }
    }

    console.log(`\n✓ Destinos creados:  ${creados}`);
    console.log(`✓ Ya existían:       ${omitidos}`);
    console.log(`✓ Total en dataset:  ${PAISES.reduce((acc, p) => acc + p.ciudades.length, 0)}`);
    process.exit(0);
  } catch (err) {
    console.error('Error en seedDestinos:', err);
    process.exit(1);
  }
}

seedDestinos();
