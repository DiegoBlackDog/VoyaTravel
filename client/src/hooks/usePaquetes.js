import { useState, useEffect } from 'react';
import { listar } from '../services/paqueteService';

export function usePaquetes(filtros = {}) {
  const [paquetes, setPaquetes] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const filtrosKey = JSON.stringify(filtros);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setError(null);

    const params = {};
    Object.entries(filtros).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) {
        params[k] = v;
      }
    });

    listar(params)
      .then((res) => {
        if (cancelado) return;
        setPaquetes(res.paquetes || []);
        setTotal(res.total ?? 0);
        setPagina(res.pagina ?? 1);
        setTotalPaginas(res.totalPaginas ?? 1);
      })
      .catch((err) => {
        if (cancelado) return;
        console.error('usePaquetes error:', err);
        setError('No se pudieron cargar los paquetes. Intentá de nuevo.');
        setPaquetes([]);
        setTotal(0);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => { cancelado = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtrosKey]);

  return { paquetes, total, cargando, pagina, totalPaginas, error };
}
