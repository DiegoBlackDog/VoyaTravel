import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaMedal,
  FaShieldAlt,
  FaHeart,
  FaCreditCard,
  FaQuoteLeft,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import PaqueteCard from '../../components/paquetes/PaqueteCard';
import { obtenerDestacados } from '../../services/paqueteService';
import { useConfiguracion } from '../../hooks/useConfiguracion';
import api from '../../services/api';
import styles from './HomePage.module.css';

/* ------------------------------------------------------------------ */
/* Datos estáticos                                                       */
/* ------------------------------------------------------------------ */

const TIPOS_VIAJE = [
  { label: 'Relax', emoji: '🏖️', experiencia: 'relax', bg: '#f0f9f4' },
  { label: 'Aventura', emoji: '🧗', experiencia: 'aventura', bg: '#fff5f3' },
  { label: 'Circuitos', emoji: '🗺️', experiencia: 'circuitos', bg: '#fffbf0' },
  { label: 'Grupal', emoji: '👥', experiencia: 'grupal', bg: '#f0f4ff' },
  { label: 'Eventos', emoji: '🎉', experiencia: 'eventos', bg: '#fdf0ff' },
  { label: 'Terrestre', emoji: '🚌', experiencia: 'terrestre', bg: '#f0f8ff' },
  { label: 'Exótico', emoji: '🌴', experiencia: 'exotico', bg: '#fff0f7' },
];

const POR_QUE_VOYA = [
  {
    icon: FaMedal,
    titulo: 'Mejor Precio',
    texto: 'Encontramos las mejores tarifas del mercado y te aseguramos el precio más bajo garantizado.',
  },
  {
    icon: FaShieldAlt,
    titulo: 'Viajá Seguro',
    texto: 'Operamos con las principales aseguradoras y respaldamos cada viaje con atención 24/7.',
  },
  {
    icon: FaHeart,
    titulo: 'Experiencia Local',
    texto: 'Somos uruguayos y conocemos el destino. Cada paquete está diseñado con amor y detalle.',
  },
  {
    icon: FaCreditCard,
    titulo: 'Financiación',
    texto: 'Pagá en cuotas sin interés con todas las tarjetas. Tu viaje soñado, a tu ritmo.',
  },
];

const TEMPORADAS = [
  { value: '', label: 'Cualquier temporada' },
  { value: 'verano', label: 'Verano' },
  { value: 'invierno', label: 'Invierno' },
  { value: 'primavera', label: 'Primavera' },
  { value: 'otono', label: 'Otoño' },
  { value: 'todo-el-ano', label: 'Todo el año' },
];

const DURACIONES = [
  { value: '', label: 'Cualquier duración' },
  { value: '1-5', label: '1 a 5 días' },
  { value: '6-10', label: '6 a 10 días' },
  { value: '11-15', label: '11 a 15 días' },
  { value: '15+', label: 'Más de 15 días' },
];

const PRESUPUESTOS = [
  { value: '', label: 'Cualquier presupuesto' },
  { value: '0-500', label: 'Hasta USD 500' },
  { value: '500-1000', label: 'USD 500 – 1.000' },
  { value: '1000-2000', label: 'USD 1.000 – 2.000' },
  { value: '2000+', label: 'Más de USD 2.000' },
];

/* ------------------------------------------------------------------ */
/* Hook: contador animado                                               */
/* ------------------------------------------------------------------ */
function useContador(valorFinal, duracion = 1800) {
  const [valor, setValor] = useState(0);
  const ref = useRef(null);
  const animado = useRef(false);

  useEffect(() => {
    if (!valorFinal) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animado.current) {
          animado.current = true;
          const inicio = performance.now();
          const num = parseInt(valorFinal, 10) || 0;

          function frame(ahora) {
            const progreso = Math.min((ahora - inicio) / duracion, 1);
            const eased = 1 - Math.pow(1 - progreso, 3);
            setValor(Math.round(eased * num));
            if (progreso < 1) requestAnimationFrame(frame);
          }

          requestAnimationFrame(frame);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [valorFinal, duracion]);

  return { valor, ref };
}

/* ------------------------------------------------------------------ */
/* Subcomponentes                                                        */
/* ------------------------------------------------------------------ */

function StatItem({ valor, sufijo = '+', etiqueta }) {
  const { valor: contado, ref } = useContador(valor);
  return (
    <div className={styles.statItem} ref={ref}>
      <span className={styles.statNumero}>
        {contado.toLocaleString('es-UY')}
        {sufijo}
      </span>
      <span className={styles.statEtiqueta}>{etiqueta}</span>
    </div>
  );
}

function TestimonioCard({ testimonio }) {
  return (
    <div className={styles.testimonioCard}>
      <FaQuoteLeft className={styles.comilla} />
      <p className={styles.testimonioTexto}>{testimonio.contenido}</p>
      <div className={styles.testimonioEstrellas}>
        {[1, 2, 3, 4, 5].map((s) => (
          <FaStar key={s} size={12} className={styles.estrella} />
        ))}
      </div>
      <div className={styles.testimonioAutor}>
        {testimonio.foto ? (
          <img
            src={testimonio.foto}
            alt={testimonio.nombre}
            className={styles.testimonioFoto}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className={styles.testimonioAvatar}>
            {testimonio.nombre?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div>
          <div className={styles.testimonioNombre}>{testimonio.nombre}</div>
          {testimonio.destino && (
            <div className={styles.testimonioDestino}>{testimonio.destino}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                  */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const navigate = useNavigate();
  const { configuracion } = useConfiguracion();

  const [destino, setDestino] = useState('');
  const [temporada, setTemporada] = useState('');
  const [duracion, setDuracion] = useState('');
  const [presupuesto, setPresupuesto] = useState('');

  const [paquetes, setPaquetes] = useState([]);
  const [cargandoPaquetes, setCargandoPaquetes] = useState(true);

  const [testimonios, setTestimonios] = useState([]);

  /* Fetch destacados */
  useEffect(() => {
    obtenerDestacados()
      .then(setPaquetes)
      .catch(() => setPaquetes([]))
      .finally(() => setCargandoPaquetes(false));
  }, []);

  /* Fetch testimonios */
  useEffect(() => {
    api.get('/testimonios')
      .then(({ data }) => setTestimonios(data.data || data || []))
      .catch(() => setTestimonios([]));
  }, []);

  /* Buscador */
  function handleBuscar(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destino) params.set('destino', destino);
    if (temporada) params.set('temporada', temporada);
    if (duracion) {
      if (duracion === '15+') {
        params.set('duracion_min', '15');
      } else if (duracion.includes('-')) {
        const [min, max] = duracion.split('-');
        params.set('duracion_min', min);
        params.set('duracion_max', max);
      }
    }
    if (presupuesto) {
      if (presupuesto === '2000+') {
        params.set('precio_min', '2000');
      } else if (presupuesto.includes('-')) {
        const [min, max] = presupuesto.split('-');
        params.set('precio_min', min);
        params.set('precio_max', max);
      }
    }
    navigate(`/paquetes?${params.toString()}`);
  }

  /* Estadísticas */
  const stats = [
    {
      valor: configuracion?.estadistica_paquetes || '0',
      etiqueta: 'Paquetes',
    },
    {
      valor: configuracion?.estadistica_paises || '0',
      etiqueta: 'Países',
    },
    {
      valor: configuracion?.estadistica_actividades || '0',
      etiqueta: 'Actividades',
    },
    {
      valor: configuracion?.estadistica_viajeros || '0',
      etiqueta: 'Viajeros felices',
    },
  ];

  return (
    <div className={styles.pagina}>
      {/* ========================================================= */}
      {/* HERO                                                        */}
      {/* ========================================================= */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContenido}>
          <p className={styles.heroEyebrow}>Agencia de viajes uruguaya</p>
          <h1 className={styles.heroTitulo}>
            Tu próximo destino<br />
            te está esperando
          </h1>
          <p className={styles.heroSubtitulo}>
            Diseñamos experiencias únicas para que viajes sin preocupaciones.
            Encontrá el paquete perfecto para vos.
          </p>
        </div>

        {/* ---- Buscador flotante ---- */}
        <div className={styles.buscadorWrapper}>
          <form className={styles.buscador} onSubmit={handleBuscar}>
            <div className={styles.buscadorCampo}>
              <FaMapMarkerAlt className={styles.buscadorIcono} />
              <input
                type="text"
                placeholder="¿A dónde querés ir?"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className={styles.buscadorInput}
              />
            </div>

            <div className={styles.buscadorSeparador} />

            <div className={styles.buscadorCampo}>
              <FaCalendarAlt className={styles.buscadorIcono} />
              <select
                value={temporada}
                onChange={(e) => setTemporada(e.target.value)}
                className={styles.buscadorSelect}
              >
                {TEMPORADAS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.buscadorSeparador} />

            <div className={styles.buscadorCampo}>
              <FaClock className={styles.buscadorIcono} />
              <select
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className={styles.buscadorSelect}
              >
                {DURACIONES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.buscadorSeparador} />

            <div className={styles.buscadorCampo}>
              <FaDollarSign className={styles.buscadorIcono} />
              <select
                value={presupuesto}
                onChange={(e) => setPresupuesto(e.target.value)}
                className={styles.buscadorSelect}
              >
                {PRESUPUESTOS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className={styles.buscadorBtn}>
              <FaSearch size={16} />
              <span>Buscar</span>
            </button>
          </form>
        </div>
      </section>

      {/* ========================================================= */}
      {/* PAQUETES DESTACADOS                                        */}
      {/* ========================================================= */}
      <section className={styles.seccion}>
        <div className={styles.contenedor}>
          <div className={styles.seccionHeader}>
            <div>
              <p className={styles.seccionEyebrow}>Selección especial</p>
              <h2 className={styles.seccionTitulo}>Paquetes destacados</h2>
            </div>
            <button
              className={styles.verTodos}
              onClick={() => navigate('/paquetes')}
            >
              Ver todos →
            </button>
          </div>

          {cargandoPaquetes ? (
            <div className={styles.cargando}>
              <div className={styles.spinner} />
              <p>Cargando paquetes…</p>
            </div>
          ) : paquetes.length === 0 ? (
            <p className={styles.sinResultados}>
              No hay paquetes destacados en este momento.
            </p>
          ) : (
            <div className={styles.carruselWrapper}>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                navigation={{
                  nextEl: `.${styles.swiperNext}`,
                  prevEl: `.${styles.swiperPrev}`,
                }}
                pagination={{ clickable: true }}
                autoplay={{ delay: 4500, disableOnInteraction: true }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                className={styles.swiper}
              >
                {paquetes.map((p) => (
                  <SwiperSlide key={p.id} className={styles.swiperSlide}>
                    <PaqueteCard paquete={p} />
                  </SwiperSlide>
                ))}
              </Swiper>
              <button className={styles.swiperPrev} aria-label="Anterior">
                <FaChevronLeft />
              </button>
              <button className={styles.swiperNext} aria-label="Siguiente">
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* TU TIPO DE VIAJE                                          */}
      {/* ========================================================= */}
      <section className={`${styles.seccion} ${styles.seccionCrema}`}>
        <div className={styles.contenedor}>
          <div className={styles.seccionHeaderCentrado}>
            <p className={styles.seccionEyebrow}>Explorá por estilo</p>
            <h2 className={styles.seccionTitulo}>Tu tipo de viaje</h2>
            <p className={styles.seccionSubtitulo}>
              Cada viajero es único. Encontrá el estilo que más te representa.
            </p>
          </div>

          <div className={styles.tiposGrid}>
            {TIPOS_VIAJE.map(({ label, emoji, experiencia, bg }) => (
              <button
                key={experiencia}
                className={styles.tipoCard}
                style={{ '--tipo-bg': bg }}
                onClick={() => navigate(`/paquetes?experiencia=${experiencia}`)}
              >
                <span className={styles.tipoEmoji}>{emoji}</span>
                <span className={styles.tipoLabel}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* POR QUÉ VOYÂ                                              */}
      {/* ========================================================= */}
      <section className={styles.seccion}>
        <div className={styles.contenedor}>
          <div className={styles.seccionHeaderCentrado}>
            <p className={styles.seccionEyebrow}>Nuestro compromiso</p>
            <h2 className={styles.seccionTitulo}>¿Por qué Voyâ?</h2>
            <p className={styles.seccionSubtitulo}>
              Más de una razón para elegirnos como tu agencia de confianza.
            </p>
          </div>

          <div className={styles.porQueGrid}>
            {POR_QUE_VOYA.map(({ icon: Icon, titulo, texto }) => (
              <div key={titulo} className={styles.porQueCard}>
                <div className={styles.porQueIcono}>
                  <Icon size={26} />
                </div>
                <h3 className={styles.porQueTitulo}>{titulo}</h3>
                <p className={styles.porQueTexto}>{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* ESTADÍSTICAS                                               */}
      {/* ========================================================= */}
      <section className={styles.statsBar}>
        <div className={styles.contenedor}>
          <div className={styles.statsGrid}>
            {stats.map((s) => (
              <StatItem
                key={s.etiqueta}
                valor={s.valor}
                etiqueta={s.etiqueta}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* TESTIMONIOS                                                */}
      {/* ========================================================= */}
      {testimonios.length > 0 && (
        <section className={`${styles.seccion} ${styles.seccionCrema}`}>
          <div className={styles.contenedor}>
            <div className={styles.seccionHeaderCentrado}>
              <p className={styles.seccionEyebrow}>Experiencias reales</p>
              <h2 className={styles.seccionTitulo}>Lo que dicen nuestros viajeros</h2>
            </div>

            <div className={styles.carruselWrapper}>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                navigation={{
                  nextEl: `.${styles.testimonioNext}`,
                  prevEl: `.${styles.testimonioPrev}`,
                }}
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: true }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                className={styles.swiper}
              >
                {testimonios.map((t) => (
                  <SwiperSlide key={t.id} className={styles.swiperSlide}>
                    <TestimonioCard testimonio={t} />
                  </SwiperSlide>
                ))}
              </Swiper>
              <button className={styles.testimonioPrev} aria-label="Anterior">
                <FaChevronLeft />
              </button>
              <button className={styles.testimonioNext} aria-label="Siguiente">
                <FaChevronRight />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* CTA FINAL                                                  */}
      {/* ========================================================= */}
      <section className={styles.ctaFinal}>
        <div className={styles.contenedor}>
          <div className={styles.ctaContenido}>
            <h2 className={styles.ctaTitulo}>
              ¿Listo para tu próxima aventura?
            </h2>
            <p className={styles.ctaSubtitulo}>
              Hablá con nuestros expertos y armamos el viaje perfecto para vos.
            </p>
            <div className={styles.ctaBotones}>
              <button
                className={styles.ctaBtnPrimario}
                onClick={() => navigate('/paquetes')}
              >
                Ver todos los paquetes
              </button>
              <button
                className={styles.ctaBtnSecundario}
                onClick={() => navigate('/contacto')}
              >
                Contactarnos
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
