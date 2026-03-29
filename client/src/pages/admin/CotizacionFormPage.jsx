import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiPlus, FiX, FiEdit2, FiTrash2,
  FiAlertCircle, FiCopy, FiExternalLink, FiSave, FiSearch,
} from 'react-icons/fi';
import api from '../../services/api';
import styles from './CotizacionFormPage.module.css';

/* ────────────────────────────────────────────────── */
/* Constants                                          */
/* ────────────────────────────────────────────────── */

const CONDICIONES_DEFAULT = `Los precios están expresados en USD por persona y sujetos a disponibilidad al momento de la reserva.

Se requiere el 30% de seña para confirmar la reserva. El saldo restante debe abonarse 30 días antes de la fecha de salida.

Cancelaciones con más de 30 días de anticipación: reembolso del 80% de la seña. Con menos de 30 días: sin reembolso.

Voyâ no se responsabiliza por cambios en itinerarios originados por causas de fuerza mayor (condiciones climáticas, huelgas, pandemias u otras circunstancias ajenas a nuestra voluntad).`;

const OPCIONES_INCLUYE = [
  'Vuelo de ida y vuelta',
  'Hotel (habitación doble)',
  'Traslados aeropuerto - hotel',
  'Desayuno incluido',
  'Media pensión (desayuno + cena)',
  'Pensión completa',
  'All Inclusive',
  'Guía de turismo en español',
  'Seguro de viaje básico',
  'Asistencia al viajero 24hs',
  'Visitas y excursiones indicadas',
  'Transfers incluidos',
  'Impuestos y tasas incluidas',
];

const OPCIONES_NO_INCLUYE = [
  'Vuelos internacionales',
  'Visa y trámites consulares',
  'Gastos personales',
  'Propinas',
  'Seguro de viaje premium',
  'Comidas no mencionadas',
  'Actividades opcionales',
  'Bebidas en restaurantes',
  'Equipaje adicional',
  'Recargo por habitación individual',
  'Traslados no indicados',
];

const REGIMENES = ['S/Desayuno', 'Desayuno', 'Media Pensión', 'Pensión Completa', 'All Inclusive'];
const METODOS_CONTACTO = ['Whatsapp', 'Email', 'Teléfono'];

const PRECIO_COLS = [
  { key: 'precio_single',    label: 'Single' },
  { key: 'precio_doble',     label: 'Doble' },
  { key: 'precio_triple',    label: 'Triple' },
  { key: 'precio_cuadruple', label: 'Cuádruple' },
  { key: 'precio_menor',     label: 'Menor' },
  { key: 'precio_infante',   label: 'Infante' },
];

const ALOJ_VACIO = {
  hotel_id: null, hotel_nombre: '', regimen: '',
  precio_single: '', precio_doble: '', precio_triple: '',
  precio_cuadruple: '', precio_menor: '', precio_infante: '',
};

/* ────────────────────────────────────────────────── */
/* Destino single autocomplete                        */
/* ────────────────────────────────────────────────── */
function DestinoAutocomplete({ destinos, selectedId, onChange }) {
  const [query, setQuery] = useState('');
  const [abierto, setAbierto] = useState(false);
  const wrapRef = useRef(null);

  const normalizar = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sugerencias = useMemo(() => {
    const q = normalizar(query.trim());
    if (!q) return [];
    return destinos
      .filter((d) => (normalizar(d.nombre).includes(q) || normalizar(d.pais).includes(q)) && d.id !== selectedId)
      .slice(0, 8);
  }, [query, destinos, selectedId]);

  const seleccionado = destinos.find((d) => d.id === Number(selectedId));

  const seleccionar = (d) => {
    onChange(d.id);
    setQuery('');
    setAbierto(false);
  };

  const deseleccionar = () => {
    onChange('');
    setQuery('');
  };

  return (
    <div ref={wrapRef} className={styles.destinoBuscador}>
      {seleccionado ? (
        <div className={styles.destinoChips}>
          <span className={styles.destinoChip}>
            <span>{seleccionado.nombre}</span>
            {seleccionado.pais && <span className={styles.destinoChipPais}>, {seleccionado.pais}</span>}
            <button type="button" className={styles.destinoChipX} onClick={deseleccionar}>
              <FiX size={10} />
            </button>
          </span>
        </div>
      ) : (
        <>
          <div className={styles.destinoInputWrap}>
            <FiSearch size={13} className={styles.destinoIcono} />
            <input
              type="text"
              className={styles.destinoInput}
              placeholder="Buscar ciudad o país..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setAbierto(true); }}
              onFocus={() => setAbierto(true)}
            />
            {query && (
              <button type="button" className={styles.destinoLimpiar} onClick={() => { setQuery(''); setAbierto(false); }}>
                <FiX size={11} />
              </button>
            )}
          </div>
          {abierto && sugerencias.length > 0 && (
            <ul className={styles.destinoDropdown}>
              {sugerencias.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    className={styles.destinoOpcion}
                    onMouseDown={(e) => { e.preventDefault(); seleccionar(d); }}
                  >
                    <span className={styles.destinoOpcionNombre}>{d.nombre}</span>
                    {d.pais && <span className={styles.destinoOpcionPais}>{d.pais}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {abierto && query.trim() && sugerencias.length === 0 && (
            <div className={styles.destinoSinResultados}>Sin resultados</div>
          )}
        </>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────── */
/* Hotel autocomplete (debounced, filtered by destino)*/
/* ────────────────────────────────────────────────── */
function HotelAutocomplete({ destinoId, value, onChange }) {
  const [query, setQuery] = useState(value || '');
  const [sugerencias, setSugerencias] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const wrapRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const buscar = (q) => {
    clearTimeout(timerRef.current);
    if (!q.trim()) { setSugerencias([]); return; }
    timerRef.current = setTimeout(async () => {
      try {
        const params = { busqueda: q };
        if (destinoId) params.destino_id = destinoId;
        const { data } = await api.get('/hoteles', { params });
        setSugerencias(data.hoteles || []);
        setAbierto(true);
      } catch { setSugerencias([]); }
    }, 220);
  };

  return (
    <div ref={wrapRef} className={styles.destinoBuscador}>
      <div className={styles.destinoInputWrap}>
        <FiSearch size={13} className={styles.destinoIcono} />
        <input
          type="text"
          className={styles.destinoInput}
          placeholder="Buscar hotel..."
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            onChange({ hotel_id: null, hotel_nombre: v });
            buscar(v);
          }}
          autoComplete="off"
        />
        {query && (
          <button type="button" className={styles.destinoLimpiar} onClick={() => { setQuery(''); onChange({ hotel_id: null, hotel_nombre: '' }); setSugerencias([]); }}>
            <FiX size={11} />
          </button>
        )}
      </div>
      {abierto && sugerencias.length > 0 && (
        <ul className={styles.destinoDropdown}>
          {sugerencias.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                className={styles.destinoOpcion}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setQuery(h.nombre);
                  onChange({ hotel_id: h.id, hotel_nombre: h.nombre });
                  setAbierto(false);
                }}
              >
                <span className={styles.destinoOpcionNombre}>{h.nombre}</span>
                {h.ciudad && <span className={styles.destinoOpcionPais}>{h.ciudad}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────── */
/* Main component                                     */
/* ────────────────────────────────────────────────── */
export default function CotizacionFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  const [cargando, setCargando] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [token, setToken] = useState(null);

  // Scalar fields
  const [form, setForm] = useState({
    nombre_pasajero: '',
    destino_id: '',
    duracion_dias: '',
    duracion_noches: '',
    condiciones: CONDICIONES_DEFAULT,
    contacto_metodo: '',
    contacto_dato: '',
  });

  // Lists
  const [incluye, setIncluye] = useState([]);
  const [noIncluye, setNoIncluye] = useState([]);
  const [nuevoIncluye, setNuevoIncluye] = useState('');
  const [nuevoNoIncluye, setNuevoNoIncluye] = useState('');

  // Accommodations
  const [alojamientos, setAlojamientos] = useState([]);
  const [modalAloj, setModalAloj] = useState(null);
  const [alojForm, setAlojForm] = useState(ALOJ_VACIO);

  // Auxiliary
  const [destinos, setDestinos] = useState([]);

  useEffect(() => {
    api.get('/destinos').then(({ data }) => setDestinos(data.destinos || []));
  }, []);

  useEffect(() => {
    if (!esEdicion) return;
    api.get(`/cotizaciones/${id}`)
      .then(({ data }) => {
        const c = data.cotizacion;
        setToken(c.token);
        setForm({
          nombre_pasajero: c.nombre_pasajero || '',
          destino_id: c.destino_id || '',
          duracion_dias: c.duracion_dias ?? '',
          duracion_noches: c.duracion_noches ?? '',
          condiciones: c.condiciones || CONDICIONES_DEFAULT,
          contacto_metodo: c.contacto_metodo || '',
          contacto_dato: c.contacto_dato || '',
        });
        setIncluye(Array.isArray(c.incluye) ? c.incluye : []);
        setNoIncluye(Array.isArray(c.no_incluye) ? c.no_incluye : []);
        setAlojamientos(
          (c.alojamientos || []).map((a) => ({
            hotel_id: a.hotel_id,
            hotel_nombre: a.hotel?.nombre || '',
            regimen: a.regimen || '',
            precio_single:    a.precio_single    ?? '',
            precio_doble:     a.precio_doble     ?? '',
            precio_triple:    a.precio_triple    ?? '',
            precio_cuadruple: a.precio_cuadruple ?? '',
            precio_menor:     a.precio_menor     ?? '',
            precio_infante:   a.precio_infante   ?? '',
          }))
        );
      })
      .catch(() => setError('No se pudo cargar la cotización.'))
      .finally(() => setCargando(false));
  }, [id, esEdicion]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // ── Incluye helpers ──
  const agregarIncluye = useCallback(() => {
    const t = nuevoIncluye.trim();
    if (!t || incluye.includes(t)) return;
    setIncluye((p) => [...p, t]);
    setNuevoIncluye('');
  }, [nuevoIncluye, incluye]);

  const agregarNoIncluye = useCallback(() => {
    const t = nuevoNoIncluye.trim();
    if (!t || noIncluye.includes(t)) return;
    setNoIncluye((p) => [...p, t]);
    setNuevoNoIncluye('');
  }, [nuevoNoIncluye, noIncluye]);

  const handleKey = (e, fn) => { if (e.key === 'Enter') { e.preventDefault(); fn(); } };

  // ── Alojamiento modal ──
  const abrirAloj = (index = null) => {
    setAlojForm(index !== null ? { ...alojamientos[index] } : { ...ALOJ_VACIO });
    setModalAloj({ index });
  };

  const guardarAloj = async () => {
    if (!alojForm.hotel_id && !alojForm.hotel_nombre.trim()) return;

    let { hotel_id, hotel_nombre } = alojForm;
    // If typed freely without selecting from dropdown, try to create the hotel
    if (!hotel_id && hotel_nombre.trim()) {
      try {
        const { data } = await api.post('/hoteles', {
          nombre: hotel_nombre.trim(),
          destino_id: form.destino_id || null,
        });
        hotel_id = data.hotel?.id ?? data.id;
      } catch { /* keep null */ }
    }

    const entry = { ...alojForm, hotel_id, hotel_nombre };
    if (modalAloj.index !== null) {
      setAlojamientos((p) => p.map((a, i) => i === modalAloj.index ? entry : a));
    } else {
      setAlojamientos((p) => [...p, entry]);
    }
    setModalAloj(null);
  };

  const eliminarAloj = (i) => setAlojamientos((p) => p.filter((_, idx) => idx !== i));

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre_pasajero.trim()) { setError('El nombre del pasajero es obligatorio.'); return; }
    setGuardando(true);
    setError('');

    const payload = {
      nombre_pasajero: form.nombre_pasajero.trim(),
      destino_id:      form.destino_id || null,
      duracion_dias:   form.duracion_dias || null,
      duracion_noches: form.duracion_noches || null,
      incluye,
      no_incluye:      noIncluye,
      condiciones:     form.condiciones.trim() || null,
      contacto_metodo: form.contacto_metodo || null,
      contacto_dato:   form.contacto_dato.trim() || null,
      alojamientos:    alojamientos.map((a) => ({
        hotel_id:         a.hotel_id,
        regimen:          a.regimen || null,
        precio_single:    a.precio_single    ? Number(a.precio_single)    : null,
        precio_doble:     a.precio_doble     ? Number(a.precio_doble)     : null,
        precio_triple:    a.precio_triple    ? Number(a.precio_triple)    : null,
        precio_cuadruple: a.precio_cuadruple ? Number(a.precio_cuadruple) : null,
        precio_menor:     a.precio_menor     ? Number(a.precio_menor)     : null,
        precio_infante:   a.precio_infante   ? Number(a.precio_infante)   : null,
      })),
    };

    try {
      if (esEdicion) {
        await api.put(`/cotizaciones/${id}`, payload);
        setExito('Cotización guardada.');
        setTimeout(() => setExito(''), 3000);
      } else {
        const { data } = await api.post('/cotizaciones', payload);
        const newId = data?.cotizacion?.id;
        if (newId) navigate(`/admin/cotizador/${newId}/editar`, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const copiarLink = () => {
    if (!token) return;
    const url = `${window.location.origin}/cotizacion/${token}`;
    navigator.clipboard.writeText(url).then(() => { setExito('Link copiado.'); setTimeout(() => setExito(''), 3000); });
  };

  if (cargando) return <div style={{ padding: 40 }}>Cargando...</div>;

  const linkUrl = token ? `${window.location.origin}/cotizacion/${token}` : null;

  return (
    <div className={styles.pagina}>
      {/* Header */}
      <div className={styles.encabezado}>
        <Link to="/admin/cotizador" className={styles.botonVolver}>
          <FiArrowLeft size={15} /> Cotizaciones
        </Link>
        <h1 className={styles.titulo}>
          {esEdicion ? `Cotización #${id}` : 'Nueva cotización'}
        </h1>
      </div>

      {error && (
        <div className={styles.alerta}>
          <FiAlertCircle size={15} /><span>{error}</span>
          <button className={styles.alertaCerrar} onClick={() => setError('')}>×</button>
        </div>
      )}
      {exito && (
        <div className={styles.alertaExito}>{exito}</div>
      )}

      <form onSubmit={handleSubmit}>

        {/* ── Datos del pasajero ── */}
        <div className={styles.seccion}>
          <p className={styles.seccionTitulo}>Datos del pasajero</p>
          <div className={styles.fila}>
            <div className={styles.grupo}>
              <label>Nombre del pasajero *</label>
              <input
                className={styles.input}
                type="text"
                value={form.nombre_pasajero}
                onChange={(e) => setField('nombre_pasajero', e.target.value)}
                placeholder="Ej: Juan García"
                autoFocus
              />
            </div>
            <div className={styles.grupo}>
              <label>Destino</label>
              <DestinoAutocomplete
                destinos={destinos}
                selectedId={form.destino_id}
                onChange={(v) => setField('destino_id', v)}
              />
            </div>
          </div>
          <div className={styles.fila}>
            <div className={styles.grupo}>
              <label>Duración (días)</label>
              <input
                className={styles.input}
                type="number"
                min="1"
                value={form.duracion_dias}
                onChange={(e) => setField('duracion_dias', e.target.value)}
                placeholder="Ej: 7"
              />
            </div>
            <div className={styles.grupo}>
              <label>Duración (noches)</label>
              <input
                className={styles.input}
                type="number"
                min="0"
                value={form.duracion_noches}
                onChange={(e) => setField('duracion_noches', e.target.value)}
                placeholder="Ej: 6"
              />
            </div>
          </div>
          <div className={styles.fila}>
            <div className={styles.grupo}>
              <label>Método de contacto</label>
              <select
                className={styles.select}
                value={form.contacto_metodo}
                onChange={(e) => setField('contacto_metodo', e.target.value)}
              >
                <option value="">— Sin especificar —</option>
                {METODOS_CONTACTO.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className={styles.grupo}>
              <label>Dato de contacto</label>
              <input
                className={styles.input}
                type="text"
                value={form.contacto_dato}
                onChange={(e) => setField('contacto_dato', e.target.value)}
                placeholder="Ej: +598 99 123 456"
              />
            </div>
          </div>
        </div>

        {/* ── Incluye / No incluye ── */}
        <div className={styles.seccion}>
          <p className={styles.seccionTitulo}>¿Qué incluye / No incluye?</p>
          <div className={styles.fila}>
            {/* Incluye */}
            <div className={styles.grupo}>
              <label>Incluye</label>
              <select
                className={styles.select}
                value=""
                onChange={(e) => {
                  if (e.target.value && !incluye.includes(e.target.value)) {
                    setIncluye((p) => [...p, e.target.value]);
                  }
                }}
              >
                <option value="">+ Opción predefinida...</option>
                {OPCIONES_INCLUYE.filter((o) => !incluye.includes(o)).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <div className={styles.agregarWrap}>
                <input
                  type="text"
                  className={styles.input}
                  value={nuevoIncluye}
                  onChange={(e) => setNuevoIncluye(e.target.value)}
                  onKeyDown={(e) => handleKey(e, agregarIncluye)}
                  placeholder="O escribí uno personalizado..."
                />
                <button type="button" className={styles.botonAgregarItem} onClick={agregarIncluye}>
                  <FiPlus size={14} />
                </button>
              </div>
              <div className={styles.listaItems}>
                {incluye.map((item, i) => (
                  <div key={i} className={styles.itemChip}>
                    <span className={styles.itemTexto}>{item}</span>
                    <button type="button" className={styles.itemEliminar} onClick={() => setIncluye((p) => p.filter((_, j) => j !== i))}>
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* No incluye */}
            <div className={styles.grupo}>
              <label>No incluye</label>
              <select
                className={styles.select}
                value=""
                onChange={(e) => {
                  if (e.target.value && !noIncluye.includes(e.target.value)) {
                    setNoIncluye((p) => [...p, e.target.value]);
                  }
                }}
              >
                <option value="">+ Opción predefinida...</option>
                {OPCIONES_NO_INCLUYE.filter((o) => !noIncluye.includes(o)).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <div className={styles.agregarWrap}>
                <input
                  type="text"
                  className={styles.input}
                  value={nuevoNoIncluye}
                  onChange={(e) => setNuevoNoIncluye(e.target.value)}
                  onKeyDown={(e) => handleKey(e, agregarNoIncluye)}
                  placeholder="O escribí uno personalizado..."
                />
                <button type="button" className={styles.botonAgregarItem} onClick={agregarNoIncluye}>
                  <FiPlus size={14} />
                </button>
              </div>
              <div className={styles.listaItems}>
                {noIncluye.map((item, i) => (
                  <div key={i} className={`${styles.itemChip} ${styles.itemChipRojo}`}>
                    <span className={styles.itemTexto}>{item}</span>
                    <button type="button" className={styles.itemEliminar} onClick={() => setNoIncluye((p) => p.filter((_, j) => j !== i))}>
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Alojamientos ── */}
        <div className={styles.seccion}>
          <p className={styles.seccionTitulo}>Alojamientos</p>
          {alojamientos.length > 0 && (
            <table className={styles.alojTabla}>
              <thead>
                <tr>
                  <th>Hotel</th><th>Régimen</th><th>Doble</th><th>Single</th><th></th>
                </tr>
              </thead>
              <tbody>
                {alojamientos.map((a, i) => (
                  <tr key={i}>
                    <td>{a.hotel_nombre || '—'}</td>
                    <td>{a.regimen || '—'}</td>
                    <td>{a.precio_doble  ? `USD ${Number(a.precio_doble).toLocaleString('es-UY')}`  : '—'}</td>
                    <td>{a.precio_single ? `USD ${Number(a.precio_single).toLocaleString('es-UY')}` : '—'}</td>
                    <td>
                      <div className={styles.alojAcciones}>
                        <button type="button" className={styles.botonIcono} onClick={() => abrirAloj(i)} title="Editar"><FiEdit2 size={13} /></button>
                        <button type="button" className={`${styles.botonIcono} ${styles.botonIconoPeligro}`} onClick={() => eliminarAloj(i)} title="Eliminar"><FiTrash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button type="button" className={styles.botonAgregarAloj} onClick={() => abrirAloj(null)}>
            <FiPlus size={14} /> Agregar alojamiento
          </button>
        </div>

        {/* ── Condiciones ── */}
        <div className={styles.seccion}>
          <p className={styles.seccionTitulo}>Condiciones</p>
          <div className={styles.grupo}>
            <textarea
              className={styles.textarea}
              value={form.condiciones}
              onChange={(e) => setField('condiciones', e.target.value)}
              rows={6}
            />
          </div>
        </div>

        {/* ── Link generado ── */}
        {linkUrl && (
          <div className={styles.seccion}>
            <p className={styles.seccionTitulo}>Link para el cliente</p>
            <div className={styles.linkBox}>
              <span className={styles.linkUrl}>{linkUrl}</span>
              <button type="button" className={styles.botonCopiar} onClick={copiarLink} title="Copiar link">
                <FiCopy size={15} />
              </button>
              <a href={linkUrl} target="_blank" rel="noopener noreferrer" className={styles.botonCopiar} title="Ver cotización">
                <FiExternalLink size={15} />
              </a>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <Link to="/admin/cotizador" className={styles.botonSecundario}>Cancelar</Link>
          <button type="submit" className={styles.botonPrimario} disabled={guardando}>
            <FiSave size={14} /> {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear cotización'}
          </button>
        </div>
      </form>

      {/* ── Modal alojamiento ── */}
      {modalAloj && (
        <div className={styles.alojModalOverlay} onClick={() => setModalAloj(null)}>
          <div className={styles.alojModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.alojModalTop}>
              <h3 className={styles.alojModalTitulo}>
                {modalAloj.index !== null ? 'Editar alojamiento' : 'Agregar alojamiento'}
              </h3>
              <button type="button" className={styles.botonIcono} onClick={() => setModalAloj(null)}>
                <FiX size={16} />
              </button>
            </div>

            <div className={styles.fila}>
              <div className={styles.grupo}>
                <label>Hotel *</label>
                <HotelAutocomplete
                  destinoId={form.destino_id || null}
                  value={alojForm.hotel_nombre}
                  onChange={(h) => setAlojForm((p) => ({ ...p, hotel_id: h.hotel_id, hotel_nombre: h.hotel_nombre }))}
                />
              </div>
              <div className={styles.grupo}>
                <label>Régimen</label>
                <select
                  className={styles.select}
                  value={alojForm.regimen}
                  onChange={(e) => setAlojForm((p) => ({ ...p, regimen: e.target.value }))}
                >
                  <option value="">— Seleccionar —</option>
                  {REGIMENES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.alojPreciosGrid}>
              {PRECIO_COLS.map((col) => (
                <div key={col.key} className={styles.grupo}>
                  <label>{col.label}</label>
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={alojForm[col.key]}
                    onChange={(e) => setAlojForm((p) => ({ ...p, [col.key]: e.target.value }))}
                    placeholder="USD"
                  />
                </div>
              ))}
            </div>

            <div className={styles.footer} style={{ paddingTop: 16 }}>
              <button type="button" className={styles.botonSecundario} onClick={() => setModalAloj(null)}>Cancelar</button>
              <button
                type="button"
                className={styles.botonPrimario}
                onClick={guardarAloj}
                disabled={!alojForm.hotel_nombre.trim()}
              >
                {modalAloj.index !== null ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
