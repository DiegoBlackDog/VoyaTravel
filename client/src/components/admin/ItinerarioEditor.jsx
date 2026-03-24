import { FiPlus, FiTrash2, FiChevronUp, FiChevronDown, FiMapPin } from 'react-icons/fi';
import styles from './ItinerarioEditor.module.css';

export default function ItinerarioEditor({ value = [], onChange }) {
  const dias = Array.isArray(value) ? value : [];

  const actualizar = (nuevosDias) => {
    onChange?.(nuevosDias);
  };

  const agregarDia = () => {
    actualizar([
      ...dias,
      {
        numero_dia: dias.length + 1,
        titulo: '',
        descripcion: '',
        orden: dias.length + 1,
      },
    ]);
  };

  const eliminarDia = (index) => {
    const nuevosDias = dias
      .filter((_, i) => i !== index)
      .map((d, i) => ({
        ...d,
        numero_dia: i + 1,
        orden: i + 1,
      }));
    actualizar(nuevosDias);
  };

  const cambiarCampo = (index, campo, valor) => {
    const nuevosDias = dias.map((d, i) =>
      i === index ? { ...d, [campo]: valor } : d
    );
    actualizar(nuevosDias);
  };

  const moverArriba = (index) => {
    if (index === 0) return;
    const nuevosDias = [...dias];
    [nuevosDias[index - 1], nuevosDias[index]] = [nuevosDias[index], nuevosDias[index - 1]];
    actualizar(
      nuevosDias.map((d, i) => ({ ...d, numero_dia: i + 1, orden: i + 1 }))
    );
  };

  const moverAbajo = (index) => {
    if (index >= dias.length - 1) return;
    const nuevosDias = [...dias];
    [nuevosDias[index], nuevosDias[index + 1]] = [nuevosDias[index + 1], nuevosDias[index]];
    actualizar(
      nuevosDias.map((d, i) => ({ ...d, numero_dia: i + 1, orden: i + 1 }))
    );
  };

  return (
    <div className={styles.contenedor}>
      <div className={styles.cabecera}>
        <h3 className={styles.seccionTitulo}>
          <FiMapPin size={18} />
          Itinerario
        </h3>
        <button
          type="button"
          className={styles.botonAgregar}
          onClick={agregarDia}
        >
          <FiPlus size={15} />
          Agregar dia
        </button>
      </div>

      {dias.length === 0 && (
        <p className={styles.vacio}>
          No hay dias en el itinerario. Haz clic en &quot;Agregar dia&quot; para comenzar.
        </p>
      )}

      <div className={styles.lista}>
        {dias.map((dia, index) => (
          <div key={index} className={styles.diaCard}>
            <div className={styles.diaHeader}>
              <span className={styles.diaNumero}>Dia {dia.numero_dia}</span>
              <div className={styles.diaAcciones}>
                <button
                  type="button"
                  className={styles.botonMover}
                  onClick={() => moverArriba(index)}
                  disabled={index === 0}
                  title="Mover arriba"
                >
                  <FiChevronUp size={16} />
                </button>
                <button
                  type="button"
                  className={styles.botonMover}
                  onClick={() => moverAbajo(index)}
                  disabled={index >= dias.length - 1}
                  title="Mover abajo"
                >
                  <FiChevronDown size={16} />
                </button>
                <button
                  type="button"
                  className={styles.botonEliminar}
                  onClick={() => eliminarDia(index)}
                  title="Eliminar dia"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>

            <div className={styles.diaCampos}>
              <div className={styles.campo}>
                <label className={styles.label}>Titulo del dia</label>
                <input
                  type="text"
                  className={styles.input}
                  value={dia.titulo || ''}
                  onChange={(e) => cambiarCampo(index, 'titulo', e.target.value)}
                  placeholder="Ej: Llegada a Cancun"
                />
              </div>
              <div className={styles.campo}>
                <label className={styles.label}>Descripcion</label>
                <textarea
                  className={styles.textarea}
                  value={dia.descripcion || ''}
                  onChange={(e) => cambiarCampo(index, 'descripcion', e.target.value)}
                  placeholder="Describe las actividades del dia..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
