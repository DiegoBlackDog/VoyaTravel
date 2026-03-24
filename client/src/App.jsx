import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './Router';
import './styles/global.css';

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </HelmetProvider>
  );
}
