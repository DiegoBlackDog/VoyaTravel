import { FaWhatsapp } from 'react-icons/fa';
import { useConfiguracion } from '../../hooks/useConfiguracion';
import styles from './WhatsAppButton.module.css';

export default function WhatsAppButton() {
  const { configuracion } = useConfiguracion();

  const whatsapp = configuracion?.whatsapp || '';
  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}`
    : null;

  if (!whatsappUrl) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.boton}
      aria-label="Contactar por WhatsApp"
    >
      <FaWhatsapp size={26} />
      <span className={styles.tooltip}>Chateá con nosotros</span>
    </a>
  );
}
