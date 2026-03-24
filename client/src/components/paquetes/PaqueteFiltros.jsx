import { useState, useEffect, useRef, useMemo } from 'react';
import { FaChevronDown, FaChevronUp, FaTimes, FaFilter, FaSearch } from 'react-icons/fa';
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
/* Buscador de destinos con autocompletado                              */
/* ------------------------------------------------------------------ */

function normalizar(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function DestinoBuscador({ destinos, selected, onToggle }) {
  const [query, setQuery] = useState('');
  const [abierto, setAbierto] = useState(false);
  const wrapRef = useRef(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sugerencias = useMemo(() => {
    const q = normalizar(query.trim());
    if (!q) return [];
    return destinos
      .filter((d) => {
        const nombre = normalizar(d.nombre);
        const pais = normalizar(d.pais);
        return (nombre.includes(q) || pais.includes(q)) && !selected.includes(d.slug);
      })
      .slice(0, 8);
  }, [query, destinos, selected]);

  const seleccionados = destinos.filter((d) => selected.includes(d.slug));

  return (
    <div ref={wrapRef} className={styles.buscadorWrap}>
      {/* Chips de destinos seleccionados */}
      {seleccionados.length > 0 && (
        <div className={styles.destinoChips}>
          {seleccionados.map((d) => (
            <span key={d.slug} className={styles.destinoChip}>
              <span>{d.nombre}</span>
              {d.pais && <span className={styles.destinoChipPais}>, {d.pais}</span>}
              <button
                type="button"
                className={styles.destinoChipX}
                onClick={() => onToggle(d.slug)}
                aria-label={`Quitar ${d.nombre}`}
              >
                <FaTimes size={9} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input de búsqueda */}
      <div className={styles.buscadorInputWrap}>
        <FaSearch size={12} className={styles.buscadorIcono} />
        <input
          type="text"
          className={styles.buscadorInput}
          placeholder="Buscar ciudad o país..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setAbierto(true); }}
          onFocus={() => setAbierto(true)}
        />
        {query && (
          <button
            type="button"
            className={styles.buscadorLimpiar}
            onClick={() => { setQuery(''); setAbierto(false); }}
            aria-label="Limpiar búsqueda"
          >
            <FaTimes size={10} />
          </button>
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {abierto && sugerencias.length > 0 && (
        <ul className={styles.buscadorDropdown} role="listbox">
          {sugerencias.map((d) => (
            <li key={d.slug} role="option">
              <button
                type="button"
                className={styles.buscadorOpcion}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onToggle(d.slug);
                  setQuery('');
                  setAbierto(false);
                }}
              >
                <span className={styles.buscadorOpcionNombre}>{d.nombre}</span>
                {d.pais && <span className={styles.buscadorOpcionPais}>{d.pais}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {abierto && query.trim() && sugerencias.length === 0 && (
        <div className={styles.buscadorSinResultados}>Sin resultados</div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                  */
/* ------------------------------------------------------------------ */

export default function PaqueteFiltros({ filtros, setFiltro, toggleFiltroMulti, resetFiltros }) {
  const [destinos, setDestinos] = useState([]);
  const [etiquetas, setEtiquetas] = useState({ Temporada: [], Transporte: [], Experiencia: [], Viaje: [] });
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
        const grupos = { Temporada: [], Transporte: [], Experiencia: [], Viaje: [] };
        categoriasData.forEach((cat) => {
          if (cat.nombre === 'Temporada') grupos.Temporada = cat.etiquetas || [];
          else if (cat.nombre === 'Tipo de transporte') grupos.Transporte = cat.etiquetas || [];
          else if (cat.nombre === 'Tipo de experiencia') grupos.Experiencia = cat.etiquetas || [];
          else if (cat.nombre === 'Tipo de viaje') grupos.Viaje = cat.etiquetas || [];
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
              <DestinoBuscador
                destinos={destinos}
                selected={selectedDestinos}
                onToggle={(slug) => toggleFiltroMulti('destino', slug)}
              />
            </SeccionFiltro>
          )}

          {/* ---- Precio ---- */}
          <SeccionFiltro titulo="Precio (USD)">
            <div onMouseUp={commitPrecio} onTouchEnd={commitPrecio}>
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
            </div>
          </SeccionFiltro>

          {/* ---- Duración ---- */}
          <SeccionFiltro titulo="Duración (días)">
            <div onMouseUp={commitDuracion} onTouchEnd={commitDuracion}>
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
            </div>
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

          {/* ---- Tipo de viaje ---- */}
          {etiquetas.Viaje.length > 0 && (
            <SeccionFiltro titulo="Tipo de viaje" defaultOpen={false}>
              <div className={styles.checkboxList}>
                {etiquetas.Viaje.map((e) => (
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
