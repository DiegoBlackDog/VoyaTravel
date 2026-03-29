import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiPlus, FiRefreshCw, FiAlertCircle, FiCheck,
  FiEdit2, FiTrash2, FiSearch, FiX, FiSave, FiUpload,
} from 'react-icons/fi';
import api from '../../services/api';
import styles from './DestinosPage.module.css';

const VACIO = { nombre: '', ciudad: '', pais: '', iata: '', icao: '' };

export default function AeropuertosPage() {
  const [aeropuertos, setAeropuertos] = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState('');
  const [exito, setExito]         = useState('');
  const [busqueda, setBusqueda]   = useState('');
  const [modal, setModal]         = useState(null); // null | { data, esEdicion }
  const [guardando, setGuardando] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(null);
  const [importando, setImportando] = useState(false);
  const fileRef = useRef(null);

  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try {
      const { data } = await api.get('/aeropuertos', { params: busqueda ? { busqueda } : {} });
      setAeropuertos(data.aeropuertos || []);
    } catch { setError('No se pudo cargar.'); }
    finally { setCargando(false); }
  }, [busqueda]);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => {
    if (exito) { const t = setTimeout(() => setExito(''), 4000); return () => clearTimeout(t); }
  }, [exito]);

  const abrirNuevo  = () => setModal({ data: { ...VACIO }, esEdicion: false });
  const abrirEditar = (a) => setModal({ data: { nombre: a.nombre || '', ciudad: a.ciudad || '', pais: a.pais || '', iata: a.iata || '', icao: a.icao || '' }, esEdicion: true, id: a.id });
  const setField    = (k, v) => setModal((m) => ({ ...m, data: { ...m.data, [k]: v } }));

  const handleGuardar = async () => {
    if (!modal.data.nombre.trim()) { setError('El nombre es obligatorio.'); return; }
    setGuardando(true); setError('');
    try {
      if (modal.esEdicion) {
        await api.put(`/aeropuertos/${modal.id}`, modal.data);
        setExito('Aeropuerto actualizado.');
      } else {
        await api.post('/aeropuertos', modal.data);
        setExito('Aeropuerto creado.');
      }
      setModal(null); cargar();
    } catch (err) { setError(err.response?.data?.error || 'Error al guardar.'); }
    finally { setGuardando(false); }
  };

  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    try {
      await api.delete(`/aeropuertos/${confirmEliminar.id}`);
      setConfirmEliminar(null); setExito('Eliminado.'); cargar();
    } catch (err) { setError(err.response?.data?.error || 'Error.'); setConfirmEliminar(null); }
  };

  const handleImportar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportando(true); setError('');
    const fd = new FormData();
    fd.append('archivo', file);
    try {
      const { data } = await api.post('/aeropuertos/importar/excel', fd);
      setExito(`${data.importados} aeropuertos importados.`); cargar();
    } catch (err) { setError(err.response?.data?.error || 'Error al importar.'); }
    finally { setImportando(false); e.target.value = ''; }
  };

  return (
    <div className={styles.pagina}>
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Aeropuertos</h1>
          <p className={styles.subtitulo}>{aeropuertos.length} registros</p>
        </div>
        <div className={styles.headerAcciones}>
          <button className={styles.botonSecundario} onClick={cargar} disabled={cargando}>
            <FiRefreshCw size={14} /> Recargar
          </button>
          <button className={styles.botonSecundario} onClick={() => fileRef.current?.click()} disabled={importando}>
            <FiUpload size={14} /> {importando ? 'Importando...' : 'Importar Excel'}
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImportar} />
          <button className={styles.botonPrimario} onClick={abrirNuevo}>
            <FiPlus size={14} /> Nuevo aeropuerto
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.alerta} role="alert">
          <FiAlertCircle size={15} /><span>{error}</span>
          <button className={styles.alertaCerrar} onClick={() => setError('')}>×</button>
        </div>
      )}
      {exito && (
        <div className={styles.alertaExito} role="status">
          <FiCheck size={15} /><span>{exito}</span>
          <button className={styles.alertaCerrar} onClick={() => setExito('')}>×</button>
        </div>
      )}

      <div className={styles.buscadorWrap}>
        <FiSearch size={15} className={styles.buscadorIcono} />
        <input
          className={styles.buscadorInput}
          type="text"
          placeholder="Buscar por nombre, ciudad, país, IATA, ICAO..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button className={styles.buscadorLimpiar} onClick={() => setBusqueda('')}><FiX size={13} /></button>
        )}
      </div>

      {cargando ? (
        <div className={styles.cargando}>Cargando...</div>
      ) : aeropuertos.length === 0 ? (
        <div className={styles.cargando}>{busqueda ? `Sin resultados para "${busqueda}"` : 'No hay aeropuertos todavía.'}</div>
      ) : (
        <div className={styles.tablaWrap}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ciudad</th>
                <th>País</th>
                <th>IATA</th>
                <th>ICAO</th>
                <th className={styles.thAcciones}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {aeropuertos.map((a) => (
                <tr key={a.id}>
                  <td>{a.nombre}</td>
                  <td>{a.ciudad || '—'}</td>
                  <td>{a.pais   || '—'}</td>
                  <td><code>{a.iata || '—'}</code></td>
                  <td><code>{a.icao || '—'}</code></td>
                  <td className={styles.tdAcciones}>
                    <div className={styles.tablaAcciones}>
                      <button className={styles.botonIcono} onClick={() => abrirEditar(a)} title="Editar"><FiEdit2 size={14} /></button>
                      <button className={`${styles.botonIcono} ${styles.botonIconoPeligro}`} onClick={() => setConfirmEliminar(a)} title="Eliminar"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear/editar */}
      {modal && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitulo}>{modal.esEdicion ? 'Editar aeropuerto' : 'Nuevo aeropuerto'}</h2>
              <button className={styles.modalCerrar} onClick={() => setModal(null)}><FiX size={18} /></button>
            </div>
            <div className={styles.modalBody}>
              {[
                { key: 'nombre', label: 'Nombre *',     placeholder: 'Ej: Aeropuerto Internacional de Carrasco' },
                { key: 'ciudad', label: 'Ciudad',        placeholder: 'Ej: Montevideo' },
                { key: 'pais',   label: 'País',          placeholder: 'Ej: Uruguay' },
                { key: 'iata',   label: 'IATA',          placeholder: 'Ej: MVD' },
                { key: 'icao',   label: 'ICAO',          placeholder: 'Ej: SUMU' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className={styles.grupo}>
                  <label>{label}</label>
                  <input
                    className={styles.input}
                    type="text"
                    value={modal.data[key]}
                    onChange={(e) => setField(key, e.target.value)}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.botonSecundario} onClick={() => setModal(null)}>Cancelar</button>
              <button className={styles.botonPrimario} onClick={handleGuardar} disabled={guardando}>
                <FiSave size={14} /> {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm eliminar */}
      {confirmEliminar && (
        <div className={styles.overlay} onClick={() => setConfirmEliminar(null)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <h3>Eliminar aeropuerto</h3>
            <p>¿Eliminar <strong>{confirmEliminar.nombre}</strong>?</p>
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
