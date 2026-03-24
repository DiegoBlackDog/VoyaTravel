import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import styles from './PaqueteTabla.module.css';

/** Badge de estado del paquete */
function BadgeEstado({ disponible }) {
  return (
    <span className={disponible ? styles.badgeDisponible : styles.badgeOculto}>
      {disponible ? 'Disponible' : 'Oculto'}
    </span>
  );
}

/** Modal de confirmación para eliminar */
function ModalConfirmar({ paquete, onConfirmar, onCancelar, cargando }) {
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalIcono}>
          <FiAlertTriangle size={28} />
        </div>
        <h3 className={styles.modalTitulo}>¿Eliminar paquete?</h3>
        <p className={styles.modalTexto}>
          Estás a punto de eliminar <strong>{paquete.titulo}</strong>. Esta
          acción no se puede deshacer.
        </p>
        <div className={styles.modalAcciones}>
          <button
            className={styles.botonCancelar}
            onClick={onCancelar}
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            className={styles.botonEliminar}
            onClick={onConfirmar}
            disabled={cargando}
          >
            {cargando ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaqueteTabla({ paquetes, cargando, onToggleVisible, onEliminar }) {
  const { usuario } = useAuth();
  const [confirmando, setConfirmando] = useState(null); // paquete a eliminar
  const [eliminando, setEliminando] = useState(false);
  const [toggling, setToggling] = useState(null); // id del paquete que está cambiando

  const jerarquia = { admin: 3, editor: 2, visor: 1 };
  const rol = jerarquia[usuario?.rol] || 0;
  const puedeEditar = rol >= 2;
  const puedeEliminar = rol >= 3;

  const handleToggle = async (paquete) => {
    setToggling(paquete.id);
    try {
      await onToggleVisible(paquete);
    } finally {
      setToggling(null);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!confirmando) return;
    setEliminando(true);
    try {
      await onEliminar(confirmando.id);
      setConfirmando(null);
    } finally {
      setEliminando(false);
    }
  };

  if (cargando) {
    return (
      <div className={styles.skeletonWrap}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.skeletonFila} />
        ))}
      </div>
    );
  }

  if (!paquetes || paquetes.length === 0) {
    return (
      <div className={styles.vacio}>
        <span>No se encontraron paquetes.</span>
      </div>
    );
  }

  return (
    <>
      <div className={styles.tablaWrap}>
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th className={styles.thTitulo}>Título</th>
              <th className={styles.thDestino}>Destino</th>
              <th className={styles.thPrecio}>Precio</th>
              <th className={styles.thDias}>Días</th>
              <th className={styles.thEstado}>Estado</th>
              {puedeEditar && (
                <th className={styles.thAcciones}>Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paquetes.map((p) => {
              const disponible = p.disponible !== false;
              const destino = p.destinos?.[0]?.nombre
                || p.destino?.nombre
                || p.destino
                || '—';
              const precio = p.precio_adulto != null
                ? `$${Number(p.precio_adulto).toLocaleString('es-MX')}`
                : '—';
              const dias = p.duracion_dias ?? '—';

              return (
                <tr key={p.id} className={styles.fila}>
                  <td className={styles.tdTitulo}>
                    <span className={styles.titulo}>{p.titulo}</span>
                    {p.destacado && (
                      <span className={styles.badgeDestacado}>Destacado</span>
                    )}
                  </td>
                  <td className={styles.tdDestino}>{destino}</td>
                  <td className={styles.tdPrecio}>{precio}</td>
                  <td className={styles.tdDias}>{dias}</td>
                  <td className={styles.tdEstado}>
                    <BadgeEstado disponible={disponible} />
                  </td>
                  {puedeEditar && (
                    <td className={styles.tdAcciones}>
                      <Link
                        to={`/admin/paquetes/${p.id}`}
                        className={styles.botonIcono}
                        title="Editar"
                      >
                        <FiEdit2 size={15} />
                      </Link>
                      <button
                        className={styles.botonIcono}
                        title={disponible ? 'Ocultar' : 'Publicar'}
                        onClick={() => handleToggle(p)}
                        disabled={toggling === p.id}
                      >
                        {disponible ? (
                          <FiEyeOff size={15} />
                        ) : (
                          <FiEye size={15} />
                        )}
                      </button>
                      {puedeEliminar && (
                        <button
                          className={`${styles.botonIcono} ${styles.botonEliminarIcono}`}
                          title="Eliminar"
                          onClick={() => setConfirmando(p)}
                        >
                          <FiTrash2 size={15} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {confirmando && (
        <ModalConfirmar
          paquete={confirmando}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setConfirmando(null)}
          cargando={eliminando}
        />
      )}
    </>
  );
}
