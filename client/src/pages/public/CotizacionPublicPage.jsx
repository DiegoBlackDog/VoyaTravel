import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaPlane, FaBed, FaBus, FaShieldAlt, FaCamera, FaDollarSign,
  FaCheck, FaCheckCircle, FaMapMarkerAlt,
  FaCreditCard, FaUniversity, FaStore, FaMoneyBillWave,
  FaInstagram, FaFacebook, FaWhatsapp, FaPhone, FaEnvelope,
  FaLinkedin, FaGlobe, FaMobileAlt, FaUtensils,
} from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import api from '../../services/api';
import { parsePnr, formatSegment } from '../../utils/pnrParser';
import { getAirlineLogo } from '../../utils/airlineLogos';
import styles from './CotizacionPublicPage.module.css';

/* ── Constants ── */
const PRECIO_COLS = [
  { key: 'precio_single',    label: 'Single' },
  { key: 'precio_doble',     label: 'Doble' },
  { key: 'precio_triple',    label: 'Triple' },
  { key: 'precio_cuadruple', label: 'Cuádruple' },
  { key: 'precio_menor',     label: 'Menor' },
  { key: 'precio_infante',   label: 'Infante' },
];

const SERVICIOS_EXCLUSIVOS = [
  'Apoyo con formularios de migración.',
  'Asistencia integral antes, durante y post viaje.',
  'Atención personalizada y disponible 24/7.',
  'Trámites de check-in de vuelos.',
];

const MEDIOS_PAGO = [
  { Icon: FaCreditCard,    label: 'Tarjetas de crédito' },
  { Icon: FaUniversity,    label: 'Transferencia bancaria' },
  { Icon: FaStore,         label: 'Pago en el local' },
  { Icon: FaMoneyBillWave, label: 'Redes de cobranza' },
];

const TIPO_ICON_MAP = {
  'Billete aéreo según itinerario':       FaPlane,
  'Alojamiento':                          FaBed,
  'Traslados':                            FaBus,
  'Seguro de Viaje':                      FaShieldAlt,
  'Visitas y excursiones no indicadas':   FaCamera,
  'Tasas e impuestos aéreos incluidos':          FaDollarSign,
};

function getItemIcon(tipo) {
  return TIPO_ICON_MAP[tipo] || FaCheck;
}

function renderItemLabel(item, cot) {
  if (typeof item === 'string') return item;
  const { tipo, detalle, destino } = item;

  if (tipo === 'Alojamiento') {
    const noches = detalle ? Number(detalle) : cot?.duracion_noches;
    const dest =
      destino ||
      (cot?.destinos_extra?.length === 1 ? cot.destinos_extra[0].nombre : null) ||
      cot?.destino?.nombre;
    if (noches && dest) return `${noches} noches de alojamiento en ${dest} con régimen según hotel`;
    if (noches)         return `${noches} noches de alojamiento con régimen según hotel`;
    return 'Alojamiento';
  }

  if (tipo === 'Personalizado')  return detalle || 'Personalizado';
  if (tipo === 'Traslados')      return detalle || tipo;
  return detalle ? `${tipo} — ${detalle}` : tipo;
}

/* ── Component ── */
export default function CotizacionPublicPage() {
  const { token }      = useParams();
  const [cot,          setCot]          = useState(null);
  const [config,       setConfig]       = useState({});
  const [cargando,     setCargando]     = useState(true);
  const [error,        setError]        = useState(false);

  const API_BASE = import.meta.env.DEV ? 'http://localhost:4000' : '';

  useEffect(() => {
    api.get(`/cotizaciones/public/${token}`)
      .then(({ data }) => setCot(data.cotizacion))
      .catch(() => setError(true))
      .finally(() => setCargando(false));

    api.get('/configuracion')
      .then(({ data }) => setConfig(data.configuracion || {}))
      .catch(() => {});
  }, [token]);

  if (cargando) {
    return <div className={styles.centro}><p>Cargando cotización...</p></div>;
  }
  if (error || !cot) {
    return (
      <div className={styles.centro}>
        <p style={{ fontWeight: 600 }}>Cotización no encontrada</p>
        <p>El link puede ser incorrecto o haber expirado.</p>
      </div>
    );
  }

  const incluyeArr   = Array.isArray(cot.incluye)     ? cot.incluye.filter(Boolean)    : [];
  const noIncluyeArr = Array.isArray(cot.no_incluye)  ? cot.no_incluye.filter(Boolean) : [];
  const alojamientos = cot.alojamientos || [];
  const colsVisibles = PRECIO_COLS.filter((col) =>
    alojamientos.some((a) => a[col.key] != null && Number(a[col.key]) > 0)
  );

  const fechaCreacion = cot.creado_en
    ? new Date(cot.creado_en).toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const destinoPrincipal =
    cot.destinos_extra?.[0] ||
    cot.destino ||
    (cot.destinos_extra?.length > 0 ? cot.destinos_extra[0] : null);

  const destinos = cot.destinos_extra?.length > 0
    ? cot.destinos_extra.map((d) => ({ nombre: d.nombre, pais: d.pais }))
    : destinoPrincipal
      ? [{ nombre: destinoPrincipal.nombre, pais: destinoPrincipal.pais }]
      : [];

  const instagram  = config['instagram']  || null;
  const facebook   = config['facebook']   || null;
  const whatsapp   = config['whatsapp']   || config['whatsapp_numero'] || null;
  const linkedin   = config['linkedin']   || 'https://www.linkedin.com/company/voya-uy/';
  const telEmpresa = config['telefono']   || config['telefono_contacto'] || null;
  const emailEmpresa = config['email']    || config['email_contacto']    || null;
  const web        = config['web']        || config['sitio_web']          || null;
  const direccion  = config['direccion']  || null;

  return (
    <div className={styles.pagina}>
      <Helmet>
        <title>
          {cot.nombre_pasajero
            ? `Cotización para ${cot.nombre_pasajero} | voyâ`
            : 'Cotización | voyâ'}
        </title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* ── NAV BAR ── */}
      <div className={styles.navBar}>
        <span className={styles.navLogo}>voy<span className={styles.acento}>â</span></span>
      </div>

      {/* ── BANNER (foto) ── */}
      <div className={styles.banner}>
        {destinoPrincipal?.imagen && (
          <div className={styles.bannerImg} style={{ backgroundImage: `url(${destinoPrincipal.imagen})` }} />
        )}
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          {fechaCreacion && <p className={styles.bannerFecha}>{fechaCreacion}</p>}
          {destinos.length > 0 && (
            <h1 className={styles.bannerDestino}>
              {destinos.map((d, i) => (
                <span key={i}>
                  {i > 0 && <span className={styles.bannerSep}> · </span>}
                  {d.nombre}
                  {d.pais && <span className={styles.bannerPais}>, {d.pais}</span>}
                </span>
              ))}
            </h1>
          )}
          {cot.nombre_pasajero && (
            <p className={styles.bannerPasajero}>Para {cot.nombre_pasajero}</p>
          )}
          {(cot.duracion_dias || cot.duracion_noches) && (
            <p className={styles.bannerDuracion}>
              {cot.duracion_dias ? `${cot.duracion_dias} días` : ''}
              {cot.duracion_dias && cot.duracion_noches ? ' / ' : ''}
              {cot.duracion_noches ? `${cot.duracion_noches} noches` : ''}
            </p>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <main className={styles.body}>

        {/* Incluye */}
        {incluyeArr.length > 0 && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>Incluye</div>
            <ul className={styles.itemLista}>
              {incluyeArr.map((item, i) => {
                const Icon = getItemIcon(typeof item === 'string' ? item : item.tipo);
                return (
                  <li key={i} className={styles.itemFila}>
                    <Icon size={15} className={styles.iconoIncluye} />
                    <span>{renderItemLabel(item, cot)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Itinerario PNR — moved up */}
        {cot.itinerario_tipo === 'pnr' && cot.itinerario_pnr && (() => {
          const segments = parsePnr(cot.itinerario_pnr).map(formatSegment);
          return (
            <div className={styles.card}>
              <div className={styles.cardHeader}>Itinerario de vuelo</div>
              {segments.length > 0 ? (<>
                {/* Desktop: tabla */}
                <div className={styles.pnrTablaWrap}>
                  <table className={styles.pnrTabla}>
                    <thead>
                      <tr>
                        <th>Aerolínea</th>
                        <th>Vuelo</th>
                        <th>Salida</th>
                        <th>De</th>
                        <th>Llegada</th>
                        <th>A</th>
                      </tr>
                    </thead>
                    <tbody>
                      {segments.map((s, i) => (
                        <tr key={i}>
                          <td>
                            <div className={styles.pnrAerolineaCell}>
                              {getAirlineLogo(s.airlineCode) && (
                                <img
                                  src={getAirlineLogo(s.airlineCode)}
                                  alt={s.airline}
                                  className={styles.pnrLogoImg}
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              )}
                              <span>{s.airline}</span>
                            </div>
                          </td>
                          <td className={styles.pnrVuelo}>{s.flightNo}</td>
                          <td><strong>{s.salida.split(' · ')[0]}</strong>{s.salida.split(' · ')[1] ? ` - ${s.salida.split(' · ')[1]}` : ''}</td>
                          <td className={styles.pnrAeropuerto}>{s.desde}</td>
                          <td><strong>{s.llegada.split(' · ')[0]}</strong>{s.llegada.split(' · ')[1] ? ` - ${s.llegada.split(' · ')[1]}` : ''}</td>
                          <td className={styles.pnrAeropuerto}>{s.hasta}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile: cards */}
                <div className={styles.pnrCards}>
                  {segments.map((s, i) => (
                    <div key={i} className={styles.pnrCard}>
                      <div className={styles.pnrCardHeader}>
                        <div className={styles.pnrCardAerolinea}>
                          {getAirlineLogo(s.airlineCode) ? (
                            <img
                              src={getAirlineLogo(s.airlineCode)}
                              alt={s.airline}
                              className={styles.pnrCardLogoImg}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextSibling?.classList?.remove(styles.hidden);
                              }}
                            />
                          ) : (
                            <div className={styles.pnrLogoPlaceholder} />
                          )}
                          <span>{s.airline}</span>
                        </div>
                        <span className={styles.pnrCardFecha}>{s.fecha}</span>
                      </div>
                      <div className={styles.pnrCardRuta}>
                        <div className={styles.pnrCardAeropuerto}>
                          <span className={styles.pnrCardCodigo}>{s.desdeCodigo}</span>
                          <span className={styles.pnrCardCiudad}>{s.desdeNombre}</span>
                          <span className={styles.pnrCardHora}>{s.horaSalida}</span>
                        </div>
                        <div className={styles.pnrCardLinea}>
                          <div className={styles.pnrCardLineaBar} />
                          <FaPlane size={28} className={styles.pnrCardAvion} />
                        </div>
                        <div className={`${styles.pnrCardAeropuerto} ${styles.pnrCardAeropuertoRight}`}>
                          <span className={styles.pnrCardCodigo}>{s.hastaCodigo}</span>
                          <span className={styles.pnrCardCiudad}>{s.hastaNombre}</span>
                          <span className={styles.pnrCardHora}>{s.horaLlegada}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>) : (
                <pre className={styles.pnrText}>{cot.itinerario_pnr}</pre>
              )}
            </div>
          );
        })()}
        {/* Itinerario Imagen — moved up */}
        {cot.itinerario_tipo === 'imagen' && cot.itinerario_imagen && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>Itinerario de vuelo</div>
            <img src={`${API_BASE}${cot.itinerario_imagen}`} alt="Itinerario" className={styles.itinerarioImg} />
          </div>
        )}

        {/* Opciones de alojamiento */}
        {alojamientos.length > 0 && (() => {
          const gruposMap = new Map();
          alojamientos.forEach((a) => {
            const k = a.grupo != null ? a.grupo : `id_${a.id}`;
            if (!gruposMap.has(k)) gruposMap.set(k, { hotels: [], precios: a });
            gruposMap.get(k).hotels.push(a);
          });
          const grupos = [...gruposMap.values()];
          return (
            <div className={styles.card}>
              <div className={styles.cardHeader}>Opciones de alojamiento</div>
              <div className={styles.alojOpciones}>
                {grupos.map((g, gi) => {
                  const p = g.precios;
                  const preciosVisibles = PRECIO_COLS.filter((col) => p[col.key] != null && Number(p[col.key]) > 0);
                  return (
                    <div key={gi} className={styles.alojOpcion}>
                      <p className={styles.alojOpcionTitulo}>Opción {gi + 1}</p>
                      <ul className={styles.alojHoteles}>
                        {g.hotels.map((a, hi) => (
                          <li key={hi} className={styles.alojHotelFila}>
                            <FaBed size={13} className={styles.iconoIncluye} />
                            <span>
                              {a.hotel?.web_url ? (
                                <a href={a.hotel.web_url} target="_blank" rel="noopener noreferrer" className={styles.alojHotelLink}>
                                  {a.hotel?.nombre || '—'} <FiExternalLink size={10} />
                                </a>
                              ) : (
                                <strong>{a.hotel?.nombre || '—'}</strong>
                              )}
                              {a.regimen && (
                                <span className={styles.alojRegimen}>
                                  <FaUtensils size={10} className={styles.iconoIncluye} style={{ marginLeft: 6 }} />
                                  {a.regimen}
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {preciosVisibles.length > 0 && (
                        <div className={styles.alojPrecios}>
                          {preciosVisibles.map((col) => (
                            <span key={col.key} className={styles.alojPrecioChip}>
                              {col.label}: USD {Number(p[col.key]).toLocaleString('es-UY')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* No Incluye */}
        {noIncluyeArr.length > 0 && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>No Incluye</div>
            <ul className={styles.itemLista}>
              {noIncluyeArr.map((item, i) => {
                const Icon = getItemIcon(typeof item === 'string' ? item : item.tipo);
                return (
                  <li key={i} className={styles.itemFila}>
                    <Icon size={15} className={styles.iconoNoIncluye} />
                    <span>{renderItemLabel(item, cot)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Servicios Exclusivos */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>Servicios Exclusivos</div>
          <ul className={styles.itemLista}>
            {SERVICIOS_EXCLUSIVOS.map((s) => (
              <li key={s} className={styles.itemFila}>
                <FaCheckCircle size={15} className={styles.iconoIncluye} />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Medios de Pago */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>Medios de Pago</div>
          <div className={styles.pagosGrid}>
            {MEDIOS_PAGO.map(({ Icon, label }) => (
              <div key={label} className={styles.pagoItem}>
                <Icon size={22} className={styles.pagoIcono} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Condiciones */}
        {cot.condiciones && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>Condiciones</div>
            <p className={styles.condiciones}>{cot.condiciones}</p>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>

          {/* Columna 1: Logo + redes */}
          <div className={styles.footerCol1}>
            <div className={styles.footerLogo}>
              voy<span className={styles.acento}>â</span>
            </div>
            <div className={styles.footerSocial}>
              <a href={facebook || '#'} target={facebook ? '_blank' : undefined} rel="noopener noreferrer" className={styles.socialLink} title="Facebook">
                <FaFacebook size={20} />
              </a>
              <a href={instagram || '#'} target={instagram ? '_blank' : undefined} rel="noopener noreferrer" className={styles.socialLink} title="Instagram">
                <FaInstagram size={20} />
              </a>
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="LinkedIn">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Columna 2: Datos empresa */}
          <div className={styles.footerCol2}>
            <ul className={styles.footerInfoLista}>
              {web && (
                <li className={styles.footerInfoItem}>
                  <FaGlobe size={13} />
                  <a href={web} target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
                    {web.replace(/^https?:\/\//, '')}
                  </a>
                </li>
              )}
              {direccion && (
                <li className={styles.footerInfoItem}>
                  <FaMapMarkerAlt size={13} /><span>{direccion}</span>
                </li>
              )}
              {telEmpresa && (
                <li className={styles.footerInfoItem}>
                  <FaPhone size={13} />
                  <a href={`tel:${telEmpresa}`} className={styles.footerLink}>{telEmpresa}</a>
                </li>
              )}
              {emailEmpresa && (
                <li className={styles.footerInfoItem}>
                  <FaEnvelope size={13} />
                  <a href={`mailto:${emailEmpresa}`} className={styles.footerLink}>{emailEmpresa}</a>
                </li>
              )}
            </ul>
          </div>

          {/* Columna 3: Datos asesor */}
          <div className={styles.footerCol3}>
            {cot.usuario?.nombre && (
              <p className={styles.footerAsesorNombre}>{cot.usuario.nombre}</p>
            )}
            {cot.usuario?.telefono && (
              <div className={styles.footerContactItem}>
                <FaMobileAlt size={13} />
                <a href={`tel:${cot.usuario.telefono}`} className={styles.footerLink}>
                  {cot.usuario.telefono}
                </a>
              </div>
            )}
            {cot.usuario?.email && (
              <div className={styles.footerContactItem}>
                <FaEnvelope size={13} />
                <a href={`mailto:${cot.usuario.email}`} className={styles.footerLink}>
                  {cot.usuario.email}
                </a>
              </div>
            )}
          </div>

        </div>

        {fechaCreacion && (
          <p className={styles.footerFecha}>Cotización generada el {fechaCreacion}</p>
        )}
      </footer>
    </div>
  );
}
