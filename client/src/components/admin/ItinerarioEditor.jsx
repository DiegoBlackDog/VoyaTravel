import { useState, useRef } from 'react';
import { FiPlus, FiTrash2, FiChevronUp, FiChevronDown, FiMapPin, FiImage, FiX, FiChevronRight } from 'react-icons/fi';
import api from '../../services/api';
import styles from './ItinerarioEditor.module.css';

const API_BASE = import.meta.env.DEV ? 'http://localhost:4000' : '';

export default function ItinerarioEditor({ value = [], onChange, paqueteId = null }) {
  const dias = Array.isArray(value) ? value : [];
  const fileRefs = useRef({});
  // Set of indices that are expanded; new days start expanded, old ones collapse on new add
  const [expandidos, setExpandidos] = useState(new Set(dias.map((_, i) => i)));

  const actualizar = (nuevosDias) => onChange?.(nuevosDias);

  const toggleExpandido = (index) => {
    setExpandidos((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const agregarDia = () => {
    const nuevoIndex = dias.length;
    actualizar([
      ...dias,
      { numero_dia: nuevoIndex + 1, titulo: '', descripcion: '', imagen: null, orden: nuevoIndex + 1 },
    ]);
    // Collapse all previous, expand only the new one
    setExpandidos(new Set([nuevoIndex]));
  };

  const eliminarDia = (index) => {
    actualizar(
      dias.filter((_, i) => i !== index)
           .map((d, i) => ({ ...d, numero_dia: i + 1, orden: i + 1 }))
    );
    setExpandidos((prev) => {
      const next = new Set();
      prev.forEach((i) => { if (i < index) next.add(i); else if (i > index) next.add(i - 1); });
      return next;
    });
  };

  const cambiarCampo = (index, campo, valor) => {
    actualizar(dias.map((d, i) => (i === index ? { ...d, [campo]: valor } : d)));
  };

  const moverArriba = (index) => {
    if (index === 0) return;
    const arr = [...dias];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    actualizar(arr.map((d, i) => ({ ...d, numero_dia: i + 1, orden: i + 1 })));
    setExpandidos((prev) => {
      const next = new Set();
      prev.forEach((i) => {
        if (i === index) next.add(i - 1);
        else if (i === index - 1) next.add(i + 1);
        else next.add(i);
      });
      return next;
    });
  };

  const moverAbajo = (index) => {
    if (index >= dias.length - 1) return;
    const arr = [...dias];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    actualizar(arr.map((d, i) => ({ ...d, numero_dia: i + 1, orden: i + 1 })));
    setExpandidos((prev) => {
      const next = new Set();
      prev.forEach((i) => {
        if (i === index) next.add(i + 1);
        else if (i === index + 1) next.add(i - 1);
        else next.add(i);
      });
      return next;
    });
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
        {dias.map((dia, index) => {
          const estaExpandido = expandidos.has(index);
          return (
            <div key={index} className={`${styles.diaCard} ${estaExpandido ? styles.diaCardExpandida : ''}`}>
              <div className={styles.diaHeader} onClick={() => toggleExpandido(index)} style={{ cursor: 'pointer' }}>
                <div className={styles.diaHeaderIzq}>
                  <FiChevronRight
                    size={15}
                    className={`${styles.chevron} ${estaExpandido ? styles.chevronAbierto : ''}`}
                  />
                  <span className={styles.diaNumero}>Día {dia.numero_dia}</span>
                  {!estaExpandido && dia.titulo && (
                    <span className={styles.diaTituloCompacto}>{dia.titulo}</span>
                  )}
                </div>
                <div className={styles.diaAcciones} onClick={(e) => e.stopPropagation()}>
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

              {estaExpandido && (
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
