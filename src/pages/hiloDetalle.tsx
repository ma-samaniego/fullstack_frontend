import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from "../services/api"; // instancia de axios para llamadas a comentarios y publicaciones
import '../css/hiloDetalle.css';

// Interfaz que coincide con ComentarioModel.java
interface Comentario {
    id: number;
    publicationId: number;
    usuarioId: number;
    contenido: string; 
    autorNombre: string;
    fechaCreacion: string;
}

// (Opcional) Interfaz para el Hilo para tener mejor tipado en lugar de 'any'
interface Hilo {
    id: number;
    title: string;
    category: string;
    createDt: string;
    authorname: string;
    imageUri?: string | null;
    description: string;
}

const HiloDetalle: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Si el hilo fue pasado por `location.state`, lo usamos para evitar una petición extra
    const [hilo, setHilo] = useState<Hilo | null>(location.state?.hilo || null);
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [nuevoComentario, setNuevoComentario] = useState('');

  const cargarHilo = useCallback(async (pubId: number) => {
      try {
          const res = await api.get(`/api/publicaciones/${pubId}`);
          setHilo(res.data);
      } catch (e) { console.error("Error cargando hilo", e); }
  }, []);

  const cargarComentarios = useCallback(async (pubId: number) => {
      try {
          // Endpoint definido en ComentarioController.java
          const res = await api.get(`/api/comentarios/publicacion/${pubId}`);
          setComentarios(res.data);
      } catch (e) { console.error("Error cargando comentarios", e); }
  }, []);

    // Al montar: cargar comentarios y, si es necesario, cargar el hilo por id
    useEffect(() => {
        if (id) {
                cargarComentarios(Number(id));
                if(!hilo) cargarHilo(Number(id));
        }
    }, [id, hilo, cargarComentarios, cargarHilo]);

  // Publicar un nuevo comentario
  const handleAgregarComentario = async () => {
    if (!nuevoComentario.trim() || !hilo) return;

    const usuarioId = Number(localStorage.getItem('usuario_id'));
    const autorNombre = localStorage.getItem('nombre_usuario') || 'Anonimo';

    const payload = {
        publicationId: hilo.id,
        usuarioId: usuarioId,
        contenido: nuevoComentario,
        autorNombre: autorNombre,
    };

    try {
        // POST para crear el comentario en el backend
        const res = await api.post('/api/comentarios/comentar', payload);
        // Añadir el comentario nuevo a la lista local para render inmediato
        setComentarios([...comentarios, res.data]);
        setNuevoComentario('');
    } catch (error) {
        console.error("Error publicando comentario", error);
        alert("Error al comentar.");
    }
  };

    // Si todavía no tenemos datos del hilo mostramos un indicador de carga
    if (!hilo) return <div className="text-white mt-5 text-center">Cargando...</div>;

  return (
    <div className="hilo-detalle-wrapper">
      <div className="hilo-detalle-main-container">

        {/* SIDEBAR IZQUIERDO */}
        <aside className="sidebar sidebar-left">
          <div className="sidebar-card">
            <h3 className="sidebar-title">🏠 Inicio</h3>
            <p className="sidebar-text">Tu página principal de PixelHub</p>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">📖 Navegación</h3>
            <div className="quick-links">
              <button className="btn-pixelhub-secondary btn-pixelhub-full" onClick={() => navigate('/principal')}>
                ← Volver a Principal
              </button>
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">ℹ️ Acerca de PixelHub</h3>
            <p className="sidebar-text">Una comunidad para compartir y discutir sobre tecnología, videojuegos y desarrollo.</p>
            <button className="btn-pixelhub-primary btn-pixelhub-full" style={{ marginTop: '1rem' }} onClick={() => navigate('/donaciones')}>
              ❤️ Apoyar
            </button>
          </div>
        </aside>

        {/* CONTENIDO CENTRAL */}
        <div className="hilo-detalle-content">
          {/* Card principal del hilo */}
          <div className="hilo-card-main">
          <div className="hilo-top">
            <div className="hilo-category-date">
              <span className="category-badge-detail">{hilo.category}</span>
              <span className="date-text">{hilo.createDt ? new Date(hilo.createDt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
            </div>
            <h1 className="hilo-title-main">{hilo.title}</h1>
            <div className="author-section">
              <div className="author-avatar-large">{hilo.authorname.charAt(0).toUpperCase()}</div>
              <div className="author-info-detail">
                <span className="author-name-detail">{hilo.authorname}</span>
                <span className="author-role">Miembro de la comunidad</span>
              </div>
            </div>
          </div>

          {hilo.imageUri && (
            <div className="hilo-image-section">
              <img
                src={hilo.imageUri}
                alt={hilo.title}
                className="hilo-main-image"
                onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
              />
            </div>
          )}

          <div className="hilo-content-section">
            <p className="hilo-description-detail">{hilo.description}</p>
          </div>
        </div>

        {/* Sección de comentarios */}
        <div className="comments-section">
          <div className="comments-header">
            <h2 className="comments-title">Comentarios</h2>
            <span className="comments-count">{comentarios.length} {comentarios.length === 1 ? 'comentario' : 'comentarios'}</span>
          </div>

          {/* Input para nuevo comentario */}
          <div className="comment-input-section">
            <textarea
              className="comment-textarea"
              rows={3}
              placeholder="¿Qué opinas? Comparte tu comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              maxLength={500}
            ></textarea>
            <div className="comment-input-footer">
              <small className="char-counter">{nuevoComentario.length}/500 caracteres</small>
              <button
                className="btn-pixelhub-primary"
                onClick={handleAgregarComentario}
                disabled={!nuevoComentario.trim()}
              >
                Publicar Comentario
              </button>
            </div>
          </div>

          {/* Lista de comentarios */}
          <div className="comments-list">
            {comentarios.length > 0 ? (
              comentarios.map((com) => (
                <div key={com.id} className="comment-item">
                  <div className="comment-avatar">{com.autorNombre.charAt(0).toUpperCase()}</div>
                  <div className="comment-content">
                    <div className="comment-header-info">
                      <span className="comment-author">{com.autorNombre}</span>
                      <span className="comment-date">
                        {com.fechaCreacion ? new Date(com.fechaCreacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </span>
                    </div>
                    <p className="comment-text">{com.contenido}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-comments">
                <div className="no-comments-icon">💬</div>
                <p className="no-comments-text">No hay comentarios aún</p>
                <p className="no-comments-subtext">¡Sé el primero en comentar!</p>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* SIDEBAR DERECHO */}
        <aside className="sidebar sidebar-right">
          <div className="sidebar-card">
            <h3 className="sidebar-title">📌 Información del Hilo</h3>
            <div className="hilo-info-stats">
              <div className="info-stat-item">
                <span className="info-label">Categoría</span>
                <span className="info-value">{hilo.category}</span>
              </div>
              <div className="info-stat-item">
                <span className="info-label">Autor</span>
                <span className="info-value">{hilo.authorname}</span>
              </div>
              <div className="info-stat-item">
                <span className="info-label">Fecha</span>
                <span className="info-value">
                  {hilo.createDt ? new Date(hilo.createDt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </span>
              </div>
              <div className="info-stat-item">
                <span className="info-label">Comentarios</span>
                <span className="info-value">{comentarios.length}</span>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">📋 Reglas de la Comunidad</h3>
            <ul className="rules-list">
              <li>Respeta a todos los miembros</li>
              <li>No spam ni autopromoción</li>
              <li>Contenido relevante solamente</li>
              <li>Sé constructivo y amable</li>
            </ul>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">🔗 Enlaces Rápidos</h3>
            <div className="quick-links">
              <button className="btn-pixelhub-secondary btn-pixelhub-full" onClick={() => navigate('/cuenta')}>Mi Perfil</button>
              <button className="btn-pixelhub-secondary btn-pixelhub-full" style={{ marginTop: '0.75rem' }} onClick={() => navigate('/donaciones')}>Donaciones</button>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default HiloDetalle;