import React, { useState } from "react";
import '../css/registro.css';
import logo from '../img/logo.png';
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // instancia de axios para llamadas al backend

const Registro: React.FC = () => {
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correoelectronico, setCorreoelectronico] = useState('');
  const [contraseña, setContraseña] = useState('');

  // Estado de carga para deshabilitar botón durante la petición
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  // Errores de validación por campo
  const [errores, setErrores] = useState({
    nombre: "",
    telefono: "",
    correoelectronico: "",
    contraseña: "",
  });

  // Validaciones simples del formulario
  const validarFormulario = () => {
    const nuevosErrores = { nombre: "", telefono: "", correoelectronico: "", contraseña: "" };

    if (!nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio.";

    const telefonoRegex = /^[0-9]+$/;
    if (!telefono.trim()) {
      nuevosErrores.telefono = "El número de teléfono es obligatorio.";
    } else if (!telefonoRegex.test(telefono)) {
      nuevosErrores.telefono = "El teléfono solo debe contener números.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoelectronico.trim()) {
      nuevosErrores.correoelectronico = "El correo electrónico es obligatorio.";
    } else if (!emailRegex.test(correoelectronico)) {
      nuevosErrores.correoelectronico = "Formato de email no válido.";
    }
    
    if (!contraseña.trim()) nuevosErrores.contraseña = "La contraseña es obligatoria.";

    setErrores(nuevosErrores);
    // Retorna true si NO hay errores
    return !Object.values(nuevosErrores).some(error => error !== "");
  }

    // Enviar petición de registro al backend
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!validarFormulario()) return;

    setCargando(true);

    // Payload según espera el backend
    const nuevoUsuario = {
      nombre_usuario: nombre,
      contrasena: contraseña,
      numero_telefono: telefono,
      correo: correoelectronico,
      estado: "ACTIVO",
      rol: { rol_id: 2 }
    };

    try {
      // POST para crear usuario
      await api.post('/api/v1/users', nuevoUsuario);
        
      alert(`¡Cuenta creada con éxito, ${nombre}! Ahora puedes iniciar sesión.`);
      navigate('/inicioSesion'); 

    } catch (error: any) {
      console.error("Error en registro:", error);
      const mensajeError = error.response?.data || "Hubo un error al registrarte. Inténtalo de nuevo.";
      alert(mensajeError);
    } finally {
      setCargando(false);
    }
    }

  const handleNavigateToLogin = () => {
    navigate('/inicioSesion'); 
  };
    
  const botonDeshabilitado =
    !!errores.nombre ||
    !!errores.telefono ||
    !!errores.correoelectronico ||
    !!errores.contraseña ||
    !nombre.trim() ||
    !telefono.trim() ||
    !correoelectronico.trim() ||
    !contraseña.trim() ||
    cargando; // Deshabilitar mientras carga

  return (
    <div className="contenedor-form-registro">
      <img 
        src={logo} 
        alt="Logo de PixelHub" 
        className="navbar-logo" 
      />
      
      <form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: '400px' }}>
        
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label text-white">Nombre de Usuario</label>
          <input 
            type="text"
            id="nombre"
            className="form-control"
            value={nombre}
            onChange={(e) => { setNombre(e.target.value); }}
            onBlur={validarFormulario}
          />
          {errores.nombre && <div className="text-danger">{errores.nombre}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="telefono" className="form-label text-white">Número de Teléfono</label>
          <input 
            type="tel" 
            id="telefono"
            className="form-control"
            value={telefono}
            onChange={(e) => { setTelefono(e.target.value); }}
            onBlur={validarFormulario}
          />
          {errores.telefono && <div className="text-danger">{errores.telefono}</div>}
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
        
        <div className="mb-3">
          <label htmlFor="contraseña" className="form-label text-white">Contraseña</label>
          <input 
            type="password"
            id="contraseña"
            className="form-control"
            value={contraseña}
            onChange={(e) => { setContraseña(e.target.value); }}
            onBlur={validarFormulario}
          />
          {errores.contraseña && <div className="text-danger">{errores.contraseña}</div>}
        </div>
        
        <button type="submit" className="btn-pixelhub-primary btn-pixelhub-full" disabled={botonDeshabilitado}>
          {cargando ? 'Registrando...' : 'Registrarse'}
        </button>

        <div className="separator">O</div>

        <button type="button" className="btn-pixelhub-secondary btn-pixelhub-full" onClick={handleNavigateToLogin}>
          Si ya tienes cuenta, inicia sesión
        </button>
        
      </form>   
    </div>
  );
};

export default Registro;