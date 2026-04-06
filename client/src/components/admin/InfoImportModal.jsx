import { FiX, FiInfo } from 'react-icons/fi';
import styles from './InfoImportModal.module.css';

/**
 * columnas: [{ letra: 'A', campo: 'Nombre', descripcion: '...', requerido: true }]
 * nota: string opcional (ej: "La primera fila puede ser encabezado")
 */
export default function InfoImportModal({ titulo, columnas, nota, abierto, onCerrar }) {
  if (!abierto) return null;
  return (
    <div className={styles.overlay} onClick={onCerrar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitulo}>
            <FiInfo size={18} className={styles.headerIcono} />
            <h3>Formato Excel — {titulo}</h3>
          </div>
          <button className={styles.cerrar} onClick={onCerrar} aria-label="Cerrar">
            <FiX size={18} />
          </button>
        </div>

        <p className={styles.intro}>
          El archivo <strong>.xlsx</strong> debe tener las columnas en este orden exacto.
          La primera fila puede ser un encabezado (se ignora si no tiene datos válidos).
        </p>

        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Columna</th>
              <th>Campo</th>
              <th>Descripción</th>
              <th>Requerido</th>
            </tr>
          </thead>
          <tbody>
            {columnas.map((col) => (
              <tr key={col.letra}>
                <td className={styles.colLetra}>{col.letra}</td>
                <td className={styles.colCampo}>{col.campo}</td>
                <td className={styles.colDesc}>{col.descripcion}</td>
                <td className={styles.colReq}>{col.requerido ? '✓' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {nota && <p className={styles.nota}>{nota}</p>}
      </div>
    </div>
  );
}
