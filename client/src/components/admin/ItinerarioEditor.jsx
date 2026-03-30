import { useRef } from 'react';
import { FiPlus, FiTrash2, FiChevronUp, FiChevronDown, FiMapPin, FiImage, FiX } from 'react-icons/fi';
import api from '../../services/api';
import styles from './ItinerarioEditor.module.css';

const API_BASE = import.meta.env.DEV ? 'http://localhost:4000' : '';

export default function ItinerarioEditor({ value = [], onChange, paqueteId = null }) {
  const dias = Array.isArray(value) ? value : [];
  const fileRefs = useRef({});

  const actualizar = (nuevosDias) => onChange?.(nuevosDias);

  const agregarDia = () => {
    actualizar([
      ...dias,
      { numero_dia: dias.length + 1, titulo: '', descripcion: '', imagen: null, orden: dias.length + 1 },
    ]);
  };

  const eliminarDia = (index) => {
    actualizar(
      dias.filter((_, i) => i !== index)
           .map((d, i) => ({ ...d, numero_dia: i + 1, orden: i + 1 }))
    );
  };

  const cambiarCampo = (index, campo, valor) => {
    actualizar(dias.map((d, i) => (i === index ? { ...d, [campo]: valor } : d)));
  };

  const moverArriba = (index) => {
    if (index === 0) return;
    const arr = [...dias];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    actualizar(arr.map((d, i) => ({ ...d, numero_dia: i + 1, orden: i + 1 })));
  };

  const moverAbajo = (index) => {
    if (index >= dias.length - 1) return;
    const arr = [...dias];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    actualizar(arr.map((d, i) => ({ ...d, numero_dia: i + 1, orden: i + 1 })));
  };

  const subirImagen = async (index, file) => {
    const fd = new FormData();
    fd.append('imagen', file);
    try {
      const { data } = await api.post('/paquetes/upload-itinerario-imagen', fd);
      cambiarCampo(index, 'imagen', data.url);
    } catch {
      // silent fail
    }
  };

  return (
    <div className={styles.contenedor}>
      <div className={styles.cabecera}>
        <h3 className={styles.seccionTitulo}>
          <FiMapPin size={18} />
          Itinerario
        </h3>
        <button type="button" className={styles.botonAgregar} onClick={agregarDia}>
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
                <button type="button" className={styles.botonMover} onClick={() => moverArriba(index)} disabled={index === 0} title="Mover arriba">
                  <FiChevronUp size={16} />
                </button>
                <button type="button" className={styles.botonMover} onClick={() => moverAbajo(index)} disabled={index >= dias.length - 1} title="Mover abajo">
                  <FiChevronDown size={16} />
                </button>
                <button type="button" className={styles.botonEliminar} onClick={() => eliminarDia(index)} title="Eliminar dia">
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

              {/* Imagen del dia */}
              <div className={styles.campo}>
                {dia.imagen ? (
                  <div className={styles.imgPreviewWrap}>
                    <img src={`${API_BASE}${dia.imagen}`} alt={`Dia ${dia.numero_dia}`} className={styles.imgPreview} />
                    <button type="button" className={styles.imgRemove} onClick={() => cambiarCampo(index, 'imagen', null)} title="Quitar imagen">
                      <FiX size={13} />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={(el) => { fileRefs.current[index] = el; }}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => { if (e.target.files[0]) subirImagen(index, e.target.files[0]); }}
                    />
                    <button
                      type="button"
                      className={styles.botonImagen}
                      onClick={() => fileRefs.current[index]?.click()}
                    >
                      <FiImage size={13} /> Agregar imagen del día
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
