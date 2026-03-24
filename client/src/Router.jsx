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

// Admin pages (placeholders until implemented)
const PaquetesListPage = () => <div>Admin Paquetes</div>;
const PaqueteEditPage = () => <div>Editar Paquete</div>;
const EtiquetasPage = () => <div>Etiquetas</div>;
const DestinosPage = () => <div>Destinos</div>;
const TestimoniosPage = () => <div>Testimonios</div>;
const ConfiguracionPage = () => <div>Configuración</div>;
const UsuariosPage = () => <div>Usuarios</div>;

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
