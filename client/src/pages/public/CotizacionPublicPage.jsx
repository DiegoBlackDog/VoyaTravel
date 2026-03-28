import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaCheckCircle, FaTimesCircle, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import api from '../../services/api';
import styles from './CotizacionPublicPage.module.css';

const PRECIO_COLS = [
  { key: 'precio_single',    label: 'Single' },
  { key: 'precio_doble',     label: 'Doble' },
  { key: 'precio_triple',    label: 'Triple' },
  { key: 'precio_cuadruple', label: 'Cuádruple' },
  { key: 'precio_menor',     label: 'Menor' },
  { key: 'precio_infante',   label: 'Infante' },
];

export default function CotizacionPublicPage() {
  const { token } = useParams();
  const [cot, setCot] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/cotizaciones/public/${token}`)
      .then(({ data }) => setCot(data.cotizacion))
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, [token]);

  if (cargando) {
    return (
      <div className={styles.centro}>
        <p>Cargando cotización...</p>
      </div>
    );
  }

  if (error || !cot) {
    return (
      <div className={styles.centro}>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Cotización no encontrada</p>
        <p>El link puede ser incorrecto o haber expirado.</p>
      </div>
    );
  }

  const incluyeArr = Array.isArray(cot.incluye) ? cot.incluye.filter(Boolean) : [];
  const noIncluyeArr = Array.isArray(cot.no_incluye) ? cot.no_incluye.filter(Boolean) : [];
  const alojamientos = cot.alojamientos || [];

  // Only show price columns that have data
  const colsVisibles = PRECIO_COLS.filter((col) =>
    alojamientos.some((a) => a[col.key] != null && Number(a[col.key]) > 0)
  );

  const fechaCreacion = new Date(cot.creado_en).toLocaleDateString('es-UY', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const destino = cot.destino;

  return (
    <div className={styles.pagina}>
      <Helmet>
        <title>Cotización para {cot.nombre_pasajero} | voyâ</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* ── Header ── */}
      <div className={styles.header}>
        {destino?.imagen && (
          <div
            className={styles.headerImg}
            style={{ backgroundImage: `url(${destino.imagen})` }}
          />
        )}
        <div className={styles.headerOverlay} />
        <div className={styles.headerInner}>
          <span className={styles.headerBrand}>voyâ</span>
          <p className={styles.headerNumero}>{fechaCreacion}</p>
          <h1 className={styles.headerTitulo}>Para {cot.nombre_pasajero}</h1>
          <div className={styles.headerMeta}>
            {destino && (
              <span className={styles.headerMetaItem}>
                <FaMapMarkerAlt size={13} />
                {destino.nombre}{destino.pais ? `, ${destino.pais}` : ''}
              </span>
            )}
            {cot.duracion_dias && (
              <span className={styles.headerMetaItem}>
                <FaClock size={13} />
                {cot.duracion_dias} {cot.duracion_dias === 1 ? 'día' : 'días'}
                {cot.duracion_noches ? ` / ${cot.duracion_noches} noches` : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>

        {/* Qué incluye / No incluye */}
        {(incluyeArr.length > 0 || noIncluyeArr.length > 0) && (
          <div className={styles.card}>
            <p className={styles.cardTitulo}>¿Qué incluye?</p>
            <div className={styles.incluyeGrid}>
              {incluyeArr.length > 0 && (
                <div>
                  <h3 className={styles.incluyeSubtitulo}>Incluye</h3>
                  <ul className={styles.incluyeLista}>
                    {incluyeArr.map((item, i) => (
                      <li key={i} className={styles.incluyeItem}>
                        <FaCheckCircle size={14} className={styles.iconoIncluye} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {noIncluyeArr.length > 0 && (
                <div>
                  <h3 className={styles.incluyeSubtitulo}>No incluye</h3>
                  <ul className={styles.incluyeLista}>
                    {noIncluyeArr.map((item, i) => (
                      <li key={i} className={styles.incluyeItem}>
                        <FaTimesCircle size={14} className={styles.iconoNoIncluye} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alojamientos */}
        {alojamientos.length > 0 && (
          <div className={styles.card}>
            <p className={styles.cardTitulo}>Alojamientos</p>
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
                      <td>
                        {a.hotel?.web_url ? (
                          <a
                            href={a.hotel.web_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.alojHotelLink}
                          >
                            {a.hotel?.nombre || '—'} <FiExternalLink size={11} />
                          </a>
                        ) : (
                          <span className={styles.alojHotelNombre}>{a.hotel?.nombre || '—'}</span>
                        )}
                      </td>
                      <td>{a.regimen || '—'}</td>
                      {colsVisibles.map((c) => (
                        <td key={c.key} className={styles.alojPrecio}>
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
          </div>
        )}

        {/* Condiciones */}
        {cot.condiciones && (
          <div className={styles.card}>
            <p className={styles.cardTitulo}>Condiciones</p>
            <p className={styles.condiciones}>{cot.condiciones}</p>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className={styles.footer}>
        <span className={styles.footerBrand}>voyâ</span>
        <p>Cotización generada el {fechaCreacion}</p>
      </div>
    </div>
  );
}
