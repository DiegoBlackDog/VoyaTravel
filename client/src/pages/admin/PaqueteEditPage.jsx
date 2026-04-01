import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';
import PaqueteForm from '../../components/admin/PaqueteForm';
import ImageUploader from '../../components/admin/ImageUploader';
import ItinerarioEditor from '../../components/admin/ItinerarioEditor';
import styles from './PaqueteEditPage.module.css';

export default function PaqueteEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const esEdicion = !!id;

  const [paquete, setPaquete] = useState(null);
  const [etiquetas, setEtiquetas] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [itinerario, setItinerario] = useState([]);
  const [disponible, setDisponible] = useState(true);
  const [destacado, setDestacado] = useState(false);
  const [precioAdulto, setPrecioAdulto] = useState('');
  const [moneda, setMoneda] = useState('USD');
  const [duracionDias, setDuracionDias] = useState('');
  const [duracionNoches, setDuracionNoches] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  /* ── Load etiquetas & destinos ── */
  const cargarCatalogos = useCallback(async () => {
    try {
      const [etqRes, destRes] = await Promise.all([
        api.get('/etiquetas'),
        api.get('/destinos'),
      ]);
      setEtiquetas(etqRes.data.categorias || []);
      setDestinos(destRes.data.destinos || []);
    } catch {
      // Non-blocking: form still works without tags/destinations
    }
  }, []);

  /* ── Load existing package ── */
  const cargarPaquete = useCallback(async () => {
    if (!id) {
      setCargando(false);
      return;
    }

    try {
      const { data } = await api.get(`/paquetes/id/${id}`);
      const paq = data.paquete || data;

      setPaquete(paq);
      setDisponible(paq.disponible !== false);
      setDestacado(paq.destacado === true);
      setPrecioAdulto(paq.precio_adulto ?? '');
      setMoneda(paq.moneda || 'USD');
      setDuracionDias(paq.duracion_dias ?? '');
      setDuracionNoches(paq.duracion_noches ?? '');
      setFechaInicio(paq.fecha_inicio ?? '');
      setFechaVencimiento(paq.fecha_vencimiento ?? '');
      setItinerario(
        (paq.itinerario || [])
          .sort((a, b) => (a.orden ?? a.numero_dia ?? 0) - (b.orden ?? b.numero_dia ?? 0))
      );
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Paquete no encontrado.');
      } else {
        setError('Error al cargar el paquete.');
      }
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargarCatalogos();
    cargarPaquete();
  }, [cargarCatalogos, cargarPaquete]);

  /* ── Refresh after image changes ── */
  const refrescarPaquete = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/paquetes/id/${id}`);
      const paq = data.paquete || data;
      setPaquete(paq);
    } catch {
      // Silent fail
    }
  }, [id]);

  /* ── Submit handler ── */
  const handleSubmit = async (formData) => {
    setError('');
    setExito('');
    setGuardando(true);

    try {
      const payload = {
        ...formData,
        disponible,
        destacado,
        precio_adulto: precioAdulto ? Number(precioAdulto) : null,
        moneda,
        duracion_dias: duracionDias ? Number(duracionDias) : null,
        duracion_noches: duracionNoches ? Number(duracionNoches) : null,
        fecha_inicio: fechaInicio || null,
        fecha_vencimiento: fechaVencimiento || null,
        itinerario: itinerario.map((d, i) => ({
          numero_dia: i + 1,
          titulo: d.titulo,
          descripcion: d.descripcion,
          imagen: d.imagen || null,
          orden: i + 1,
        })),
      };

      if (esEdicion) {
        await api.put(`/paquetes/${id}`, payload);
        setExito('Paquete actualizado correctamente.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        refrescarPaquete();
      } else {
        const { data } = await api.post('/paquetes', payload);
        const nuevoPaquete = data.paquete || data;
        const nuevoId = nuevoPaquete.id;
        navigate(`/admin/paquetes/${nuevoId}`, { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Error al guardar el paquete.';
      setError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setGuardando(false);
    }
  };

  /* ── Build default values for the form ── */
  const buildDefaultValues = () => {
    if (!paquete) return undefined;

    return {
      titulo: paquete.titulo || '',
      slug: paquete.slug || '',
      descripcion: paquete.descripcion || '',
      resumen: paquete.resumen || '',
      duracion_dias: paquete.duracion_dias ?? '',
      duracion_noches: paquete.duracion_noches ?? '',
      condiciones: paquete.condiciones || '',
      incluye: paquete.incluye || [],
      no_incluye: paquete.no_incluye || [],
      etiquetas_ids: (paquete.etiquetas || []).map((e) => e.id),
      destinos_ids: (paquete.destinos || []).map((d) => d.id),
      costos: paquete.costos || [],
      alojamientos: (paquete.alojamientos || []).map((a) => ({
        ...a,
        hotel_nombre: a.hotel?.nombre || '',
      })),
    };
  };

  /* ── Loading state ── */
  if (cargando) {
    return (
      <div className={styles.pagina}>
        <div className={styles.cargando}>
          <div className={styles.spinner} />
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pagina}>
      {/* ── Header ── */}
      <div className={styles.encabezado}>
        <div>
          <Link to="/admin/paquetes" className={styles.linkVolver}>
            <FiArrowLeft size={16} />
            Volver a paquetes
          </Link>
          <h1 className={styles.titulo}>
            {esEdicion ? `Editar: ${paquete?.titulo || 'Paquete'}` : 'Nuevo paquete'}
          </h1>
        </div>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className={styles.alerta} role="alert">
          <FiAlertCircle size={15} />
          <span>{error}</span>
          <button className={styles.alertaCerrar} onClick={() => setError('')}>x</button>
        </div>
      )}

      {exito && (
        <div className={styles.alertaExito} role="status">
          <span>{exito}</span>
          <button className={styles.alertaCerrar} onClick={() => setExito('')}>x</button>
        </div>
      )}

      {/* ── Main content ── */}
      <div className={styles.contenido}>
        <div className={styles.columnaForm}>
          <PaqueteForm
            key={paquete?.id || 'nuevo'}
            defaultValues={buildDefaultValues()}
            etiquetas={etiquetas}
            destinos={destinos}
            onSubmit={handleSubmit}
            guardando={guardando}
          />
        </div>

        <div className={styles.columnaSide}>
          <ImageUploader
            paqueteId={paquete?.id || null}
            imagenes={paquete?.imagenes || []}
            onUpdate={refrescarPaquete}
          />

          {/* Duración */}
          <div className={styles.opcionesCard}>
            <div className={styles.duracionHeader}>
              <h3 className={styles.opcionesTitulo} style={{ margin: 0 }}>Duración</h3>
              <button
                type="button"
                className={styles.botonStandard}
                onClick={() => {
                  const isDuracionStandard = String(duracionDias) === '8' && String(duracionNoches) === '7';
                  if (isDuracionStandard) { setDuracionDias(''); setDuracionNoches(''); }
                  else { setDuracionDias(8); setDuracionNoches(7); }
                }}
              >
                {String(duracionDias) === '8' && String(duracionNoches) === '7' ? 'Limpiar' : 'Estándar'}
              </button>
            </div>
            <div className={styles.preciosGrid} style={{ marginTop: 12 }}>
              <div className={styles.preciosCampo}>
                <label className={styles.preciosLabel}>Días</label>
                <input
                  type="number"
                  min="1"
                  className={styles.preciosInput}
                  value={duracionDias}
                  onChange={(e) => setDuracionDias(e.target.value)}
                  placeholder="Ej: 8"
                />
              </div>
              <div className={styles.preciosCampo}>
                <label className={styles.preciosLabel}>Noches</label>
                <input
                  type="number"
                  min="0"
                  className={styles.preciosInput}
                  value={duracionNoches}
                  onChange={(e) => setDuracionNoches(e.target.value)}
                  placeholder="Ej: 7"
                />
              </div>
            </div>
          </div>

          {/* Vigencia */}
          <div className={styles.opcionesCard}>
            <h3 className={styles.opcionesTitulo}>Vigencia</h3>
            <div className={styles.preciosGrid}>
              <div className={styles.preciosCampo}>
                <label className={styles.preciosLabel}>Fecha inicio</label>
                <input
                  type="date"
                  className={styles.preciosInput}
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className={styles.preciosCampo}>
                <label className={styles.preciosLabel}>Fecha vencimiento</label>
                <input
                  type="date"
                  className={styles.preciosInput}
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                />
              </div>
            </div>
            {fechaVencimiento && (
              <p className={styles.vigenciaAviso}>
                Al vencer esta fecha el paquete dejará de ser visible en el sitio.
              </p>
            )}
          </div>

          {/* Precios */}
          <div className={styles.opcionesCard}>
            <h3 className={styles.opcionesTitulo}>Precio</h3>
            <div className={styles.preciosGrid}>
              <div className={styles.preciosCampo}>
                <label className={styles.preciosLabel}>Precio adulto</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={styles.preciosInput}
                  value={precioAdulto}
                  onChange={(e) => setPrecioAdulto(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className={styles.preciosCampo}>
                <label className={styles.preciosLabel}>Moneda</label>
                <select className={styles.preciosSelect} value={moneda} onChange={(e) => setMoneda(e.target.value)}>
                  <option value="USD">USD</option>
                  <option value="UYU">UYU</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>

          {/* Opciones */}
          <div className={styles.opcionesCard}>
            <h3 className={styles.opcionesTitulo}>Opciones</h3>
            <div className={styles.opcionesLista}>
              {[
                { value: disponible, setter: setDisponible, label: 'Disponible', desc: 'Visible en el sitio' },
                { value: destacado,  setter: setDestacado,  label: 'Destacado',  desc: 'Aparece en la home' },
              ].map(({ value, setter, label, desc }) => (
                <div key={label} className={styles.opcionItem}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={value}
                    className={`${styles.toggle} ${value ? styles.toggleActivo : ''}`}
                    onClick={() => setter(!value)}
                  >
                    <span className={styles.toggleCircle} />
                  </button>
                  <div>
                    <span className={styles.opcionLabel}>{label}</span>
                    <span className={styles.opcionDesc}>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ItinerarioEditor
            value={itinerario}
            onChange={setItinerario}
            paqueteId={paquete?.id || null}
          />
        </div>
      </div>
    </div>
  );
}
