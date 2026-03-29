import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import HomePage from './pages/public/HomePage';
import PaquetesPage from './pages/public/PaquetesPage';
import PaqueteDetallePage from './pages/public/PaqueteDetallePage';
import NosotrosPage from './pages/public/NosotrosPage';
import ContactoPage from './pages/public/ContactoPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import PaquetesListPage from './pages/admin/PaquetesListPage';
import PaqueteEditPage from './pages/admin/PaqueteEditPage';
import EtiquetasPage from './pages/admin/EtiquetasPage';
import DestinosPage from './pages/admin/DestinosPage';
import HotelesPage from './pages/admin/HotelesPage';
import OperadoresPage from './pages/admin/OperadoresPage';
import TestimoniosPage from './pages/admin/TestimoniosPage';
import ConfiguracionPage from './pages/admin/ConfiguracionPage';
import UsuariosPage from './pages/admin/UsuariosPage';
import CotizadorPage from './pages/admin/CotizadorPage';
import CotizacionFormPage from './pages/admin/CotizacionFormPage';
import CotizacionPublicPage from './pages/public/CotizacionPublicPage';
import AeropuertosPage from './pages/admin/AeropuertosPage';
import AerolineasPage from './pages/admin/AerolineasPage';

function RutaProtegida({ rolMinimo }) {
  const { usuario, cargando } = useContext(AuthContext);
  if (cargando) return <div>Cargando...</div>;
  if (!usuario) return <Navigate to="/admin/login" replace />;

  const jerarquia = { admin: 3, editor: 2, visor: 1 };
  if (rolMinimo && jerarquia[usuario.rol] < jerarquia[rolMinimo]) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public — wrapped in PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/paquetes" element={<PaquetesPage />} />
          <Route path="/paquetes/:slug" element={<PaqueteDetallePage />} />
          <Route path="/nosotros" element={<NosotrosPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
        </Route>

        {/* Public cotización — no layout */}
        <Route path="/cotizacion/:token" element={<CotizacionPublicPage />} />

        {/* Admin login — no layout */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin — protected + AdminLayout */}
        <Route element={<RutaProtegida />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/paquetes" element={<PaquetesListPage />} />
            <Route element={<RutaProtegida rolMinimo="editor" />}>
              <Route path="/admin/paquetes/nuevo" element={<PaqueteEditPage />} />
              <Route path="/admin/paquetes/:id" element={<PaqueteEditPage />} />
              <Route path="/admin/etiquetas" element={<EtiquetasPage />} />
              <Route path="/admin/destinos" element={<DestinosPage />} />
              <Route path="/admin/hoteles" element={<HotelesPage />} />
              <Route path="/admin/operadores" element={<OperadoresPage />} />
              <Route path="/admin/cotizador" element={<CotizadorPage />} />
              <Route path="/admin/cotizador/nuevo" element={<CotizacionFormPage />} />
              <Route path="/admin/cotizador/:id/editar" element={<CotizacionFormPage />} />
              <Route path="/admin/aeropuertos" element={<AeropuertosPage />} />
              <Route path="/admin/aerolineas" element={<AerolineasPage />} />
              <Route path="/admin/testimonios" element={<TestimoniosPage />} />
            </Route>
            <Route element={<RutaProtegida rolMinimo="admin" />}>
              <Route path="/admin/configuracion" element={<ConfiguracionPage />} />
              <Route path="/admin/usuarios" element={<UsuariosPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
