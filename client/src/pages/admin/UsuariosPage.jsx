import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiRefreshCw, FiAlertCircle, FiCheck, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import styles from './UsuariosPage.module.css';

const EMPTY_FORM = {
  nombre: '',
  email: '',
  contrasena: '',
  rol: 'editor',
  activo: true,
};

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'visor', label: 'Visor' },
];

const rolBadgeClass = {
  admin: 'badgeAdmin',
  editor: 'badgeEditor',
  visor: 'badgeVisor',
};

export default function UsuariosPage() {
  const { usuario: usuarioActual } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [guardando, setGuardando] = useState(false);

  // Delete confirmation
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const { data } = await api.get('/usuarios');
      setUsuarios(data.usuarios || []);
    } catch {
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (exito) {
      const timer = setTimeout(() => setExito(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [exito]);

  const abrirNuevo = () => {
    setForm(EMPTY_FORM);
    setEditandoId(null);
    setModalAbierto(true);
  };

  const abrirEditar = (u) => {
    setForm({
      nombre: u.nombre || '',
      email: u.email || '',
      contrasena: '',
      rol: u.rol || 'editor',
      activo: u.activo !== undefined ? u.activo : true,
    });
    setEditandoId(u.id);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim()) return;
    if (!editandoId && !form.contrasena) {
      setError('La contraseña es obligatoria para nuevos usuarios.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      const body = {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        rol: form.rol,
        activo: form.activo,
      };
      if (form.contrasena) {
        body.contrasena = form.contrasena;
      }
      if (editandoId) {
        await api.put(`/usuarios/${editandoId}`, body);
        setExito('Usuario actualizado correctamente.');
      } else {
        await api.post('/usuarios', body);
        setExito('Usuario creado correctamente.');
      }
      cerrarModal();
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el usuario.');
    } finally {
      setGuardando(false);
    }
  };

  const intentarEliminar = (u) => {
    if (u.id === usuarioActual?.id) {
      setError('No puedes eliminar tu propio usuario.');
      return;
    }
    setConfirmEliminar(u);
  };

  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    try {
      await api.delete(`/usuarios/${confirmEliminar.id}`);
      setConfirmEliminar(null);
      setExito('Usuario eliminado.');
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar el usuario.');
      setConfirmEliminar(null);
    }
  };

  return (
    <div className={styles.pagina}>
      {/* Header */}
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Usuarios</h1>
          <p className={styles.subtitulo}>
            {usuarios.length > 0
              ? `${usuarios.length} usuario${usuarios.length !== 1 ? 's' : ''} registrados`
              : 'Gestión de usuarios del panel'}
          </p>
        </div>
        <div className={styles.headerAcciones}>
          <button className={styles.botonSecundario} onClick={cargar} disabled={cargando}>
            <FiRefreshCw size={14} />
            Recargar
          </button>
          <button className={styles.botonPrimario} onClick={abrirNuevo}>
            <FiPlus size={15} />
            Nuevo usuario
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

      {/* Loading */}
      {cargando && <div className={styles.cargando}>Cargando usuarios...</div>}

      {/* Table */}
      {!cargando && usuarios.length > 0 && (
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.nombre}
                  {u.id === usuarioActual?.id && <span className={styles.esTu}>(tú)</span>}
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`${styles.badge} ${styles[rolBadgeClass[u.rol]] || styles.badgeVisor}`}>
                    {u.rol}
                  </span>
                </td>
                <td>
                  <span className={`${styles.badge} ${u.activo ? styles.badgeActivo : styles.badgeInactivo}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className={styles.tablaAcciones}>
                    <button
                      className={styles.botonIcono}
                      onClick={() => abrirEditar(u)}
                      title="Editar"
                    >
                      <FiEdit2 size={15} />
                    </button>
                    {usuarioActual?.rol === 'admin' && (
                      <button
                        className={`${styles.botonIcono} ${styles.botonIconoPeligro}`}
                        onClick={() => intentarEliminar(u)}
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

      {!cargando && usuarios.length === 0 && (
        <div className={styles.cargando}>No hay usuarios registrados.</div>
      )}

      {/* Modal create/edit */}
      {modalAbierto && (
        <div className={styles.overlay} onClick={cerrarModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editandoId ? 'Editar usuario' : 'Nuevo usuario'}</h2>
            <form onSubmit={handleGuardar}>
              <div className={styles.formGroup}>
                <label>Nombre</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={form.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Nombre completo"
                  autoFocus
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  className={styles.formInput}
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label>{editandoId ? 'Contraseña (dejar vacío para mantener)' : 'Contraseña'}</label>
                <input
                  className={styles.formInput}
                  type="password"
                  value={form.contrasena}
                  onChange={(e) => handleChange('contrasena', e.target.value)}
                  placeholder={editandoId ? 'Sin cambios si vacío' : 'Contraseña segura'}
                />
                {editandoId && (
                  <div className={styles.formHint}>Deja el campo vacío para mantener la contraseña actual.</div>
                )}
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Rol</label>
                  <select
                    className={styles.formSelect}
                    value={form.rol}
                    onChange={(e) => handleChange('rol', e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Estado</label>
                  <div className={styles.formToggle}>
                    <button
                      type="button"
                      className={`${styles.toggleSwitch} ${form.activo ? styles.toggleSwitchOn : ''}`}
                      onClick={() => handleChange('activo', !form.activo)}
                      aria-label="Toggle activo"
                    />
                    <span className={styles.toggleLabel}>
                      {form.activo ? 'Activo' : 'Inactivo'}
                    </span>
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
                  disabled={!form.nombre.trim() || !form.email.trim() || guardando}
                >
                  {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmEliminar && (
        <div className={styles.overlay} onClick={() => setConfirmEliminar(null)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <h3>Eliminar usuario</h3>
            <p>
              ¿Estás seguro de que deseas eliminar a <strong>{confirmEliminar.nombre}</strong> ({confirmEliminar.email})?
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
