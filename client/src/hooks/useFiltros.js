import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook que sincroniza filtros con los URL search params.
 * Proporciona `filtros` (objeto) y `setFiltro(key, value)` / `resetFiltros()`.
 */
export function useFiltros() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Construimos el objeto de filtros a partir de los params actuales
  const filtros = Object.fromEntries(searchParams.entries());

  const setFiltro = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === null || value === undefined || value === '') {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
        // Al cambiar cualquier filtro que no sea la página, volvemos a la pág 1
        if (key !== 'page') next.set('page', '1');
        return next;
      });
    },
    [setSearchParams]
  );

  /**
   * Activa/desactiva un valor dentro de un param multivalor (e.g. etiqueta=slug1,slug2).
   * Usamos comas como separador para mantener la URL limpia.
   */
  const toggleFiltroMulti = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        const current = next.get(key) ? next.get(key).split(',') : [];
        const idx = current.indexOf(value);
        if (idx === -1) {
          current.push(value);
        } else {
          current.splice(idx, 1);
        }
        if (current.length === 0) {
          next.delete(key);
        } else {
          next.set(key, current.join(','));
        }
        next.set('page', '1');
        return next;
      });
    },
    [setSearchParams]
  );

  const resetFiltros = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  return { filtros, setFiltro, toggleFiltroMulti, resetFiltros };
}
