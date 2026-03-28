import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaWhatsapp, FaPaperPlane, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { enviarConsulta } from '../../services/contactoService';
import { useConfiguracion } from '../../hooks/useConfiguracion';
import styles from './FormularioConsulta.module.css';

export default function FormularioConsulta({ paquete }) {
  const { configuracion, cargando: cargandoConfig } = useConfiguracion();
  const whatsappDisponible = !cargandoConfig && configuracion?.whatsapp;
  const [enviado, setEnviado] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      nombre: '',
      email: '',
      celular: '',
      adultos: 1,
      ninos: 0,
      infantes: 0,
      mensaje: '',
    },
  });

  const paqueteUrl = paquete?.slug
    ? `${window.location.origin}/paquetes/${paquete.slug}`
    : window.location.href;

  async function onSubmit(datos) {
    setErrorEnvio('');
    try {
      await enviarConsulta({
        nombre: datos.nombre,
        email: datos.email,
        celular: datos.celular,
        mensaje: datos.mensaje,
        paquete_titulo: paquete?.titulo || '',
        paquete_url: paqueteUrl,
        adultos: datos.adultos,
        ninos: datos.ninos,
        infantes: datos.infantes,
      });
      setEnviado(true);
      reset();
    } catch {
      setErrorEnvio('No pudimos enviar tu consulta. Por favor intentá de nuevo o escribinos por WhatsApp.');
    }
  }

  function normalizarWhatsapp(raw) {
    // Strip everything except digits
    let n = (raw || '').replace(/\D/g, '');
    // If local Uruguayan format (starts with 0, 8-9 digits), convert to international
    if (n.startsWith('0') && n.length <= 9) n = '598' + n.slice(1);
    // If bare local number without leading 0 (8 digits), prepend country code
    if (n.length === 8) n = '598' + n;
    return n;
  }

  function handleWhatsApp() {
    const numero = normalizarWhatsapp(configuracion?.whatsapp);
    if (!numero) return;
    const nombre = paquete?.titulo || 'un paquete';
    const texto = encodeURIComponent(
      `Hola! Me interesa consultar sobre el paquete "${nombre}". ¿Podrían darme más información?\n\n${paqueteUrl}`
    );
    window.open(`https://wa.me/${numero}?text=${texto}`, '_blank', 'noopener,noreferrer');
  }

  if (enviado) {
    return (
      <div className={styles.exito}>
        <FaCheckCircle size={40} className={styles.exitoIcono} />
        <h3 className={styles.exitoTitulo}>¡Consulta enviada!</h3>
        <p className={styles.exitoTexto}>
          Nos pondremos en contacto contigo a la brevedad. También podés escribirnos por WhatsApp para una respuesta más rápida.
        </p>
        {whatsappDisponible && (
          <button
            type="button"
            className={styles.whatsappBtn}
            onClick={handleWhatsApp}
          >
            <FaWhatsapp size={18} />
            Escribir por WhatsApp
          </button>
        )}
        <button
          type="button"
          className={styles.nuevaConsultaBtn}
          onClick={() => setEnviado(false)}
        >
          Nueva consulta
        </button>
      </div>
    );
  }

  return (
    <div className={styles.formulario}>
      <h3 className={styles.titulo}>Consultar este paquete</h3>
      <p className={styles.subtitulo}>Completá el formulario y te respondemos a la brevedad.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Nombre */}
        <div className={styles.campo}>
          <label className={styles.label} htmlFor="consulta-nombre">
            Nombre completo <span className={styles.requerido}>*</span>
          </label>
          <input
            id="consulta-nombre"
            type="text"
            className={`${styles.input} ${errors.nombre ? styles.inputError : ''}`}
            placeholder="Tu nombre"
            {...register('nombre', { required: 'El nombre es obligatorio' })}
          />
          {errors.nombre && (
            <span className={styles.error}>{errors.nombre.message}</span>
          )}
        </div>

        {/* Email */}
        <div className={styles.campo}>
          <label className={styles.label} htmlFor="consulta-email">
            Email <span className={styles.requerido}>*</span>
          </label>
          <input
            id="consulta-email"
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="tu@email.com"
            {...register('email', {
              required: 'El email es obligatorio',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
            })}
          />
          {errors.email && (
            <span className={styles.error}>{errors.email.message}</span>
          )}
        </div>

        {/* Celular */}
        <div className={styles.campo}>
          <label className={styles.label} htmlFor="consulta-celular">
            Celular
          </label>
          <input
            id="consulta-celular"
            type="tel"
            className={styles.input}
            placeholder="+598 99 000 000"
            {...register('celular')}
          />
        </div>

        {/* Pasajeros */}
        <div className={styles.pasajerosRow}>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="consulta-adultos">
              Adultos
            </label>
            <input
              id="consulta-adultos"
              type="number"
              min="1"
              max="20"
              className={styles.inputNumero}
              {...register('adultos', { min: 1, valueAsNumber: true })}
            />
          </div>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="consulta-ninos">
              Niños
            </label>
            <input
              id="consulta-ninos"
              type="number"
              min="0"
              max="20"
              className={styles.inputNumero}
              {...register('ninos', { min: 0, valueAsNumber: true })}
            />
          </div>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="consulta-infantes">
              Infantes
            </label>
            <input
              id="consulta-infantes"
              type="number"
              min="0"
              max="20"
              className={styles.inputNumero}
              {...register('infantes', { min: 0, valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Mensaje */}
        <div className={styles.campo}>
          <label className={styles.label} htmlFor="consulta-mensaje">
            Mensaje <span className={styles.requerido}>*</span>
          </label>
          <textarea
            id="consulta-mensaje"
            rows={4}
            className={`${styles.textarea} ${errors.mensaje ? styles.inputError : ''}`}
            placeholder="¿Tenés alguna consulta específica o preferencia?"
            {...register('mensaje', { required: 'El mensaje es obligatorio' })}
          />
          {errors.mensaje && (
            <span className={styles.error}>{errors.mensaje.message}</span>
          )}
        </div>

        {/* Error de envío */}
        {errorEnvio && (
          <div className={styles.errorEnvio} role="alert">
            <FaExclamationCircle size={14} />
            <span>{errorEnvio}</span>
          </div>
        )}

        {/* Botones */}
        <button
          type="submit"
          className={styles.btnEnviar}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className={styles.spinner} />
          ) : (
            <>
              <FaPaperPlane size={14} />
              Enviar consulta
            </>
          )}
        </button>
      </form>

      {whatsappDisponible && (
        <div className={styles.separador}>
          <span>o también</span>
        </div>
      )}

      {whatsappDisponible && (
        <button
          type="button"
          className={styles.whatsappBtn}
          onClick={handleWhatsApp}
        >
          <FaWhatsapp size={18} />
          Consultar por WhatsApp
        </button>
      )}
    </div>
  );
}
