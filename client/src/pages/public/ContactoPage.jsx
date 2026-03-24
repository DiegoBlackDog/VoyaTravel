import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
} from 'react-icons/fa';
import { useConfiguracion } from '../../hooks/useConfiguracion';
import { enviarConsulta } from '../../services/contactoService';
import styles from './ContactoPage.module.css';

/* ------------------------------------------------------------------ */
/* Componente principal                                                  */
/* ------------------------------------------------------------------ */

export default function ContactoPage() {
  const { configuracion, cargando: cargandoConfig } = useConfiguracion();
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
      telefono: '',
      mensaje: '',
    },
  });

  async function onSubmit(datos) {
    setErrorEnvio('');
    try {
      await enviarConsulta(datos);
      setEnviado(true);
      reset();
    } catch {
      setErrorEnvio('No pudimos enviar tu mensaje. Por favor intentá de nuevo o escribinos por WhatsApp.');
    }
  }

  function handleWhatsApp() {
    const numero = configuracion?.whatsapp || '';
    const texto = encodeURIComponent('Hola! Me gustaría obtener más información sobre sus paquetes.');
    window.open(`https://wa.me/${numero}?text=${texto}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className={styles.pagina}>
      {/* ========================================================= */}
      {/* HEADER                                                      */}
      {/* ========================================================= */}
      <section className={styles.header}>
        <div className={styles.headerContenido}>
          <p className={styles.eyebrow}>Estamos para ayudarte</p>
          <h1 className={styles.titulo}>Contactanos</h1>
          <p className={styles.subtitulo}>
            ¿Tenés dudas, querés cotizar un viaje o simplemente hola?
            Escribinos y te respondemos a la brevedad.
          </p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* CONTENIDO                                                   */}
      {/* ========================================================= */}
      <div className={styles.contenedor}>
        <div className={styles.layout}>
          {/* ---- Formulario ---- */}
          <main className={styles.formWrapper}>
            <div className={styles.formCard}>
              {enviado ? (
                <div className={styles.exito}>
                  <FaCheckCircle size={52} className={styles.exitoIcono} />
                  <h2 className={styles.exitoTitulo}>¡Mensaje enviado!</h2>
                  <p className={styles.exitoTexto}>
                    Gracias por escribirnos. Nos pondremos en contacto contigo a la brevedad.
                    También podés escribirnos por WhatsApp para una respuesta más rápida.
                  </p>
                  <button
                    type="button"
                    className={styles.whatsappBtn}
                    onClick={handleWhatsApp}
                  >
                    <FaWhatsapp size={18} />
                    Continuar por WhatsApp
                  </button>
                  <button
                    type="button"
                    className={styles.nuevoMensajeBtn}
                    onClick={() => setEnviado(false)}
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <>
                  <h2 className={styles.formTitulo}>Envianos un mensaje</h2>

                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className={styles.formDosColumnas}>
                      {/* Nombre */}
                      <div className={styles.campo}>
                        <label className={styles.label} htmlFor="contacto-nombre">
                          Nombre completo <span className={styles.requerido}>*</span>
                        </label>
                        <input
                          id="contacto-nombre"
                          type="text"
                          className={`${styles.input} ${errors.nombre ? styles.inputError : ''}`}
                          placeholder="Tu nombre"
                          {...register('nombre', { required: 'El nombre es obligatorio' })}
                        />
                        {errors.nombre && (
                          <span className={styles.errorMsg}>{errors.nombre.message}</span>
                        )}
                      </div>

                      {/* Email */}
                      <div className={styles.campo}>
                        <label className={styles.label} htmlFor="contacto-email">
                          Email <span className={styles.requerido}>*</span>
                        </label>
                        <input
                          id="contacto-email"
                          type="email"
                          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                          placeholder="tu@email.com"
                          {...register('email', {
                            required: 'El email es obligatorio',
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
                          })}
                        />
                        {errors.email && (
                          <span className={styles.errorMsg}>{errors.email.message}</span>
                        )}
                      </div>
                    </div>

                    {/* Teléfono */}
                    <div className={styles.campo}>
                      <label className={styles.label} htmlFor="contacto-telefono">
                        Teléfono
                      </label>
                      <input
                        id="contacto-telefono"
                        type="tel"
                        className={styles.input}
                        placeholder="+598 99 000 000"
                        {...register('telefono')}
                      />
                    </div>

                    {/* Mensaje */}
                    <div className={styles.campo}>
                      <label className={styles.label} htmlFor="contacto-mensaje">
                        Mensaje <span className={styles.requerido}>*</span>
                      </label>
                      <textarea
                        id="contacto-mensaje"
                        rows={6}
                        className={`${styles.textarea} ${errors.mensaje ? styles.inputError : ''}`}
                        placeholder="Contanos en qué te podemos ayudar..."
                        {...register('mensaje', { required: 'El mensaje es obligatorio' })}
                      />
                      {errors.mensaje && (
                        <span className={styles.errorMsg}>{errors.mensaje.message}</span>
                      )}
                    </div>

                    {/* Error de envío */}
                    {errorEnvio && (
                      <div className={styles.errorEnvio} role="alert">
                        <FaExclamationCircle size={14} />
                        <span>{errorEnvio}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className={styles.btnEnviar}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className={styles.spinner} />
                      ) : (
                        <>
                          <FaPaperPlane size={15} />
                          Enviar mensaje
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </main>

          {/* ---- Sidebar de info ---- */}
          <aside className={styles.sidebar}>
            <div className={styles.infoCard}>
              <h2 className={styles.infoTitulo}>Información de contacto</h2>
              <p className={styles.infoSubtitulo}>
                Podés comunicarte con nosotros por cualquiera de estos medios.
              </p>

              <div className={styles.infoLista}>
                {/* Email */}
                {(!cargandoConfig && configuracion?.email_contacto) && (
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcono}>
                      <FaEnvelope size={18} />
                    </div>
                    <div className={styles.infoTexto}>
                      <span className={styles.infoLabel}>Email</span>
                      <a
                        href={`mailto:${configuracion.email_contacto}`}
                        className={styles.infoValor}
                      >
                        {configuracion.email_contacto}
                      </a>
                    </div>
                  </div>
                )}

                {/* Teléfono */}
                {(!cargandoConfig && configuracion?.telefono) && (
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcono}>
                      <FaPhone size={18} />
                    </div>
                    <div className={styles.infoTexto}>
                      <span className={styles.infoLabel}>Teléfono</span>
                      <a
                        href={`tel:${configuracion.telefono}`}
                        className={styles.infoValor}
                      >
                        {configuracion.telefono}
                      </a>
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                {(!cargandoConfig && configuracion?.whatsapp) && (
                  <div className={styles.infoItem}>
                    <div className={`${styles.infoIcono} ${styles.infoIconoWhatsapp}`}>
                      <FaWhatsapp size={18} />
                    </div>
                    <div className={styles.infoTexto}>
                      <span className={styles.infoLabel}>WhatsApp</span>
                      <button
                        type="button"
                        className={styles.infoValorBtn}
                        onClick={handleWhatsApp}
                      >
                        {configuracion.whatsapp}
                      </button>
                    </div>
                  </div>
                )}

                {/* Dirección */}
                {(!cargandoConfig && configuracion?.direccion) && (
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcono}>
                      <FaMapMarkerAlt size={18} />
                    </div>
                    <div className={styles.infoTexto}>
                      <span className={styles.infoLabel}>Dirección</span>
                      <span className={styles.infoValor}>{configuracion.direccion}</span>
                    </div>
                  </div>
                )}

                {/* Horarios — fallback estático si no hay config */}
                <div className={styles.infoItem}>
                  <div className={styles.infoIcono}>
                    <FaClock size={18} />
                  </div>
                  <div className={styles.infoTexto}>
                    <span className={styles.infoLabel}>Horarios</span>
                    <span className={styles.infoValor}>
                      {configuracion?.horario_atencion || 'Lunes a viernes, 9:00 – 18:00'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.infoDivisor} />

              <button
                type="button"
                className={styles.whatsappBtnSidebar}
                onClick={handleWhatsApp}
              >
                <FaWhatsapp size={18} />
                Escribir por WhatsApp
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
