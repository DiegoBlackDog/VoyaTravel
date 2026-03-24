import { useState, useEffect, useCallback } from 'react';
import { FiAlertCircle, FiCheck, FiSave } from 'react-icons/fi';
import api from '../../services/api';
import styles from './ConfiguracionPage.module.css';

const GRUPOS = [
  {
    key: 'contacto',
    titulo: 'Contacto',
    descripcion: 'Información de contacto visible en el sitio web.',
    campos: [
      { clave: 'whatsapp_numero', label: 'WhatsApp', placeholder: '+598 99 123 456', hint: 'Número con código de país' },
      { clave: 'email_contacto', label: 'Email de contacto', placeholder: 'hola@voya.travel', hint: '' },
      { clave: 'telefono_contacto', label: 'Teléfono', placeholder: '+598 2 123 4567', hint: '' },
    ],
  },
  {
    key: 'estadisticas',
    titulo: 'Estadísticas',
    descripcion: 'Números destacados que se muestran en la página de inicio.',
    campos: [
      { clave: 'estadistica_paquetes', label: 'Paquetes', placeholder: 'Ej: 120+', hint: '' },
      { clave: 'estadistica_paises', label: 'Países', placeholder: 'Ej: 30+', hint: '' },
      { clave: 'estadistica_actividades', label: 'Actividades', placeholder: 'Ej: 50+', hint: '' },
      { clave: 'estadistica_viajeros', label: 'Viajeros felices', placeholder: 'Ej: 10K+', hint: '' },
    ],
  },
];

export default function ConfiguracionPage() {
  const [valores, setValores] = useState({});
  const [originales, setOriginales] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [guardando, setGuardando] = useState({});

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const { data } = await api.get('/configuracion');
      const config = data.configuracion || {};
      setValores({ ...config });
      setOriginales({ ...config });
    } catch {
      setError('No se pudo cargar la configuración.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (exito) {
      const timer = setTimeout(() => setExito(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [exito]);

  const handleChange = (clave, valor) => {
    setValores((prev) => ({ ...prev, [clave]: valor }));
  };

  const grupoModificado = (grupo) => {
    return grupo.campos.some((c) => (valores[c.clave] || '') !== (originales[c.clave] || ''));
  };

  const guardarGrupo = async (grupo) => {
    setGuardando((prev) => ({ ...prev, [grupo.key]: true }));
    setError('');
    try {
      const camposModificados = grupo.campos.filter(
        (c) => (valores[c.clave] || '') !== (originales[c.clave] || '')
      );

      for (const campo of camposModificados) {
        await api.put(`/configuracion/${campo.clave}`, { valor: valores[campo.clave] || '' });
      }

      // Update originals
      setOriginales((prev) => {
        const updated = { ...prev };
        for (const campo of camposModificados) {
          updated[campo.clave] = valores[campo.clave] || '';
        }
        return updated;
      });

      setExito(`Sección "${grupo.titulo}" guardada correctamente.`);
    } catch (err) {
      setError(err.response?.data?.error || `Error al guardar la sección "${grupo.titulo}".`);
    } finally {
      setGuardando((prev) => ({ ...prev, [grupo.key]: false }));
    }
  };

  return (
    <div className={styles.pagina}>
      {/* Header */}
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Configuración</h1>
          <p className={styles.subtitulo}>Ajustes generales del sitio</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className={styles.alerta} role="alert">
          <FiAlertCircle size={15} />
          <span>{error}</span>
          <button className={styles.alertaCerrar} onClick={() => setError('')}>×</button>
        </div>
      )}
      {exito && (
        <div className={styles.alertaExito} role="status">
          <FiCheck size={15} />
          <span>{exito}</span>
          <button className={styles.alertaCerrar} onClick={() => setExito('')}>×</button>
        </div>
      )}

      {/* Loading */}
      {cargando && <div className={styles.cargando}>Cargando configuración...</div>}

      {/* Groups */}
      {!cargando &&
        GRUPOS.map((grupo) => (
          <div key={grupo.key} className={styles.seccionGrupo}>
            <h2 className={styles.seccionTitulo}>{grupo.titulo}</h2>
            {grupo.descripcion && <p className={styles.seccionDesc}>{grupo.descripcion}</p>}

            <div className={styles.formGrid}>
              {grupo.campos.map((campo) => (
                <div key={campo.clave} className={styles.formGroup}>
                  <label htmlFor={campo.clave}>{campo.label}</label>
                  <input
                    id={campo.clave}
                    className={styles.formInput}
                    type="text"
                    value={valores[campo.clave] || ''}
                    onChange={(e) => handleChange(campo.clave, e.target.value)}
                    placeholder={campo.placeholder}
                  />
                  {campo.hint && <div className={styles.formHint}>{campo.hint}</div>}
                </div>
              ))}
            </div>

            <div className={styles.seccionAcciones}>
              <button
                className={styles.botonPrimario}
                onClick={() => guardarGrupo(grupo)}
                disabled={!grupoModificado(grupo) || guardando[grupo.key]}
              >
                <FiSave size={14} />
                {guardando[grupo.key] ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
