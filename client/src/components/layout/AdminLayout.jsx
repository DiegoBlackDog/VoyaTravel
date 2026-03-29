import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FiGrid,
  FiPackage,
  FiTag,
  FiMapPin,
  FiMessageSquare,
  FiSettings,
  FiUsers,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown,
  FiBriefcase,
  FiHome,
  FiFileText,
  FiInfo,
  FiNavigation,
  FiSend,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import styles from './AdminLayout.module.css';

const NAV_ITEMS = [
  { to: '/admin',             label: 'Dashboard',     icon: FiGrid,          rolMinimo: 'visor'  },
  { to: '/admin/paquetes',    label: 'Paquetes',      icon: FiPackage,       rolMinimo: 'visor'  },
  { to: '/admin/testimonios', label: 'Testimonios',   icon: FiMessageSquare, rolMinimo: 'editor' },
  { to: '/admin/cotizador',   label: 'Cotizaciones',  icon: FiFileText,      rolMinimo: 'editor' },
];

const INFO_ITEMS = [
  { to: '/admin/destinos',    label: 'Destinos',     icon: FiMapPin,     rolMinimo: 'editor' },
  { to: '/admin/etiquetas',   label: 'Etiquetas',    icon: FiTag,        rolMinimo: 'editor' },
  { to: '/admin/hoteles',     label: 'Hoteles',      icon: FiHome,       rolMinimo: 'editor' },
  { to: '/admin/operadores',  label: 'Operadores',   icon: FiBriefcase,  rolMinimo: 'editor' },
  { to: '/admin/aeropuertos', label: 'Aeropuertos',  icon: FiNavigation, rolMinimo: 'editor' },
  { to: '/admin/aerolineas',  label: 'Aerolíneas',   icon: FiSend,       rolMinimo: 'editor' },
];

const ADMIN_ITEMS = [
  { to: '/admin/configuracion', label: 'Configuración', icon: FiSettings, rolMinimo: 'admin' },
  { to: '/admin/usuarios',      label: 'Usuarios',      icon: FiUsers,    rolMinimo: 'admin' },
];

const JERARQUIA = { admin: 3, editor: 2, visor: 1 };
const BADGE_CLASE = {
  admin:  styles.badgeAdmin,
  editor: styles.badgeEditor,
  visor:  styles.badgeVisor,
};

function tieneAcceso(rolUsuario, rolMinimo) {
  return (JERARQUIA[rolUsuario] || 0) >= (JERARQUIA[rolMinimo] || 0);
}

export default function AdminLayout() {
  const { usuario, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [infoAbierto, setInfoAbierto]       = useState(
    INFO_ITEMS.some((i) => location.pathname.startsWith(i.to))
  );
  const overlayRef = useRef(null);

  const cerrarSidebar = () => setSidebarAbierto(false);

  useEffect(() => {
    const handler = (e) => {
      if (sidebarAbierto && overlayRef.current === e.target) setSidebarAbierto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sidebarAbierto]);

  useEffect(() => {
    if (sidebarAbierto) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarAbierto]);

  const handleLogout = async () => {
    setCerrandoSesion(true);
    try { await logout(); navigate('/admin/login', { replace: true }); }
    finally { setCerrandoSesion(false); }
  };

  const filtrar = (items) => items.filter((i) => usuario && tieneAcceso(usuario.rol, i.rolMinimo));

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className={styles.shell}>
      <header className={styles.topbarMovil}>
        <button className={styles.hamburger} onClick={() => setSidebarAbierto(true)} aria-label="Abrir menú">
          <FiMenu size={22} />
        </button>
        <span className={styles.logoMovil}>voyâ</span>
        <div className={styles.topbarSpacer} />
      </header>

      {sidebarAbierto && <div ref={overlayRef} className={styles.overlay} aria-hidden="true" />}

      <aside className={`${styles.sidebar} ${sidebarAbierto ? styles.sidebarAbierto : ''}`}>
        <button className={styles.cerrarSidebar} onClick={cerrarSidebar} aria-label="Cerrar menú">
          <FiX size={20} />
        </button>

        <NavLink to="/admin" className={styles.logo} onClick={cerrarSidebar}>voyâ</NavLink>

        <nav className={styles.nav} aria-label="Navegación admin">
          <ul className={styles.navList}>
            {/* Main items */}
            {filtrar(NAV_ITEMS).map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/admin'}
                  className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActivo : ''}`}
                  onClick={cerrarSidebar}
                >
                  <Icon size={18} className={styles.navIcon} />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}

            {/* Información group */}
            {filtrar(INFO_ITEMS).length > 0 && (
              <li>
                <button
                  className={`${styles.navLink} ${styles.navLinkGrupo} ${infoAbierto ? styles.navLinkGrupoAbierto : ''}`}
                  onClick={() => setInfoAbierto((v) => !v)}
                >
                  <FiInfo size={18} className={styles.navIcon} />
                  <span>Recursos</span>
                  <FiChevronDown size={14} className={styles.navChevron} />
                </button>
                {infoAbierto && (
                  <ul className={styles.navSubList}>
                    {filtrar(INFO_ITEMS).map(({ to, label, icon: Icon }) => (
                      <li key={to}>
                        <NavLink
                          to={to}
                          className={({ isActive }) => `${styles.navLink} ${styles.navSubLink} ${isActive ? styles.navLinkActivo : ''}`}
                          onClick={cerrarSidebar}
                        >
                          <Icon size={16} className={styles.navIcon} />
                          <span>{label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )}

            {/* Admin items */}
            {filtrar(ADMIN_ITEMS).map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActivo : ''}`}
                  onClick={cerrarSidebar}
                >
                  <Icon size={18} className={styles.navIcon} />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.footerSidebar}>
          <div className={styles.usuarioInfo}>
            <div className={styles.avatar}>{iniciales}</div>
            <div className={styles.usuarioDatos}>
              <span className={styles.usuarioNombre}>{usuario?.nombre || 'Usuario'}</span>
              <span className={`${styles.badge} ${BADGE_CLASE[usuario?.rol] || ''}`}>
                {usuario?.rol || '—'}
              </span>
            </div>
          </div>
          <button className={styles.botonLogout} onClick={handleLogout} disabled={cerrandoSesion} aria-label="Cerrar sesión">
            {cerrandoSesion ? <span className={styles.spinnerLogout} /> : <FiLogOut size={18} />}
            <span>Salir</span>
          </button>
        </div>
      </aside>

      <main className={styles.contenido}>
        <Outlet />
      </main>
    </div>
  );
}
