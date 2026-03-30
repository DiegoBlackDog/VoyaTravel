import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaMapMarkerAlt,
  FaTag,
  FaExclamationCircle,
} from 'react-icons/fa';
import { obtenerPorSlug } from '../../services/paqueteService';
import PaqueteGaleria from '../../components/paquetes/PaqueteGaleria';
import PaqueteItinerario from '../../components/paquetes/PaqueteItinerario';
import FormularioConsulta from '../../components/paquetes/FormularioConsulta';
import styles from './PaqueteDetallePage.module.css';

/* ------------------------------------------------------------------ */
/* Alojamientos table                                                    */
/* ------------------------------------------------------------------ */

const PRECIO_COLS = [
  { key: 'precio_single',    label: 'Single' },
  { key: 'precio_doble',     label: 'Doble' },
  { key: 'precio_triple',    label: 'Triple' },
  { key: 'precio_cuadruple', label: 'Cuádruple' },
  { key: 'precio_menor',     label: 'Menor' },
  { key: 'precio_infante',   label: 'Infante' },
];

function AlojamientosTabla({ alojamientos }) {
  const colsVisibles = PRECIO_COLS.filter((col) =>
    alojamientos.some((a) => a[col.key] != null && Number(a[col.key]) > 0)
  );

  return (
    <div className={styles.alojTablaWrap}>
      <table className={styles.alojTabla}>
        <thead>
          <tr>
            <th>Hotel</th>
            <th>Régimen</th>
            {colsVisibles.map((c) => <th key={c.key}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {alojamientos.map((a, i) => (
            <tr key={i}>
              <td className={styles.alojHotelCell}>
                {a.hotel?.web_url
                  ? <a href={a.hotel.web_url} target="_blank" rel="noopener noreferrer" className={styles.alojHotelLink}>{a.hotel.nombre}</a>
                  : (a.hotel?.nombre || '—')}
              </td>
              <td>{a.regimen || '—'}</td>
              {colsVisibles.map((c) => (
                <td key={c.key} className={styles.alojPrecioCell}>
                  {a[c.key] != null && Number(a[c.key]) > 0
                    ? `USD ${Number(a[c.key]).toLocaleString('es-UY')}`
                    : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                              */
/* ------------------------------------------------------------------ */

function Skeleton() {
  return (
    <div className={styles.skeletonWrapper}>
      <div className={styles.skeletonHero} />
      <div className={styles.skeletonContenido}>
        <div className={styles.skeletonMain}>
          <div className={styles.skeletonLinea} style={{ width: '60%', height: '32px' }} />
          <div className={styles.skeletonLinea} style={{ width: '90%', height: '16px', marginTop: '12px' }} />
          <div className={styles.skeletonLinea} style={{ width: '80%', height: '16px', marginTop: '8px' }} />
          <div className={styles.skeletonLinea} style={{ width: '85%', height: '16px', marginTop: '8px' }} />
        </div>
        <div className={styles.skeletonSidebar}>
          <div className={styles.skeletonLinea} style={{ width: '100%', height: '200px', borderRadius: '14px' }} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                  */
/* ------------------------------------------------------------------ */

export default function PaqueteDetallePage() {
  const { slug } = useParams();
  const [paquete, setPaquete] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [tabActiva, setTabActiva] = useState('incluye');

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    obtenerPorSlug(slug)
      .then((data) => {
        if (!cancelado) setPaquete(data);
      })
      .catch(() => {
        if (!cancelado) setError('No pudimos cargar el paquete. Por favor intentá de nuevo.');
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => { cancelado = true; };
  }, [slug]);

  if (cargando) return <Skeleton />;

  if (error || !paquete) {
    return (
      <div className={styles.errorPage}>
        <FaExclamationCircle size={48} className={styles.errorIcono} />
        <h2 className={styles.errorTitulo}>Paquete no encontrado</h2>
        <p className={styles.errorTexto}>{error || 'El paquete que buscás no existe o fue removido.'}</p>
        <Link to="/paquetes" className={styles.errorBtn}>
          Ver todos los paquetes
        </Link>
      </div>
    );
  }

  const {
    titulo,
    resumen,
    descripcion,
    precio_adulto,
    precio_desde,
    precio_nino,
    precio_infante,
    duracion_dias,
    duracion_noches,
    etiquetas = [],
    destinos = [],
    imagenes = [],
    itinerario: itinerarios = [],
    incluye = [],
    no_incluye = [],
    condiciones,
    alojamientos = [],
  } = paquete;

  const renderTextoItem = (item) => {
    if (typeof item === 'string') return item;
    const { tipo, detalle } = item;

    if (tipo === 'Alojamiento') {
      const noches = detalle ? Number(detalle) : duracion_noches;
      if (destinos.length > 1 && detalle) {
        // multi-destino: each alojamiento item should have destino in detalle or use first destino
        const dest = destinos[0]?.nombre || '';
        return noches && dest
          ? `${noches} noches de alojamiento en ${dest} con régimen según hotel`
          : noches ? `${noches} noches de alojamiento con régimen según hotel` : 'Alojamiento';
      }
      return noches
        ? `${noches} noches de alojamiento con régimen según hotel`
        : 'Alojamiento';
    }

    if (tipo === 'Traslados') return detalle || tipo;
    if (tipo === 'Personalizado') return detalle || 'Personalizado';
    return detalle ? `${tipo} — ${detalle}` : tipo;
  };

  const precioMostrar = precio_desde ?? precio_adulto;

  // Parse incluye/no_incluye if they come as JSON string
  const incluyeArr = Array.isArray(incluye)
    ? incluye
    : (() => { try { return JSON.parse(incluye); } catch { return []; } })();
  const noIncluyeArr = Array.isArray(no_incluye)
    ? no_incluye
    : (() => { try { return JSON.parse(no_incluye); } catch { return []; } })();

  const destinoPrincipal = destinos[0];

  return (
    <div className={styles.pagina}>
      <Helmet>
        <title>{titulo} | Voyâ</title>
        <meta name="description" content={resumen || `Conocé todos los detalles del paquete ${titulo}. Consultá precios, itinerario y más.`} />
        <meta property="og:title" content={`${titulo} | Voyâ`} />
        <meta property="og:description" content={resumen || `Conocé todos los detalles del paquete ${titulo}.`} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ============================================================ */}
      {/* BREADCRUMB                                                     */}
      {/* ============================================================ */}
      <nav className={styles.breadcrumb} aria-label="Navegación">
        <div className={styles.breadcrumbInner}>
          <Link to="/" className={styles.breadcrumbLink}>Inicio</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link to="/paquetes" className={styles.breadcrumbLink}>Paquetes</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbActual}>{titulo}</span>
        </div>
      </nav>

      {/* ============================================================ */}
      {/* HEADER DEL PAQUETE                                            */}
      {/* ============================================================ */}
      <header
        className={styles.header}
        style={
          destinoPrincipal?.imagen
            ? {
                backgroundImage: `url(${destinoPrincipal.imagen})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }
            : undefined
        }
      >
        {destinoPrincipal?.imagen && <div className={styles.headerImgOverlay} />}
        <div className={styles.headerInner}>
          <div className={styles.metaFila}>
            {destinoPrincipal && (
              <span className={styles.metaDestino}>
                <FaMapMarkerAlt size={13} />
                {destinoPrincipal.nombre}{destinoPrincipal.pais ? `, ${destinoPrincipal.pais}` : ''}
              </span>
            )}
            <span className={styles.metaDuracion}>
              <FaClock size={13} />
              {duracion_dias} {duracion_dias === 1 ? 'día' : 'días'}{duracion_noches ? ` / ${duracion_noches} ${duracion_noches === 1 ? 'noche' : 'noches'}` : ''}
            </span>
          </div>

          <h1 className={styles.titulo}>{titulo}</h1>

          {resumen && <p className={styles.resumen}>{resumen}</p>}

          {/* Etiquetas */}
          {etiquetas.length > 0 && (
            <div className={styles.etiquetas}>
              {etiquetas.map((etq) => (
                <span key={etq.id} className={styles.etiqueta}>
                  <FaTag size={10} />
                  {etq.nombre}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ============================================================ */}
      {/* CONTENIDO PRINCIPAL                                           */}
      {/* ============================================================ */}
      <div className={styles.contenedor}>
        <div className={styles.layout}>
          {/* ---- Columna principal ---- */}
          <main className={styles.main}>
            {/* Galería */}
            {imagenes.length > 0 && (
              <section className={styles.seccion}>
                <PaqueteGaleria imagenes={imagenes} titulo={titulo} />
              </section>
            )}

            {/* Descripción */}
            {descripcion && (
              <section className={styles.seccion}>
                <h2 className={styles.seccionTitulo}>Descripción</h2>
                <p className={styles.descripcion}>{descripcion}</p>
              </section>
            )}

            {/* Tabs: Qué incluye / Itinerario / Condiciones */}
            <div className={styles.tabs}>
              <div className={styles.tabsNav} role="tablist">
                <button
                  role="tab"
                  aria-selected={tabActiva === 'incluye'}
                  className={`${styles.tabBtn} ${tabActiva === 'incluye' ? styles.tabBtnActivo : ''}`}
                  onClick={() => setTabActiva('incluye')}
                >
                  ¿Qué incluye?
                </button>
                {alojamientos.length > 0 && (
                  <button
                    role="tab"
                    aria-selected={tabActiva === 'alojamientos'}
                    className={`${styles.tabBtn} ${tabActiva === 'alojamientos' ? styles.tabBtnActivo : ''}`}
                    onClick={() => setTabActiva('alojamientos')}
                  >
                    Alojamientos
                  </button>
                )}
                {itinerarios.length > 0 && (
                  <button
                    role="tab"
                    aria-selected={tabActiva === 'itinerario'}
                    className={`${styles.tabBtn} ${tabActiva === 'itinerario' ? styles.tabBtnActivo : ''}`}
                    onClick={() => setTabActiva('itinerario')}
                  >
                    Itinerario
                  </button>
                )}
                {condiciones && (
                  <button
                    role="tab"
                    aria-selected={tabActiva === 'condiciones'}
                    className={`${styles.tabBtn} ${tabActiva === 'condiciones' ? styles.tabBtnActivo : ''}`}
                    onClick={() => setTabActiva('condiciones')}
                  >
                    Condiciones
                  </button>
                )}
              </div>

              <div className={styles.tabsContenido}>
                {/* Panel: Qué incluye */}
                <div className={tabActiva === 'incluye' ? styles.tabPanelActivo : styles.tabPanel}>
                  {incluyeArr.length === 0 && noIncluyeArr.length === 0 ? (
                    <p className={styles.descripcion}>No se especificaron detalles de inclusión.</p>
                  ) : (
                    <div className={styles.incluyeGrid}>
                      {incluyeArr.length > 0 && (
                        <div className={styles.incluyeColumna}>
                          <h3 className={styles.incluyeSubtitulo}>Incluye</h3>
                          <ul className={styles.incluyeLista}>
                            {incluyeArr.map((item, i) => (
                              <li key={i} className={styles.incluyeItem}>
                                <FaCheckCircle size={15} className={styles.iconoIncluye} />
                                <span>{renderTextoItem(item)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {noIncluyeArr.length > 0 && (
                        <div className={styles.incluyeColumna}>
                          <h3 className={styles.incluyeSubtitulo}>No incluye</h3>
                          <ul className={styles.incluyeLista}>
                            {noIncluyeArr.map((item, i) => (
                              <li key={i} className={styles.incluyeItem}>
                                <FaTimesCircle size={15} className={styles.iconoNoIncluye} />
                                <span>{renderTextoItem(item)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Panel: Itinerario */}
                <div className={tabActiva === 'itinerario' ? styles.tabPanelActivo : styles.tabPanel}>
                  <PaqueteItinerario itinerarios={itinerarios} />
                </div>

                {/* Panel: Condiciones */}
                <div className={tabActiva === 'condiciones' ? styles.tabPanelActivo : styles.tabPanel}>
                  {condiciones && <p className={styles.condiciones}>{condiciones}</p>}
                </div>

                {/* Panel: Alojamientos */}
                {alojamientos.length > 0 && (
                  <div className={tabActiva === 'alojamientos' ? styles.tabPanelActivo : styles.tabPanel}>
                    <AlojamientosTabla alojamientos={alojamientos} />
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* ---- Sidebar ---- */}
          <aside className={styles.sidebar}>
            {/* Bloque de precio */}
            <div className={styles.precioCard}>
              <p className={styles.precioDesde}>Precio desde</p>
              <p className={styles.precioMonto}>
                USD {Number(precioMostrar).toLocaleString('es-UY')}
              </p>
              <p className={styles.precioPorPersona}>por persona</p>

              {alojamientos.length === 0 && (precio_nino != null && Number(precio_nino) > 0 || precio_infante != null && Number(precio_infante) > 0) && (
                <div className={styles.precioDetalle}>
                  {precio_nino != null && Number(precio_nino) > 0 && (
                    <div className={styles.precioFila}>
                      <span className={styles.precioLabel}>Niño</span>
                      <span className={styles.precioValor}>
                        USD {Number(precio_nino).toLocaleString('es-UY')}
                      </span>
                    </div>
                  )}
                  {precio_infante != null && Number(precio_infante) > 0 && (
                    <div className={styles.precioFila}>
                      <span className={styles.precioLabel}>Infante</span>
                      <span className={styles.precioValor}>
                        USD {Number(precio_infante).toLocaleString('es-UY')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.precioDivisor} />

              <div className={styles.precioDuracion}>
                <FaClock size={13} />
                <span>{duracion_dias} {duracion_dias === 1 ? 'día' : 'días'}{duracion_noches ? ` / ${duracion_noches} ${duracion_noches === 1 ? 'noche' : 'noches'}` : ''}</span>
              </div>
            </div>

            {/* Formulario de consulta */}
            <div className={styles.consultaCard}>
              <FormularioConsulta paquete={paquete} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
