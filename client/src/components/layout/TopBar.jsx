import { FaInstagram, FaFacebook, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useConfiguracion } from '../../hooks/useConfiguracion';
import styles from './TopBar.module.css';

export default function TopBar() {
  const { configuracion } = useConfiguracion();

  const instagram = configuracion?.instagram || '#';
  const facebook = configuracion?.facebook || '#';
  const telefono = configuracion?.telefono || '';
  const email = configuracion?.email_contacto || '';

  return (
    <div className={styles.topbar}>
      <div className={styles.contenedor}>
        <div className={styles.contacto}>
          {telefono && (
            <a href={`tel:${telefono}`} className={styles.item}>
              <FaPhone size={12} />
              <span>{telefono}</span>
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className={styles.item}>
              <FaEnvelope size={12} />
              <span>{email}</span>
            </a>
          )}
        </div>
        <div className={styles.redes}>
          <a
            href={instagram !== '#' ? instagram : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.redSocial}
            aria-label="Instagram"
          >
            <FaInstagram size={14} />
          </a>
          <a
            href={facebook !== '#' ? facebook : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.redSocial}
            aria-label="Facebook"
          >
            <FaFacebook size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
