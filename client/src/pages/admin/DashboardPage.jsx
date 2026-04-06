import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPackage, FiEye, FiEyeOff, FiStar,
  FiPlusCircle, FiTag, FiRefreshCw, FiAlertCircle,
  FiFileText, FiCalendar, FiUser,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import styles from './DashboardPage.module.css';

function TarjetaStat({ titulo, valor, icono: Icono, colorClase, descripcion }) {
  return (
    <div className={`${styles.tarjeta} ${colorClase}`}>
      <div className={styles.tarjetaIcono}><Icono size={22} /></div>
      <div className={styles.tarjetaDatos}>
        <span className={styles.tarjetaValor}>{valor === null ? '—' : valor}</span>
        <span className={styles.tarjetaTitulo}>{titulo}</span>
        {descripcion && <span className={styles.tarjetaDesc}>{descripcion}</span>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';

  const [paquetesStats, setPaquetesStats]   = useState(null);
  const [cotStats,      setCotStats]        = useState(null);
  const [cargando,      setCargando]        = useState(true);
  const [error,         setError]           = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [paqRes, cotRes] = await Promise.all([
        api.get('/paquetes', { params: { limit: 1000, mostrar_vencidos: true } }),
        api.get('/cotizaciones/stats'),
      ]);

      const paquetes = paqRes.data.paquetes || [];
      setPaquetesStats({
        total:       paquetes.length,
        disponibles: paquetes.filter((p) => p.activo !== false && p.visible !== false).length,
        ocultos:     paquetes.filter((p) => p.activo === false || p.visible === false).length,
        destacados:  paquetes.filter((p) => p.destacado === true).length,
      });

      setCotStats(cotRes.data);
    } catch {
      setError('No se pudieron cargar las estadísticas.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const nombreCorto = usuario?.nombre?.split(' ')[0] || 'admin';
  const maxSemana   = cotStats?.por_usuario
    ? Math.max(1, ...cotStats.por_usuario.map((u) => u.semana))
    : 1;

  return (
    <div className={styles.pagina}>

      {/* Header */}
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Hola, {nombreCorto} 👋</h1>
          <p className={styles.subtitulo}>Resumen del estado actual de la plataforma.</p>
        </div>
        <button className={styles.botonRefresh} onClick={cargar} disabled={cargando}>
          <FiRefreshCw size={16} className={cargando ? styles.girando : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {error && (
        <div className={styles.alerta} role="alert">
          <FiAlertCircle size={16} /><span>{error}</span>
        </div>
      )}

      {/* ── Cotizaciones ── */}
      <div className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Cotizaciones</h2>
        <div className={styles.grid}>
          {cargando ? (
            <>
              <div className={`${styles.tarjeta} ${styles.skeleton}`} />
              <div className={`${styles.tarjeta} ${styles.skeleton}`} />
            </>
          ) : (
            <>
              <TarjetaStat
                titulo="Total cotizaciones"
                valor={cotStats?.total ?? 0}
                icono={FiFileText}
                colorClase={styles.tarjetaVerde}
                descripcion={esAdmin ? 'en toda la plataforma' : 'creadas por vos'}
              />
              <TarjetaStat
                titulo="Esta semana"
                valor={cotStats?.semana ?? 0}
                icono={FiCalendar}
                colorClase={styles.tarjetaAzul}
                descripcion={esAdmin ? 'todas las cotizaciones' : 'tus cotizaciones'}
              />
            </>
          )}
        </div>

        {/* Per-user breakdown — admin only */}
        {esAdmin && !cargando && cotStats?.por_usuario?.length > 0 && (
          <div className={styles.usuariosBloque}>
            <p className={styles.usuariosBloqueLabel}>Actividad esta semana por usuario</p>
            <div className={styles.usuariosLista}>
              {cotStats.por_usuario.map((u) => (
                <div key={u.id} className={styles.usuarioFila}>
                  <div className={styles.usuarioAvatar}>
                    <FiUser size={14} />
                  </div>
                  <div className={styles.usuarioInfo}>
                    <div className={styles.usuarioHeader}>
                      <span className={styles.usuarioNombre}>{u.nombre}</span>
                      <span className={styles.usuarioContadores}>
                        <span className={styles.usuarioSemana}>{u.semana} esta semana</span>
                        <span className={styles.usuarioTotal}>{u.total} total</span>
                      </span>
                    </div>
                    <div className={styles.barraWrap}>
                      <div
                        className={styles.barraRelleno}
                        style={{ width: `${Math.round((u.semana / maxSemana) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Paquetes ── */}
      <div className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Paquetes</h2>
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
              <TarjetaStat titulo="Total"       valor={paquetesStats?.total      ?? 0} icono={FiPackage} colorClase={styles.tarjetaNegro}   descripcion="en el catálogo" />
              <TarjetaStat titulo="Disponibles" valor={paquetesStats?.disponibles ?? 0} icono={FiEye}     colorClase={styles.tarjetaVerde}   descripcion="visibles al público" />
              <TarjetaStat titulo="Ocultos"     valor={paquetesStats?.ocultos     ?? 0} icono={FiEyeOff}  colorClase={styles.tarjetaSalmon}  descripcion="no visibles" />
              <TarjetaStat titulo="Destacados"  valor={paquetesStats?.destacados  ?? 0} icono={FiStar}    colorClase={styles.tarjetaAmarillo} descripcion="en la home" />
            </>
          )}
        </div>
      </div>

      {/* ── Accesos rápidos ── */}
      <div className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Accesos rápidos</h2>
        <div className={styles.enlacesGrid}>
          <Link to="/admin/cotizador/nueva" className={styles.enlaceRapido}>
            <FiFileText size={20} />
            <div>
              <span className={styles.enlaceNombre}>Nueva cotización</span>
              <span className={styles.enlaceDesc}>Crear una cotización para un cliente</span>
            </div>
          </Link>
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
