import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import PublicLayout from './components/layout/PublicLayout';

// Public pages (placeholders for now)
const HomePage = () => <div>Home</div>;
const PaquetesPage = () => <div>Paquetes</div>;
const PaqueteDetallePage = () => <div>Detalle</div>;
const NosotrosPage = () => <div>Nosotros</div>;
const ContactoPage = () => <div>Contacto</div>;

// Admin pages (placeholders)
const LoginPage = () => <div>Login</div>;
const DashboardPage = () => <div>Dashboard</div>;
const PaquetesListPage = () => <div>Admin Paquetes</div>;
const PaqueteEditPage = () => <div>Editar Paquete</div>;
const EtiquetasPage = () => <div>Etiquetas</div>;
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

        {/* Admin — no layout wrapper (own layout comes later) */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route element={<RutaProtegida />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/paquetes" element={<PaquetesListPage />} />
          <Route element={<RutaProtegida rolMinimo="editor" />}>
            <Route path="/admin/paquetes/nuevo" element={<PaqueteEditPage />} />
            <Route path="/admin/paquetes/:id" element={<PaqueteEditPage />} />
            <Route path="/admin/etiquetas" element={<EtiquetasPage />} />
            <Route path="/admin/testimonios" element={<TestimoniosPage />} />
          </Route>
          <Route element={<RutaProtegida rolMinimo="admin" />}>
            <Route path="/admin/configuracion" element={<ConfiguracionPage />} />
            <Route path="/admin/usuarios" element={<UsuariosPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
