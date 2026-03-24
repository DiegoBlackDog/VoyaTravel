import { Helmet } from 'react-helmet-async';
import {
  FaHeart,
  FaGlobe,
  FaShieldAlt,
  FaMedal,
  FaMapMarkerAlt,
  FaUsers,
  FaLightbulb,
  FaHandshake,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useConfiguracion } from '../../hooks/useConfiguracion';
import styles from './NosotrosPage.module.css';

/* ------------------------------------------------------------------ */
/* Datos estáticos                                                       */
/* ------------------------------------------------------------------ */

const VALORES = [
  {
    icon: FaHeart,
    titulo: 'Pasión',
    texto: 'Amamos viajar y eso se nota en cada detalle. Diseñamos cada paquete con el mismo cuidado con que planeamos nuestros propios viajes.',
  },
  {
    icon: FaShieldAlt,
    titulo: 'Confianza',
    texto: 'Operamos con total transparencia. Cada precio, condición y servicio es exactamente lo que te comunicamos desde el primer contacto.',
  },
  {
    icon: FaGlobe,
    titulo: 'Experiencia',
    texto: 'Años recorriendo el mundo para traerte los mejores destinos, proveedores y experiencias. Conocemos cada rincón que te ofrecemos.',
  },
  {
    icon: FaHandshake,
    titulo: 'Compromiso',
    texto: 'Estamos con vos antes, durante y después de tu viaje. No desaparecemos cuando comprás: somos tu apoyo en cada etapa.',
  },
];

const EQUIPO = [
  {
    nombre: 'Valentina Sosa',
    rol: 'Fundadora & Directora',
    descripcion: 'Viajera empedernida, soñó con Voyâ mientras recorría el sudeste asiático. Hoy convierte sueños en itinerarios reales.',
    iniciales: 'VS',
    color: '#378966',
  },
  {
    nombre: 'Martín Rodríguez',
    rol: 'Gerente de Operaciones',
    descripcion: 'Especialista en logística de viajes. Asegura que cada detalle esté perfecto para que vos solo tengas que disfrutar.',
    iniciales: 'MR',
    color: '#fc7c5e',
  },
  {
    nombre: 'Lucía Fernández',
    rol: 'Asesora de Viajes',
    descripcion: 'Conoce Europa como la palma de su mano. Su pasión es encontrar el destino ideal para cada tipo de viajero.',
    iniciales: 'LF',
    color: '#ffc757',
  },
  {
    nombre: 'Diego Sánchez',
    rol: 'Asesor de Viajes',
    descripcion: 'Especialista en Latinoamérica y Caribe. Ha visitado más de 40 países y trae esa experiencia a cada consulta.',
    iniciales: 'DS',
    color: '#378966',
  },
];

const HITOS = [
  { año: '2018', hito: 'Fundamos Voyâ con una pequeña oficina en Montevideo y grandes sueños.' },
  { año: '2019', hito: 'Alcanzamos los primeros 500 viajeros felices y sumamos destinos en Europa.' },
  { año: '2020', hito: 'Superamos juntos los desafíos de la pandemia y salimos más fuertes que nunca.' },
  { año: '2022', hito: 'Lanzamos nuestra plataforma digital para una experiencia de reserva más ágil.' },
  { año: '2024', hito: 'Más de 3.000 viajeros confiaron en nosotros. ¡El viaje continúa!' },
];

/* ------------------------------------------------------------------ */
/* Componente principal                                                  */
/* ------------------------------------------------------------------ */

export default function NosotrosPage() {
  const { configuracion } = useConfiguracion();

  return (
    <div className={styles.pagina}>
      <Helmet>
        <title>Nosotros | Voyâ</title>
        <meta name="description" content="Conocé a Voyâ, la agencia de viajes uruguaya que diseña experiencias únicas. Nuestra misión, valores y el equipo detrás de cada viaje." />
        <meta property="og:title" content="Nosotros | Voyâ" />
        <meta property="og:description" content="Conocé a Voyâ, la agencia de viajes uruguaya que diseña experiencias únicas." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ========================================================= */}
      {/* HERO                                                        */}
      {/* ========================================================= */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContenido}>
          <p className={styles.heroEyebrow}>Quiénes somos</p>
          <h1 className={styles.heroTitulo}>
            Somos Voyâ,<br />
            la agencia que te lleva
          </h1>
          <p className={styles.heroSubtitulo}>
            Nacimos en Uruguay con una misión simple: hacer que viajar sea fácil,
            accesible y memorable. Somos un equipo apasionado que convierte destinos
            en experiencias únicas.
          </p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* MISIÓN Y VISIÓN                                            */}
      {/* ========================================================= */}
      <section className={styles.misionSection}>
        <div className={styles.contenedor}>
          <div className={styles.misionGrid}>
            <div className={styles.misionCard}>
              <div className={styles.misionIcono}>
                <FaLightbulb size={28} />
              </div>
              <h2 className={styles.misionTitulo}>Nuestra Misión</h2>
              <p className={styles.misionTexto}>
                Conectar a los uruguayos con el mundo a través de experiencias de viaje diseñadas
                con pasión, honestidad y atención al detalle. Queremos que cada viajero vuelva
                a casa con historias que contar y ganas de volver a salir.
              </p>
            </div>

            <div className={styles.misionCard}>
              <div className={`${styles.misionIcono} ${styles.misionIconoSalmon}`}>
                <FaGlobe size={28} />
              </div>
              <h2 className={styles.misionTitulo}>Nuestra Visión</h2>
              <p className={styles.misionTexto}>
                Ser la agencia de viajes de referencia en Uruguay, reconocida por la calidad
                de sus paquetes, la transparencia de sus procesos y el vínculo cercano que
                construimos con cada viajero que elige recorrer el mundo con nosotros.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* NUESTRA HISTORIA                                           */}
      {/* ========================================================= */}
      <section className={`${styles.section} ${styles.sectionCrema}`}>
        <div className={styles.contenedor}>
          <div className={styles.sectionHeaderCentrado}>
            <p className={styles.eyebrow}>Cómo llegamos hasta acá</p>
            <h2 className={styles.sectionTitulo}>Nuestra historia</h2>
            <p className={styles.sectionSubtitulo}>
              De un sueño en un café de Montevideo a miles de viajeros en todo el mundo.
            </p>
          </div>

          <div className={styles.hitosTimeline}>
            {HITOS.map((h, idx) => (
              <div key={h.año} className={`${styles.hitoItem} ${idx % 2 === 1 ? styles.hitoItemDerecho : ''}`}>
                <div className={styles.hitoAño}>{h.año}</div>
                <div className={styles.hitoPunto} />
                <div className={styles.hitoTextoWrapper}>
                  <p className={styles.hitoTexto}>{h.hito}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* VALORES                                                    */}
      {/* ========================================================= */}
      <section className={styles.section}>
        <div className={styles.contenedor}>
          <div className={styles.sectionHeaderCentrado}>
            <p className={styles.eyebrow}>En qué creemos</p>
            <h2 className={styles.sectionTitulo}>Nuestros valores</h2>
          </div>

          <div className={styles.valoresGrid}>
            {VALORES.map(({ icon: Icon, titulo, texto }) => (
              <div key={titulo} className={styles.valorCard}>
                <div className={styles.valorIcono}>
                  <Icon size={24} />
                </div>
                <h3 className={styles.valorTitulo}>{titulo}</h3>
                <p className={styles.valorTexto}>{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* EQUIPO                                                     */}
      {/* ========================================================= */}
      <section className={`${styles.section} ${styles.sectionCrema}`}>
        <div className={styles.contenedor}>
          <div className={styles.sectionHeaderCentrado}>
            <p className={styles.eyebrow}>Las personas detrás de Voyâ</p>
            <h2 className={styles.sectionTitulo}>Nuestro equipo</h2>
            <p className={styles.sectionSubtitulo}>
              Apasionados por los viajes, comprometidos con tu experiencia.
            </p>
          </div>

          <div className={styles.equipoGrid}>
            {EQUIPO.map(({ nombre, rol, descripcion, iniciales, color }) => (
              <div key={nombre} className={styles.equipoCard}>
                <div
                  className={styles.equipoAvatar}
                  style={{ background: color }}
                >
                  {iniciales}
                </div>
                <h3 className={styles.equipoNombre}>{nombre}</h3>
                <p className={styles.equipoRol}>{rol}</p>
                <p className={styles.equipoDescripcion}>{descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* STATS                                                       */}
      {/* ========================================================= */}
      <section className={styles.statsBar}>
        <div className={styles.contenedor}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statNumero}>{configuracion?.estadistica_viajeros || '3.000'}+</span>
              <span className={styles.statLabel}>Viajeros felices</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumero}>{configuracion?.estadistica_paises || '40'}+</span>
              <span className={styles.statLabel}>Países disponibles</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumero}>{configuracion?.estadistica_paquetes || '100'}+</span>
              <span className={styles.statLabel}>Paquetes activos</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumero}>{new Date().getFullYear() - 2018}</span>
              <span className={styles.statLabel}>Años de experiencia</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* CTA                                                        */}
      {/* ========================================================= */}
      <section className={styles.ctaSection}>
        <div className={styles.contenedor}>
          <div className={styles.ctaContenido}>
            <FaMapMarkerAlt size={36} className={styles.ctaIcono} />
            <h2 className={styles.ctaTitulo}>¿Listo para viajar con nosotros?</h2>
            <p className={styles.ctaSubtitulo}>
              Explorá nuestros paquetes o contactanos directamente. Estamos para ayudarte a crear el viaje perfecto.
            </p>
            <div className={styles.ctaBotones}>
              <Link to="/paquetes" className={styles.ctaBtnPrimario}>
                Ver paquetes
              </Link>
              <Link to="/contacto" className={styles.ctaBtnSecundario}>
                Contactarnos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
