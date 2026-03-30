import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiPlus, FiX, FiEdit2, FiTrash2,
  FiAlertCircle, FiCopy, FiExternalLink, FiSave, FiSearch, FiUploadCloud,
} from 'react-icons/fi';
import api from '../../services/api';
import { parsePnr, formatSegment } from '../../utils/pnrParser';
import styles from './CotizacionFormPage.module.css';

/* ────────────────────────────────────────────────── */
/* Constants                                          */
/* ────────────────────────────────────────────────── */

const CONDICIONES_DEFAULT = `• Los precios indicados pueden variar sin previo aviso en función de la disponibilidad de vuelos y alojamientos.
• Para confirmar la reserva y proceder con la emisión de tickets, hoteles u otros servicios, necesitamos sus datos personales tal como aparecen en el documento de viaje que utilizará.
• La gestión de toda la documentación necesaria para viajar —pasaporte vigente, visados, permisos de menores, partidas de nacimiento, entre otros— es responsabilidad exclusiva del pasajero, quien deberá tramitarla ante las autoridades correspondientes.
• Consulte con su asesor las fechas y condiciones de pago, tanto de la seña como del monto total.
• Voyâ no se responsabiliza por cambios en itinerarios originados por causas de fuerza mayor (condiciones climáticas, huelgas, pandemias u otras circunstancias ajenas a nuestra voluntad).`;

const OPCIONES_COMBO     = ['Billete aéreo según itinerario', 'Alojamiento', 'Traslados', 'Seguro de Viaje', 'Visitas y excursiones no indicadas', 'Tasas e impuestos aéreos incluidos', 'Personalizado'];

const INCLUYE_STANDARD = [
  { tipo: 'Billete aéreo según itinerario', detalle: 'Equipaje de mano (Carry on)', destino: '' },
  { tipo: 'Alojamiento',                   detalle: '',                            destino: '' },
  { tipo: 'Traslados',                     detalle: 'Traslados Aeropuerto - Hotel - Aeropuerto', destino: '' },
  { tipo: 'Tasas e impuestos aéreos incluidos',   detalle: '',                            destino: '' },
];

const NO_INCLUYE_STANDARD = [
  { tipo: 'Seguro de Viaje', detalle: '', destino: '' },
];
const OPCIONES_BILLETE   = ['Equipaje de mano (Carry on)', 'Equipaje en bodega', 'Artículo Personal'];
const OPCIONES_TRASLADOS = ['Traslados Aeropuerto - Hotel - Aeropuerto', 'Traslados Aeropuerto - Hotel', 'Traslados Hotel - Aeropuerto'];
const OPCIONES_SEGURO    = ['Urban', 'Tarjeta Celeste 40k'];

const getSecondaryType = (tipo) => {
  switch (tipo) {
    case 'Billete aéreo según itinerario': return 'combo-billete';
    case 'Alojamiento':                    return 'number';
    case 'Traslados':                      return 'combo-traslados';
    case 'Seguro de Viaje':                return 'combo-seguro';
    case 'Personalizado':                  return 'text';
    default:                               return null;
  }
};

const REGIMENES        = ['S/Desayuno', 'Desayuno', 'Media Pensión', 'Pensión Completa', 'All Inclusive'];
const METODOS_CONTACTO = ['Whatsapp', 'Email', 'Teléfono'];

const PRECIO_COLS = [
  { key: 'precio_single',    label: 'Single' },
  { key: 'precio_doble',     label: 'Doble' },
  { key: 'precio_triple',    label: 'Triple' },
  { key: 'precio_cuadruple', label: 'Cuádruple' },
  { key: 'precio_menor',     label: 'Menor' },
  { key: 'precio_infante',   label: 'Infante' },
];

const API_BASE = import.meta.env.DEV ? 'http://localhost:4000' : '';

const PRECIOS_VACIO = {
  precio_single: '', precio_doble: '', precio_triple: '',
  precio_cuadruple: '', precio_menor: '', precio_infante: '',
};

/* An alojamiento "group" = N hotel rows (one per destination) + shared prices */
const nuevoGrupo = (destinos, nochesDefault = '') => ({
  items: destinos.length > 0
    ? destinos.map((d) => ({ destino_id: d.id, destino_nombre: d.nombre, hotel_id: null, hotel_nombre: '', regimen: '', noches: nochesDefault }))
    : [{ destino_id: null, destino_nombre: '', hotel_id: null, hotel_nombre: '', regimen: '', noches: nochesDefault }],
  ...PRECIOS_VACIO,
});

const normalizeItems = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) =>
    typeof item === 'string'
      ? { tipo: item, detalle: '', destino: '' }
      : { tipo: item.tipo || '', detalle: item.detalle || '', destino: item.destino || '' }
  );
};

/* ────────────────────────────────────────────────── */
/* Combobox — searchable + free-text                  */
/* ────────────────────────────────────────────────── */
function Combobox({ value, onChange, opciones, placeholder, className }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const filtered = useMemo(() => {
    if (!value.trim()) return opciones.slice(0, 10);
    const q = value.toLowerCase();
    return opciones.filter((o) => o.toLowerCase().includes(q)).slice(0, 8);
  }, [value, opciones]);

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapRef} className={`${styles.comboWrap} ${className || ''}`}>
      <input
        type="text"
        className={styles.comboInput}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className={styles.comboDropdown}>
          {filtered.map((o) => (
            <li key={o}>
              <button type="button" className={styles.comboOpcion} onMouseDown={(e) => { e.preventDefault(); onChange(o); setOpen(false); }}>
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────── */
/* ItemRow — incluye / no incluye                     */
/* ────────────────────────────────────────────────── */
function ItemRow({ item, onChange, onRemove, esRojo, destinosSeleccionados }) {
  const secType   = getSecondaryType(item.tipo);
  const multiDest = destinosSeleccionados && destinosSeleccionados.length > 1;

  const handleTipoChange = (v) => onChange({ tipo: v, detalle: '', destino: '' });

  return (
    <div className={`${styles.itemRow} ${esRojo ? styles.itemRowRojo : ''}`}>
      <Combobox
        value={item.tipo}
        onChange={handleTipoChange}
        opciones={OPCIONES_COMBO}
        placeholder="Seleccioná o escribí..."
        className={styles.comboPrimario}
      />

      {secType === 'number' && multiDest && (
        <>
          <input
            type="number"
            className={`${styles.comboInput} ${styles.comboInputAngosto}`}
            value={item.detalle}
            onChange={(e) => onChange({ ...item, detalle: e.target.value })}
            placeholder="Noches"
            min="0"
          />
          <Combobox
            value={item.destino || ''}
            onChange={(v) => onChange({ ...item, destino: v })}
            opciones={destinosSeleccionados.map((d) => d.nombre)}
            placeholder="Destino..."
          />
        </>
      )}
      {secType === 'text' && (
        <div className={styles.comboWrap}>
          <input type="text" className={styles.comboInput} value={item.detalle} onChange={(e) => onChange({ ...item, detalle: e.target.value })} placeholder="Escribí el detalle..." />
        </div>
      )}
      {secType === 'combo-billete'   && <Combobox value={item.detalle} onChange={(v) => onChange({ ...item, detalle: v })} opciones={OPCIONES_BILLETE}   placeholder="Tipo de equipaje..."  />}
      {secType === 'combo-traslados' && <Combobox value={item.detalle} onChange={(v) => onChange({ ...item, detalle: v })} opciones={OPCIONES_TRASLADOS} placeholder="Tipo de traslado..." />}
      {secType === 'combo-seguro'    && <Combobox value={item.detalle} onChange={(v) => onChange({ ...item, detalle: v })} opciones={OPCIONES_SEGURO}    placeholder="Tipo de seguro..."   />}

      <button type="button" className={styles.itemRemove} onClick={onRemove}><FiX size={12} /></button>
    </div>
  );
}

/* ────────────────────────────────────────────────── */
/* DestinoMultiSelect                                 */
/* ────────────────────────────────────────────────── */
function DestinoMultiSelect({ destinos, seleccionados, onChange }) {
  const [query,   setQuery]   = useState('');
  const [abierto, setAbierto] = useState(false);
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);

  const normalizar = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const selIds     = useMemo(() => new Set(seleccionados.map((d) => d.id)), [seleccionados]);

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setAbierto(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sugerencias = useMemo(() => {
    const q = normalizar(query.trim());
    if (!q) return [];
    return destinos
      .filter((d) => !selIds.has(d.id) && (normalizar(d.nombre).includes(q) || normalizar(d.pais || '').includes(q)))
      .slice(0, 8);
  }, [query, destinos, selIds]);

  const agregar = (d) => { onChange([...seleccionados, d]); setQuery(''); setAbierto(false); inputRef.current?.focus(); };
  const quitar  = (id) => onChange(seleccionados.filter((d) => d.id !== id));

  return (
    <div ref={wrapRef} className={styles.multiSelectWrap}>
      <div className={styles.multiSelectBox} onClick={() => inputRef.current?.focus()}>
        {seleccionados.map((d) => (
          <span key={d.id} className={styles.destinoChip}>
            {d.nombre}{d.pais ? `, ${d.pais}` : ''}
            <button type="button" className={styles.destinoChipX} onClick={(e) => { e.stopPropagation(); quitar(d.id); }}>
              <FiX size={10} />
            </button>
          </span>
        ))}
        <div className={styles.multiSelectInputWrap}>
          <FiSearch size={13} className={styles.multiSelectIcono} />
          <input
            ref={inputRef}
            type="text"
            className={styles.multiSelectInput}
            placeholder={seleccionados.length > 0 ? 'Agregar destino...' : 'Buscar ciudad o país...'}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setAbierto(true); }}
            onFocus={() => setAbierto(true)}
            autoComplete="off"
          />
          {query && (
            <button type="button" className={styles.destinoLimpiar} onClick={() => { setQuery(''); setAbierto(false); }}>
              <FiX size={11} />
            </button>
          )}
        </div>
      </div>
      {abierto && sugerencias.length > 0 && (
        <ul className={styles.destinoDropdown}>
          {sugerencias.map((d) => (
            <li key={d.id}>
              <button type="button" className={styles.destinoOpcion} onMouseDown={(e) => { e.preventDefault(); agregar(d); }}>
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
    </div>
  );
}

/* ────────────────────────────────────────────────── */
/* HotelAutocomplete                                  */
/* ────────────────────────────────────────────────── */
function HotelAutocomplete({ destinoId, value, onChange }) {
  const [query,      setQuery]      = useState(value || '');
  const [sugerencias, setSugerencias] = useState([]);
  const [abierto,    setAbierto]    = useState(false);
  const wrapRef  = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setAbierto(false); };
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
          onChange={(e) => { const v = e.target.value; setQuery(v); onChange({ hotel_id: null, hotel_nombre: v }); buscar(v); }}
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
              <button type="button" className={styles.destinoOpcion}
                onMouseDown={(e) => { e.preventDefault(); setQuery(h.nombre); onChange({ hotel_id: h.id, hotel_nombre: h.nombre }); setAbierto(false); }}
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
  const { id }    = useParams();
  const navigate  = useNavigate();
  const esEdicion = Boolean(id);

  const [cargando,  setCargando]  = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState('');
  const [exito,     setExito]     = useState('');
  const [token,     setToken]     = useState(null);

  const [form, setForm] = useState({
    nombre_pasajero: '',
    duracion_dias:   '',
    duracion_noches: '',
    condiciones:     CONDICIONES_DEFAULT,
    contacto_metodo: '',
    contacto_dato:   '',
  });

  const [destinosSeleccionados, setDestinosSeleccionados] = useState([]);
  const [todosDestinos, setTodosDestinos]                 = useState([]);
  const [incluye,   setIncluye]   = useState([]);
  const [noIncluye, setNoIncluye] = useState([]);

  const [itinerarioTipo,        setItinerarioTipo]        = useState('');
  const [itinerarioPnr,         setItinerarioPnr]         = useState('');
  const [itinerarioImagen,      setItinerarioImagen]      = useState('');
  const [itinerarioImgSubiendo, setItinerarioImgSubiendo] = useState(false);
  const [dropDragging,          setDropDragging]          = useState(false);
  const fileInputRef = useRef(null);

  /* alojamientos is now an array of GROUPS:
     { items: [{destino_id, destino_nombre, hotel_id, hotel_nombre, regimen}], precio_single, ... } */
  const [alojamientos, setAlojamientos] = useState([]);
  const [modalAloj,    setModalAloj]    = useState(null);   // null | { index: number|null }
  const [grupoForm,    setGrupoForm]    = useState(null);   // current group being edited

  /* ── Init ── */
  useEffect(() => {
    const init = async () => {
      const { data: dData } = await api.get('/destinos');
      const allD = dData.destinos || [];
      setTodosDestinos(allD);

      if (!esEdicion) { setCargando(false); return; }

      const { data } = await api.get(`/cotizaciones/${id}`);
      const c = data.cotizacion;
      setToken(c.token);
      setForm({
        nombre_pasajero: c.nombre_pasajero || '',
        duracion_dias:   c.duracion_dias   ?? '',
        duracion_noches: c.duracion_noches ?? '',
        condiciones:     c.condiciones     || CONDICIONES_DEFAULT,
        contacto_metodo: c.contacto_metodo || '',
        contacto_dato:   c.contacto_dato   || '',
      });

      const ids = Array.isArray(c.destinos_ids) && c.destinos_ids.length > 0
        ? c.destinos_ids : (c.destino_id ? [c.destino_id] : []);
      setDestinosSeleccionados(ids.map((iid) => allD.find((d) => d.id === iid)).filter(Boolean));

      setIncluye(normalizeItems(c.incluye));
      setNoIncluye(normalizeItems(c.no_incluye));
      setItinerarioTipo(c.itinerario_tipo    || '');
      setItinerarioPnr(c.itinerario_pnr      || '');
      setItinerarioImagen(c.itinerario_imagen || '');

      /* Load: reconstruct groups using the `grupo` field (fallback: each record = own group) */
      const grupoMap = new Map();
      (c.alojamientos || [])
        .slice()
        .sort((a, b) => (a.grupo ?? a.id) - (b.grupo ?? b.id))
        .forEach((a) => {
          const gKey = a.grupo != null ? `g${a.grupo}` : `id${a.id}`;
          if (!grupoMap.has(gKey)) {
            grupoMap.set(gKey, {
              items: [],
              precio_single:    a.precio_single    ?? '',
              precio_doble:     a.precio_doble     ?? '',
              precio_triple:    a.precio_triple    ?? '',
              precio_cuadruple: a.precio_cuadruple ?? '',
              precio_menor:     a.precio_menor     ?? '',
              precio_infante:   a.precio_infante   ?? '',
            });
          }
          grupoMap.get(gKey).items.push({
            destino_id:     a.destino_id || null,
            destino_nombre: allD.find((d) => d.id === a.destino_id)?.nombre || '',
            hotel_id:       a.hotel_id,
            hotel_nombre:   a.hotel?.nombre || '',
            regimen:        a.regimen || '',
            noches:         a.noches ?? '',
          });
        });
      setAlojamientos([...grupoMap.values()]);
      setCargando(false);
    };
    init().catch(() => { setError('No se pudo cargar.'); setCargando(false); });
  }, [id, esEdicion]);

  /* Scroll to top on error or success */
  useEffect(() => {
    if (error || exito) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [error, exito]);

  /* Paste listener for itinerario imagen */
  useEffect(() => {
    if (itinerarioTipo !== 'imagen') return;
    const handler = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) { uploadItinerarioImagen(item.getAsFile()); break; }
      }
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [itinerarioTipo]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const uploadItinerarioImagen = async (file) => {
    if (!file) return;
    setItinerarioImgSubiendo(true);
    try {
      const fd = new FormData();
      fd.append('imagen', file);
      const { data } = await api.post('/cotizaciones/upload-imagen', fd);
      setItinerarioImagen(data.url);
    } catch { setError('Error al subir la imagen.'); }
    finally { setItinerarioImgSubiendo(false); }
  };

  const addItem    = useCallback((setter) => setter((p) => [...p, { tipo: '', detalle: '', destino: '' }]), []);
  const updateItem = useCallback((setter, i, v) => setter((p) => { const n = [...p]; n[i] = v; return n; }), []);
  const removeItem = useCallback((setter, i) => setter((p) => p.filter((_, j) => j !== i)), []);

  /* ── Alojamiento modal ── */
  const abrirAloj = (index = null) => {
    if (index !== null) {
      setGrupoForm({ ...alojamientos[index], items: alojamientos[index].items.map((it) => ({ ...it })) });
    } else {
      /* Auto-fill noches when there is exactly one destination */
      const nochesDefault = destinosSeleccionados.length === 1 && form.duracion_noches
        ? String(form.duracion_noches) : '';
      setGrupoForm(nuevoGrupo(destinosSeleccionados, nochesDefault));
    }
    setModalAloj({ index });
  };

  const updateGrupoItem = (i, field, value) => {
    setGrupoForm((g) => {
      const items = g.items.map((it, idx) => idx === i ? { ...it, [field]: value } : it);
      return { ...g, items };
    });
  };

  const guardarAloj = async () => {
    /* Auto-create hotels that were typed freely */
    const itemsResueltos = await Promise.all(
      grupoForm.items.map(async (it) => {
        if (!it.hotel_id && it.hotel_nombre.trim()) {
          try {
            const { data } = await api.post('/hoteles', { nombre: it.hotel_nombre.trim(), destino_id: it.destino_id || null });
            return { ...it, hotel_id: data.hotel?.id ?? data.id };
          } catch { return it; }
        }
        return it;
      })
    );

    const grupo = { ...grupoForm, items: itemsResueltos };

    if (modalAloj.index !== null) {
      setAlojamientos((p) => p.map((a, i) => i === modalAloj.index ? grupo : a));
    } else {
      setAlojamientos((p) => [...p, grupo]);
    }
    setModalAloj(null);
    setGrupoForm(null);
  };

  const eliminarAloj = (i) => setAlojamientos((p) => p.filter((_, idx) => idx !== i));

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError('');

    /* Validate: at least 1 destination */
    if (destinosSeleccionados.length === 0) {
      setError('Debés seleccionar al menos 1 destino.');
      setGuardando(false);
      return;
    }

    /* Validate: at least 1 alojamiento */
    if (alojamientos.length === 0) {
      setError('Debés agregar al menos 1 alojamiento.');
      setGuardando(false);
      return;
    }

    /* Validate: sum of noches in incluye "Alojamiento" items <= duracion_noches */
    if (form.duracion_noches) {
      const totalNochesIncluye = incluye
        .filter((it) => it.tipo === 'Alojamiento' && Number(it.detalle) > 0)
        .reduce((s, it) => s + Number(it.detalle), 0);
      if (totalNochesIncluye > Number(form.duracion_noches)) {
        setError(`La suma de noches en Alojamiento (${totalNochesIncluye}) supera la duración total (${form.duracion_noches} noches).`);
        setGuardando(false);
        return;
      }
    }

    const destino_id   = destinosSeleccionados[0]?.id || null;
    const destinos_ids = destinosSeleccionados.map((d) => d.id);

    /* Flatten groups into individual alojamiento records */
    const alojamientosFlat = alojamientos.flatMap((g, gi) =>
      g.items.map((it) => ({
        grupo:            gi,
        destino_id:       it.destino_id  || null,
        hotel_id:         it.hotel_id,
        regimen:          it.regimen     || null,
        noches:           it.noches      ? Number(it.noches)           : null,
        precio_single:    g.precio_single    ? Number(g.precio_single)    : null,
        precio_doble:     g.precio_doble     ? Number(g.precio_doble)     : null,
        precio_triple:    g.precio_triple    ? Number(g.precio_triple)    : null,
        precio_cuadruple: g.precio_cuadruple ? Number(g.precio_cuadruple) : null,
        precio_menor:     g.precio_menor     ? Number(g.precio_menor)     : null,
        precio_infante:   g.precio_infante   ? Number(g.precio_infante)   : null,
      }))
    );

    const payload = {
      nombre_pasajero: form.nombre_pasajero.trim() || null,
      destino_id,
      destinos_ids,
      duracion_dias:   form.duracion_dias   || null,
      duracion_noches: form.duracion_noches || null,
      incluye:         incluye.filter((i) => i.tipo.trim()),
      no_incluye:      noIncluye.filter((i) => i.tipo.trim()),
      condiciones:     form.condiciones.trim() || null,
      contacto_metodo: form.contacto_metodo   || null,
      contacto_dato:   form.contacto_dato.trim() || null,
      itinerario_tipo:   itinerarioTipo || null,
      itinerario_pnr:    itinerarioTipo === 'pnr'   ? (itinerarioPnr.trim() || null)  : null,
      itinerario_imagen: itinerarioTipo === 'imagen' ? (itinerarioImagen || null)      : null,
      alojamientos: alojamientosFlat,
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

  /* Can save the group only if at least one hotel row has a name */
  const grupoValido = grupoForm?.items.some((it) => it.hotel_nombre.trim());

  return (
    <div className={styles.pagina}>
      <div className={styles.encabezado}>
        <Link to="/admin/cotizador" className={styles.botonVolver}>
          <FiArrowLeft size={15} /> Cotizaciones
        </Link>
        <h1 className={styles.titulo}>{esEdicion ? `Cotización #${id}` : 'Nueva cotización'}</h1>
      </div>

      {error && (
        <div className={styles.alerta}>
          <FiAlertCircle size={15} /><span>{error}</span>
          <button className={styles.alertaCerrar} onClick={() => setError('')}>×</button>
        </div>
      )}
      {exito && <div className={styles.alertaExito}>{exito}</div>}

      <form onSubmit={handleSubmit}>

        {/* ── Datos del pasajero ── */}
        <div className={styles.seccion}>
          <p className={styles.seccionTitulo}>Datos del pasajero</p>
          <div className={styles.filaTres}>
            <div className={styles.grupo}>
              <label>Nombre del pasajero</label>
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
              <label>Método de contacto</label>
              <select className={styles.select} value={form.contacto_metodo} onChange={(e) => setField('contacto_metodo', e.target.value)}>
                <option value="">— Sin especificar —</option>
                {METODOS_CONTACTO.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className={styles.grupo}>
              <label>Dato de contacto</label>
              <input className={styles.input} type="text" value={form.contacto_dato} onChange={(e) => setField('contacto_dato', e.target.value)} placeholder="Ej: +598 99 123 456" />
            </div>
          </div>
        </div>

        {/* ── Viaje ── */}
        <div className={styles.seccion}>
          <div className={styles.seccionTituloFila}>
            <p className={styles.seccionTitulo}>Viaje</p>
            <button type="button" className={styles.botonStandard} onClick={() => { setField('duracion_dias', 8); setField('duracion_noches', 7); }}>
              Estándar
            </button>
          </div>
          <div className={styles.fila}>
            <div className={styles.grupo}>
              <label>Destinos</label>
              <DestinoMultiSelect
                destinos={todosDestinos}
                seleccionados={destinosSeleccionados}
                onChange={setDestinosSeleccionados}
              />
            </div>
            <div className={styles.fila} style={{ margin: 0 }}>
              <div className={styles.grupo}>
                <label>Duración (días)</label>
                <input className={styles.input} type="number" min="1" value={form.duracion_dias} onChange={(e) => setField('duracion_dias', e.target.value)} placeholder="Ej: 7" />
              </div>
              <div className={styles.grupo}>
                <label>Duración (noches)</label>
                <input className={styles.input} type="number" min="0" value={form.duracion_noches} onChange={(e) => setField('duracion_noches', e.target.value)} placeholder="Ej: 6" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Incluye / No incluye ── */}
        <div className={styles.seccion}>
          <p className={styles.seccionTitulo}>¿Qué incluye / No incluye?</p>

          <div className={styles.incluyeBloque}>
            <div className={styles.incluyeBloqueHeader}>
              <p className={styles.incluyeBloqueTitulo}>Incluye</p>
              <button type="button" className={styles.botonStandard} onClick={() => { setIncluye(INCLUYE_STANDARD.map((i) => ({ ...i }))); setNoIncluye(NO_INCLUYE_STANDARD.map((i) => ({ ...i }))); }}>
                Estándar
              </button>
            </div>
            <div className={styles.itemList}>
              {incluye.map((item, i) => (
                <ItemRow key={i} item={item} onChange={(v) => updateItem(setIncluye, i, v)} onRemove={() => removeItem(setIncluye, i)} esRojo={false} destinosSeleccionados={destinosSeleccionados} />
              ))}
            </div>
            <button type="button" className={styles.botonAgregarItem} onClick={() => addItem(setIncluye)}>
              <FiPlus size={13} /> Agregar
            </button>
          </div>

          <div className={styles.incluyeLinea} />

          <div className={styles.incluyeBloque}>
            <p className={`${styles.incluyeBloqueTitulo} ${styles.incluyeBloqueTituloRojo}`}>No incluye</p>
            <div className={styles.itemList}>
              {noIncluye.map((item, i) => (
                <ItemRow key={i} item={item} onChange={(v) => updateItem(setNoIncluye, i, v)} onRemove={() => removeItem(setNoIncluye, i)} esRojo destinosSeleccionados={destinosSeleccionados} />
              ))}
            </div>
            <button type="button" className={`${styles.botonAgregarItem} ${styles.botonAgregarItemRojo}`} onClick={() => addItem(setNoIncluye)}>
              <FiPlus size={13} /> Agregar
            </button>
          </div>
        </div>

        {/* ── Itinerario ── */}
        <div className={styles.seccion}>
          <p className={styles.seccionTitulo}>Itinerario</p>
          <div className={styles.itinerarioToggle}>
            {['', 'pnr', 'imagen'].map((t) => (
              <button key={t} type="button" className={`${styles.itinerarioBtn} ${itinerarioTipo === t ? styles.itinerarioBtnActivo : ''}`} onClick={() => setItinerarioTipo(t)}>
                {t === '' ? 'Sin itinerario' : t === 'pnr' ? 'PNR / Texto' : 'Imagen'}
              </button>
            ))}
          </div>

          {itinerarioTipo === 'pnr' && (
            <div className={styles.grupo} style={{ marginTop: 14 }}>
              <label>Texto del itinerario / PNR</label>
              <textarea className={styles.textarea} value={itinerarioPnr} onChange={(e) => setItinerarioPnr(e.target.value)} rows={10} placeholder="Pegá aquí el itinerario o texto del PNR..." />
              {(() => {
                const segments = parsePnr(itinerarioPnr).map(formatSegment);
                if (!segments.length) return null;
                return (
                  <div className={styles.pnrTablaWrap}>
                    <p className={styles.pnrTablaLabel}>Vista previa del itinerario</p>
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
                            <td>{s.airline}</td>
                            <td className={styles.pnrVuelo}>{s.flightNo}</td>
                            <td><strong>{s.salida.split(' · ')[0]}</strong> · {s.salida.split(' · ')[1]}</td>
                            <td className={styles.pnrAeropuerto}>{s.desde}</td>
                            <td><strong>{s.llegada.split(' · ')[0]}</strong> · {s.llegada.split(' · ')[1]}</td>
                            <td className={styles.pnrAeropuerto}>{s.hasta}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {itinerarioTipo === 'imagen' && (
            <div className={styles.grupo} style={{ marginTop: 14 }}>
              {itinerarioImagen ? (
                <div className={styles.itinerarioImgPreview}>
                  <img src={`${API_BASE}${itinerarioImagen}`} alt="Itinerario" />
                  <button type="button" className={styles.botonSecundario} style={{ marginTop: 8 }} onClick={() => setItinerarioImagen('')}>
                    <FiX size={13} /> Quitar imagen
                  </button>
                </div>
              ) : (
                <div className={`${styles.dropZone} ${dropDragging ? styles.dropZoneDragging : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDropDragging(true); }}
                  onDragLeave={() => setDropDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDropDragging(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) uploadItinerarioImagen(f); }}
                >
                  <FiUploadCloud size={28} />
                  <p>{itinerarioImgSubiendo ? 'Subiendo...' : 'Arrastrá, pegá (Ctrl+V) o hacé clic para seleccionar'}</p>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={(e) => { const f = e.target.files[0]; if (f) uploadItinerarioImagen(f); e.target.value = ''; }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Alojamientos ── */}
        <div className={styles.seccion}>
          <p className={styles.seccionTitulo}>Alojamientos</p>

          {alojamientos.length > 0 && (
            <div className={styles.alojLista}>
              {alojamientos.map((g, i) => {
                const nombres = g.items.map((it) => it.hotel_nombre || '—').join(' / ');
                const precio  = g.precio_doble ? `USD ${Number(g.precio_doble).toLocaleString('es-UY')} doble` : g.precio_single ? `USD ${Number(g.precio_single).toLocaleString('es-UY')} single` : '';
                return (
                  <div key={i} className={styles.alojFila}>
                    <span className={styles.alojNombres}>{nombres}</span>
                    {precio && <span className={styles.alojPrecioChip}>{precio}</span>}
                    <div className={styles.alojAcciones}>
                      <button type="button" className={styles.botonIcono} onClick={() => abrirAloj(i)} title="Editar"><FiEdit2 size={13} /></button>
                      <button type="button" className={`${styles.botonIcono} ${styles.botonIconoPeligro}`} onClick={() => eliminarAloj(i)} title="Eliminar"><FiTrash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button type="button" className={styles.botonAgregarAloj} onClick={() => abrirAloj(null)}>
            <FiPlus size={14} /> Agregar alojamiento
          </button>
        </div>

        {/* ── Condiciones ── */}
        <div className={styles.seccion}>
          <p className={styles.seccionTitulo}>Condiciones</p>
          <div className={styles.grupo}>
            <textarea className={styles.textarea} value={form.condiciones} onChange={(e) => setField('condiciones', e.target.value)} rows={6} />
          </div>
        </div>

        {/* ── Link ── */}
        {linkUrl && (
          <div className={styles.seccion}>
            <p className={styles.seccionTitulo}>Link para el cliente</p>
            <div className={styles.linkBox}>
              <span className={styles.linkUrl}>{linkUrl}</span>
              <button type="button" className={styles.botonCopiar} onClick={copiarLink} title="Copiar link"><FiCopy size={15} /></button>
              <a href={linkUrl} target="_blank" rel="noopener noreferrer" className={styles.botonCopiar} title="Ver cotización"><FiExternalLink size={15} /></a>
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <Link to="/admin/cotizador" className={styles.botonSecundario}>Cancelar</Link>
          <button type="submit" className={styles.botonPrimario} disabled={guardando}>
            <FiSave size={14} /> {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear cotización'}
          </button>
        </div>
      </form>

      {/* ── Modal alojamiento ── */}
      {modalAloj && grupoForm && (
        <div className={styles.alojModalOverlay} onClick={() => setModalAloj(null)}>
          <div className={styles.alojModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.alojModalTop}>
              <h3 className={styles.alojModalTitulo}>
                {modalAloj.index !== null ? 'Editar alojamiento' : 'Agregar alojamiento'}
              </h3>
              <button type="button" className={styles.botonIcono} onClick={() => setModalAloj(null)}><FiX size={16} /></button>
            </div>

            {/* One hotel row per destination */}
            {grupoForm.items.map((it, i) => (
              <div key={i} className={styles.alojHotelRow}>
                {(it.destino_nombre || grupoForm.items.length > 1) && (
                  <p className={styles.alojHotelDestino}>{it.destino_nombre || `Opción ${i + 1}`}</p>
                )}
                <div className={styles.fila}>
                  <div className={styles.grupo}>
                    <label>Hotel</label>
                    <HotelAutocomplete
                      destinoId={it.destino_id}
                      value={it.hotel_nombre}
                      onChange={(h) => setGrupoForm((g) => {
                        const items = g.items.map((it2, idx) => idx === i ? { ...it2, hotel_id: h.hotel_id, hotel_nombre: h.hotel_nombre } : it2);
                        return { ...g, items };
                      })}
                    />
                  </div>
                  <div className={styles.grupo}>
                    <label>Régimen</label>
                    <select className={styles.select} value={it.regimen} onChange={(e) => updateGrupoItem(i, 'regimen', e.target.value)}>
                      <option value="">— Seleccionar —</option>
                      {REGIMENES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {/* Shared price grid */}
            <p className={styles.alojPreciosTitulo}>Precios por persona</p>
            <div className={styles.alojPreciosGrid}>
              {PRECIO_COLS.map((col) => (
                <div key={col.key} className={styles.grupo}>
                  <label>{col.label}</label>
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={grupoForm[col.key]}
                    onChange={(e) => setGrupoForm((g) => ({ ...g, [col.key]: e.target.value }))}
                    placeholder="USD"
                  />
                </div>
              ))}
            </div>

            <div className={styles.footer} style={{ paddingTop: 16 }}>
              <button type="button" className={styles.botonSecundario} onClick={() => setModalAloj(null)}>Cancelar</button>
              <button type="button" className={styles.botonPrimario} onClick={guardarAloj} disabled={!grupoValido}>
                {modalAloj.index !== null ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
