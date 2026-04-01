import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';
import PaqueteTabla from '../../components/admin/PaqueteTabla';
import styles from './PaquetesListPage.module.css';

const TABS = [
  { key: 'todos',       label: 'Todos' },
  { key: 'disponibles', label: 'Disponibles' },
  { key: 'ocultos',     label: 'Ocultos' },
  { key: 'destacados',  label: 'Destacados' },
];

const LIMIT = 12;

export default function PaquetesListPage() {
  const [paquetes, setPaquetes]       = useState([]);
  const [total, setTotal]             = useState(0);
  const [pagina, setPagina]           = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState('');
  const [busqueda, setBusqueda]       = useState('');
  const [inputBusqueda, setInputBusqueda] = useState('');
  const debounceRef = useRef(null);
  const [tabActiva, setTabActiva]     = useState('todos');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const params = { page: pagina, limit: LIMIT, mostrar_vencidos: true };
      if (busqueda) params.busqueda = busqueda;
      if (tabActiva === 'disponibles') params.disponible = true;
      if (tabActiva === 'ocultos')     params.disponible = false;
      if (tabActiva === 'destacados')  params.destacado = true;

      const { data } = await api.get('/paquetes', { params });
      const lista        = data.data  || data.paquetes || data || [];
      const totalItems   = data.total || lista.length;
      const totalPags    = data.totalPaginas || Math.ceil(totalItems / LIMIT) || 1;

      setPaquetes(Array.isArray(lista) ? lista : []);
      setTotal(totalItems);
      setTotalPaginas(totalPags);
    } catch (err) {
      setError('No se pudo cargar la lista de paquetes.');
    } finally {
      setCargando(false);
    }
  }, [pagina, busqueda, tabActiva]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  /* ── Buscar al escribir (debounce 350ms) ── */
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputBusqueda(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setBusqueda(val.trim());
      setPagina(1);
    }, 350);
  };

  /* ── Buscar al pulsar Enter o botón ── */
  const handleBuscar = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    setBusqueda(inputBusqueda.trim());
    setPagina(1);
  };

  /* ── Cambio de tab ── */
  const handleTab = (key) => {
    setTabActiva(key);
    setPagina(1);
  };

  /* ── Toggle visibilidad ── */
  const handleToggleVisible = async (paquete) => {
    try {
      await api.patch(`/paquetes/${paquete.id}/disponible`);
      // Actualizar localmente para respuesta inmediata
      setPaquetes((prev) =>
        prev.map((p) =>
          p.id === paquete.id ? { ...p, disponible: !p.disponible } : p
        )
      );
    } catch {
      setError('No se pudo cambiar la visibilidad del paquete.');
    }
  };

  /* ── Eliminar ── */
  const handleEliminar = async (id) => {
    try {
      await api.delete(`/paquetes/${id}`);
      setPaquetes((prev) => prev.filter((p) => p.id !== id));
      setTotal((t) => t - 1);
    } catch {
      setError('No se pudo eliminar el paquete.');
    }
  };

  const paginaAnterior = () => setPagina((p) => Math.max(1, p - 1));
  const paginaSiguiente = () => setPagina((p) => Math.min(totalPaginas, p + 1));

  return (
    <div className={styles.pagina}>
      {/* ── Header ── */}
      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Paquetes</h1>
          <p className={styles.subtitulo}>
            {total > 0 ? `${total} paquete${total !== 1 ? 's' : ''} en el catálogo` : 'Catálogo de viajes'}
          </p>
        </div>
        <div className={styles.headerAcciones}>
          <button
            className={styles.botonRefresh}
            onClick={() => cargar()}
            disabled={cargando}
            aria-label="Recargar"
          >
            <FiRefreshCw size={15} className={cargando ? styles.girando : ''} />
          </button>
          <Link to="/admin/paquetes/nuevo" className={styles.botonNuevo}>
            <FiPlus size={16} />
            <span>Nuevo paquete</span>
          </Link>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className={styles.alerta} role="alert">
          <FiAlertCircle size={15} />
          <span>{error}</span>
          <button className={styles.alertaCerrar} onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* ── Filtros ── */}
      <div className={styles.filtrosBar}>
        {/* Búsqueda */}
        <form className={styles.buscadorForm} onSubmit={handleBuscar}>
          <div className={styles.buscadorWrap}>
            <FiSearch size={15} className={styles.buscadorIcono} />
            <input
              type="text"
              className={styles.buscadorInput}
              placeholder="Buscar por título, destino…"
              value={inputBusqueda}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit" className={styles.botonBuscar}>Buscar</button>
        </form>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${tabActiva === tab.key ? styles.tabActiva : ''}`}
              onClick={() => handleTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabla ── */}
      <PaqueteTabla
        paquetes={paquetes}
        cargando={cargando}
        onToggleVisible={handleToggleVisible}
        onEliminar={handleEliminar}
      />

      {/* ── Paginación ── */}
      {totalPaginas > 1 && (
        <div className={styles.paginacion}>
          <button
            className={styles.paginaBtn}
            onClick={paginaAnterior}
            disabled={pagina <= 1 || cargando}
          >
            ← Anterior
          </button>
          <span className={styles.paginaInfo}>
            Página {pagina} de {totalPaginas}
          </span>
          <button
            className={styles.paginaBtn}
            onClick={paginaSiguiente}
            disabled={pagina >= totalPaginas || cargando}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
