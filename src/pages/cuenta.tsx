import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // instancia de Axios para llamadas al backend
import '../css/cuenta.css';
import logo from '../img/logo.png';

const Cuenta: React.FC = () => {
  const navigate = useNavigate();

  // --- ESTADOS --- (valores del formulario y auxiliares)
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [correoelectronico, setCorreoelectronico] = useState('');

  // Guardamos los valores originales para detectar si hubo cambios
  const [originalNombre, setOriginalNombre] = useState('');
  const [originalCorreo, setOriginalCorreo] = useState('');

  // Estado de carga para mostrar un indicador mientras fetch termina
  const [cargando, setCargando] = useState(true);

  // Estado para mostrar mensaje de error
  const [errorMensaje, setErrorMensaje] = useState('');

  // Errores de validación por campo
  const [errores, setErrores] = useState({
    nombreUsuario: "",
    correoelectronico: "",
  });

  // --- EFECTO: CARGAR DATOS DEL USUARIO ---
  useEffect(() => {
    // Efecto para cargar los datos del usuario al montar el componente
    const cargarDatosUsuario = async () => {
      const usuarioId = localStorage.getItem('usuario_id');

      // Si no hay sesión, redirigimos a inicio de sesión
      if (!usuarioId) {
        setErrorMensaje("No hay sesión activa. Por favor inicia sesión.");
        setCargando(false);
        return;
      }

      try {
        // Petición GET al backend para obtener los datos del usuario
        const response = await api.get(`/api/v1/users/${usuarioId}`);
        const usuario = response.data;

        // Rellenamos el formulario con los datos del backend
        setNombreUsuario(usuario.nombre_usuario);
        setCorreoelectronico(usuario.correo);

        // Guardamos los valores originales para detectar cambios posteriores
        setOriginalNombre(usuario.nombre_usuario);
        setOriginalCorreo(usuario.correo);

      } catch (error) {
        console.error("Error cargando perfil:", error);
        alert("Error al cargar los datos del usuario.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatosUsuario();
  }, [navigate]);

  // --- VALIDACIÓN ---
  // Validación simple del formulario
  const validarFormulario = () => {
    const nuevosErrores = { nombreUsuario: "", correoelectronico: "" };
    if (!nombreUsuario.trim()) {
      nuevosErrores.nombreUsuario = "El nombre de usuario es obligatorio.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoelectronico.trim()) {
      nuevosErrores.correoelectronico = "El correo electrónico es obligatorio.";
    } else if (!emailRegex.test(correoelectronico)) {
      nuevosErrores.correoelectronico = "Formato de email no válido.";
    }
    setErrores(nuevosErrores);
    return nuevosErrores;
  };

  // --- FUNCIÓN DE ACTUALIZACIÓN (PUT) ---
    // Enviar cambios al backend
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultadoErrores = validarFormulario();

    // Si hay errores de validación, no procedemos
    if (resultadoErrores.nombreUsuario || resultadoErrores.correoelectronico) {
      return;
    }

    try {
      const usuarioId = localStorage.getItem('usuario_id');

      // Construimos payload con los campos que queremos actualizar
      const datosActualizados = {
        nombre_usuario: nombreUsuario,
        correo: correoelectronico,
      };

      // PUT al backend para actualizar el usuario
      await api.put(`/api/v1/users/${usuarioId}`, datosActualizados);

      alert("¡Datos actualizados correctamente en el servidor!");

      // Actualizamos los originales y el localStorage
      setOriginalNombre(nombreUsuario);
      setOriginalCorreo(correoelectronico);
      localStorage.setItem('nombre_usuario', nombreUsuario);

    } catch (error) {
      console.error("Error actualizando perfil:", error);
      alert("Hubo un error al guardar los cambios.");
    }
    };

  const handleNavigateToPrincipal = () => {
    navigate('/principal');
  };

  // Comprobar cambios
  const sinCambios = 
    (nombreUsuario === originalNombre) && 
    (correoelectronico === originalCorreo);

  const botonDeshabilitado =
    !!errores.nombreUsuario ||
    !!errores.correoelectronico ||
    !nombreUsuario.trim() ||
    !correoelectronico.trim() ||
    sinCambios;

  if (cargando) {
      return <div className="text-white text-center mt-5">Cargando perfil...</div>;
  }

  // Si hay un error de sesión, mostrar mensaje con botón
  if (errorMensaje) {
    return (
      <div className="contenedor-form-inicio">
        <img src={logo} alt="Logo de PixelHub" className="navbar-logo" />
        <div className="w-100" style={{ maxWidth: '400px' }}>
          <div className="alert alert-danger text-center mb-4">
            {errorMensaje}
          </div>
          <button
            className="btn-pixelhub-primary btn-pixelhub-full"
            onClick={() => navigate('/inicioSesion')}
          >
            Ir a Iniciar Sesión
          </button>
          <button
            className="btn-pixelhub-secondary btn-pixelhub-full mt-3"
            onClick={() => navigate('/principal')}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor-form-inicio">

      <img
        src={logo}
        alt="Logo de PixelHub"
        className="navbar-logo"
      />

      <form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: '400px' }}>
        <h3 className="text-white mb-4 text-center">Configuración de Cuenta</h3>
        
        {/* --- CAMPOS DEL FORMULARIO --- */}
        
        <div className="mb-3">
          <label htmlFor="nombreUsuario" className="form-label text-white">Nombre de Usuario</label>
          <input 
            type="text"
            id="nombreUsuario"
            className="form-control"
            value={nombreUsuario}
            onChange={(e) => { setNombreUsuario(e.target.value); }} 
            onBlur={validarFormulario} // Validar al salir del campo
          />
          {errores.nombreUsuario && <div className="text-danger">{errores.nombreUsuario}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="correo" className="form-label text-white">Correo Electrónico</label>
          <input 
            type="email"
            id="correo"
            className="form-control"
            value={correoelectronico}
            onChange={(e) => { setCorreoelectronico(e.target.value); }}
            onBlur={validarFormulario}
          />
          {errores.correoelectronico && <div className="text-danger">{errores.correoelectronico}</div>}
        </div>

        <button type="submit" className="btn-pixelhub-primary btn-pixelhub-full" disabled={botonDeshabilitado}>
          Guardar Cambios
        </button>

        <div className="separator">O</div>

        <button type="button" className="btn-pixelhub-secondary btn-pixelhub-full" onClick={handleNavigateToPrincipal}>
          Volver a Principal
        </button>
        
      </form> 
    </div>
  );
};

export default Cuenta;