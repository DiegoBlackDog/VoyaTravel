import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import styles from './AdminLayout.module.css';

/* ── Navigation items with role requirements ── */
const NAV_ITEMS = [
  { to: '/admin',            label: 'Dashboard',    icon: FiGrid,          rolMinimo: 'visor'  },
  { to: '/admin/paquetes',   label: 'Paquetes',     icon: FiPackage,       rolMinimo: 'visor'  },
  { to: '/admin/etiquetas',  label: 'Etiquetas',    icon: FiTag,           rolMinimo: 'editor' },
  { to: '/admin/destinos',   label: 'Destinos',     icon: FiMapPin,        rolMinimo: 'editor' },
  { to: '/admin/hoteles',    label: 'Hoteles',      icon: FiHome,          rolMinimo: 'editor' },
  { to: '/admin/testimonios',label: 'Testimonios',  icon: FiMessageSquare, rolMinimo: 'editor' },
  { to: '/admin/operadores', label: 'Operadores',   icon: FiBriefcase,     rolMinimo: 'editor' },
  { to: '/admin/cotizador', label: 'Cotizador',    icon: FiFileText,      rolMinimo: 'editor' },
  { to: '/admin/configuracion', label: 'Configuración', icon: FiSettings,  rolMinimo: 'admin'  },
  { to: '/admin/usuarios',   label: 'Usuarios',     icon: FiUsers,         rolMinimo: 'admin'  },
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
  const navigate = useNavigate();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const overlayRef = useRef(null);

  /* Close sidebar on route change (mobile) */
  const cerrarSidebar = () => setSidebarAbierto(false);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (sidebarAbierto && overlayRef.current === e.target) {
        setSidebarAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sidebarAbierto]);

  /* Prevent body scroll when sidebar open on mobile */
  useEffect(() => {
    if (sidebarAbierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarAbierto]);

  const handleLogout = async () => {
    setCerrandoSesion(true);
    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } finally {
      setCerrandoSesion(false);
    }
  };

  const enlacesFiltrados = NAV_ITEMS.filter(
    (item) => usuario && tieneAcceso(usuario.rol, item.rolMinimo)
  );

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className={styles.shell}>
      {/* ── Mobile top bar ── */}
      <header className={styles.topbarMovil}>
        <button
          className={styles.hamburger}
          onClick={() => setSidebarAbierto(true)}
          aria-label="Abrir menú"
        >
          <FiMenu size={22} />
        </button>
        <span className={styles.logoMovil}>voyâ</span>
        <div className={styles.topbarSpacer} />
      </header>

      {/* ── Overlay for mobile ── */}
      {sidebarAbierto && (
        <div
          ref={overlayRef}
          className={styles.overlay}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${sidebarAbierto ? styles.sidebarAbierto : ''}`}>
        {/* Close btn (mobile only) */}
        <button
          className={styles.cerrarSidebar}
          onClick={cerrarSidebar}
          aria-label="Cerrar menú"
        >
          <FiX size={20} />
        </button>

        {/* Logo */}
        <NavLink to="/admin" className={styles.logo} onClick={cerrarSidebar}>
          voyâ
        </NavLink>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Navegación admin">
          <ul className={styles.navList}>
            {enlacesFiltrados.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/admin'}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActivo : ''}`
                  }
                  onClick={cerrarSidebar}
                >
                  <Icon size={18} className={styles.navIcon} />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info + logout */}
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
          <button
            className={styles.botonLogout}
            onClick={handleLogout}
            disabled={cerrandoSesion}
            aria-label="Cerrar sesión"
          >
            {cerrandoSesion ? (
              <span className={styles.spinnerLogout} />
            ) : (
              <FiLogOut size={18} />
            )}
            <span>Salir</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.contenido}>
        <Outlet />
      </main>
    </div>
  );
}
