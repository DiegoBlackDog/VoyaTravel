import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiRefreshCw, FiAlertCircle, FiCheck, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import styles from './DestinosPage.module.css';

const EMPTY_FORM = { nombre: '', comision: '', contacto: '', telefono: '' };

export default function OperadoresPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';

  const [operadores, setOperadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [guardando, setGuardando] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const { data } = await api.get('/operadores');
      setOperadores(data.operadores || []);
    } catch { setError('No se pudieron cargar los operadores.'); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { if (exito) { const t = setTimeout(() => setExito(''), 3000); return () => clearTimeout(t); } }, [exito]);

  const abrirNuevo = () => { setForm(EMPTY_FORM); setEditandoId(null); setModalAbierto(true); };
  const abrirEditar = (op) => { setForm({ nombre: op.nombre, comision: op.comision ?? '', contacto: op.contacto || '', telefono: op.telefono || '' }); setEditandoId(op.id); setModalAbierto(true); };
  const cerrarModal = () => { setModalAbierto(false); setEditandoId(null); setForm(EMPTY_FORM); };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    setGuardando(true);
    try {
      const body = { nombre: form.nombre.trim(), comision: form.comision !== '' ? Number(form.comision) : null, contacto: form.contacto.trim() || null, telefono: form.telefono.trim() || null };
      if (editandoId) { await api.put(`/operadores/${editandoId}`, body); setExito('Operador actualizado.'); }
      else { await api.post('/operadores', body); setExito('Operador creado.'); }
      cerrarModal(); cargar();
    } catch (err) { setError(err.response?.data?.error || 'Error al guardar.'); }
    finally { setGuardando(false); }
  };

  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    try { await api.delete(`/operadores/${confirmEliminar.id}`); setConfirmEliminar(null); setExito('Operador eliminado.'); cargar(); }
    catch (err) { setError(err.response?.data?.error || 'Error al eliminar.'); setConfirmEliminar(null); }
  };

  return (
    <div className={styles.pagina}>
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Operadores</h1>
          <p className={styles.subtitulo}>{operadores.length} operador{operadores.length !== 1 ? 'es' : ''} registrados</p>
        </div>
        <div className={styles.headerAcciones}>
          <button className={styles.botonSecundario} onClick={cargar} disabled={cargando}><FiRefreshCw size={14} /> Recargar</button>
          <button className={styles.botonPrimario} onClick={abrirNuevo}><FiPlus size={15} /> Nuevo operador</button>
        </div>
      </div>

      {error && <div className={styles.alerta} role="alert"><FiAlertCircle size={15} /><span>{error}</span><button className={styles.alertaCerrar} onClick={() => setError('')}>×</button></div>}
      {exito && <div className={styles.alertaExito} role="status"><FiCheck size={15} /><span>{exito}</span><button className={styles.alertaCerrar} onClick={() => setExito('')}>×</button></div>}

      {cargando && <div className={styles.cargando}>Cargando...</div>}

      {!cargando && operadores.length > 0 && (
        <table className={styles.tabla}>
          <thead><tr><th>Nombre</th><th>Comisión</th><th>Contacto</th><th>Teléfono</th><th>Acciones</th></tr></thead>
          <tbody>
            {operadores.map((op) => (
              <tr key={op.id}>
                <td><span className={styles.nombreDestino}>{op.nombre}</span></td>
                <td>{op.comision != null ? `${op.comision}%` : '—'}</td>
                <td>{op.contacto || '—'}</td>
                <td>{op.telefono || '—'}</td>
                <td>
                  <div className={styles.tablaAcciones}>
                    <button className={styles.botonIcono} onClick={() => abrirEditar(op)} title="Editar"><FiEdit2 size={15} /></button>
                    {esAdmin && <button className={`${styles.botonIcono} ${styles.botonIconoPeligro}`} onClick={() => setConfirmEliminar(op)} title="Eliminar"><FiTrash2 size={15} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!cargando && operadores.length === 0 && <div className={styles.cargando}>No hay operadores registrados.</div>}

      {modalAbierto && (
        <div className={styles.overlay} onClick={cerrarModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editandoId ? 'Editar operador' : 'Nuevo operador'}</h2>
            <form onSubmit={handleGuardar}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Nombre *</label>
                  <input className={styles.formInput} type="text" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Liberty" autoFocus />
                </div>
                <div className={styles.formGroup}>
                  <label>Comisión (%)</label>
                  <input className={styles.formInput} type="number" step="0.01" min="0" max="100" value={form.comision} onChange={(e) => setForm((p) => ({ ...p, comision: e.target.value }))} placeholder="Ej: 12.5" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Contacto</label>
                  <input className={styles.formInput} type="text" value={form.contacto} onChange={(e) => setForm((p) => ({ ...p, contacto: e.target.value }))} placeholder="Nombre del representante" />
                </div>
                <div className={styles.formGroup}>
                  <label>Teléfono</label>
                  <input className={styles.formInput} type="text" value={form.telefono} onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))} placeholder="+598 99 000 000" />
                </div>
              </div>
              <div className={styles.modalAcciones}>
                <button type="button" className={styles.botonSecundario} onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className={styles.botonPrimario} disabled={!form.nombre.trim() || guardando}>{guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear operador'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmEliminar && (
        <div className={styles.overlay} onClick={() => setConfirmEliminar(null)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <h3>Eliminar operador</h3>
            <p>¿Estás seguro de que deseas eliminar <strong>{confirmEliminar.nombre}</strong>? Esta acción no se puede deshacer.</p>
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
