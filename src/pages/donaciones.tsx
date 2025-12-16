import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; 
import '../css/donaciones.css';

const Donaciones: React.FC = () => {
  const navigate = useNavigate();

  // Estados del formulario y control de proceso
  const [montoSeleccionado, setMontoSeleccionado] = useState<number | null>(null);
  const [montoPersonalizado, setMontoPersonalizado] = useState('');
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Opciones predefinidas que el usuario puede seleccionar
  const opcionesMontos = [5000, 10000, 20000];

  // Verificar sesión al montar: si no hay token, redirigir a login sin alerta
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/inicioSesion', { state: { from: 'donaciones' } });
    }
  }, [navigate]);

  const handleSelectMonto = (monto: number) => {
    setMontoSeleccionado(monto);
    setMontoPersonalizado('');
  };

  const handlePersonalizadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMontoPersonalizado(e.target.value);
    setMontoSeleccionado(null);
  };

  // Enviar la donación
  const handleDonar = async (e: React.FormEvent) => {
    e.preventDefault();

    // Determinar monto final: preferir la selección previa sobre el input personalizado
    const montoFinal = montoSeleccionado || Number(montoPersonalizado);

    // Validaciones básicas
    if (!montoFinal || montoFinal <= 0) {
      alert("Por favor selecciona o ingresa un monto válido.");
      return;
    }

    if (!nombreTarjeta.trim() || !numeroTarjeta.trim()) {
      alert("Por favor completa los datos de la tarjeta.");
      return;
    }

    setProcesando(true);

    const usuarioId = Number(localStorage.getItem('usuario_id'));

    // Payload para el backend
    const nuevaDonacion = {
        usuarioDonanteId: usuarioId,
        monto: montoFinal,
        metodoPago: "TARJETA",
        mensaje: mensaje || "Apoyo a la comunidad PixelHub"
    };

    try {
        await api.post('/api/donaciones', nuevaDonacion);
        alert(`¡Gracias ${nombreTarjeta}! Tu donación de $${montoFinal} ayuda a mantener PixelHub en línea.`);
        navigate('/principal');

    } catch (error) {
        console.error("Error al donar:", error);
        alert("Hubo un error al procesar tu donación. Inténtalo nuevamente.");
    } finally {
        setProcesando(false);
    }
  };

  return (
    <div className="donaciones-container">
      <div className="donaciones-header">
        <h2>Apoya a PixelHub 👾</h2>
        <p>Ayúdanos a mantener los servidores activos y a seguir desarrollando la mejor comunidad gamer.</p>
      </div>

      <form onSubmit={handleDonar}>
        <h5 className="text-start mb-3">Selecciona un monto:</h5>
        <div className="montos-grid">
          {opcionesMontos.map((monto) => (
            <button
              type="button"
              key={monto}
              className={`btn-monto ${montoSeleccionado === monto ? 'seleccionado' : ''}`}
              onClick={() => handleSelectMonto(monto)}
            >
              ${monto.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <input
            type="number"
            placeholder="O ingresa otro monto (CLP)"
            className="form-control input-custom-monto"
            value={montoPersonalizado}
            onChange={handlePersonalizadoChange}
            min="1000"
          />
        </div>

        <div className="mb-4 text-start">
            <label className="form-label text-white">Mensaje (Opcional)</label>
            <textarea 
                className="form-control" 
                rows={2}
                placeholder="¡Sigan así!"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid #F0127E' }}
            ></textarea>
        </div>

        <div className="tarjeta-simulada">
            <h5 className="mb-3 text-white">Detalles del Pago</h5>
            <div className="mb-3">
                <label className="form-label text-white">Nombre en la tarjeta</label>
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ej: Juan Pérez"
                    value={nombreTarjeta}
                    onChange={(e) => setNombreTarjeta(e.target.value)}
                />
            </div>
            <div className="row">
                <div className="col-8">
                    <label className="form-label text-white">Número de tarjeta</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="0000 0000 0000 0000"
                        maxLength={16}
                        value={numeroTarjeta}
                        onChange={(e) => setNumeroTarjeta(e.target.value)}
                    />
                </div>
                <div className="col-4">
                    <label className="form-label text-white">CVC</label>
                    <input type="text" className="form-control" placeholder="123" maxLength={3}/>
                </div>
            </div>
        </div>

        <button type="submit" className="btn-pixelhub-primary btn-pixelhub-full" disabled={procesando}>
          {procesando ? 'Procesando...' : 'Realizar Donación ❤️'}
        </button>

        <button
            type="button"
            className="btn-pixelhub-link mt-2"
            onClick={() => navigate('/principal')}
            style={{ width: '100%', textAlign: 'center' }}
        >
            Volver
        </button>

      </form>
    </div>
  );
};

export default Donaciones;