/**
 * Convierte un texto a slug URL-friendly.
 * Ejemplo: "Playa del Carmen & Sol" -> "playa-del-carmen-sol"
 *
 * @param {string} texto
 * @returns {string} slug
 */
export default function slugify(texto) {
  if (!texto) return '';

  return texto
    .toString()
    .normalize('NFD')                   // descomponer acentos
    .replace(/[\u0300-\u036f]/g, '')    // eliminar marcas diacríticas
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')      // eliminar caracteres especiales
    .replace(/[\s_]+/g, '-')            // espacios y guiones bajos -> guion
    .replace(/-+/g, '-')               // múltiples guiones -> uno
    .replace(/^-+|-+$/g, '');          // quitar guiones al inicio/final
}
