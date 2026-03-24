import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiRefreshCw, FiAlertCircle, FiCheck, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { FaStar, FaGoogle } from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import styles from './TestimoniosPage.module.css';

const EMPTY_FORM = {
  nombre: '',
  texto: '',
  viaje: '',
  fecha_viaje: '',
  imagen_url: '',
  activo: true,
  orden: 0,
  calificacion: 5,
  fuente: 'manual',
};

const EMPTY_GOOGLE_FORM = {
  nombre: '',
  texto: '',
  calificacion: 5,
  fecha_viaje: '',
  imagen_url: '',
  activo: true,
  orden: 0,
  fuente: 'google',
  viaje: '',
};

function EstrellaSelector({ value, onChange }) {
  return (
    <div className={styles.estrellaSelector}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`${styles.estrellaBtn} ${n <= value ? styles.estrellaBtnActiva : ''}`}
          onClick={() => onChange(n)}
          aria-label={`${n} estrellas`}
        >
          <FaStar size={20} />
        </button>
      ))}
    </div>
  );
}

export default function TestimoniosPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';

  const [testimonios, setTestimonios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Modal normal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [guardando, setGuardando] = useState(false);

  // Modal Google import
  const [modalGoogle, setModalGoogle] = useState(false);
  const [googleForm, setGoogleForm] = useState(EMPTY_GOOGLE_FORM);
  const [guardandoGoogle, setGuardandoGoogle] = useState(false);

  // Delete confirmation
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const { data } = await api.get('/testimonios');
      setTestimonios(data.testimonios || []);
    } catch {
      setError('No se pudieron cargar los testimonios.');
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

  const abrirGoogle = () => {
    setGoogleForm(EMPTY_GOOGLE_FORM);
    setModalGoogle(true);
  };

  const cerrarGoogle = () => {
    setModalGoogle(false);
    setGoogleForm(EMPTY_GOOGLE_FORM);
  };

  const handleGuardarGoogle = async (e) => {
    e.preventDefault();
    if (!googleForm.nombre.trim() || !googleForm.texto.trim()) return;
    setGuardandoGoogle(true);
    try {
      await api.post('/testimonios', {
        nombre: googleForm.nombre.trim(),
        texto: googleForm.texto.trim(),
        calificacion: googleForm.calificacion,
        fecha_viaje: googleForm.fecha_viaje || null,
        imagen_url: googleForm.imagen_url.trim(),
        viaje: googleForm.viaje.trim(),
        fuente: 'google',
        activo: true,
        orden: googleForm.orden ? parseInt(googleForm.orden, 10) : 0,
      });
      setExito('Review de Google importada correctamente.');
      cerrarGoogle();
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la review.');
    } finally {
      setGuardandoGoogle(false);
    }
  };

  const abrirEditar = (t) => {
    setForm({
      nombre: t.nombre || '',
      texto: t.texto || '',
      viaje: t.viaje || '',
      fecha_viaje: t.fecha_viaje ? t.fecha_viaje.substring(0, 10) : '',
      imagen_url: t.imagen_url || '',
      activo: t.activo !== undefined ? t.activo : true,
      orden: t.orden || 0,
    });
    setEditandoId(t.id);
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
    if (!form.nombre.trim() || !form.texto.trim()) return;
    setGuardando(true);
    try {
      const body = {
        nombre: form.nombre.trim(),
        texto: form.texto.trim(),
        viaje: form.viaje.trim(),
        fecha_viaje: form.fecha_viaje || null,
        imagen_url: form.imagen_url.trim(),
        activo: form.activo,
        orden: parseInt(form.orden, 10) || 0,
      };
      if (editandoId) {
        await api.put(`/testimonios/${editandoId}`, body);
        setExito('Testimonio actualizado correctamente.');
      } else {
        await api.post('/testimonios', body);
        setExito('Testimonio creado correctamente.');
      }
      cerrarModal();
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el testimonio.');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleActivo = async (t) => {
    try {
      await api.put(`/testimonios/${t.id}`, { ...t, activo: !t.activo });
      setTestimonios((prev) =>
        prev.map((item) =>
          item.id === t.id ? { ...item, activo: !item.activo } : item
        )
      );
    } catch {
      setError('Error al cambiar el estado del testimonio.');
    }
  };

  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    try {
      await api.delete(`/testimonios/${confirmEliminar.id}`);
      setConfirmEliminar(null);
      setExito('Testimonio eliminado.');
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar el testimonio.');
      setConfirmEliminar(null);
    }
  };

  return (
    <div className={styles.pagina}>
      {/* Header */}
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Testimonios</h1>
          <p className={styles.subtitulo}>
            {testimonios.length > 0
              ? `${testimonios.length} testimonio${testimonios.length !== 1 ? 's' : ''}`
              : 'Gestión de testimonios de viajeros'}
          </p>
        </div>
        <div className={styles.headerAcciones}>
          <button className={styles.botonSecundario} onClick={cargar} disabled={cargando}>
            <FiRefreshCw size={14} />
            Recargar
          </button>
          <button className={styles.botonGoogle} onClick={abrirGoogle}>
            <FaGoogle size={14} />
            Importar de Google
          </button>
          <button className={styles.botonPrimario} onClick={abrirNuevo}>
            <FiPlus size={15} />
            Nuevo testimonio
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
      {cargando && <div className={styles.cargando}>Cargando testimonios...</div>}

      {/* Cards */}
      {!cargando && testimonios.length > 0 && (
        <div className={styles.cardsGrid}>
          {testimonios.map((t) => (
            <div key={t.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardNombre}>{t.nombre}</h3>
                  {t.viaje && <span className={styles.cardViaje}>{t.viaje}</span>}
                </div>
                <div className={styles.cardHeaderRight}>
                  {t.fuente === 'google' && (
                    <span className={styles.badgeGoogle}><FaGoogle size={11} /> Google</span>
                  )}
                  {t.calificacion && (
                    <span className={styles.cardEstrellas}>
                      {[1,2,3,4,5].map((n) => (
                        <FaStar key={n} size={11} style={{ color: n <= t.calificacion ? '#FBBF24' : '#d1d5db' }} />
                      ))}
                    </span>
                  )}
                </div>
              </div>

              <p className={styles.cardTexto}>{t.texto}</p>

              <div className={styles.cardMeta}>
                <button
                  className={`${styles.toggleBtn} ${t.activo ? styles.toggleActivo : styles.toggleInactivo}`}
                  onClick={() => handleToggleActivo(t)}
                  title={t.activo ? 'Clic para desactivar' : 'Clic para activar'}
                >
                  {t.activo ? 'Activo' : 'Inactivo'}
                </button>

                {t.orden > 0 && (
                  <span className={styles.badge + ' ' + styles.badgeOrden}>
                    Orden: {t.orden}
                  </span>
                )}

                {t.fecha_viaje && (
                  <span className={styles.badge} style={{ background: 'rgba(29,29,27,0.06)', color: 'var(--color-gris)' }}>
                    {new Date(t.fecha_viaje).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })}
                  </span>
                )}

                <div className={styles.cardAcciones}>
                  <button
                    className={styles.botonIcono}
                    onClick={() => abrirEditar(t)}
                    title="Editar"
                  >
                    <FiEdit2 size={15} />
                  </button>
                  {esAdmin && (
                    <button
                      className={`${styles.botonIcono} ${styles.botonIconoPeligro}`}
                      onClick={() => setConfirmEliminar(t)}
                      title="Eliminar"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!cargando && testimonios.length === 0 && (
        <div className={styles.cargando}>No hay testimonios registrados.</div>
      )}

      {/* Modal create/edit */}
      {modalAbierto && (
        <div className={styles.overlay} onClick={cerrarModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editandoId ? 'Editar testimonio' : 'Nuevo testimonio'}</h2>
            <form onSubmit={handleGuardar}>
              <div className={styles.formGroup}>
                <label>Nombre del viajero</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={form.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Ej: María García"
                  autoFocus
                />
              </div>
              <div className={styles.formGroup}>
                <label>Testimonio</label>
                <textarea
                  className={styles.formTextarea}
                  value={form.texto}
                  onChange={(e) => handleChange('texto', e.target.value)}
                  placeholder="El texto del testimonio..."
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Viaje</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    value={form.viaje}
                    onChange={(e) => handleChange('viaje', e.target.value)}
                    placeholder="Ej: Cusco & Machu Picchu"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Fecha del viaje</label>
                  <input
                    className={styles.formInput}
                    type="date"
                    value={form.fecha_viaje}
                    onChange={(e) => handleChange('fecha_viaje', e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>URL de imagen</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={form.imagen_url}
                  onChange={(e) => handleChange('imagen_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Orden</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    min="0"
                    value={form.orden}
                    onChange={(e) => handleChange('orden', e.target.value)}
                  />
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
                  disabled={!form.nombre.trim() || !form.texto.trim() || guardando}
                >
                  {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear testimonio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal importar de Google */}
      {modalGoogle && (
        <div className={styles.overlay} onClick={cerrarGoogle}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalGoogleHeader}>
              <FaGoogle size={18} className={styles.googleIcono} />
              <h2>Importar review de Google</h2>
            </div>
            <p className={styles.modalGoogleHint}>
              Copiá los datos de la review tal como aparecen en Google Maps y pegálos acá.
            </p>
            <form onSubmit={handleGuardarGoogle}>
              <div className={styles.formGroup}>
                <label>Nombre del revisor *</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={googleForm.nombre}
                  onChange={(e) => setGoogleForm((p) => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: Ana Pérez"
                  autoFocus
                />
              </div>
              <div className={styles.formGroup}>
                <label>Calificación</label>
                <EstrellaSelector
                  value={googleForm.calificacion}
                  onChange={(v) => setGoogleForm((p) => ({ ...p, calificacion: v }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Texto de la review *</label>
                <textarea
                  className={styles.formTextarea}
                  value={googleForm.texto}
                  onChange={(e) => setGoogleForm((p) => ({ ...p, texto: e.target.value }))}
                  placeholder="Pegá el texto de la review de Google..."
                  rows={4}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Viaje (opcional)</label>
                  <input
                    className={styles.formInput}
                    type="text"
                    value={googleForm.viaje}
                    onChange={(e) => setGoogleForm((p) => ({ ...p, viaje: e.target.value }))}
                    placeholder="Ej: Cusco & Machu Picchu"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Fecha de la review</label>
                  <input
                    className={styles.formInput}
                    type="date"
                    value={googleForm.fecha_viaje}
                    onChange={(e) => setGoogleForm((p) => ({ ...p, fecha_viaje: e.target.value }))}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Foto de perfil (URL, opcional)</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={googleForm.imagen_url}
                  onChange={(e) => setGoogleForm((p) => ({ ...p, imagen_url: e.target.value }))}
                  placeholder="https://lh3.googleusercontent.com/..."
                />
              </div>
              <div className={styles.modalAcciones}>
                <button type="button" className={styles.botonSecundario} onClick={cerrarGoogle}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.botonPrimario}
                  disabled={!googleForm.nombre.trim() || !googleForm.texto.trim() || guardandoGoogle}
                >
                  {guardandoGoogle ? 'Importando...' : 'Importar review'}
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
            <h3>Eliminar testimonio</h3>
            <p>
              ¿Estás seguro de que deseas eliminar el testimonio de <strong>{confirmEliminar.nombre}</strong>?
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
