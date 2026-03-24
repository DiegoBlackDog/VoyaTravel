/**
 * Formatea un precio con su moneda.
 *
 * formatPrecio(1500, 'USD') -> "US$ 1.500"
 * formatPrecio(2300, 'UYU') -> "UYU 2.300"
 * formatPrecio(980, 'EUR')  -> "EUR 980"
 *
 * @param {number|string} precio
 * @param {string} [moneda='USD']
 * @returns {string}
 */
export default function formatPrecio(precio, moneda = 'USD') {
  if (precio == null || precio === '') return '—';

  const num = Number(precio);
  if (isNaN(num)) return '—';

  const formateado = num.toLocaleString('es-UY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const prefijos = {
    USD: 'US$',
    UYU: 'UYU',
    EUR: 'EUR',
  };

  const prefijo = prefijos[moneda] || moneda;
  return `${prefijo} ${formateado}`;
}
