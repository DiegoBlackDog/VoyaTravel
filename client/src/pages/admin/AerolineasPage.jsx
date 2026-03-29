import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiPlus, FiRefreshCw, FiAlertCircle, FiCheck,
  FiEdit2, FiTrash2, FiSearch, FiX, FiSave, FiUpload, FiImage,
} from 'react-icons/fi';
import api from '../../services/api';
import styles from './DestinosPage.module.css';
import propios from './AerolineasPage.module.css';

const VACIO = { iata: '', icao: '', nombre: '', pais_region: '' };
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function AerolineasPage() {
  const [aerolineas, setAerolineas]   = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState('');
  const [exito, setExito]             = useState('');
  const [busqueda, setBusqueda]       = useState('');
  const [modal, setModal]             = useState(null);
  const [guardando, setGuardando]     = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(null);
  const [importando, setImportando]   = useState(false);
  const [imgPreview, setImgPreview]   = useState(null);
  const [imgFile, setImgFile]         = useState(null);
  const fileRef    = useRef(null);
  const imgRef     = useRef(null);

  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try {
      const { data } = await api.get('/aerolineas', { params: busqueda ? { busqueda } : {} });
      setAerolineas(data.aerolineas || []);
    } catch { setError('No se pudo cargar.'); }
    finally { setCargando(false); }
  }, [busqueda]);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => {
    if (exito) { const t = setTimeout(() => setExito(''), 4000); return () => clearTimeout(t); }
  }, [exito]);

  const abrirNuevo  = () => { setModal({ data: { ...VACIO }, esEdicion: false }); setImgPreview(null); setImgFile(null); };
  const abrirEditar = (a) => {
    setModal({ data: { iata: a.iata || '', icao: a.icao || '', nombre: a.nombre || '', pais_region: a.pais_region || '' }, esEdicion: true, id: a.id });
    setImgPreview(a.imagen ? `${API_URL}${a.imagen}` : null);
    setImgFile(null);
  };
  const setField = (k, v) => setModal((m) => ({ ...m, data: { ...m.data, [k]: v } }));

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const handleGuardar = async () => {
    if (!modal.data.nombre.trim()) { setError('El nombre es obligatorio.'); return; }
    setGuardando(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(modal.data).forEach(([k, v]) => fd.append(k, v));
      if (imgFile) fd.append('imagen', imgFile);

      if (modal.esEdicion) {
        await api.put(`/aerolineas/${modal.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setExito('Aerolínea actualizada.');
      } else {
        await api.post('/aerolineas', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setExito('Aerolínea creada.');
      }
      setModal(null); cargar();
    } catch (err) { setError(err.response?.data?.error || 'Error al guardar.'); }
    finally { setGuardando(false); }
  };

  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    try {
      await api.delete(`/aerolineas/${confirmEliminar.id}`);
      setConfirmEliminar(null); setExito('Eliminada.'); cargar();
    } catch (err) { setError(err.response?.data?.error || 'Error.'); setConfirmEliminar(null); }
  };

  const handleImportar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportando(true); setError('');
    const fd = new FormData();
    fd.append('archivo', file);
    try {
      const { data } = await api.post('/aerolineas/importar/excel', fd);
      setExito(`${data.importados} aerolíneas importadas.`); cargar();
    } catch (err) { setError(err.response?.data?.error || 'Error al importar.'); }
    finally { setImportando(false); e.target.value = ''; }
  };

  return (
    <div className={styles.pagina}>
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Aerolíneas</h1>
          <p className={styles.subtitulo}>{aerolineas.length} registros</p>
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
            <FiPlus size={14} /> Nueva aerolínea
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
          placeholder="Buscar por nombre, IATA, ICAO, país..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button className={styles.buscadorLimpiar} onClick={() => setBusqueda('')}><FiX size={13} /></button>
        )}
      </div>

      {cargando ? (
        <div className={styles.cargando}>Cargando...</div>
      ) : aerolineas.length === 0 ? (
        <div className={styles.cargando}>{busqueda ? `Sin resultados para "${busqueda}"` : 'No hay aerolíneas todavía.'}</div>
      ) : (
        <div className={styles.tablaWrap}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Logo</th>
                <th>Nombre</th>
                <th>IATA</th>
                <th>ICAO</th>
                <th>País / Región</th>
                <th className={styles.thAcciones}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {aerolineas.map((a) => (
                <tr key={a.id}>
                  <td>
                    {a.imagen
                      ? <img src={`${API_URL}${a.imagen}`} alt={a.nombre} className={propios.logo} />
                      : <span className={propios.sinLogo}><FiImage size={16} /></span>}
                  </td>
                  <td>{a.nombre}</td>
                  <td><code>{a.iata || '—'}</code></td>
                  <td><code>{a.icao || '—'}</code></td>
                  <td>{a.pais_region || '—'}</td>
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
              <h2 className={styles.modalTitulo}>{modal.esEdicion ? 'Editar aerolínea' : 'Nueva aerolínea'}</h2>
              <button className={styles.modalCerrar} onClick={() => setModal(null)}><FiX size={18} /></button>
            </div>
            <div className={styles.modalBody}>
              {[
                { key: 'nombre',      label: 'Nombre *',     placeholder: 'Ej: LATAM Airlines' },
                { key: 'iata',        label: 'IATA',          placeholder: 'Ej: LA' },
                { key: 'icao',        label: 'ICAO',          placeholder: 'Ej: LAN' },
                { key: 'pais_region', label: 'País / Región', placeholder: 'Ej: Chile' },
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
              {/* Imagen */}
              <div className={styles.grupo}>
                <label>Logo / Imagen</label>
                <div className={propios.imgWrap}>
                  {imgPreview
                    ? <img src={imgPreview} alt="preview" className={propios.imgPreview} />
                    : <div className={propios.imgPlaceholder}><FiImage size={28} /></div>}
                  <button type="button" className={styles.botonSecundario} onClick={() => imgRef.current?.click()}>
                    <FiUpload size={13} /> {imgPreview ? 'Cambiar imagen' : 'Subir imagen'}
                  </button>
                  <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImgChange} />
                </div>
              </div>
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

      {confirmEliminar && (
        <div className={styles.overlay} onClick={() => setConfirmEliminar(null)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <h3>Eliminar aerolínea</h3>
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
