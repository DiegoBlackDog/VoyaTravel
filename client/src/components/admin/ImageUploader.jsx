import { useState, useRef, useCallback } from 'react';
import { FiUploadCloud, FiTrash2, FiStar, FiImage, FiX } from 'react-icons/fi';
import api from '../../services/api';
import styles from './ImageUploader.module.css';

export default function ImageUploader({ paqueteId, imagenes = [], onUpdate }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const [arrastrando, setArrastrando] = useState(false);
  const inputRef = useRef(null);

  const habilitado = !!paqueteId;

  const subirArchivos = useCallback(async (archivos) => {
    if (!habilitado || !archivos.length) return;

    const maxArchivos = 10 - imagenes.length;
    if (archivos.length > maxArchivos) {
      setError(`Solo puedes subir ${maxArchivos} imagen(es) mas (maximo 10).`);
      return;
    }

    // Validar tipos
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    for (const archivo of archivos) {
      if (!tiposPermitidos.includes(archivo.type)) {
        setError(`Formato no soportado: ${archivo.name}. Usa JPG, PNG o WebP.`);
        return;
      }
      if (archivo.size > 5 * 1024 * 1024) {
        setError(`${archivo.name} excede el limite de 5 MB.`);
        return;
      }
    }

    setError('');
    setSubiendo(true);

    try {
      const formData = new FormData();
      for (const archivo of archivos) {
        formData.append('imagenes', archivo);
      }

      await api.post(`/imagenes/${paqueteId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onUpdate?.();
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.message || 'Error al subir imagenes.';
      setError(msg);
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [habilitado, imagenes.length, paqueteId, onUpdate]);

  const handleEliminar = async (imagenId) => {
    try {
      await api.delete(`/imagenes/${imagenId}`);
      onUpdate?.();
    } catch {
      setError('No se pudo eliminar la imagen.');
    }
  };

  const handlePortada = async (imagen) => {
    try {
      await api.put(`/imagenes/${imagen.id}/orden`, {
        orden: imagen.orden,
        es_portada: true,
      });
      onUpdate?.();
    } catch {
      setError('No se pudo establecer la portada.');
    }
  };

  /* ── Drag & Drop handlers ── */
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (habilitado) setArrastrando(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setArrastrando(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setArrastrando(false);
    if (!habilitado) return;
    const archivos = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    );
    subirArchivos(archivos);
  };

  const handleInputChange = (e) => {
    const archivos = Array.from(e.target.files);
    subirArchivos(archivos);
  };

  const urlBase = import.meta.env.DEV ? 'http://localhost:4000' : '';

  const resolverUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${urlBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className={styles.contenedor}>
      <h3 className={styles.seccionTitulo}>
        <FiImage size={18} />
        Imagenes
      </h3>

      {!habilitado && (
        <p className={styles.aviso}>
          Guarda el paquete primero para poder subir imagenes.
        </p>
      )}

      {error && (
        <div className={styles.error}>
          <span>{error}</span>
          <button className={styles.errorCerrar} onClick={() => setError('')}>
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* ── Drop Zone ── */}
      <div
        className={`${styles.dropZone} ${arrastrando ? styles.dropZoneActiva : ''} ${!habilitado ? styles.dropZoneDeshabilitada : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => habilitado && inputRef.current?.click()}
        role="button"
        tabIndex={habilitado ? 0 : -1}
        aria-label="Subir imagenes"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={handleInputChange}
          className={styles.inputOculto}
          disabled={!habilitado || subiendo}
        />
        <FiUploadCloud size={32} className={styles.dropIcono} />
        {subiendo ? (
          <p className={styles.dropTexto}>Subiendo imagenes...</p>
        ) : (
          <>
            <p className={styles.dropTexto}>
              Arrastra imagenes aqui o haz clic para seleccionar
            </p>
            <p className={styles.dropHint}>
              JPG, PNG o WebP. Max 5 MB por imagen. Max 10 imagenes.
            </p>
          </>
        )}
      </div>

      {/* ── Thumbnails ── */}
      {imagenes.length > 0 && (
        <div className={styles.galeria}>
          {imagenes
            .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
            .map((img) => (
              <div
                key={img.id}
                className={`${styles.thumbnail} ${img.es_portada ? styles.thumbnailPortada : ''}`}
              >
                <img
                  src={resolverUrl(img.url)}
                  alt=""
                  className={styles.thumbnailImg}
                />
                <div className={styles.thumbnailOverlay}>
                  <button
                    className={`${styles.thumbnailBtn} ${img.es_portada ? styles.thumbnailBtnActivo : ''}`}
                    onClick={() => handlePortada(img)}
                    title={img.es_portada ? 'Portada actual' : 'Establecer como portada'}
                  >
                    <FiStar size={14} />
                  </button>
                  <button
                    className={`${styles.thumbnailBtn} ${styles.thumbnailBtnEliminar}`}
                    onClick={() => handleEliminar(img.id)}
                    title="Eliminar imagen"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
                {img.es_portada && (
                  <span className={styles.badgePortada}>Portada</span>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
