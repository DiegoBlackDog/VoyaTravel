import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
    precio_nino,
    precio_infante,
    duracion_dias,
    etiquetas = [],
    destinos = [],
    imagenes = [],
    itinerarios = [],
    incluye = [],
    no_incluye = [],
    condiciones,
  } = paquete;

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
      <header className={styles.header}>
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
              {duracion_dias} {duracion_dias === 1 ? 'día' : 'días'}
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
                <div
                  className={styles.descripcion}
                  dangerouslySetInnerHTML={{ __html: descripcion }}
                />
              </section>
            )}

            {/* Incluye / No incluye */}
            {(incluyeArr.length > 0 || noIncluyeArr.length > 0) && (
              <section className={styles.seccion}>
                <h2 className={styles.seccionTitulo}>¿Qué incluye?</h2>
                <div className={styles.incluyeGrid}>
                  {incluyeArr.length > 0 && (
                    <div className={styles.incluyeColumna}>
                      <h3 className={styles.incluyeSubtitulo}>Incluye</h3>
                      <ul className={styles.incluyeLista}>
                        {incluyeArr.map((item, i) => (
                          <li key={i} className={styles.incluyeItem}>
                            <FaCheckCircle size={15} className={styles.iconoIncluye} />
                            <span>{item}</span>
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
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Itinerario */}
            {itinerarios.length > 0 && (
              <section className={styles.seccion}>
                <h2 className={styles.seccionTitulo}>Itinerario día a día</h2>
                <PaqueteItinerario itinerarios={itinerarios} />
              </section>
            )}

            {/* Condiciones */}
            {condiciones && (
              <section className={styles.seccion}>
                <h2 className={styles.seccionTitulo}>Condiciones</h2>
                <div
                  className={styles.condiciones}
                  dangerouslySetInnerHTML={{ __html: condiciones }}
                />
              </section>
            )}
          </main>

          {/* ---- Sidebar ---- */}
          <aside className={styles.sidebar}>
            {/* Bloque de precio */}
            <div className={styles.precioCard}>
              <p className={styles.precioDesde}>Precio desde</p>
              <p className={styles.precioMonto}>
                USD {Number(precio_adulto).toLocaleString('es-UY')}
              </p>
              <p className={styles.precioPorPersona}>por persona</p>

              <div className={styles.precioDetalle}>
                <div className={styles.precioFila}>
                  <span className={styles.precioLabel}>Adulto</span>
                  <span className={styles.precioValor}>
                    USD {Number(precio_adulto).toLocaleString('es-UY')}
                  </span>
                </div>
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

              <div className={styles.precioDivisor} />

              <div className={styles.precioDuracion}>
                <FaClock size={13} />
                <span>{duracion_dias} {duracion_dias === 1 ? 'día' : 'días'}</span>
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
