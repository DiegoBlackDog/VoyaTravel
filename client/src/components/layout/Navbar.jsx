import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars, FaTimes, FaWhatsapp } from 'react-icons/fa';
import { useConfiguracion } from '../../hooks/useConfiguracion';
import styles from './Navbar.module.css';

const LINKS = [
  { to: '/', label: 'Inicio', exact: true },
  { to: '/paquetes', label: 'Paquetes' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { configuracion } = useConfiguracion();
  const menuRef = useRef(null);

  const whatsapp = configuracion?.whatsapp || '';
  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}`
    : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    };
    if (menuAbierto) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuAbierto]);

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} ref={menuRef}>
      <div className={styles.contenedor}>
        {/* Logo */}
        <NavLink to="/" className={styles.logo} onClick={cerrarMenu}>
          voyâ
        </NavLink>

        {/* Desktop nav links */}
        <ul className={styles.links}>
          {LINKS.map(({ to, label, exact }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={exact}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.linkActivo : ''}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaWhatsapp}
          >
            <FaWhatsapp size={16} />
            <span>Consultar</span>
          </a>
        )}

        {/* Hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuAbierto}
        >
          {menuAbierto ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div className={`${styles.menuMovil} ${menuAbierto ? styles.menuAbierto : ''}`}>
        <ul className={styles.linksMovil}>
          {LINKS.map(({ to, label, exact }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={exact}
                className={({ isActive }) =>
                  `${styles.linkMovil} ${isActive ? styles.linkMovilActivo : ''}`
                }
                onClick={cerrarMenu}
              >
                {label}
              </NavLink>
            </li>
          ))}
          {whatsappUrl && (
            <li>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaMovil}
                onClick={cerrarMenu}
              >
                <FaWhatsapp size={16} />
                <span>Consultar por WhatsApp</span>
              </a>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
