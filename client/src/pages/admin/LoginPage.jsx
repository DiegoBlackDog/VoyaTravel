import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { usuario, cargando, login } = useAuth();
  const navigate = useNavigate();
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [errorServidor, setErrorServidor] = useState('');
  const [enviando, setEnviando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onBlur' });

  if (cargando) {
    return (
      <div className={styles.cargando}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (usuario) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async ({ email, contrasena }) => {
    setErrorServidor('');
    setEnviando(true);
    try {
      await login(email, contrasena);
      navigate('/admin', { replace: true });
    } catch (err) {
      const mensaje =
        err?.response?.data?.mensaje ||
        err?.response?.data?.message ||
        'Credenciales incorrectas. Intenta nuevamente.';
      setErrorServidor(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={styles.pagina}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <span className={styles.logo}>voyâ</span>
          <p className={styles.subtitulo}>Panel de administración</p>
        </div>

        {/* Error de servidor */}
        {errorServidor && (
          <div className={styles.alertaError} role="alert">
            <FiAlertCircle size={16} />
            <span>{errorServidor}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.formulario}>
          {/* Email */}
          <div className={styles.campo}>
            <label htmlFor="email" className={styles.label}>
              Correo electrónico
            </label>
            <div className={`${styles.inputWrap} ${errors.email ? styles.inputError : ''}`}>
              <FiMail size={16} className={styles.icono} />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="hola@voya.com"
                className={styles.input}
                {...register('email', {
                  required: 'El correo es obligatorio.',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Ingresa un correo válido.',
                  },
                })}
              />
            </div>
            {errors.email && (
              <span className={styles.mensajeError}>{errors.email.message}</span>
            )}
          </div>

          {/* Contraseña */}
          <div className={styles.campo}>
            <label htmlFor="contrasena" className={styles.label}>
              Contraseña
            </label>
            <div className={`${styles.inputWrap} ${errors.contrasena ? styles.inputError : ''}`}>
              <FiLock size={16} className={styles.icono} />
              <input
                id="contrasena"
                type={mostrarContrasena ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={styles.input}
                {...register('contrasena', {
                  required: 'La contraseña es obligatoria.',
                  minLength: {
                    value: 4,
                    message: 'Mínimo 4 caracteres.',
                  },
                })}
              />
              <button
                type="button"
                className={styles.toggleOjo}
                onClick={() => setMostrarContrasena((v) => !v)}
                aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {mostrarContrasena ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.contrasena && (
              <span className={styles.mensajeError}>{errors.contrasena.message}</span>
            )}
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={enviando}
            className={styles.botonIngresar}
          >
            {enviando ? (
              <>
                <span className={styles.spinnerBtn} />
                Ingresando…
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
