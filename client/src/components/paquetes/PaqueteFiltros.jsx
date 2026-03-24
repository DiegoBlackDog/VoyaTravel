import { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaTimes, FaFilter } from 'react-icons/fa';
import api from '../../services/api';
import styles from './PaqueteFiltros.module.css';

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const PRECIO_MIN = 0;
const PRECIO_MAX = 10000;
const DURACION_MIN = 1;
const DURACION_MAX = 30;

function getMultiValues(filtros, key) {
  const v = filtros[key];
  return v ? v.split(',') : [];
}

/* ------------------------------------------------------------------ */
/* Sub-componentes                                                       */
/* ------------------------------------------------------------------ */

function SeccionFiltro({ titulo, children, defaultOpen = true }) {
  const [abierta, setAbierta] = useState(defaultOpen);
  return (
    <div className={styles.seccion}>
      <button
        type="button"
        className={styles.seccionHeader}
        onClick={() => setAbierta((a) => !a)}
        aria-expanded={abierta}
      >
        <span className={styles.seccionTitulo}>{titulo}</span>
        {abierta ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
      </button>
      {abierta && <div className={styles.seccionCuerpo}>{children}</div>}
    </div>
  );
}

function CheckboxItem({ label, value, checked, onChange }) {
  return (
    <label className={styles.checkboxItem}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(value)}
        className={styles.checkbox}
      />
      <span className={styles.checkboxLabel}>{label}</span>
    </label>
  );
}

function RangeSlider({ label, min, max, valueMin, valueMax, step = 1, formato, onChangeMin, onChangeMax }) {
  return (
    <div className={styles.rangeGroup}>
      <div className={styles.rangeValues}>
        <span>{formato(valueMin)}</span>
        <span>{formato(valueMax)}{valueMax >= max ? '+' : ''}</span>
      </div>
      <div className={styles.rangeTrack}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v < valueMax) onChangeMin(v);
          }}
          className={`${styles.rangeInput} ${styles.rangeInputMin}`}
          aria-label={`${label} mínimo`}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v > valueMin) onChangeMax(v);
          }}
          className={`${styles.rangeInput} ${styles.rangeInputMax}`}
          aria-label={`${label} máximo`}
        />
        {/* Track visual fill */}
        <div
          className={styles.rangeFill}
          style={{
            left: `${((valueMin - min) / (max - min)) * 100}%`,
            width: `${((valueMax - valueMin) / (max - min)) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                  */
/* ------------------------------------------------------------------ */

export default function PaqueteFiltros({ filtros, setFiltro, toggleFiltroMulti, resetFiltros }) {
  const [destinos, setDestinos] = useState([]);
  const [etiquetas, setEtiquetas] = useState({ Temporada: [], Transporte: [], Experiencia: [] });
  const [cargandoOpciones, setCargandoOpciones] = useState(true);

  // Estado local para sliders (para evitar llamadas en cada movimiento)
  const [precioMin, setPrecioMin] = useState(Number(filtros.precio_min) || PRECIO_MIN);
  const [precioMax, setPrecioMax] = useState(Number(filtros.precio_max) || PRECIO_MAX);
  const [duracionMin, setDuracionMin] = useState(Number(filtros.duracion_min) || DURACION_MIN);
  const [duracionMax, setDuracionMax] = useState(Number(filtros.duracion_max) || DURACION_MAX);

  // Sidebar visible en mobile
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  /* Sincronizar sliders cuando los filtros cambian externamente (e.g. reset) */
  useEffect(() => {
    setPrecioMin(Number(filtros.precio_min) || PRECIO_MIN);
    setPrecioMax(Number(filtros.precio_max) || PRECIO_MAX);
    setDuracionMin(Number(filtros.duracion_min) || DURACION_MIN);
    setDuracionMax(Number(filtros.duracion_max) || DURACION_MAX);
  }, [filtros.precio_min, filtros.precio_max, filtros.duracion_min, filtros.duracion_max]);

  /* Fetch destinos y etiquetas */
  useEffect(() => {
    Promise.all([
      api.get('/destinos').then(({ data }) => data.destinos || data.data || []),
      api.get('/etiquetas').then(({ data }) => data.categorias || data.data || []),
    ])
      .then(([destinosData, categoriasData]) => {
        setDestinos(destinosData);

        // El API retorna { categorias: [{ nombre, etiquetas: [...] }] }
        const grupos = { Temporada: [], Transporte: [], Experiencia: [] };
        categoriasData.forEach((cat) => {
          if (grupos[cat.nombre]) {
            grupos[cat.nombre] = cat.etiquetas || [];
          }
        });
        setEtiquetas(grupos);
      })
      .catch((err) => console.error('Error cargando opciones de filtros:', err))
      .finally(() => setCargandoOpciones(false));
  }, []);

  /* Commit slider values on mouseup/touchend */
  function commitPrecio() {
    if (precioMin === PRECIO_MIN && precioMax === PRECIO_MAX) {
      setFiltro('precio_min', '');
      setFiltro('precio_max', '');
    } else {
      setFiltro('precio_min', precioMin === PRECIO_MIN ? '' : precioMin);
      setFiltro('precio_max', precioMax === PRECIO_MAX ? '' : precioMax);
    }
  }

  function commitDuracion() {
    if (duracionMin === DURACION_MIN && duracionMax === DURACION_MAX) {
      setFiltro('duracion_min', '');
      setFiltro('duracion_max', '');
    } else {
      setFiltro('duracion_min', duracionMin === DURACION_MIN ? '' : duracionMin);
      setFiltro('duracion_max', duracionMax === DURACION_MAX ? '' : duracionMax);
    }
  }

  /* Conteo de filtros activos para badge en mobile */
  const filtrosActivos = Object.entries(filtros).filter(
    ([k, v]) => k !== 'page' && k !== 'ordenar' && v !== ''
  ).length;

  const selectedDestinos = getMultiValues(filtros, 'destino');
  const selectedEtiquetas = getMultiValues(filtros, 'etiqueta');

  const sidebar = (
    <aside className={`${styles.sidebar} ${sidebarAbierto ? styles.sidebarAbierto : ''}`}>
      {/* Header del sidebar */}
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarTitulo}>
          <FaFilter size={14} />
          <span>Filtros</span>
          {filtrosActivos > 0 && (
            <span className={styles.badge}>{filtrosActivos}</span>
          )}
        </div>
        {filtrosActivos > 0 && (
          <button
            type="button"
            className={styles.limpiarBtn}
            onClick={() => {
              resetFiltros();
              setPrecioMin(PRECIO_MIN);
              setPrecioMax(PRECIO_MAX);
              setDuracionMin(DURACION_MIN);
              setDuracionMax(DURACION_MAX);
            }}
          >
            Limpiar todo
          </button>
        )}
        <button
          type="button"
          className={styles.cerrarBtn}
          onClick={() => setSidebarAbierto(false)}
          aria-label="Cerrar filtros"
        >
          <FaTimes size={16} />
        </button>
      </div>

      {cargandoOpciones ? (
        <div className={styles.cargando}>
          <div className={styles.spinner} />
        </div>
      ) : (
        <div className={styles.filtros}>
          {/* ---- Destino ---- */}
          {destinos.length > 0 && (
            <SeccionFiltro titulo="Destino">
              <div className={styles.checkboxList}>
                {destinos.map((d) => (
                  <CheckboxItem
                    key={d.id}
                    label={d.nombre}
                    value={d.slug}
                    checked={selectedDestinos.includes(d.slug)}
                    onChange={(v) => toggleFiltroMulti('destino', v)}
                  />
                ))}
              </div>
            </SeccionFiltro>
          )}

          {/* ---- Precio ---- */}
          <SeccionFiltro titulo="Precio (USD)">
            <RangeSlider
              label="Precio"
              min={PRECIO_MIN}
              max={PRECIO_MAX}
              step={50}
              valueMin={precioMin}
              valueMax={precioMax}
              formato={(v) => `$${v.toLocaleString('es-UY')}`}
              onChangeMin={setPrecioMin}
              onChangeMax={setPrecioMax}
            />
            {/* Commit on pointer up */}
            <div
              onMouseUp={commitPrecio}
              onTouchEnd={commitPrecio}
              style={{ display: 'none' }}
            />
            <div
              className={styles.sliderCommitArea}
              onMouseUp={commitPrecio}
              onTouchEnd={commitPrecio}
            />
          </SeccionFiltro>

          {/* ---- Duración ---- */}
          <SeccionFiltro titulo="Duración (días)">
            <RangeSlider
              label="Duración"
              min={DURACION_MIN}
              max={DURACION_MAX}
              step={1}
              valueMin={duracionMin}
              valueMax={duracionMax}
              formato={(v) => `${v} d`}
              onChangeMin={setDuracionMin}
              onChangeMax={setDuracionMax}
            />
            <div
              className={styles.sliderCommitArea}
              onMouseUp={commitDuracion}
              onTouchEnd={commitDuracion}
            />
          </SeccionFiltro>

          {/* ---- Temporada ---- */}
          {etiquetas.Temporada.length > 0 && (
            <SeccionFiltro titulo="Temporada">
              <div className={styles.checkboxList}>
                {etiquetas.Temporada.map((e) => (
                  <CheckboxItem
                    key={e.id}
                    label={e.nombre}
                    value={e.slug}
                    checked={selectedEtiquetas.includes(e.slug)}
                    onChange={(v) => toggleFiltroMulti('etiqueta', v)}
                  />
                ))}
              </div>
            </SeccionFiltro>
          )}

          {/* ---- Transporte ---- */}
          {etiquetas.Transporte.length > 0 && (
            <SeccionFiltro titulo="Transporte" defaultOpen={false}>
              <div className={styles.checkboxList}>
                {etiquetas.Transporte.map((e) => (
                  <CheckboxItem
                    key={e.id}
                    label={e.nombre}
                    value={e.slug}
                    checked={selectedEtiquetas.includes(e.slug)}
                    onChange={(v) => toggleFiltroMulti('etiqueta', v)}
                  />
                ))}
              </div>
            </SeccionFiltro>
          )}

          {/* ---- Experiencia ---- */}
          {etiquetas.Experiencia.length > 0 && (
            <SeccionFiltro titulo="Experiencia" defaultOpen={false}>
              <div className={styles.checkboxList}>
                {etiquetas.Experiencia.map((e) => (
                  <CheckboxItem
                    key={e.id}
                    label={e.nombre}
                    value={e.slug}
                    checked={selectedEtiquetas.includes(e.slug)}
                    onChange={(v) => toggleFiltroMulti('etiqueta', v)}
                  />
                ))}
              </div>
            </SeccionFiltro>
          )}
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* Botón mobile para abrir filtros */}
      <div className={styles.mobileToggleWrapper}>
        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() => setSidebarAbierto(true)}
        >
          <FaFilter size={14} />
          Filtros
          {filtrosActivos > 0 && (
            <span className={styles.badge}>{filtrosActivos}</span>
          )}
        </button>
      </div>

      {/* Overlay mobile */}
      {sidebarAbierto && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarAbierto(false)}
          aria-hidden="true"
        />
      )}

      {sidebar}
    </>
  );
}
