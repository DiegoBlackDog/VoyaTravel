import styles from './PaqueteItinerario.module.css';

export default function PaqueteItinerario({ itinerarios = [] }) {
  if (!itinerarios.length) return null;

  // Sort by orden, fallback to dia
  const ordenados = [...itinerarios].sort((a, b) => (a.orden ?? a.dia) - (b.orden ?? b.dia));

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
              <span className={styles.diaLabel}>Día {item.dia}</span>
              <h3 className={styles.diaTitulo}>{item.titulo}</h3>
            </div>
            {item.descripcion && (
              <p className={styles.diaDescripcion}>{item.descripcion}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
