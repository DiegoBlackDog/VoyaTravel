import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebook, FaWhatsapp, FaEnvelope, FaPhone } from 'react-icons/fa';
import { useConfiguracion } from '../../hooks/useConfiguracion';
import styles from './Footer.module.css';

const LINKS_NAV = [
  { to: '/', label: 'Inicio' },
  { to: '/paquetes', label: 'Paquetes' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
];

const LINKS_EXPLORAR = [
  { to: '/paquetes?destino=playa', label: 'Destinos de Playa' },
  { to: '/paquetes?destino=montaña', label: 'Aventura y Montaña' },
  { to: '/paquetes?destino=ciudad', label: 'City Breaks' },
  { to: '/paquetes?destino=europa', label: 'Europa' },
  { to: '/paquetes?destino=caribe', label: 'Caribe' },
];

export default function Footer() {
  const { configuracion } = useConfiguracion();

  const whatsapp = configuracion?.whatsapp_numero || '';
  const email = configuracion?.email_contacto || '';
  const telefono = configuracion?.telefono_contacto || '';
  const instagram = configuracion?.instagram || '';
  const facebook = configuracion?.facebook || '';
  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}`
    : null;

  const anio = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.contenido}>
        <div className={styles.contenedor}>
          {/* Column 1: Brand */}
          <div className={styles.columna}>
            <Link to="/" className={styles.logoFooter}>voyâ</Link>
            <p className={styles.descripcion}>
              Tu agencia de viajes de confianza en Uruguay. Exploramos el mundo juntos con destinos únicos y experiencias inolvidables.
            </p>
            <div className={styles.redes}>
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.redSocial}
                  aria-label="Instagram"
                >
                  <FaInstagram size={18} />
                </a>
              )}
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.redSocial}
                  aria-label="Facebook"
                >
                  <FaFacebook size={18} />
                </a>
              )}
              {whatsapp && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.redSocial}
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Navegación */}
          <div className={styles.columna}>
            <h4 className={styles.tituloColumna}>Navegación</h4>
            <ul className={styles.listaLinks}>
              {LINKS_NAV.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className={styles.linkFooter}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Explorar */}
          <div className={styles.columna}>
            <h4 className={styles.tituloColumna}>Explorar</h4>
            <ul className={styles.listaLinks}>
              {LINKS_EXPLORAR.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className={styles.linkFooter}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contacto */}
          <div className={styles.columna}>
            <h4 className={styles.tituloColumna}>Contacto</h4>
            <ul className={styles.listaContacto}>
              {telefono && (
                <li>
                  <a href={`tel:${telefono}`} className={styles.itemContacto}>
                    <FaPhone size={13} />
                    <span>{telefono}</span>
                  </a>
                </li>
              )}
              {email && (
                <li>
                  <a href={`mailto:${email}`} className={styles.itemContacto}>
                    <FaEnvelope size={13} />
                    <span>{email}</span>
                  </a>
                </li>
              )}
              {whatsapp && (
                <li>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.itemContacto}
                  >
                    <FaWhatsapp size={13} />
                    <span>{whatsapp}</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className={styles.copyright}>
        <div className={styles.contenedorCopyright}>
          <p>&copy; {anio} Voyâ. Todos los derechos reservados.</p>
          <p className={styles.hecho}>Hecho con cariño en Uruguay</p>
        </div>
      </div>
    </footer>
  );
}
