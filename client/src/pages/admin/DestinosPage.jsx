import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FiPlus, FiRefreshCw, FiAlertCircle, FiCheck, FiEdit2, FiTrash2, FiSearch, FiUpload, FiX } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import styles from './DestinosPage.module.css';

function PaisSelect({ value, onChange, className }) {
  const [query, setQuery] = useState(value || '');
  const [abierto, setAbierto] = useState(false);
  const wrapRef = useRef(null);

  // Sync query when value changes externally (e.g. opening edit modal)
  useEffect(() => { setQuery(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setAbierto(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtrados = useMemo(() => {
    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return q ? PAISES.filter((p) => p.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)) : PAISES;
  }, [query]);

  const seleccionar = (pais) => {
    setQuery(pais);
    onChange(pais);
    setAbierto(false);
  };

  const handleInput = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setAbierto(true);
  };

  const handleBlur = () => {
    // If typed value matches exactly a country, keep it; otherwise clear to last valid
    setTimeout(() => {
      if (!PAISES.includes(query) && query !== '') {
        const match = PAISES.find((p) => p.toLowerCase() === query.toLowerCase());
        if (match) { setQuery(match); onChange(match); }
      }
    }, 150);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        className={className}
        type="text"
        value={query}
        onChange={handleInput}
        onFocus={() => setAbierto(true)}
        onBlur={handleBlur}
        placeholder="Seleccionar país..."
        autoComplete="off"
      />
      {abierto && filtrados.length > 0 && (
        <ul style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999,
          background: '#fff', border: '1.5px solid var(--color-borde)',
          borderRadius: 'var(--radio-md)', maxHeight: 220, overflowY: 'auto',
          margin: 0, padding: 0, listStyle: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          {filtrados.map((p) => (
            <li
              key={p}
              onMouseDown={() => seleccionar(p)}
              style={{
                padding: '8px 12px', cursor: 'pointer', fontSize: '0.875rem',
                background: p === value ? 'var(--color-verde-claro, #f0faf4)' : 'transparent',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = p === value ? 'var(--color-verde-claro, #f0faf4)' : 'transparent'}
            >
              {p}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const PAISES = [
  'Afganistán','Albania','Alemania','Andorra','Angola','Antigua y Barbuda','Arabia Saudita',
  'Argelia','Argentina','Armenia','Australia','Austria','Azerbaiyán','Bahamas','Bangladés',
  'Barbados','Baréin','Bélgica','Belice','Benín','Bielorrusia','Bolivia','Bosnia y Herzegovina',
  'Botsuana','Brasil','Brunéi','Bulgaria','Burkina Faso','Burundi','Bután','Cabo Verde',
  'Camboya','Camerún','Canadá','Catar','Chad','Chile','China','Chipre','Colombia','Comoras',
  'Congo','Corea del Norte','Corea del Sur','Costa de Marfil','Costa Rica','Croacia','Cuba',
  'Dinamarca','Dominica','Ecuador','Egipto','El Salvador','Emiratos Árabes Unidos','Eritrea',
  'Eslovaquia','Eslovenia','España','Estados Unidos','Estonia','Etiopía','Filipinas','Finlandia',
  'Fiyi','Francia','Gabón','Gambia','Georgia','Ghana','Granada','Grecia','Guatemala','Guinea',
  'Guinea-Bisáu','Guinea Ecuatorial','Guyana','Haití','Honduras','Hungría','India','Indonesia',
  'Irak','Irán','Irlanda','Islandia','Islas Marshall','Islas Salomón','Israel','Italia','Jamaica',
  'Japón','Jordania','Kazajistán','Kenia','Kirguistán','Kiribati','Kuwait','Laos','Lesoto',
  'Letonia','Líbano','Liberia','Libia','Liechtenstein','Lituania','Luxemburgo','Madagascar',
  'Malasia','Malaui','Maldivas','Malí','Malta','Marruecos','Mauricio','Mauritania','México',
  'Micronesia','Moldavia','Mónaco','Mongolia','Montenegro','Mozambique','Namibia','Nauru',
  'Nepal','Nicaragua','Níger','Nigeria','Noruega','Nueva Zelanda','Omán','Países Bajos',
  'Pakistán','Palaos','Panamá','Papúa Nueva Guinea','Paraguay','Perú','Polonia','Portugal',
  'Reino Unido','República Centroafricana','República Checa','República Democrática del Congo',
  'República Dominicana','Ruanda','Rumania','Rusia','Samoa','San Cristóbal y Nieves',
  'San Marino','San Vicente y las Granadinas','Santa Lucía','Santo Tomé y Príncipe','Senegal',
  'Serbia','Seychelles','Sierra Leona','Singapur','Siria','Somalia','Sri Lanka','Suazilandia',
  'Sudáfrica','Sudán','Sudán del Sur','Suecia','Suiza','Surinam','Tailandia','Tanzania',
  'Tayikistán','Timor Oriental','Togo','Tonga','Trinidad y Tobago','Túnez','Turkmenistán',
  'Turquía','Tuvalu','Ucrania','Uganda','Uruguay','Uzbekistán','Vanuatu','Venezuela',
  'Vietnam','Yemen','Yibuti','Zambia','Zimbabue',
];

const REGIONES = [
  'América del Norte',
  'América Central y Caribe',
  'América del Sur',
  'Europa',
  'Asia',
  'África',
  'Oceanía',
  'Medio Oriente',
];

const EMPTY_FORM = { nombre: '', slug: '', pais: '', region: '', imagen: '' };

const SERVER_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

function imagenSrc(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${SERVER_URL}${url}`;
}

export default function DestinosPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';

  const [destinos, setDestinos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [autoSlug, setAutoSlug] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Imagen upload
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [previewImagen, setPreviewImagen] = useState('');
  const fileRef = useRef(null);

  // Bulk delete
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [eliminandoBulk, setEliminandoBulk] = useState(false);

  // Delete confirm
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const { data } = await api.get('/destinos');
      setDestinos(data.destinos || []);
    } catch {
      setError('No se pudieron cargar los destinos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    if (exito) {
      const t = setTimeout(() => setExito(''), 3000);
      return () => clearTimeout(t);
    }
  }, [exito]);

  const destinosFiltrados = destinos.filter((d) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      d.nombre?.toLowerCase().includes(q) ||
      d.pais?.toLowerCase().includes(q) ||
      d.region?.toLowerCase().includes(q)
    );
  });

  const abrirNuevo = () => {
    setForm(EMPTY_FORM);
    setPreviewImagen('');
    setAutoSlug(true);
    setEditandoId(null);
    setModalAbierto(true);
  };

  const abrirEditar = (destino) => {
    setForm({
      nombre: destino.nombre,
      slug: destino.slug,
      pais: destino.pais || '',
      region: destino.region || '',
      imagen: destino.imagen || '',
    });
    setPreviewImagen(destino.imagen ? imagenSrc(destino.imagen) : '');
    setAutoSlug(false);
    setEditandoId(destino.id);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setForm(EMPTY_FORM);
    setPreviewImagen('');
  };

  const handleChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'nombre' && autoSlug) updated.slug = slugify(value);
      if (field === 'slug') setAutoSlug(false);
      if (field === 'imagen') setPreviewImagen(value);
      return updated;
    });
  };

  const handleArchivoImagen = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo || !editandoId) return;

    setSubiendoImagen(true);
    try {
      const fd = new FormData();
      fd.append('imagen', archivo);
      const { data } = await api.post(`/destinos/${editandoId}/imagen`, fd);
      const src = imagenSrc(data.imagen);
      setForm((prev) => ({ ...prev, imagen: data.imagen }));
      setPreviewImagen(src);
      setExito('Imagen subida correctamente.');
      cargar();
    } catch (err) {
      setError('Error al subir la imagen: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubiendoImagen(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    setGuardando(true);
    try {
      const body = {
        nombre: form.nombre.trim(),
        slug: form.slug.trim() || slugify(form.nombre),
        pais: form.pais.trim(),
        region: form.region,
        imagen: form.imagen.trim() || null,
      };
      if (editandoId) {
        await api.put(`/destinos/${editandoId}`, body);
        setExito('Destino actualizado correctamente.');
      } else {
        await api.post('/destinos', body);
        setExito('Destino creado correctamente.');
      }
      cerrarModal();
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el destino.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    try {
      await api.delete(`/destinos/${confirmEliminar.id}`);
      setConfirmEliminar(null);
      setExito('Destino eliminado.');
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar el destino.');
      setConfirmEliminar(null);
    }
  };

  const toggleSeleccion = (id) => setSeleccionados((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleTodos = () => {
    const ids = destinosFiltrados.map((d) => d.id);
    const todosSelec = ids.every((id) => seleccionados.has(id));
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (todosSelec) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleEliminarBulk = async () => {
    setEliminandoBulk(true);
    let ok = 0, fail = 0;
    for (const id of seleccionados) {
      try { await api.delete(`/destinos/${id}`); ok++; }
      catch { fail++; }
    }
    setEliminandoBulk(false);
    setConfirmBulk(false);
    setSeleccionados(new Set());
    setExito(`${ok} destino${ok !== 1 ? 's' : ''} eliminado${ok !== 1 ? 's' : ''}.${fail ? ` ${fail} con error.` : ''}`);
    cargar();
  };

  return (
    <div className={styles.pagina}>
      {/* Header */}
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Destinos</h1>
          <p className={styles.subtitulo}>
            {destinos.length > 0
              ? `${destinos.length} destino${destinos.length !== 1 ? 's' : ''} registrados`
              : 'Gestión de destinos'}
          </p>
        </div>
        <div className={styles.headerAcciones}>
          <button className={styles.botonSecundario} onClick={cargar} disabled={cargando}>
            <FiRefreshCw size={14} />
            Recargar
          </button>
          {seleccionados.size > 0 && esAdmin && (
            <button className={styles.botonPeligro} onClick={() => setConfirmBulk(true)}>
              <FiTrash2 size={14} /> Eliminar {seleccionados.size} seleccionado{seleccionados.size !== 1 ? 's' : ''}
            </button>
          )}
          <button className={styles.botonPrimario} onClick={abrirNuevo}>
            <FiPlus size={15} />
            Nuevo destino
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className={styles.alerta} role="alert">
          <FiAlertCircle size={15} />
          <span>{error}</span>
          <button className={styles.alertaCerrar} onClick={() => setError('')}>×</button>
        </div>
      )}
      {exito && (
        <div className={styles.alertaExito} role="status">
          <FiCheck size={15} />
          <span>{exito}</span>
          <button className={styles.alertaCerrar} onClick={() => setExito('')}>×</button>
        </div>
      )}

      {/* Buscador */}
      <div className={styles.buscadorWrap}>
        <FiSearch size={15} className={styles.buscadorIcono} />
        <input
          type="text"
          className={styles.buscadorInput}
          placeholder="Buscar por nombre, país o región..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button className={styles.buscadorLimpiar} onClick={() => setBusqueda('')}>
            <FiX size={13} />
          </button>
        )}
      </div>

      {/* Loading */}
      {cargando && <div className={styles.cargando}>Cargando destinos...</div>}

      {/* Table */}
      {!cargando && destinosFiltrados.length > 0 && (
        <table className={styles.tabla}>
          <thead>
            <tr>
              {esAdmin && (
                <th style={{ width: 36 }}>
                  <input
                    type="checkbox"
                    checked={destinosFiltrados.length > 0 && destinosFiltrados.every((d) => seleccionados.has(d.id))}
                    onChange={toggleTodos}
                  />
                </th>
              )}
              <th>Foto</th>
              <th>Nombre</th>
              <th>País</th>
              <th>Región</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {destinosFiltrados.map((d) => (
              <tr key={d.id} className={seleccionados.has(d.id) ? styles.filaSeleccionada : ''}>
                {esAdmin && (
                  <td>
                    <input type="checkbox" checked={seleccionados.has(d.id)} onChange={() => toggleSeleccion(d.id)} />
                  </td>
                )}
                <td>
                  {d.imagen ? (
                    <img
                      src={imagenSrc(d.imagen)}
                      alt={d.nombre}
                      className={styles.thumbImg}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className={styles.thumbVacio}>—</div>
                  )}
                </td>
                <td>
                  <span className={styles.nombreDestino}>{d.nombre}</span>
                  <span className={styles.slugDestino}>{d.slug}</span>
                </td>
                <td>{d.pais || '—'}</td>
                <td>{d.region || '—'}</td>
                <td>
                  <div className={styles.tablaAcciones}>
                    <button className={styles.botonIcono} onClick={() => abrirEditar(d)} title="Editar">
                      <FiEdit2 size={15} />
                    </button>
                    {esAdmin && (
                      <button
                        className={`${styles.botonIcono} ${styles.botonIconoPeligro}`}
                        onClick={() => setConfirmEliminar(d)}
                        title="Eliminar"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!cargando && destinosFiltrados.length === 0 && (
        <div className={styles.cargando}>
          {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay destinos registrados.'}
        </div>
      )}

      {/* Modal create/edit */}
      {modalAbierto && (
        <div className={styles.overlay} onClick={cerrarModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editandoId ? 'Editar destino' : 'Nuevo destino'}</h2>
            <form onSubmit={handleGuardar}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Nombre *</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    value={form.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    placeholder="Ej: Cusco"
                    autoFocus
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>País</label>
                  <PaisSelect
                    className={styles.formInput}
                    value={form.pais}
                    onChange={(val) => handleChange('pais', val)}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Slug</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    value={form.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="cusco-peru"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Región</label>
                  <select
                    className={styles.formInput}
                    value={form.region}
                    onChange={(e) => handleChange('region', e.target.value)}
                  >
                    <option value="">Seleccionar región...</option>
                    {REGIONES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Imagen */}
              <div className={styles.formGroup}>
                <label>Imagen del destino</label>
                <div className={styles.imagenWrap}>
                  {previewImagen && (
                    <div className={styles.imagenPreview}>
                      <img
                        src={previewImagen}
                        alt="Preview"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className={styles.imagenControles}>
                    <input
                      className={styles.formInput}
                      type="text"
                      value={form.imagen}
                      onChange={(e) => handleChange('imagen', e.target.value)}
                      placeholder="https://... o subí un archivo"
                    />
                    {editandoId && (
                      <>
                        <button
                          type="button"
                          className={styles.botonSubir}
                          onClick={() => fileRef.current?.click()}
                          disabled={subiendoImagen}
                        >
                          <FiUpload size={13} />
                          {subiendoImagen ? 'Subiendo...' : 'Subir foto'}
                        </button>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: 'none' }}
                          onChange={handleArchivoImagen}
                        />
                      </>
                    )}
                    {!editandoId && (
                      <p className={styles.imagenHint}>
                        Guardá primero el destino para poder subir una foto.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.modalAcciones}>
                <button type="button" className={styles.botonSecundario} onClick={cerrarModal}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.botonPrimario}
                  disabled={!form.nombre.trim() || guardando}
                >
                  {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear destino'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk delete confirm */}
      {confirmBulk && (
        <div className={styles.overlay} onClick={() => !eliminandoBulk && setConfirmBulk(false)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <h3>Eliminar destinos</h3>
            <p>
              ¿Estás seguro de que deseas eliminar <strong>{seleccionados.size}</strong> destino{seleccionados.size !== 1 ? 's' : ''}?
              Esta acción no se puede deshacer.
            </p>
            <div className={styles.confirmAcciones}>
              <button className={styles.botonSecundario} onClick={() => setConfirmBulk(false)} disabled={eliminandoBulk}>
                Cancelar
              </button>
              <button className={styles.botonPeligro} onClick={handleEliminarBulk} disabled={eliminandoBulk}>
                <FiTrash2 size={14} /> {eliminandoBulk ? 'Eliminando...' : `Eliminar ${seleccionados.size}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmEliminar && (
        <div className={styles.overlay} onClick={() => setConfirmEliminar(null)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <h3>Eliminar destino</h3>
            <p>
              ¿Estás seguro de que deseas eliminar <strong>{confirmEliminar.nombre}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className={styles.confirmAcciones}>
              <button className={styles.botonSecundario} onClick={() => setConfirmEliminar(null)}>
                Cancelar
              </button>
              <button className={styles.botonPeligro} onClick={handleEliminar}>
                <FiTrash2 size={14} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
