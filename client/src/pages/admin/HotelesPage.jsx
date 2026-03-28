import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FiPlus, FiRefreshCw, FiAlertCircle, FiCheck, FiEdit2, FiTrash2, FiChevronDown, FiExternalLink, FiSearch, FiX, FiUpload } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import styles from './DestinosPage.module.css';
import hotelStyles from './HotelesPage.module.css';

const EMPTY_FORM = { nombre: '', ciudad: '', web_url: '', destino_id: '' };

export default function HotelesPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';
  const fileRef = useRef(null);

  const [destinos, setDestinos] = useState([]);
  const [hoteles, setHoteles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [abiertos, setAbiertos] = useState({});
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [guardando, setGuardando] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [eliminandoMulti, setEliminandoMulti] = useState(false);
  const [confirmMulti, setConfirmMulti] = useState(false);

  // Import state
  const [modalImport, setModalImport] = useState(false);
  const [importPreview, setImportPreview] = useState(null); // { rows, warnings }
  const [importando, setImportando] = useState(false);
  const [importResult, setImportResult] = useState(null); // { creados, omitidos, errores }

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [destRes, hotRes] = await Promise.all([
        api.get('/destinos'),
        api.get('/hoteles'),
      ]);
      setDestinos(destRes.data.destinos || []);
      setHoteles(hotRes.data.hoteles || []);
    } catch { setError('No se pudo cargar la información.'); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { if (exito) { const t = setTimeout(() => setExito(''), 4000); return () => clearTimeout(t); } }, [exito]);

  const toggleDestino = (id) => setAbiertos((prev) => ({ ...prev, [id]: !prev[id] }));

  const abrirNuevo = (destino_id) => { setForm({ ...EMPTY_FORM, destino_id }); setEditandoId(null); setModalAbierto(true); };
  const abrirEditar = (h) => { setForm({ nombre: h.nombre, ciudad: h.ciudad || '', web_url: h.web_url || '', destino_id: h.destino_id }); setEditandoId(h.id); setModalAbierto(true); };
  const cerrarModal = () => { setModalAbierto(false); setEditandoId(null); setForm(EMPTY_FORM); };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    setGuardando(true);
    try {
      const body = { nombre: form.nombre.trim(), destino_id: form.destino_id || null, ciudad: form.ciudad.trim() || null, web_url: form.web_url.trim() || null };
      if (editandoId) { await api.put(`/hoteles/${editandoId}`, body); setExito('Hotel actualizado.'); }
      else { await api.post('/hoteles', body); setExito('Hotel creado.'); }
      cerrarModal(); cargar();
    } catch (err) { setError(err.response?.data?.error || 'Error al guardar.'); }
    finally { setGuardando(false); }
  };

  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    try { await api.delete(`/hoteles/${confirmEliminar.id}`); setConfirmEliminar(null); setExito('Hotel eliminado.'); cargar(); }
    catch (err) { setError(err.response?.data?.error || 'Error al eliminar.'); setConfirmEliminar(null); }
  };

  const toggleSeleccion = (id) => setSeleccionados((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleTodos = (lista) => {
    const ids = lista.map((h) => h.id);
    const todosSelec = ids.every((id) => seleccionados.has(id));
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (todosSelec) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleEliminarMulti = async () => {
    setEliminandoMulti(true);
    let ok = 0, fail = 0;
    for (const id of seleccionados) {
      try { await api.delete(`/hoteles/${id}`); ok++; }
      catch { fail++; }
    }
    setEliminandoMulti(false);
    setConfirmMulti(false);
    setSeleccionados(new Set());
    setExito(`${ok} hotel${ok !== 1 ? 'es' : ''} eliminado${ok !== 1 ? 's' : ''}.${fail ? ` ${fail} con error.` : ''}`);
    cargar();
  };

  const normalizar = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const { destinosFiltrados, hotelesMap } = useMemo(() => {
    const q = normalizar(busqueda.trim());
    const map = {};
    destinos.forEach((d) => {
      const lista = hoteles.filter((h) => h.destino_id === d.id);
      if (!q) { map[d.id] = lista; return; }
      const hotelMatch = lista.filter((h) => normalizar(h.nombre).includes(q) || normalizar(h.ciudad).includes(q));
      const destinoMatch = normalizar(d.nombre).includes(q) || normalizar(d.pais).includes(q);
      if (destinoMatch || hotelMatch.length > 0) map[d.id] = destinoMatch ? lista : hotelMatch;
    });
    const filtrados = destinos.filter((d) => d.id in map);
    return { destinosFiltrados: filtrados, hotelesMap: map };
  }, [busqueda, destinos, hoteles]);

  useEffect(() => {
    if (busqueda.trim()) {
      const abiertosNuevos = {};
      destinosFiltrados.forEach((d) => { abiertosNuevos[d.id] = true; });
      setAbiertos(abiertosNuevos);
    }
  }, [busqueda, destinosFiltrados]);

  // ── Excel import ──
  const handleArchivoExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileRef.current) fileRef.current.value = '';

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        // Skip header row if first cell looks like a label
        const startRow = raw.length > 0 && typeof raw[0][0] === 'string' && isNaN(raw[0][0]) && !raw[0][1] ? 1 : 0;
        const rows = [];
        const warnings = [];

        raw.slice(startRow).forEach((row, i) => {
          const destinoNombre = String(row[0] || '').trim();
          const hotelNombre = String(row[1] || '').trim();
          const webUrl = String(row[2] || '').trim();

          if (!destinoNombre && !hotelNombre) return; // skip empty rows

          if (!hotelNombre) { warnings.push(`Fila ${startRow + i + 1}: sin nombre de hotel, se omite.`); return; }
          if (!destinoNombre) { warnings.push(`Fila ${startRow + i + 1}: sin destino para "${hotelNombre}", se omite.`); return; }

          // Match destino
          const destino = destinos.find((d) => normalizar(d.nombre) === normalizar(destinoNombre));
          if (!destino) {
            warnings.push(`Fila ${startRow + i + 1}: destino "${destinoNombre}" no encontrado, se omite.`);
            return;
          }

          rows.push({ destino_id: destino.id, destino_nombre: destino.nombre, nombre: hotelNombre, web_url: webUrl || null, ciudad: destinoNombre });
        });

        setImportPreview({ rows, warnings });
        setImportResult(null);
        setModalImport(true);
      } catch {
        setError('No se pudo leer el archivo. Asegurate de que sea un Excel válido (.xlsx o .xls).');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmarImport = async () => {
    if (!importPreview?.rows?.length) return;
    setImportando(true);
    let creados = 0, omitidos = 0, errores = 0;

    for (const row of importPreview.rows) {
      try {
        // Skip if hotel already exists in that destino
        const existe = hoteles.some(
          (h) => h.destino_id === row.destino_id && normalizar(h.nombre) === normalizar(row.nombre)
        );
        if (existe) { omitidos++; continue; }
        await api.post('/hoteles', { nombre: row.nombre, destino_id: row.destino_id, web_url: row.web_url, ciudad: row.ciudad });
        creados++;
      } catch { errores++; }
    }

    setImportando(false);
    setImportResult({ creados, omitidos, errores });
    cargar();
  };

  const cerrarImport = () => { setModalImport(false); setImportPreview(null); setImportResult(null); };

  const totalHoteles = hoteles.length;

  return (
    <div className={styles.pagina}>
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Hoteles</h1>
          <p className={styles.subtitulo}>{totalHoteles} hotel{totalHoteles !== 1 ? 'es' : ''} en {destinos.length} destinos</p>
        </div>
        <div className={styles.headerAcciones}>
          <button className={styles.botonSecundario} onClick={cargar} disabled={cargando}><FiRefreshCw size={14} /> Recargar</button>
          {seleccionados.size > 0 && esAdmin && (
            <button className={styles.botonPeligro} onClick={() => setConfirmMulti(true)}>
              <FiTrash2 size={14} /> Eliminar {seleccionados.size} seleccionado{seleccionados.size !== 1 ? 's' : ''}
            </button>
          )}
          <button className={styles.botonSecundario} onClick={() => fileRef.current?.click()}>
            <FiUpload size={14} /> Importar Excel
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleArchivoExcel} />
        </div>
      </div>

      {error && <div className={styles.alerta} role="alert"><FiAlertCircle size={15} /><span>{error}</span><button className={styles.alertaCerrar} onClick={() => setError('')}>×</button></div>}
      {exito && <div className={styles.alertaExito} role="status"><FiCheck size={15} /><span>{exito}</span><button className={styles.alertaCerrar} onClick={() => setExito('')}>×</button></div>}

      <div className={styles.buscadorWrap}>
        <FiSearch size={15} className={styles.buscadorIcono} />
        <input
          type="text"
          className={styles.buscadorInput}
          placeholder="Buscar por destino, país u hotel..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button className={styles.buscadorLimpiar} onClick={() => setBusqueda('')}>
            <FiX size={13} />
          </button>
        )}
      </div>

      {cargando && <div className={styles.cargando}>Cargando...</div>}

      {!cargando && (
        <div className={hotelStyles.acordeon}>
          {destinosFiltrados.length === 0 && busqueda && (
            <div className={styles.cargando}>Sin resultados para "{busqueda}"</div>
          )}
          {destinosFiltrados.map((d) => {
            const lista = hotelesMap[d.id] || [];
            const abierto = abiertos[d.id];
            return (
              <div key={d.id} className={hotelStyles.acordeonItem}>
                <button className={hotelStyles.acordeonHeader} onClick={() => toggleDestino(d.id)}>
                  <div className={hotelStyles.acordeonTitulo}>
                    <span className={hotelStyles.destinoNombre}>{d.nombre}</span>
                    {d.pais && <span className={hotelStyles.destinoPais}>{d.pais}</span>}
                    <span className={hotelStyles.hotelCount}>{lista.length} hotel{lista.length !== 1 ? 'es' : ''}</span>
                  </div>
                  <FiChevronDown size={16} className={`${hotelStyles.acordeonArrow} ${abierto ? hotelStyles.acordeonArrowOpen : ''}`} />
                </button>

                {abierto && (
                  <div className={hotelStyles.acordeonBody}>
                    {lista.length > 0 && (
                      <table className={hotelStyles.hotelTabla}>
                        <thead>
                          <tr>
                            {esAdmin && (
                              <th style={{ width: 36 }}>
                                <input
                                  type="checkbox"
                                  checked={lista.length > 0 && lista.every((h) => seleccionados.has(h.id))}
                                  onChange={() => toggleTodos(lista)}
                                />
                              </th>
                            )}
                            <th>Nombre</th><th>Ciudad</th><th>Web</th><th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lista.map((h) => (
                            <tr key={h.id} className={seleccionados.has(h.id) ? hotelStyles.filaSeleccionada : ''}>
                              {esAdmin && (
                                <td>
                                  <input type="checkbox" checked={seleccionados.has(h.id)} onChange={() => toggleSeleccion(h.id)} />
                                </td>
                              )}
                              <td className={hotelStyles.hotelNombre}>{h.nombre}</td>
                              <td>{h.ciudad || '—'}</td>
                              <td>
                                {h.web_url
                                  ? <a href={h.web_url} target="_blank" rel="noopener noreferrer" className={hotelStyles.webLink}><FiExternalLink size={13} /> Ver web</a>
                                  : '—'}
                              </td>
                              <td>
                                <div className={styles.tablaAcciones}>
                                  <button className={styles.botonIcono} onClick={() => abrirEditar(h)} title="Editar"><FiEdit2 size={14} /></button>
                                  {esAdmin && <button className={`${styles.botonIcono} ${styles.botonIconoPeligro}`} onClick={() => setConfirmEliminar(h)} title="Eliminar"><FiTrash2 size={14} /></button>}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {lista.length === 0 && <p className={hotelStyles.sinHoteles}>Sin hoteles cargados en este destino.</p>}
                    <button className={hotelStyles.botonAgregarHotel} onClick={() => abrirNuevo(d.id)}><FiPlus size={14} /> Agregar hotel</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal individual ── */}
      {modalAbierto && (
        <div className={styles.overlay} onClick={cerrarModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editandoId ? 'Editar hotel' : 'Nuevo hotel'}</h2>
            <form onSubmit={handleGuardar}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Nombre del hotel *</label>
                  <input className={styles.formInput} type="text" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Hotel Barceló" autoFocus />
                </div>
                <div className={styles.formGroup}>
                  <label>Ciudad</label>
                  <input className={styles.formInput} type="text" value={form.ciudad} onChange={(e) => setForm((p) => ({ ...p, ciudad: e.target.value }))} placeholder="Ej: Punta Cana" />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>URL del sitio web</label>
                <input className={styles.formInput} type="url" value={form.web_url} onChange={(e) => setForm((p) => ({ ...p, web_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div className={styles.modalAcciones}>
                <button type="button" className={styles.botonSecundario} onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className={styles.botonPrimario} disabled={!form.nombre.trim() || guardando}>{guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear hotel'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal importar Excel ── */}
      {modalImport && (
        <div className={styles.overlay} onClick={!importando ? cerrarImport : undefined}>
          <div className={hotelStyles.importModal} onClick={(e) => e.stopPropagation()}>
            <div className={hotelStyles.importHeader}>
              <h2 className={hotelStyles.importTitulo}>Importar desde Excel</h2>
              {!importando && <button className={styles.botonIcono} onClick={cerrarImport}><FiX size={18} /></button>}
            </div>

            {/* Resultado final */}
            {importResult && (
              <div className={hotelStyles.importResult}>
                <FiCheck size={32} className={hotelStyles.importResultIcon} />
                <p><strong>{importResult.creados}</strong> hotel{importResult.creados !== 1 ? 'es' : ''} creados</p>
                {importResult.omitidos > 0 && <p className={hotelStyles.importOmitido}>{importResult.omitidos} ya existían y fueron omitidos</p>}
                {importResult.errores > 0 && <p className={hotelStyles.importError}>{importResult.errores} con error</p>}
                <button className={styles.botonPrimario} onClick={cerrarImport} style={{ marginTop: 16 }}>Cerrar</button>
              </div>
            )}

            {/* Preview */}
            {!importResult && importPreview && (
              <>
                <p className={hotelStyles.importResumen}>
                  Se encontraron <strong>{importPreview.rows.length}</strong> hotel{importPreview.rows.length !== 1 ? 'es' : ''} para importar.
                  {importPreview.warnings.length > 0 && ` ${importPreview.warnings.length} fila${importPreview.warnings.length !== 1 ? 's' : ''} omitida${importPreview.warnings.length !== 1 ? 's' : ''}.`}
                </p>

                {importPreview.warnings.length > 0 && (
                  <div className={hotelStyles.importWarnings}>
                    {importPreview.warnings.map((w, i) => <p key={i}>{w}</p>)}
                  </div>
                )}

                {importPreview.rows.length > 0 && (
                  <div className={hotelStyles.importTablaWrap}>
                    <table className={hotelStyles.importTabla}>
                      <thead><tr><th>Destino</th><th>Hotel</th><th>Web</th></tr></thead>
                      <tbody>
                        {importPreview.rows.map((r, i) => (
                          <tr key={i}>
                            <td>{r.destino_nombre}</td>
                            <td>{r.nombre}</td>
                            <td>{r.web_url ? <a href={r.web_url} target="_blank" rel="noopener noreferrer" className={hotelStyles.webLink}><FiExternalLink size={12} /> Link</a> : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className={styles.modalAcciones}>
                  <button className={styles.botonSecundario} onClick={cerrarImport} disabled={importando}>Cancelar</button>
                  <button className={styles.botonPrimario} onClick={confirmarImport} disabled={importando || importPreview.rows.length === 0}>
                    {importando ? 'Importando...' : `Importar ${importPreview.rows.length} hotel${importPreview.rows.length !== 1 ? 'es' : ''}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Confirm eliminar múltiple ── */}
      {confirmMulti && (
        <div className={styles.overlay} onClick={() => !eliminandoMulti && setConfirmMulti(false)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <h3>Eliminar hoteles</h3>
            <p>¿Estás seguro de que deseas eliminar <strong>{seleccionados.size}</strong> hotel{seleccionados.size !== 1 ? 'es' : ''}? Esta acción no se puede deshacer.</p>
            <div className={styles.confirmAcciones}>
              <button className={styles.botonSecundario} onClick={() => setConfirmMulti(false)} disabled={eliminandoMulti}>Cancelar</button>
              <button className={styles.botonPeligro} onClick={handleEliminarMulti} disabled={eliminandoMulti}>
                <FiTrash2 size={14} /> {eliminandoMulti ? 'Eliminando...' : `Eliminar ${seleccionados.size}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm eliminar ── */}
      {confirmEliminar && (
        <div className={styles.overlay} onClick={() => setConfirmEliminar(null)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <h3>Eliminar hotel</h3>
            <p>¿Estás seguro de que deseas eliminar <strong>{confirmEliminar.nombre}</strong>?</p>
            <div className={styles.confirmAcciones}>
              <button className={styles.botonSecundario} onClick={() => setConfirmEliminar(null)}>Cancelar</button>
              <button className={styles.botonPeligro} onClick={handleEliminar}><FiTrash2 size={14} /> Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
