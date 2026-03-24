import { Link } from 'react-router-dom';
import { FaPlane, FaHotel, FaUtensils, FaBed, FaTag } from 'react-icons/fa';
import { urlImagen } from '../../services/paqueteService';
import styles from './PaqueteCard.module.css';

/**
 * Extrae las etiquetas por categoría.
 */
function getEtiqueta(etiquetas = [], categoria) {
  return etiquetas.find((e) => e.categoria === categoria);
}

/**
 * Determina qué servicios muestra la tarjeta basándose en etiquetas.
 * Por ahora mostramos iconos fijos (todos los paquetes incluyen vuelo, hotel, comidas, alojamiento).
 * En el futuro se pueden filtrar por etiquetas de categoría "servicio".
 */
const SERVICIOS = [
  { icon: FaPlane, label: 'Vuelo' },
  { icon: FaHotel, label: 'Hotel' },
  { icon: FaUtensils, label: 'Comidas' },
  { icon: FaBed, label: 'Alojamiento' },
];

export default function PaqueteCard({ paquete }) {
  if (!paquete) return null;

  const {
    slug,
    titulo,
    resumen,
    precio_adulto,
    duracion_dias,
    imagenes = [],
    etiquetas = [],
  } = paquete;

  const portada = imagenes.find((i) => i.es_portada) || imagenes[0];
  const imagen_portada = portada?.ruta_imagen || portada?.url || null;

  const temporada = getEtiqueta(etiquetas, 'temporada');
  const destino = getEtiqueta(etiquetas, 'destino');

  return (
    <Link to={`/paquetes/${slug}`} className={styles.card}>
      <div className={styles.imagen}>
        <img
          src={urlImagen(imagen_portada)}
          alt={titulo}
          loading="lazy"
          onError={(e) => {
            e.target.src = '/placeholder-paquete.jpg';
          }}
        />
        {temporada && (
          <span className={styles.badge}>
            <FaTag size={10} />
            {temporada.nombre}
          </span>
        )}
        {destino && (
          <span className={styles.destinoBadge}>{destino.nombre}</span>
        )}
      </div>

      <div className={styles.cuerpo}>
        <h3 className={styles.titulo}>{titulo}</h3>
        {resumen && <p className={styles.resumen}>{resumen}</p>}

        <div className={styles.duracion}>
          {duracion_dias} {duracion_dias === 1 ? 'día' : 'días'}
        </div>

        <div className={styles.servicios}>
          {SERVICIOS.map(({ icon: Icon, label }) => (
            <span key={label} className={styles.servicio} title={label}>
              <Icon size={14} />
            </span>
          ))}
        </div>

        <div className={styles.pie}>
          <div className={styles.precio}>
            <span className={styles.desde}>desde</span>
            <span className={styles.monto}>
              USD {Number(precio_adulto).toLocaleString('es-UY')}
            </span>
            <span className={styles.porPersona}>/ persona</span>
          </div>
          <span className={styles.verMas}>Ver más →</span>
        </div>
      </div>
    </Link>
  );
}
