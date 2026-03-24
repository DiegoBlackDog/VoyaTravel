import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiRefreshCw, FiAlertCircle, FiCheck, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import styles from './DestinosPage.module.css';

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const EMPTY_FORM = { nombre: '', slug: '', pais: '', region: '' };

export default function DestinosPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';

  const [destinos, setDestinos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Modal state
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [autoSlug, setAutoSlug] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Delete confirmation
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
    });
    setAutoSlug(false);
    setEditandoId(destino.id);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditandoId(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'nombre' && autoSlug) {
        updated.slug = slugify(value);
      }
      if (field === 'slug') {
        setAutoSlug(false);
      }
      return updated;
    });
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
        region: form.region.trim(),
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

      {/* Loading */}
      {cargando && <div className={styles.cargando}>Cargando destinos...</div>}

      {/* Table */}
      {!cargando && destinos.length > 0 && (
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Slug</th>
              <th>País</th>
              <th>Región</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {destinos.map((d) => (
              <tr key={d.id}>
                <td>{d.nombre}</td>
                <td>{d.slug}</td>
                <td>{d.pais || '—'}</td>
                <td>{d.region || '—'}</td>
                <td>
                  <div className={styles.tablaAcciones}>
                    <button
                      className={styles.botonIcono}
                      onClick={() => abrirEditar(d)}
                      title="Editar"
                    >
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

      {!cargando && destinos.length === 0 && (
        <div className={styles.cargando}>No hay destinos registrados.</div>
      )}

      {/* Modal create/edit */}
      {modalAbierto && (
        <div className={styles.overlay} onClick={cerrarModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editandoId ? 'Editar destino' : 'Nuevo destino'}</h2>
            <form onSubmit={handleGuardar}>
              <div className={styles.formGroup}>
                <label>Nombre</label>
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
                <label>Slug</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={form.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  placeholder="cusco"
                />
              </div>
              <div className={styles.formGroup}>
                <label>País</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={form.pais}
                  onChange={(e) => handleChange('pais', e.target.value)}
                  placeholder="Ej: Perú"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Región</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={form.region}
                  onChange={(e) => handleChange('region', e.target.value)}
                  placeholder="Ej: Sudamérica"
                />
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
