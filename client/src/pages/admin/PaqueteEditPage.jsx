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
      const { data } = await api.get(`/paquetes/${id}`);
      const paq = data.paquete || data;

      setPaquete(paq);
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
      const { data } = await api.get(`/paquetes/${id}`);
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
        itinerario: itinerario.map((d, i) => ({
          numero_dia: i + 1,
          titulo: d.titulo,
          descripcion: d.descripcion,
          orden: i + 1,
        })),
      };

      if (esEdicion) {
        await api.put(`/paquetes/${id}`, payload);
        setExito('Paquete actualizado correctamente.');
        refrescarPaquete();
      } else {
        const { data } = await api.post('/paquetes', payload);
        const nuevoPaquete = data.paquete || data;
        const nuevoId = nuevoPaquete.id;
        setExito('Paquete creado. Redirigiendo...');
        setTimeout(() => {
          navigate(`/admin/paquetes/${nuevoId}`, { replace: true });
        }, 600);
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
      precio_adulto: paquete.precio_adulto ?? '',
      precio_nino: paquete.precio_nino ?? '',
      precio_infante: paquete.precio_infante ?? '',
      moneda: paquete.moneda || 'USD',
      duracion_dias: paquete.duracion_dias ?? '',
      duracion_noches: paquete.duracion_noches ?? '',
      condiciones: paquete.condiciones || '',
      disponible: paquete.disponible !== false,
      destacado: paquete.destacado === true,
      incluye: paquete.incluye || [],
      no_incluye: paquete.no_incluye || [],
      etiquetas_ids: (paquete.etiquetas || []).map((e) => e.id),
      destinos_ids: (paquete.destinos || []).map((d) => d.id),
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

          <ItinerarioEditor
            value={itinerario}
            onChange={setItinerario}
          />
        </div>
      </div>
    </div>
  );
}
