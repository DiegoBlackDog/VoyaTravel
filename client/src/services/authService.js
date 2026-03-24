import api from './api';

/**
 * Inicia sesión con email y contraseña.
 * @param {string} email
 * @param {string} contrasena
 * @returns {Promise<Object>} Usuario autenticado
 */
export async function login(email, contrasena) {
  const { data } = await api.post('/auth/login', { email, contrasena });
  return data.usuario;
}

/**
 * Cierra la sesión del usuario actual.
 * @returns {Promise<void>}
 */
export async function logout() {
  await api.post('/auth/logout');
}

/**
 * Obtiene el usuario actualmente autenticado.
 * @returns {Promise<Object|null>} Usuario o null si no hay sesión
 */
export async function obtenerUsuarioActual() {
  try {
    const { data } = await api.get('/auth/me');
    return data.usuario;
  } catch {
    return null;
  }
}
