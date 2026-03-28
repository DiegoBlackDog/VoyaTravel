import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FiPlus, FiX, FiSave, FiSearch, FiEdit2, FiChevronDown } from 'react-icons/fi';
import slugify from '../../utils/slugify';
import api from '../../services/api';
import styles from './PaqueteForm.module.css';

/* ------------------------------------------------------------------ */
/* Buscador de destinos para el formulario                              */
/* ------------------------------------------------------------------ */
function normalizar(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function DestinoBuscadorForm({ destinos, selectedIds, onChange }) {
  const [query, setQuery] = useState('');
  const [abierto, setAbierto] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setAbierto(false);
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
        return (nombre.includes(q) || pais.includes(q)) && !(selectedIds || []).includes(d.id);
      })
      .slice(0, 8);
  }, [query, destinos, selectedIds]);

  const seleccionados = destinos.filter((d) => (selectedIds || []).includes(d.id));

  const toggle = (id) => {
    const ids = selectedIds || [];
    onChange(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  };

  return (
    <div ref={wrapRef} className={styles.destinoBuscador}>
      {seleccionados.length > 0 && (
        <div className={styles.destinoChips}>
          {seleccionados.map((d) => (
            <span key={d.id} className={styles.destinoChip}>
              <span>{d.nombre}</span>
              {d.pais && <span className={styles.destinoChipPais}>, {d.pais}</span>}
              <button type="button" className={styles.destinoChipX} onClick={() => toggle(d.id)}>
                <FiX size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
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
                onMouseDown={(e) => { e.preventDefault(); toggle(d.id); setQuery(''); setAbierto(false); }}
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
    </div>
  );
}

const MONEDAS = [
  { value: 'USD', label: 'USD (Dolar)' },
  { value: 'UYU', label: 'UYU (Peso uruguayo)' },
  { value: 'EUR', label: 'EUR (Euro)' },
];

const OPCIONES_INCLUYE = [
  'Vuelo de ida y vuelta',
  'Hotel (habitación doble)',
  'Traslados aeropuerto - hotel',
  'Desayuno incluido',
  'Media pensión (desayuno + cena)',
  'Pensión completa',
  'Guía de turismo en español',
  'Seguro de viaje básico',
  'Asistencia al viajero 24hs',
  'Visitas y excursiones indicadas',
  'Transfers incluidos',
  'Impuestos y tasas incluidas',
  'City tax incluida',
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

const CONDICIONES_DEFAULT = `Los paquetes están sujetos a disponibilidad al momento de la reserva. Los precios pueden variar sin previo aviso.

Se requiere el 30% de seña para confirmar la reserva, el saldo restante debe abonarse 30 días antes de la fecha de salida.

Cancelaciones con más de 30 días de anticipación: reembolso del 80% de la seña. Con menos de 30 días: sin reembolso.

Voyâ no se responsabiliza por cambios en itinerarios originados por causas de fuerza mayor (condiciones climáticas, huelgas, pandemias u otras circunstancias ajenas a nuestra voluntad).

Todos los precios están expresados en USD por persona en base doble, salvo indicación contraria.`;

const REGIMENES = ['S/Desayuno', 'Desayuno', 'Media Pensión', 'Pensión Completa', 'All Inclusive'];

/* ------------------------------------------------------------------ */
/* Autocomplete de hotel                                                 */
/* ------------------------------------------------------------------ */
function HotelAutocomplete({ destinosIds, hotelNombre, onChange }) {
  const [query, setQuery] = useState(hotelNombre || '');
  const [sugerencias, setSugerencias] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const wrapRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const buscar = (q) => {
    clearTimeout(timerRef.current);
    if (!q.trim()) { setSugerencias([]); return; }
    timerRef.current = setTimeout(async () => {
      try {
        const params = { busqueda: q };
        if (destinosIds?.length > 0) params.destinos = destinosIds.join(',');
        const { data } = await api.get('/hoteles', { params });
        setSugerencias(data.hoteles || []);
        setAbierto(true);
      } catch { setSugerencias([]); }
    }, 220);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div className={styles.destinoInputWrap}>
        <FiSearch size={13} className={styles.destinoIcono} />
        <input
          type="text"
          className={styles.destinoInput}
          placeholder="Buscar o escribir nombre del hotel..."
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            onChange({ hotel_id: null, hotel_nombre: v });
            buscar(v);
          }}
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
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Multi-select dropdown por categoría de etiqueta                      */
/* ------------------------------------------------------------------ */
function EtiquetaMultiSelect({ categoria, selectedIds, onChange }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id) => {
    const ids = selectedIds || [];
    onChange(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  };

  const seleccionadas = categoria.etiquetas.filter((e) => (selectedIds || []).includes(e.id));

  return (
    <div ref={ref} className={styles.etqWrap}>
      <button type="button" className={`${styles.etqBtn} ${abierto ? styles.etqBtnAbierto : ''}`} onClick={() => setAbierto(!abierto)}>
        <span className={styles.etqBtnLabel}>{categoria.nombre}</span>
        {seleccionadas.length > 0 && <span className={styles.etqBadge}>{seleccionadas.length}</span>}
        <FiChevronDown size={14} className={`${styles.etqArrow} ${abierto ? styles.etqArrowOpen : ''}`} />
      </button>
      {abierto && (
        <div className={styles.etqDropdown}>
          {categoria.etiquetas.map((e) => (
            <label key={e.id} className={styles.etqOpcion}>
              <input type="checkbox" checked={(selectedIds || []).includes(e.id)} onChange={() => toggle(e.id)} />
              <span>{e.nombre}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PaqueteForm({
  defaultValues,
  etiquetas = [],
  destinos = [],
  onSubmit,
  guardando = false,
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      titulo: '',
      slug: '',
      descripcion: '',
      resumen: '',
      precio_adulto: '',
      precio_nino: '',
      precio_infante: '',
      moneda: 'USD',
      duracion_dias: '',
      duracion_noches: '',
      condiciones: CONDICIONES_DEFAULT,
      disponible: true,
      destacado: false,
      etiquetas_ids: [],
      destinos_ids: [],
      ...defaultValues,
    },
  });

  /* ── Dynamic lists for incluye / no_incluye ── */
  const [incluye, setIncluye] = useState(defaultValues?.incluye || []);
  const [noIncluye, setNoIncluye] = useState(defaultValues?.no_incluye || []);

  /* ── Operadores dinámicos ── */
  const [listaOperadores, setListaOperadores] = useState([]);
  useEffect(() => {
    api.get('/operadores').then(({ data }) => setListaOperadores(data.operadores || [])).catch(() => {});
  }, []);

  /* ── Costos internos ── */
  const HOY = new Date().toISOString().slice(0, 10);
  const COSTO_VACIO = { operador: '', sistema: '', tipo: '', bruto: '', neto: '', fecha_cotizacion: HOY, notas: '' };
  const [costos, setCostos] = useState(
    defaultValues?.costos?.length > 0 ? defaultValues.costos.map((c) => ({ ...COSTO_VACIO, ...c })) : []
  );
  const [modalCosto, setModalCosto] = useState(null); // null | { idx: number, data: {} }

  const abrirModalNuevo = () => setModalCosto({ idx: -1, data: { ...COSTO_VACIO } });
  const abrirModalEditar = (i) => setModalCosto({ idx: i, data: { ...costos[i] } });
  const cerrarModalCosto = () => setModalCosto(null);
  const guardarModalCosto = () => {
    const d = modalCosto.data;
    if (modalCosto.idx === -1) {
      setCostos((prev) => [...prev, d]);
    } else {
      setCostos((prev) => prev.map((c, i) => i === modalCosto.idx ? d : c));
    }
    setModalCosto(null);
  };
  const eliminarCosto = (i) => setCostos((prev) => prev.filter((_, idx) => idx !== i));

  /* ── Alojamientos ── */
  const ALOJ_VACIO = { hotel_id: null, hotel_nombre: '', regimen: '', precio_single: '', precio_doble: '', precio_triple: '', precio_cuadruple: '', precio_menor: '', precio_infante: '' };
  const [alojamientos, setAlojamientos] = useState(
    (defaultValues?.alojamientos || []).map((a) => ({ ...ALOJ_VACIO, ...a }))
  );
  const [modalAloj, setModalAloj] = useState(null);
  const destinosIds = watch('destinos_ids') || [];

  const abrirModalNuevoAloj = () => setModalAloj({ idx: -1, data: { ...ALOJ_VACIO } });
  const abrirModalEditarAloj = (i) => setModalAloj({ idx: i, data: { ...ALOJ_VACIO, ...alojamientos[i] } });
  const cerrarModalAloj = () => setModalAloj(null);
  const eliminarAloj = (i) => setAlojamientos((prev) => prev.filter((_, idx) => idx !== i));

  const guardarModalAloj = async () => {
    const d = modalAloj.data;
    let hotel_id = d.hotel_id;
    if (!hotel_id && d.hotel_nombre.trim()) {
      try {
        const { data } = await api.post('/hoteles', { nombre: d.hotel_nombre.trim(), destino_id: destinosIds[0] || null });
        hotel_id = data.hotel?.id ?? data.id;
      } catch { /* keep null */ }
    }
    const entry = { ...d, hotel_id, hotel: hotel_id ? { nombre: d.hotel_nombre } : null };
    if (modalAloj.idx === -1) {
      setAlojamientos((prev) => [...prev, entry]);
    } else {
      setAlojamientos((prev) => prev.map((a, i) => i === modalAloj.idx ? entry : a));
    }
    setModalAloj(null);
  };

  const [nuevoIncluye, setNuevoIncluye] = useState('');
  const [nuevoNoIncluye, setNuevoNoIncluye] = useState('');

  /* ── Auto-slug from title ── */
  const [slugManual, setSlugManual] = useState(false);
  const titulo = watch('titulo');

  useEffect(() => {
    if (!slugManual && titulo) {
      setValue('slug', slugify(titulo));
    }
  }, [titulo, slugManual, setValue]);

  /* ── Handlers for dynamic lists ── */
  const agregarIncluye = useCallback(() => {
    const texto = nuevoIncluye.trim();
    if (!texto) return;
    setIncluye((prev) => [...prev, texto]);
    setNuevoIncluye('');
  }, [nuevoIncluye]);

  const eliminarIncluye = (index) => {
    setIncluye((prev) => prev.filter((_, i) => i !== index));
  };

  const agregarNoIncluye = useCallback(() => {
    const texto = nuevoNoIncluye.trim();
    if (!texto) return;
    setNoIncluye((prev) => [...prev, texto]);
    setNuevoNoIncluye('');
  }, [nuevoNoIncluye]);

  const eliminarNoIncluye = (index) => {
    setNoIncluye((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e, agregar) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregar();
    }
  };

  /* ── Submit ── */
  const procesarSubmit = (data) => {
    const payload = {
      ...data,
      precio_adulto: data.precio_adulto ? Number(data.precio_adulto) : null,
      precio_nino: data.precio_nino ? Number(data.precio_nino) : null,
      precio_infante: data.precio_infante ? Number(data.precio_infante) : null,
      duracion_dias: data.duracion_dias ? Number(data.duracion_dias) : null,
      duracion_noches: data.duracion_noches ? Number(data.duracion_noches) : null,
      incluye,
      no_incluye: noIncluye,
      costos: costos.filter((c) => c.operador && c.sistema && c.tipo).map((c) => ({
        ...c,
        fecha_cotizacion: c.fecha_cotizacion || HOY,
      })),
      alojamientos: alojamientos.filter((a) => a.hotel_id).map((a) => ({
        hotel_id: a.hotel_id,
        regimen: a.regimen || null,
        precio_single: a.precio_single ? Number(a.precio_single) : null,
        precio_doble: a.precio_doble ? Number(a.precio_doble) : null,
        precio_triple: a.precio_triple ? Number(a.precio_triple) : null,
        precio_cuadruple: a.precio_cuadruple ? Number(a.precio_cuadruple) : null,
        precio_menor: a.precio_menor ? Number(a.precio_menor) : null,
        precio_infante: a.precio_infante ? Number(a.precio_infante) : null,
      })),
    };
    onSubmit?.(payload);
  };

  return (
    <form
      className={styles.formulario}
      onSubmit={handleSubmit(procesarSubmit)}
      noValidate
    >
      {/* ══════════ Seccion 1: Info basica ══════════ */}
      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}>Informacion basica</h3>

        <div className={styles.filaDos}>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="titulo">Titulo *</label>
            <input
              id="titulo"
              type="text"
              className={`${styles.input} ${errors.titulo ? styles.inputError : ''}`}
              {...register('titulo', { required: 'El titulo es obligatorio' })}
              placeholder="Nombre del paquete"
            />
            {errors.titulo && <span className={styles.errorMsg}>{errors.titulo.message}</span>}
          </div>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="slug">Slug *</label>
            <input
              id="slug"
              type="text"
              className={`${styles.input} ${errors.slug ? styles.inputError : ''}`}
              {...register('slug', { required: 'El slug es obligatorio' })}
              placeholder="url-del-paquete"
              onChange={(e) => {
                setSlugManual(true);
                setValue('slug', e.target.value);
              }}
            />
            {errors.slug && <span className={styles.errorMsg}>{errors.slug.message}</span>}
          </div>
        </div>

        <div className={styles.campo}>
          <label className={styles.label} htmlFor="resumen">Resumen</label>
          <textarea
            id="resumen"
            className={styles.textarea}
            {...register('resumen', { maxLength: { value: 500, message: 'Maximo 500 caracteres' } })}
            placeholder="Breve resumen del paquete (max 500 caracteres)"
            rows={2}
          />
          {errors.resumen && <span className={styles.errorMsg}>{errors.resumen.message}</span>}
        </div>

        <div className={styles.campo}>
          <label className={styles.label} htmlFor="descripcion">Descripcion</label>
          <textarea
            id="descripcion"
            className={styles.textarea}
            {...register('descripcion')}
            placeholder="Descripcion completa del paquete"
            rows={5}
          />
        </div>
      </div>

      {/* ══════════ Seccion 2: Precios ══════════ */}
      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}>Precios</h3>

        <div className={styles.filaCuatro}>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="precio_adulto">Precio adulto {alojamientos.length === 0 && '*'}</label>
            <input
              id="precio_adulto"
              type="number"
              step="0.01"
              min="0"
              className={`${styles.input} ${errors.precio_adulto ? styles.inputError : ''}`}
              {...register('precio_adulto', { required: alojamientos.length === 0 ? 'Obligatorio' : false })}
              placeholder="0.00"
            />
            {errors.precio_adulto && <span className={styles.errorMsg}>{errors.precio_adulto.message}</span>}
          </div>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="precio_nino">Precio nino</label>
            <input
              id="precio_nino"
              type="number"
              step="0.01"
              min="0"
              className={styles.input}
              {...register('precio_nino')}
              placeholder="Opcional"
            />
          </div>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="precio_infante">Precio infante</label>
            <input
              id="precio_infante"
              type="number"
              step="0.01"
              min="0"
              className={styles.input}
              {...register('precio_infante')}
              placeholder="Opcional"
            />
          </div>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="moneda">Moneda</label>
            <select
              id="moneda"
              className={styles.select}
              {...register('moneda')}
            >
              {MONEDAS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ══════════ Seccion 3: Duracion ══════════ */}
      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}>Duracion</h3>

        <div className={styles.filaDos}>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="duracion_dias">Dias</label>
            <input
              id="duracion_dias"
              type="number"
              min="1"
              className={styles.input}
              {...register('duracion_dias')}
              placeholder="Ej: 7"
            />
          </div>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="duracion_noches">Noches</label>
            <input
              id="duracion_noches"
              type="number"
              min="0"
              className={styles.input}
              {...register('duracion_noches')}
              placeholder="Ej: 6"
            />
          </div>
        </div>
      </div>

      {/* ══════════ Seccion 4: Incluye / No incluye ══════════ */}
      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}>Incluye / No incluye</h3>

        <div className={styles.filaDos}>
          {/* Incluye */}
          <div className={styles.campo}>
            <label className={styles.label}>Incluye</label>
            <select
              className={styles.select}
              value=""
              onChange={(e) => {
                if (e.target.value && !incluye.includes(e.target.value)) {
                  setIncluye((prev) => [...prev, e.target.value]);
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
                onKeyDown={(e) => handleKeyDown(e, agregarIncluye)}
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
                  <button type="button" className={styles.itemEliminar} onClick={() => eliminarIncluye(i)}>
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* No incluye */}
          <div className={styles.campo}>
            <label className={styles.label}>No incluye</label>
            <select
              className={styles.select}
              value=""
              onChange={(e) => {
                if (e.target.value && !noIncluye.includes(e.target.value)) {
                  setNoIncluye((prev) => [...prev, e.target.value]);
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
                onKeyDown={(e) => handleKeyDown(e, agregarNoIncluye)}
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
                  <button type="button" className={styles.itemEliminar} onClick={() => eliminarNoIncluye(i)}>
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ Seccion 5: Condiciones ══════════ */}
      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}>Condiciones</h3>

        <div className={styles.campo}>
          <textarea
            id="condiciones"
            className={styles.textarea}
            {...register('condiciones')}
            placeholder="Condiciones generales del paquete, politicas de cancelacion, etc."
            rows={4}
          />
        </div>
      </div>

      {/* ══════════ Seccion 6: Etiquetas ══════════ */}
      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}>Etiquetas</h3>

        <Controller
          name="etiquetas_ids"
          control={control}
          render={({ field }) => (
            etiquetas.length === 0
              ? <p className={styles.sinDatos}>No hay etiquetas disponibles.</p>
              : <div className={styles.etqGrid}>
                  {etiquetas.map((categoria) => (
                    <EtiquetaMultiSelect
                      key={categoria.id}
                      categoria={categoria}
                      selectedIds={field.value || []}
                      onChange={(ids) => field.onChange(ids)}
                    />
                  ))}
                </div>
          )}
        />
      </div>

      {/* ══════════ Seccion 7: Destinos ══════════ */}
      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}>Destinos</h3>

        <Controller
          name="destinos_ids"
          control={control}
          render={({ field }) => (
            destinos.length === 0
              ? <p className={styles.sinDatos}>No hay destinos disponibles.</p>
              : <DestinoBuscadorForm
                  destinos={destinos}
                  selectedIds={field.value || []}
                  onChange={field.onChange}
                />
          )}
        />
      </div>

      {/* ══════════ Seccion 8: Opciones ══════════ */}
      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}>Opciones</h3>

        <div className={styles.opcionesCompactas}>
          {[
            { name: 'disponible', label: 'Disponible', desc: 'Visible en el sitio' },
            { name: 'destacado',  label: 'Destacado',  desc: 'Aparece en la home' },
          ].map(({ name, label, desc }) => (
            <Controller
              key={name}
              name={name}
              control={control}
              render={({ field }) => (
                <div className={styles.opcionItem}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={field.value}
                    className={`${styles.toggle} ${field.value ? styles.toggleActivo : ''}`}
                    onClick={() => field.onChange(!field.value)}
                  >
                    <span className={styles.toggleCircle} />
                  </button>
                  <div>
                    <span className={styles.opcionLabel}>{label}</span>
                    <span className={styles.opcionDesc}>{desc}</span>
                  </div>
                </div>
              )}
            />
          ))}
        </div>
      </div>

      {/* ══════════ Seccion 9: Costos internos ══════════ */}
      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}>Costos internos <span className={styles.soloAdmin}>(solo admin)</span></h3>

        {costos.length > 0 && (
          <div className={styles.costosLista}>
            {costos.map((c, i) => (
              <div key={i} className={styles.costoRow}>
                <span className={styles.costoTag}>{c.operador || '—'}</span>
                <span className={styles.costoTag}>{c.tipo || '—'}</span>
                <span className={styles.costoTag}>{c.sistema || '—'}</span>
                <span className={styles.costoNeto}>{c.neto ? `$${Number(c.neto).toLocaleString('es-UY')}` : '—'}</span>
                <div className={styles.costoAcciones}>
                  <button type="button" className={styles.costoBtn} onClick={() => abrirModalEditar(i)} title="Editar">
                    <FiEdit2 size={13} />
                  </button>
                  <button type="button" className={`${styles.costoBtn} ${styles.costoBtnEliminar}`} onClick={() => eliminarCosto(i)} title="Eliminar">
                    <FiX size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button type="button" className={styles.botonAgregarCosto} onClick={abrirModalNuevo}>
          <FiPlus size={14} /> Agregar fila
        </button>
      </div>

      {/* ── Modal costo ── */}
      {modalCosto && (
        <div className={styles.costoModalOverlay}>
          <div className={styles.costoModal}>
            <div className={styles.costoModalHeader}>
              <h3 className={styles.costoModalTitulo}>{modalCosto.idx === -1 ? 'Nuevo costo' : 'Editar costo'}</h3>
              <button type="button" className={styles.costoModalCerrar} onClick={cerrarModalCosto}><FiX size={18} /></button>
            </div>
            <div className={styles.costoModalGrid}>
              {[
                { label: 'Operador', campo: 'operador', opts: listaOperadores.map((o) => o.nombre) },
                { label: 'Sistema',  campo: 'sistema',  opts: ['Flying','Starling','GDS','Directo'] },
                { label: 'Tipo',     campo: 'tipo',     opts: ['Aéreo','Traslados','Hotel','Crucero','Seguro','Otros'] },
              ].map(({ label, campo, opts }) => (
                <label key={campo} className={styles.costoModalLabel}>
                  <span>{label}</span>
                  <select
                    className={styles.costoModalInput}
                    value={modalCosto.data[campo]}
                    onChange={(e) => setModalCosto((m) => ({ ...m, data: { ...m.data, [campo]: e.target.value } }))}
                  >
                    <option value="">—</option>
                    {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
              ))}
              <label className={styles.costoModalLabel}>
                <span>Bruto</span>
                <input type="number" className={styles.costoModalInput} placeholder="0.00"
                  value={modalCosto.data.bruto}
                  onChange={(e) => setModalCosto((m) => ({ ...m, data: { ...m.data, bruto: e.target.value } }))} />
              </label>
              <label className={styles.costoModalLabel}>
                <span>Neto</span>
                <input type="number" className={styles.costoModalInput} placeholder="0.00"
                  value={modalCosto.data.neto}
                  onChange={(e) => setModalCosto((m) => ({ ...m, data: { ...m.data, neto: e.target.value } }))} />
              </label>
              <label className={styles.costoModalLabel}>
                <span>Fecha cotización</span>
                <input type="date" className={styles.costoModalInput}
                  value={modalCosto.data.fecha_cotizacion}
                  onChange={(e) => setModalCosto((m) => ({ ...m, data: { ...m.data, fecha_cotizacion: e.target.value } }))} />
              </label>
            </div>
            <label className={styles.costoModalLabel}>
              <span>Notas</span>
              <textarea
                className={`${styles.costoModalInput} ${styles.costoModalTextarea}`}
                placeholder="Pegá aquí detalles adicionales, condiciones, observaciones..."
                value={modalCosto.data.notas}
                onChange={(e) => setModalCosto((m) => ({ ...m, data: { ...m.data, notas: e.target.value } }))}
              />
            </label>
            <div className={styles.costoModalFooter}>
              <button type="button" className={styles.costoModalCancelar} onClick={cerrarModalCosto}>Cancelar</button>
              <button type="button" className={styles.costoModalGuardar} onClick={guardarModalCosto}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Seccion 10: Alojamientos ══════════ */}
      <div className={styles.seccion}>
        <h3 className={styles.seccionTitulo}>Alojamientos</h3>

        {alojamientos.length > 0 && (
          <div className={styles.costosLista}>
            {alojamientos.map((a, i) => (
              <div key={i} className={styles.costoRow}>
                <span className={styles.alojHotel}>{a.hotel_nombre || a.hotel?.nombre || '—'}</span>
                {a.regimen && <span className={styles.costoTag}>{a.regimen}</span>}
                {a.precio_doble && (
                  <span className={styles.costoNeto}>Dbl: ${Number(a.precio_doble).toLocaleString('es-UY')}</span>
                )}
                <div className={styles.costoAcciones}>
                  <button type="button" className={styles.costoBtn} onClick={() => abrirModalEditarAloj(i)} title="Editar">
                    <FiEdit2 size={13} />
                  </button>
                  <button type="button" className={`${styles.costoBtn} ${styles.costoBtnEliminar}`} onClick={() => eliminarAloj(i)} title="Eliminar">
                    <FiX size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button type="button" className={styles.botonAgregarCosto} onClick={abrirModalNuevoAloj}>
          <FiPlus size={14} /> Agregar alojamiento
        </button>
      </div>

      {/* ── Modal alojamiento ── */}
      {modalAloj && (
        <div className={styles.costoModalOverlay}>
          <div className={`${styles.costoModal} ${styles.alojModal}`}>
            <div className={styles.costoModalHeader}>
              <h3 className={styles.costoModalTitulo}>{modalAloj.idx === -1 ? 'Nuevo alojamiento' : 'Editar alojamiento'}</h3>
              <button type="button" className={styles.costoModalCerrar} onClick={cerrarModalAloj}><FiX size={18} /></button>
            </div>

            <div className={styles.alojModalTop}>
              <label className={styles.costoModalLabel}>
                <span>Hotel</span>
                <HotelAutocomplete
                  destinosIds={destinosIds}
                  hotelNombre={modalAloj.data.hotel_nombre}
                  onChange={({ hotel_id, hotel_nombre }) =>
                    setModalAloj((m) => ({ ...m, data: { ...m.data, hotel_id, hotel_nombre } }))
                  }
                />
              </label>
              <label className={styles.costoModalLabel}>
                <span>Régimen</span>
                <select
                  className={styles.costoModalInput}
                  value={modalAloj.data.regimen}
                  onChange={(e) => setModalAloj((m) => ({ ...m, data: { ...m.data, regimen: e.target.value } }))}
                >
                  <option value="">— Sin especificar —</option>
                  {REGIMENES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
            </div>

            <div className={styles.alojPreciosGrid}>
              {[
                { key: 'precio_single',    label: 'Single' },
                { key: 'precio_doble',     label: 'Doble' },
                { key: 'precio_triple',    label: 'Triple' },
                { key: 'precio_cuadruple', label: 'Cuádruple' },
                { key: 'precio_menor',     label: 'Menor' },
                { key: 'precio_infante',   label: 'Infante' },
              ].map(({ key, label }) => (
                <label key={key} className={styles.costoModalLabel}>
                  <span>{label}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.costoModalInput}
                    placeholder="0.00"
                    value={modalAloj.data[key]}
                    onChange={(e) => setModalAloj((m) => ({ ...m, data: { ...m.data, [key]: e.target.value } }))}
                  />
                </label>
              ))}
            </div>

            <div className={styles.costoModalFooter}>
              <button type="button" className={styles.costoModalCancelar} onClick={cerrarModalAloj}>Cancelar</button>
              <button type="button" className={styles.costoModalGuardar} onClick={guardarModalAloj}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Boton guardar ══════════ */}
      <div className={styles.acciones}>
        <button
          type="submit"
          className={styles.botonGuardar}
          disabled={guardando}
        >
          <FiSave size={16} />
          {guardando ? 'Guardando...' : 'Guardar paquete'}
        </button>
      </div>
    </form>
  );
}
