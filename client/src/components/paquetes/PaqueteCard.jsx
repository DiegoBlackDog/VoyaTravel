import { Link } from 'react-router-dom';
import {
  FaPlane, FaHotel, FaUtensils, FaBed, FaTag, FaCoffee,
  FaBus, FaShip, FaTrain, FaCar, FaMotorcycle, FaBicycle,
} from 'react-icons/fa';
import { urlImagen } from '../../services/paqueteService';
import styles from './PaqueteCard.module.css';

function getEtiqueta(etiquetas = [], categoria) {
  return etiquetas.find((e) => e.categoria?.nombre === categoria);
}

const ICONOS_TRANSPORTE = {
  'aéreo': FaPlane,
  'aereo': FaPlane,
  'vuelo': FaPlane,
  'terrestre': FaBus,
  'bus': FaBus,
  'ómnibus': FaBus,
  'omnibus': FaBus,
  'crucero': FaShip,
  'barco': FaShip,
  'marítimo': FaShip,
  'maritimo': FaShip,
  'tren': FaTrain,
  'ferroviario': FaTrain,
  'auto': FaCar,
  'automóvil': FaCar,
  'automovil': FaCar,
  'moto': FaMotorcycle,
  'bicicleta': FaBicycle,
  'ciclismo': FaBicycle,
};

function getIconoTransporte(etiquetas = []) {
  const transporte = getEtiqueta(etiquetas, 'Tipo de transporte');
  if (!transporte) return FaPlane;
  const key = transporte.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [palabra, Icono] of Object.entries(ICONOS_TRANSPORTE)) {
    if (key.includes(palabra)) return Icono;
  }
  return FaPlane;
}

function getIconoComida(etiquetas = []) {
  const comida = getEtiqueta(etiquetas, 'Régimen');
  if (!comida) return FaUtensils;
  const key = comida.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (key.includes('sin')) return null;
  if (key.includes('desayuno')) return FaCoffee;
  return FaUtensils;
}

export default function PaqueteCard({ paquete }) {
  if (!paquete) return null;

  const {
    slug,
    titulo,
    resumen,
    precio_adulto,
    precio_desde,
    duracion_dias,
    duracion_noches,
    imagenes = [],
    etiquetas = [],
    destinos = [],
  } = paquete;

  const precioMostrar = precio_desde ?? precio_adulto;

  const portada = imagenes.find((i) => i.es_portada) || imagenes[0];
  const imagen_portada = portada?.ruta_imagen || portada?.url || null;

  const temporada = getEtiqueta(etiquetas, 'Temporada');
  const destinoPrincipal = destinos[0];

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
        {destinoPrincipal && (
          <span className={styles.destinoBadge}>
            {destinoPrincipal.nombre}{destinoPrincipal.pais ? `, ${destinoPrincipal.pais}` : ''}
          </span>
        )}
      </div>

      <div className={styles.cuerpo}>
        <h3 className={styles.titulo}>{titulo}</h3>
        {resumen && <p className={styles.resumen}>{resumen}</p>}

        <div className={styles.duracion}>
          {duracion_dias} {duracion_dias === 1 ? 'día' : 'días'}
          {duracion_noches > 0 && ` / ${duracion_noches} ${duracion_noches === 1 ? 'noche' : 'noches'}`}
        </div>

        <div className={styles.servicios}>
          {[getIconoTransporte(etiquetas), FaHotel, getIconoComida(etiquetas), FaBed]
            .filter(Boolean)
            .map((Icon, i) => (
              <span key={i} className={styles.servicio}>
                <Icon size={14} />
              </span>
            ))}
        </div>

        <div className={styles.pie}>
          <div className={styles.precio}>
            <span className={styles.desde}>desde</span>
            <span className={styles.monto}>
              USD {Number(precioMostrar).toLocaleString('es-UY')}
            </span>
            <span className={styles.porPersona}>/ persona</span>
          </div>
          <span className={styles.verMas}>Ver más →</span>
        </div>
      </div>
    </Link>
  );
}
