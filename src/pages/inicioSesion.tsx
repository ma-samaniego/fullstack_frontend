import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api"; // instancia de axios configurada
import '../css/cuenta.css';
import logo from '../img/logo.png';

interface InicioSesionProps {
  onLoginSuccess: (email: string) => void; // callback opcional cuando inicia sesión correctamente
  onNavigateToRegister: () => void; // callback para navegar al registro
}

const InicioSesion: React.FC<InicioSesionProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
  // Estados del componente
  const [nombreUsuario, setNombreUsuario] = useState(''); // nombre de usuario usado para login
  const [contrasena, setContraseña] = useState(''); // contraseña del usuario
  const [error, setError] = useState(''); // mensaje de error a mostrar en el formulario
  const [cargando, setCargando] = useState(false); // controla el estado de carga durante la petición
  const [infoMessage, setInfoMessage] = useState(''); // mensaje informativo
  const navigate = useNavigate();
  const location = useLocation();

  // Mostrar mensaje si viene de una página que requiere autenticación
  useEffect(() => {
    const state = location.state as { from?: string } | undefined;
    if (state?.from === 'donaciones') {
      setInfoMessage('Inicia sesión para realizar una donación');
    }
  }, [location]);

  // Handler del submit del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // Llamada POST al endpoint de autenticación
      const response = await api.post('/api/v1/auth/login', {
        nombreUsuario: nombreUsuario,
        contrasena: contrasena
      });

      // Extraemos datos importantes de la respuesta y los guardamos en localStorage
      const { token, usuario_id, nombre_usuario, rol_id } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario_id', String(usuario_id));
      localStorage.setItem('nombre_usuario', nombre_usuario);
      localStorage.setItem('rol_id', String(rol_id));

      // Mostrar bienvenida y navegar a la pantalla principal
      alert(`¡Bienvenido ${nombre_usuario}!`);
      navigate('/principal');

    } catch (err: any) {
      // En caso de error mostramos un mensaje en el formulario
      console.error(err);
      setError("Credenciales incorrectas o error en el servidor.");
    } finally {
      setCargando(false);
    }
    }

  return (
    <div className="contenedor-form-inicio">
      {/* Logo */}
      <img src={logo} alt="Logo de PixelHub" className="navbar-logo" />

      {/* Formulario de inicio de sesión */}
      <form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: '400px' }}>
        {/* Mostrar mensaje informativo si existe */}
        {infoMessage && <div className="alert alert-info text-center">{infoMessage}</div>}

        {/* Mostrar mensaje de error si existe */}
        {error && <div className="alert alert-danger text-center">{error}</div>}

        {/* Input: nombre de usuario */}
        <div className="mb-3">
          <label className="form-label text-white">Nombre de Usuario</label>
          <input
            type="text"
            className="form-control"
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            required
          />
        </div>

        {/* Input: contraseña */}
        <div className="mb-3">
          <label className="form-label text-white">Contraseña</label>
          <input
            type="password"
            className="form-control"
            value={contrasena}
            onChange={(e) => setContraseña(e.target.value)}
            required
          />
        </div>

        {/* Botón enviar: deshabilitado mientras cargamos */}
        <button type="submit" className="btn-pixelhub-primary btn-pixelhub-full" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>

        <div className="separator">O</div>

        {/* Botón para navegar a registro (callback por props) */}
        <button type="button" className="btn-pixelhub-secondary btn-pixelhub-full" onClick={onNavigateToRegister}>
          Registrate
        </button>
      </form>
    </div>
  );
};

export default InicioSesion;