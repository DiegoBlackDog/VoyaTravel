import { useState, useEffect } from 'react';
import api from '../services/api';

let cache = null;

export function invalidarConfiguracion() {
  cache = null;
}

export function useConfiguracion() {
  const [configuracion, setConfiguracion] = useState(cache);
  const [cargando, setCargando] = useState(!cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cache) {
      setConfiguracion(cache);
      setCargando(false);
      return;
    }

    let cancelado = false;

    async function fetchConfiguracion() {
      try {
        const { data } = await api.get('/configuracion');
        const config = data.configuracion || data.data || data;
        cache = config;
        if (!cancelado) {
          setConfiguracion(config);
        }
      } catch (err) {
        if (!cancelado) {
          setError(err);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    fetchConfiguracion();

    return () => { cancelado = true; };
  }, []);

  return { configuracion, cargando, error };
}
