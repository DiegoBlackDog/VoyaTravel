import api from './api';

const BASE_URL = import.meta.env.DEV
  ? 'http://localhost:4000/uploads/'
  : '/uploads/';

/**
 * Construye la URL completa para una imagen de portada.
 * @param {string} filename - Nombre del archivo de imagen
 * @returns {string} URL completa
 */
export function urlImagen(filename) {
  if (!filename) return '/placeholder-paquete.jpg';
  if (filename.startsWith('http')) return filename;
  return `${BASE_URL}${filename}`;
}

/**
 * Obtiene los paquetes destacados para la home.
 * @returns {Promise<Array>} Array de paquetes
 */
export async function obtenerDestacados() {
  const { data } = await api.get('/paquetes/destacados');
  return data.paquetes || data.data || [];
}

/**
 * Lista paquetes con filtros y paginación.
 * @param {Object} params - Parámetros de filtrado
 * @param {number} [params.page=1]
 * @param {number} [params.limit=12]
 * @param {string} [params.destino]
 * @param {string} [params.temporada]
 * @param {number} [params.precio_min]
 * @param {number} [params.precio_max]
 * @param {number} [params.duracion_min]
 * @param {number} [params.duracion_max]
 * @param {string} [params.etiqueta]
 * @param {string} [params.ordenar]
 * @returns {Promise<{data: Array, total: number, pagina: number, totalPaginas: number}>}
 */
export async function listar(params = {}) {
  const { data } = await api.get('/paquetes', { params });
  return data;
}

/**
 * Obtiene un paquete por su slug.
 * @param {string} slug
 * @returns {Promise<Object>} Paquete completo
 */
export async function obtenerPorSlug(slug) {
  const { data } = await api.get(`/paquetes/${slug}`);
  return data.paquete || data;
}
