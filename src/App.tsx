import React from 'react';
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import './App.css';

// --- IMPORTACIÓN DE PÁGINAS ---
import Home from './pages/home';
import Principal from './pages/principal';
import InicioSesion from './pages/inicioSesion';
import Cuenta from './pages/cuenta';
import Registro from './pages/registro';
import Donaciones from "./pages/donaciones";
import HiloDetalle from "./pages/hiloDetalle";
import Admin from './pages/admin';

// --- COMPONENTE NAVBAR ---
function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const rolId = localStorage.getItem('rol_id');
  const isAdmin = rolId === '1';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/inicioSesion');
  };

  return (
    <div className="navbar-wrapper">
      <nav className="navbar navbar-expand-lg mi-navbar">
        <div className="container-fluid">
          <Link className="nav-link navbar-brand-custom" to="/">PixelHub</Link>
          
          <button 
            className="navbar-toggler bg-light" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarSupportedContent" 
            aria-controls="navbarSupportedContent" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <Link className="nav-link" to="/donaciones">Donaciones</Link>
              </li>

              {token ? (
                <>
                  {/* Enlace al panel de admin solo para administradores */}
                  {isAdmin && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin" style={{color: '#FFD700'}}>
                        👑 Admin
                      </Link>
                    </li>
                  )}

                  <li className="nav-item">
                    <Link className="nav-link" to="/cuenta">Cuenta</Link>
                  </li>
                  <li className="nav-item">
                    <button onClick={handleLogout} className="btn btn-sm btn-outline-light ms-2" style={{border: 'none'}}>
                      Salir
                    </button>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <Link className="btn btn-sm btn-primary ms-2 fw-bold" to="/inicioSesion" style={{backgroundColor: '#F0127E', border: 'none'}}>
                    Iniciar Sesión
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL APP ---
function App() {
  
  const navigate = useNavigate();

  const handleLoginSuccess = (email: string) => {
    alert(`Bienvenido de nuevo!`);
    navigate('/'); // Al loguearse, vamos al inicio (Principal)
  };

  const handleNavigateToRegister = () => {
    navigate('/registro');
  };

  return (
    <div className="App">
      {/* Barra de Navegación Superior */}
      <Navbar />

      {/* Contenido Principal Dinámico */}
      <div className="main-content">
        <Routes>
          {/* Ruta principal: Home Screen */}
          <Route path="/" element={<Home />} />

          {/* Rutas de Autenticación */}
          <Route
            path="/inicioSesion"
            element={
              <InicioSesion
                onLoginSuccess={handleLoginSuccess}
                onNavigateToRegister={handleNavigateToRegister}
              />
            }
          />
          <Route path="/registro" element={<Registro />} />

          {/* Páginas del Sistema */}
          <Route path="/principal" element={<Principal />} />
          <Route path="/cuenta" element={<Cuenta />} />
          <Route path="/donaciones" element={<Donaciones />} />
          <Route path="/hilo/:id" element={<HiloDetalle />} />

          {/* Página de Administración (solo para rol_id 1) */}
          <Route path="/admin" element={<Admin />} />

        </Routes>
      </div>

      {/* Pie de página */}
      <footer className="footer">
        © 2025 PixelHub - Todos los derechos reservados
      </footer>
    </div>
  );
}

export default App;