import { urlImagen } from '../../services/paqueteService';
import styles from './PaqueteItinerario.module.css';

export default function PaqueteItinerario({ itinerarios = [] }) {
  if (!itinerarios.length) return null;

  const ordenados = [...itinerarios].sort((a, b) => (a.orden ?? a.numero_dia) - (b.orden ?? b.numero_dia));

  return (
    <div className={styles.itinerario}>
      {ordenados.map((item, index) => (
        <div key={item.id} className={styles.dia}>
          {/* Línea vertical + punto */}
          <div className={styles.timeline}>
            <div className={styles.punto} />
            {index < ordenados.length - 1 && <div className={styles.linea} />}
          </div>

          {/* Contenido */}
          <div className={styles.contenido}>
            <div className={styles.diaHeader}>
              <span className={styles.diaLabel}>Día {item.numero_dia}</span>
              <h3 className={styles.diaTitulo}>{item.titulo}</h3>
            </div>
            <div className={styles.diaBody}>
              {item.descripcion && (
                <p className={styles.diaDescripcion}>{item.descripcion}</p>
              )}
              {item.imagen && (
                <img
                  src={urlImagen(item.imagen)}
                  alt={item.titulo}
                  className={styles.diaImagen}
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
