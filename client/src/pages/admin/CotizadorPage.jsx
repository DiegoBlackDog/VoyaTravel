import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus, FiRefreshCw, FiAlertCircle, FiCheck,
  FiEdit2, FiTrash2, FiExternalLink, FiCopy, FiSearch, FiX, FiClipboard,
} from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import styles from './DestinosPage.module.css';
import cotStyles from './CotizadorPage.module.css';

export default function CotizadorPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';

  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const { data } = await api.get('/cotizaciones');
      setCotizaciones(data.cotizaciones || []);
    } catch { setError('No se pudo cargar las cotizaciones.'); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => {
    if (exito) { const t = setTimeout(() => setExito(''), 4000); return () => clearTimeout(t); }
  }, [exito]);

  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    try {
      await api.delete(`/cotizaciones/${confirmEliminar.id}`);
      setConfirmEliminar(null);
      setExito('Cotización eliminada.');
      cargar();
    } catch (err) { setError(err.response?.data?.error || 'Error al eliminar.'); setConfirmEliminar(null); }
  };

  const copiarLink = (token) => {
    const url = `${window.location.origin}/cotizacion/${token}`;
    navigator.clipboard.writeText(url).then(() => setExito('Link copiado al portapapeles.'));
  };

  const handleDuplicar = async (c) => {
    try {
      const { data } = await api.post(`/cotizaciones/${c.id}/duplicar`);
      setExito(`Cotización duplicada como #${data.cotizacion.id}.`);
      cargar();
    } catch (err) { setError(err.response?.data?.error || 'Error al duplicar.'); }
  };

  const filtradas = cotizaciones.filter((c) =>
    !busqueda || (c.nombre_pasajero || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className={styles.pagina}>
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Cotizador</h1>
          <p className={styles.subtitulo}>{cotizaciones.length} cotización{cotizaciones.length !== 1 ? 'es' : ''}</p>
        </div>
        <div className={styles.headerAcciones}>
          <button className={styles.botonSecundario} onClick={cargar} disabled={cargando}>
            <FiRefreshCw size={14} /> Recargar
          </button>
          <Link to="/admin/cotizador/nuevo" className={styles.botonPrimario}>
            <FiPlus size={14} /> Nueva cotización
          </Link>
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
          placeholder="Buscar por pasajero..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button className={styles.buscadorLimpiar} onClick={() => setBusqueda('')}>
            <FiX size={13} />
          </button>
        )}
      </div>

      {cargando ? (
        <div className={styles.cargando}>Cargando...</div>
      ) : filtradas.length === 0 ? (
        <div className={styles.cargando}>
          {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay cotizaciones todavía.'}
        </div>
      ) : (
        <div className={styles.tablaWrap}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>N°</th>
                <th>Pasajero</th>
                <th>Destino</th>
                <th>Duración</th>
                <th>Fecha</th>
                {esAdmin && <th>Creado por</th>}
                <th className={styles.thAcciones}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((c) => (
                <tr key={c.id} className={styles.fila}>
                  <td><span className={cotStyles.numero}>#{c.id}</span></td>
                  <td>{c.nombre_pasajero}</td>
                  <td>
                    {c.destino
                      ? `${c.destino.nombre}${c.destino.pais ? `, ${c.destino.pais}` : ''}`
                      : '—'}
                  </td>
                  <td>
                    {c.duracion_dias
                      ? `${c.duracion_dias} día${c.duracion_dias !== 1 ? 's' : ''}${c.duracion_noches ? ` / ${c.duracion_noches} noche${c.duracion_noches !== 1 ? 's' : ''}` : ''}`
                      : '—'}
                  </td>
                  <td>{new Date(c.creado_en).toLocaleDateString('es-UY')}</td>
                  {esAdmin && <td>{c.usuario?.nombre || '—'}</td>}
                  <td className={styles.tdAcciones}>
                    <div className={styles.tablaAcciones}>
                      <button
                        className={styles.botonIcono}
                        title="Copiar link del cliente"
                        onClick={() => copiarLink(c.token)}
                      >
                        <FiCopy size={14} />
                      </button>
                      <a
                        className={styles.botonIcono}
                        href={`/cotizacion/${c.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver cotización"
                      >
                        <FiExternalLink size={14} />
                      </a>
                      <button
                        className={styles.botonIcono}
                        title="Duplicar cotización"
                        onClick={() => handleDuplicar(c)}
                      >
                        <FiClipboard size={14} />
                      </button>
                      <Link
                        className={styles.botonIcono}
                        to={`/admin/cotizador/${c.id}/editar`}
                        title="Editar"
                      >
                        <FiEdit2 size={14} />
                      </Link>
                      <button
                        className={`${styles.botonIcono} ${styles.botonIconoPeligro}`}
                        title="Eliminar"
                        onClick={() => setConfirmEliminar(c)}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmEliminar && (
        <div className={styles.overlay} onClick={() => setConfirmEliminar(null)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <h3>Eliminar cotización</h3>
            <p>¿Eliminar la cotización de <strong>{confirmEliminar.nombre_pasajero}</strong>?</p>
            <div className={styles.confirmAcciones}>
              <button className={styles.botonSecundario} onClick={() => setConfirmEliminar(null)}>Cancelar</button>
              <button className={styles.botonPeligro} onClick={handleEliminar}>
                <FiTrash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
