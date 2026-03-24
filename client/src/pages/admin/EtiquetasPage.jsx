import { useState, useEffect, useCallback } from 'react';
import { FiRefreshCw, FiAlertCircle, FiCheck, FiPlus, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import styles from './EtiquetasPage.module.css';

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function EtiquetasPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';

  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // New category form
  const [nuevaCat, setNuevaCat] = useState({ nombre: '', slug: '' });
  const [catAutoSlug, setCatAutoSlug] = useState(true);

  // New tag form per category
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState({});

  // Edit tag state
  const [editandoTag, setEditandoTag] = useState(null); // { id, nombre, slug }

  // Delete confirmation
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const { data } = await api.get('/etiquetas');
      setCategorias(data.categorias || []);
    } catch {
      setError('No se pudieron cargar las etiquetas.');
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

  // ── Create category ──
  const handleCrearCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCat.nombre.trim()) return;
    try {
      const body = {
        nombre: nuevaCat.nombre.trim(),
        slug: nuevaCat.slug.trim() || slugify(nuevaCat.nombre),
      };
      await api.post('/etiquetas/categorias', body);
      setNuevaCat({ nombre: '', slug: '' });
      setCatAutoSlug(true);
      setExito('Categoría creada correctamente.');
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la categoría.');
    }
  };

  // ── Create tag ──
  const handleCrearEtiqueta = async (e, categoriaId) => {
    e.preventDefault();
    const tag = nuevaEtiqueta[categoriaId];
    if (!tag?.nombre?.trim()) return;
    try {
      const body = {
        nombre: tag.nombre.trim(),
        slug: tag.slug?.trim() || slugify(tag.nombre),
        categoria_id: categoriaId,
      };
      await api.post('/etiquetas', body);
      setNuevaEtiqueta((prev) => ({ ...prev, [categoriaId]: { nombre: '', slug: '', autoSlug: true } }));
      setExito('Etiqueta creada correctamente.');
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la etiqueta.');
    }
  };

  // ── Edit tag ──
  const iniciarEdicion = (etiqueta) => {
    setEditandoTag({ id: etiqueta.id, nombre: etiqueta.nombre, slug: etiqueta.slug });
  };

  const guardarEdicion = async () => {
    if (!editandoTag || !editandoTag.nombre.trim()) return;
    try {
      await api.put(`/etiquetas/${editandoTag.id}`, {
        nombre: editandoTag.nombre.trim(),
        slug: editandoTag.slug.trim() || slugify(editandoTag.nombre),
      });
      setEditandoTag(null);
      setExito('Etiqueta actualizada.');
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar la etiqueta.');
    }
  };

  // ── Delete tag ──
  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    try {
      await api.delete(`/etiquetas/${confirmEliminar.id}`);
      setConfirmEliminar(null);
      setExito('Etiqueta eliminada.');
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar la etiqueta.');
      setConfirmEliminar(null);
    }
  };

  const handleNuevaEtiquetaChange = (categoriaId, field, value) => {
    setNuevaEtiqueta((prev) => {
      const current = prev[categoriaId] || { nombre: '', slug: '', autoSlug: true };
      const updated = { ...current, [field]: value };
      if (field === 'nombre' && current.autoSlug) {
        updated.slug = slugify(value);
      }
      if (field === 'slug') {
        updated.autoSlug = false;
      }
      return { ...prev, [categoriaId]: updated };
    });
  };

  return (
    <div className={styles.pagina}>
      {/* Header */}
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Etiquetas</h1>
          <p className={styles.subtitulo}>
            Categorías y etiquetas para clasificar paquetes
          </p>
        </div>
        <button
          className={styles.botonSecundario}
          onClick={cargar}
          disabled={cargando}
        >
          <FiRefreshCw size={14} className={cargando ? styles.girando : ''} />
          Recargar
        </button>
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

      {/* New category form */}
      <div className={styles.nuevaCategoriaForm}>
        <h3>Nueva categoría</h3>
        <form className={styles.formInline} onSubmit={handleCrearCategoria}>
          <input
            type="text"
            className={styles.formInput}
            placeholder="Nombre de categoría"
            value={nuevaCat.nombre}
            onChange={(e) => {
              const nombre = e.target.value;
              setNuevaCat((prev) => ({
                ...prev,
                nombre,
                slug: catAutoSlug ? slugify(nombre) : prev.slug,
              }));
            }}
          />
          <input
            type="text"
            className={styles.formInput}
            placeholder="slug"
            value={nuevaCat.slug}
            onChange={(e) => {
              setCatAutoSlug(false);
              setNuevaCat((prev) => ({ ...prev, slug: e.target.value }));
            }}
          />
          <button type="submit" className={styles.botonPrimario} disabled={!nuevaCat.nombre.trim()}>
            <FiPlus size={14} />
            Crear categoría
          </button>
        </form>
      </div>

      {/* Loading */}
      {cargando && <div className={styles.cargando}>Cargando etiquetas...</div>}

      {/* Category blocks */}
      {!cargando && categorias.map((cat) => {
        const tagForm = nuevaEtiqueta[cat.id] || { nombre: '', slug: '', autoSlug: true };
        return (
          <div key={cat.id} className={styles.categoriaBloque}>
            <div className={styles.categoriaHeader}>
              <h2 className={styles.categoriaNombre}>
                {cat.nombre}
                <span className={styles.categoriaSlug}>/{cat.slug}</span>
              </h2>
            </div>

            {/* Tag pills */}
            <div className={styles.etiquetasLista}>
              {(cat.etiquetas || []).map((etiqueta) => (
                <div key={etiqueta.id} className={styles.etiquetaPill}>
                  {editandoTag?.id === etiqueta.id ? (
                    <div className={styles.inlineEdit}>
                      <input
                        className={styles.inlineInput}
                        value={editandoTag.nombre}
                        onChange={(e) =>
                          setEditandoTag((prev) => ({ ...prev, nombre: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') guardarEdicion();
                          if (e.key === 'Escape') setEditandoTag(null);
                        }}
                        autoFocus
                      />
                      <button
                        className={styles.inlineBtn}
                        onClick={guardarEdicion}
                        title="Guardar"
                      >
                        <FiCheck size={14} />
                      </button>
                      <button
                        className={`${styles.inlineBtn} ${styles.inlineBtnCancel}`}
                        onClick={() => setEditandoTag(null)}
                        title="Cancelar"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span
                        className={styles.etiquetaNombre}
                        onClick={() => iniciarEdicion(etiqueta)}
                        title="Clic para editar"
                      >
                        {etiqueta.nombre}
                      </span>
                      {esAdmin && (
                        <button
                          className={styles.etiquetaEliminar}
                          onClick={() => setConfirmEliminar(etiqueta)}
                          title="Eliminar"
                        >
                          <FiX size={13} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}

              {(!cat.etiquetas || cat.etiquetas.length === 0) && (
                <span style={{ fontFamily: 'var(--font-cuerpo)', fontSize: '0.82rem', color: 'var(--color-gris-claro)' }}>
                  Sin etiquetas aún
                </span>
              )}
            </div>

            {/* Add tag form */}
            <form
              className={styles.agregarEtiqueta}
              onSubmit={(e) => handleCrearEtiqueta(e, cat.id)}
            >
              <input
                type="text"
                className={styles.formInputSmall}
                placeholder="Nueva etiqueta"
                value={tagForm.nombre}
                onChange={(e) => handleNuevaEtiquetaChange(cat.id, 'nombre', e.target.value)}
              />
              <input
                type="text"
                className={styles.formInputSmall}
                placeholder="slug"
                value={tagForm.slug}
                onChange={(e) => handleNuevaEtiquetaChange(cat.id, 'slug', e.target.value)}
              />
              <button
                type="submit"
                className={styles.botonPrimarioSmall}
                disabled={!tagForm.nombre?.trim()}
              >
                <FiPlus size={13} />
                Agregar
              </button>
            </form>
          </div>
        );
      })}

      {!cargando && categorias.length === 0 && (
        <div className={styles.cargando}>No hay categorías creadas. Crea una arriba para comenzar.</div>
      )}

      {/* Delete confirmation */}
      {confirmEliminar && (
        <div className={styles.overlay} onClick={() => setConfirmEliminar(null)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <h3>Eliminar etiqueta</h3>
            <p>
              ¿Estás seguro de que deseas eliminar la etiqueta <strong>{confirmEliminar.nombre}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className={styles.confirmAcciones}>
              <button
                className={styles.botonSecundario}
                onClick={() => setConfirmEliminar(null)}
              >
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
