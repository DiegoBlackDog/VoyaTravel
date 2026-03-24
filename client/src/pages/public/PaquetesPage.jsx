import { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaThLarge,
  FaList,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationCircle,
  FaBoxOpen,
} from 'react-icons/fa';
import PaqueteCard from '../../components/paquetes/PaqueteCard';
import PaqueteFiltros from '../../components/paquetes/PaqueteFiltros';
import { useFiltros } from '../../hooks/useFiltros';
import { usePaquetes } from '../../hooks/usePaquetes';
import styles from './PaquetesPage.module.css';

/* ------------------------------------------------------------------ */
/* Opciones de ordenamiento                                             */
/* ------------------------------------------------------------------ */

const OPCIONES_ORDEN = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'precio_asc', label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
  { value: 'duracion', label: 'Duración' },
];

/* ------------------------------------------------------------------ */
/* Paginación                                                           */
/* ------------------------------------------------------------------ */

function Paginacion({ pagina, totalPaginas, onCambiar }) {
  if (totalPaginas <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPaginas; i++) {
    // Mostrar: primera, última, la actual y sus vecinas, y elipsis
    if (
      i === 1 ||
      i === totalPaginas ||
      (i >= pagina - 1 && i <= pagina + 1)
    ) {
      pages.push(i);
    } else if (
      (i === pagina - 2 && pagina > 3) ||
      (i === pagina + 2 && pagina < totalPaginas - 2)
    ) {
      pages.push('...');
    }
  }

  // Deduplicar elipsis consecutivos
  const dedup = pages.filter((v, idx, arr) => v !== '...' || arr[idx - 1] !== '...');

  return (
    <nav className={styles.paginacion} aria-label="Paginación">
      <button
        className={styles.paginaBtn}
        onClick={() => onCambiar(pagina - 1)}
        disabled={pagina === 1}
        aria-label="Página anterior"
      >
        <FaChevronLeft size={12} />
      </button>

      {dedup.map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} className={styles.paginaElipsis}>
            …
          </span>
        ) : (
          <button
            key={p}
            className={`${styles.paginaBtn} ${p === pagina ? styles.paginaActiva : ''}`}
            onClick={() => onCambiar(p)}
            aria-current={p === pagina ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        className={styles.paginaBtn}
        onClick={() => onCambiar(pagina + 1)}
        disabled={pagina === totalPaginas}
        aria-label="Página siguiente"
      >
        <FaChevronRight size={12} />
      </button>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Skeletons de carga                                                   */
/* ------------------------------------------------------------------ */

function Skeleton() {
  return <div className={styles.skeleton} />;
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                  */
/* ------------------------------------------------------------------ */

export default function PaquetesPage() {
  const { filtros, setFiltro, toggleFiltroMulti, resetFiltros } = useFiltros();
  const { paquetes, total, cargando, pagina, totalPaginas, error } = usePaquetes(filtros);

  const vistaLista = filtros.vista === 'lista';
  const ordenActual = filtros.ordenar || 'recientes';

  const handlePagina = useCallback(
    (p) => {
      setFiltro('page', p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setFiltro]
  );

  const handleVista = useCallback(
    (v) => setFiltro('vista', v),
    [setFiltro]
  );

  const handleOrden = useCallback(
    (e) => setFiltro('ordenar', e.target.value),
    [setFiltro]
  );

  return (
    <div className={styles.pagina}>
      <Helmet>
        <title>Paquetes de Viaje | Voyâ</title>
        <meta name="description" content="Explorá todos nuestros paquetes de viaje. Filtrá por destino, precio, temporada y encontrá el viaje que siempre soñaste." />
        <meta property="og:title" content="Paquetes de Viaje | Voyâ" />
        <meta property="og:description" content="Explorá todos nuestros paquetes de viaje. Filtrá por destino, precio, temporada y encontrá el viaje que siempre soñaste." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ============================================================ */}
      {/* HEADER                                                         */}
      {/* ============================================================ */}
      <section className={styles.header}>
        <div className={styles.headerContenido}>
          <p className={styles.eyebrow}>Catálogo completo</p>
          <h1 className={styles.titulo}>Nuestros Paquetes</h1>
          <p className={styles.subtitulo}>
            Explorá todos nuestros destinos y encontrá el viaje que siempre soñaste.
            Filtrá por destino, precio, temporada y más.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* LAYOUT: sidebar + contenido                                    */}
      {/* ============================================================ */}
      <div className={styles.contenedor}>
        <div className={styles.layout}>
          {/* ---- Sidebar filtros ---- */}
          <PaqueteFiltros
            filtros={filtros}
            setFiltro={setFiltro}
            toggleFiltroMulti={toggleFiltroMulti}
            resetFiltros={resetFiltros}
          />

          {/* ---- Área principal ---- */}
          <main className={styles.main}>
            {/* ---- Barra superior ---- */}
            <div className={styles.topBar}>
              <p className={styles.contador}>
                {cargando ? (
                  <span className={styles.contadorCargando} />
                ) : (
                  <>
                    <strong>{total.toLocaleString('es-UY')}</strong>
                    {total === 1 ? ' paquete encontrado' : ' paquetes encontrados'}
                  </>
                )}
              </p>

              <div className={styles.topBarControles}>
                {/* Ordenar */}
                <label className={styles.ordenLabel} htmlFor="ordenar">
                  Ordenar:
                </label>
                <select
                  id="ordenar"
                  className={styles.ordenSelect}
                  value={ordenActual}
                  onChange={handleOrden}
                >
                  {OPCIONES_ORDEN.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                {/* Vista grid / lista */}
                <div className={styles.vistaToggle} role="group" aria-label="Cambiar vista">
                  <button
                    type="button"
                    className={`${styles.vistaBtn} ${!vistaLista ? styles.vistaBtnActivo : ''}`}
                    onClick={() => handleVista('grid')}
                    aria-pressed={!vistaLista}
                    title="Vista en cuadrícula"
                  >
                    <FaThLarge size={14} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.vistaBtn} ${vistaLista ? styles.vistaBtnActivo : ''}`}
                    onClick={() => handleVista('lista')}
                    aria-pressed={vistaLista}
                    title="Vista en lista"
                  >
                    <FaList size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* ---- Error ---- */}
            {error && (
              <div className={styles.errorBox} role="alert">
                <FaExclamationCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* ---- Grid / Lista de paquetes ---- */}
            {cargando ? (
              <div className={`${styles.grid} ${vistaLista ? styles.gridLista : ''}`}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} />
                ))}
              </div>
            ) : paquetes.length === 0 && !error ? (
              <div className={styles.sinResultados}>
                <FaBoxOpen size={48} className={styles.sinResultadosIcono} />
                <p className={styles.sinResultadosTitulo}>Sin resultados</p>
                <p className={styles.sinResultadosTexto}>
                  No encontramos paquetes con los filtros seleccionados.
                </p>
                <button
                  type="button"
                  className={styles.sinResultadosBtn}
                  onClick={resetFiltros}
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className={`${styles.grid} ${vistaLista ? styles.gridLista : ''}`}>
                {paquetes.map((p) => (
                  <div key={p.id} className={styles.cardWrapper}>
                    <PaqueteCard paquete={p} />
                  </div>
                ))}
              </div>
            )}

            {/* ---- Paginación ---- */}
            {!cargando && paquetes.length > 0 && (
              <Paginacion
                pagina={pagina}
                totalPaginas={totalPaginas}
                onCambiar={handlePagina}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
