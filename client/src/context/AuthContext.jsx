import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const verificarSesion = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUsuario(data.usuario);
    } catch {
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { verificarSesion(); }, [verificarSesion]);

  const login = async (email, contrasena) => {
    const { data } = await api.post('/auth/login', { email, contrasena });
    setUsuario(data.usuario);
    return data.usuario;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
