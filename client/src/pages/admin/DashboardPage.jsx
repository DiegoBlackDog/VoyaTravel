import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPackage,
  FiEye,
  FiEyeOff,
  FiStar,
  FiPlusCircle,
  FiTag,
  FiRefreshCw,
  FiAlertCircle,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import styles from './DashboardPage.module.css';

function TarjetaStat({ titulo, valor, icono: Icono, colorClase, descripcion }) {
  return (
    <div className={`${styles.tarjeta} ${colorClase}`}>
      <div className={styles.tarjetaIcono}>
        <Icono size={22} />
      </div>
      <div className={styles.tarjetaDatos}>
        <span className={styles.tarjetaValor}>
          {valor === null ? '—' : valor}
        </span>
        <span className={styles.tarjetaTitulo}>{titulo}</span>
        {descripcion && (
          <span className={styles.tarjetaDesc}>{descripcion}</span>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarStats = async () => {
    setCargando(true);
    setError('');
    try {
      const { data } = await api.get('/paquetes', { params: { limit: 1000, mostrar_vencidos: true } });
      const paquetes = data.paquetes || [];

      const total = paquetes.length;
      const disponibles = paquetes.filter((p) => p.activo !== false && p.visible !== false).length;
      const ocultos = paquetes.filter((p) => p.activo === false || p.visible === false).length;
      const destacados = paquetes.filter((p) => p.destacado === true).length;

      setStats({ total, disponibles, ocultos, destacados });
    } catch (err) {
      setError('No se pudieron cargar las estadísticas. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarStats();
  }, []);

  const nombreCorto = usuario?.nombre?.split(' ')[0] || 'admin';

  return (
    <div className={styles.pagina}>
      {/* Header */}
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>
            Hola, {nombreCorto} 👋
          </h1>
          <p className={styles.subtitulo}>
            Aquí tienes un resumen del estado actual de la plataforma.
          </p>
        </div>
        <button
          className={styles.botonRefresh}
          onClick={cargarStats}
          disabled={cargando}
          aria-label="Recargar estadísticas"
        >
          <FiRefreshCw size={16} className={cargando ? styles.girando : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.alerta} role="alert">
          <FiAlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats grid */}
      <div className={styles.grid}>
        {cargando ? (
          <>
            <div className={`${styles.tarjeta} ${styles.skeleton}`} />
            <div className={`${styles.tarjeta} ${styles.skeleton}`} />
            <div className={`${styles.tarjeta} ${styles.skeleton}`} />
            <div className={`${styles.tarjeta} ${styles.skeleton}`} />
          </>
        ) : (
          <>
            <TarjetaStat
              titulo="Total de paquetes"
              valor={stats?.total ?? 0}
              icono={FiPackage}
              colorClase={styles.tarjetaNegro}
              descripcion="en el catálogo"
            />
            <TarjetaStat
              titulo="Disponibles"
              valor={stats?.disponibles ?? 0}
              icono={FiEye}
              colorClase={styles.tarjetaVerde}
              descripcion="visibles al público"
            />
            <TarjetaStat
              titulo="Ocultos"
              valor={stats?.ocultos ?? 0}
              icono={FiEyeOff}
              colorClase={styles.tarjetaSalmon}
              descripcion="no visibles al público"
            />
            <TarjetaStat
              titulo="Destacados"
              valor={stats?.destacados ?? 0}
              icono={FiStar}
              colorClase={styles.tarjetaAmarillo}
              descripcion="en la home"
            />
          </>
        )}
      </div>

      {/* Quick links */}
      <div className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Accesos rápidos</h2>
        <div className={styles.enlacesGrid}>
          <Link to="/admin/paquetes/nuevo" className={styles.enlaceRapido}>
            <FiPlusCircle size={20} />
            <div>
              <span className={styles.enlaceNombre}>Nuevo paquete</span>
              <span className={styles.enlaceDesc}>Crear un paquete de viaje</span>
            </div>
          </Link>
          <Link to="/admin/etiquetas" className={styles.enlaceRapido}>
            <FiTag size={20} />
            <div>
              <span className={styles.enlaceNombre}>Gestionar etiquetas</span>
              <span className={styles.enlaceDesc}>Añadir o editar etiquetas</span>
            </div>
          </Link>
          <Link to="/admin/paquetes" className={styles.enlaceRapido}>
            <FiPackage size={20} />
            <div>
              <span className={styles.enlaceNombre}>Ver todos los paquetes</span>
              <span className={styles.enlaceDesc}>Listado completo del catálogo</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
