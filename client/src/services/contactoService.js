import api from './api';

/**
 * Envía una consulta de contacto al servidor.
 * @param {Object} data - Datos del formulario
 * @param {string} data.nombre
 * @param {string} data.email
 * @param {string} data.telefono
 * @param {string} data.mensaje
 * @param {string} [data.paquete_nombre]
 * @returns {Promise<Object>}
 */
export async function enviarConsulta(data) {
  const { data: respuesta } = await api.post('/contacto', data);
  return respuesta;
}
