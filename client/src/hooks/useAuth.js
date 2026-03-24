import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Shortcut hook para acceder al AuthContext.
 * @returns {{ usuario: Object|null, cargando: boolean, login: Function, logout: Function }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
