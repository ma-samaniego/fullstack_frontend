import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../css/admin.css';

interface Publicacion {
  id: number;
  userid: number;
  category: string;
  imageUri?: string | null;
  title: string;
  description: string;
  authorname: string;
  createDt: string;
  likes: number;
}

interface Comentario {
  id: number;
  publicacion_id: number;
  usuario_id: number;
  contenido: string;
  fecha_creacion: string;
  autor_nombre?: string;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'publicaciones' | 'comentarios'>('publicaciones');

  // Estados para datos
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);

  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Verificar que el usuario sea administrador
  useEffect(() => {
    const token = localStorage.getItem('token');
    const rolId = localStorage.getItem('rol_id');

    if (!token) {
      navigate('/inicioSesion', { state: { from: 'admin' } });
      return;
    }

    // Solo rol_id 1 es administrador
    if (rolId !== '1') {
      alert('Acceso denegado: Solo administradores pueden acceder a esta página');
      navigate('/principal');
      return;
    }

    // Cargar datos iniciales
    cargarPublicaciones();
  }, [navigate]);

  // Cargar publicaciones
  const cargarPublicaciones = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/publicaciones');
      setPublicaciones(response.data);
    } catch (error) {
      console.error('Error cargando publicaciones:', error);
      mostrarMensaje('Error al cargar publicaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cargar comentarios
  const cargarComentarios = async () => {
    setLoading(true);
    try {
      // Intentar cargar todos los comentarios
      const response = await api.get('/api/comentarios');
      setComentarios(response.data);
    } catch (error) {
      console.error('Error cargando comentarios:', error);
      mostrarMensaje('Error al cargar comentarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar publicación
  const eliminarPublicacion = async (publicacionId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta publicación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await api.delete(`/api/publicaciones/${publicacionId}`);
      mostrarMensaje('Publicación eliminada exitosamente', 'success');
      cargarPublicaciones();
    } catch (error) {
      console.error('Error eliminando publicación:', error);
      mostrarMensaje('Error al eliminar la publicación', 'error');
    }
  };

  // Eliminar comentario
  const eliminarComentario = async (comentarioId: number) => {
    if (!confirm('¿Estás seguro de eliminar este comentario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await api.delete(`/api/comentarios/${comentarioId}`);
      mostrarMensaje('Comentario eliminado exitosamente', 'success');
      cargarComentarios();
    } catch (error) {
      console.error('Error eliminando comentario:', error);
      mostrarMensaje('Error al eliminar el comentario', 'error');
    }
  };

  // Mostrar mensaje temporal
  const mostrarMensaje = (texto: string, tipo: 'success' | 'error') => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 3000);
  };

  // Manejar cambio de pestaña
  const handleTabChange = (tab: 'publicaciones' | 'comentarios') => {
    setActiveTab(tab);
    if (tab === 'publicaciones') cargarPublicaciones();
    if (tab === 'comentarios') cargarComentarios();
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <p>Gestiona usuarios, publicaciones y comentarios de PixelHub</p>
      </div>

      {/* Mensaje de notificación */}
      {mensaje && (
        <div className={`admin-message ${mensaje.includes('Error') ? 'error' : 'success'}`}>
          {mensaje}
        </div>
      )}

      {/* Pestañas de navegación */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'publicaciones' ? 'active' : ''}`}
          onClick={() => handleTabChange('publicaciones')}
        >
          📝 Publicaciones
        </button>
        <button
          className={`tab-btn ${activeTab === 'comentarios' ? 'active' : ''}`}
          onClick={() => handleTabChange('comentarios')}
        >
          💬 Comentarios
        </button>
      </div>

      {/* Contenido según pestaña activa */}
      <div className="admin-content">
        {loading ? (
          <div className="loading-spinner">Cargando...</div>
        ) : (
          <>
            {/* PESTAÑA PUBLICACIONES */}
            {activeTab === 'publicaciones' && (
              <div className="publicaciones-section">
                <h2>Gestión de Publicaciones</h2>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Autor</th>
                        <th>Categoría</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {publicaciones.length > 0 ? (
                        publicaciones.map((pub) => (
                          <tr key={pub.id}>
                            <td>{pub.id}</td>
                            <td className="title-cell" onClick={() => navigate(`/hilo/${pub.id}`)} style={{ cursor: 'pointer', color: '#8B5CF6' }} title="Ver publicación">{pub.title}</td>
                            <td>{pub.authorname}</td>
                            <td>
                              <span className="category-badge">{pub.category}</span>
                            </td>
                            <td>{pub.createDt ? new Date(pub.createDt).toLocaleDateString() : 'N/A'}</td>
                            <td>
                              <button
                                className="btn-action delete"
                                onClick={() => eliminarPublicacion(pub.id)}
                                title="Eliminar publicación"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="no-data">No hay publicaciones disponibles</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PESTAÑA COMENTARIOS */}
            {activeTab === 'comentarios' && (
              <div className="comentarios-section">
                <h2>Gestión de Comentarios</h2>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Contenido</th>
                        <th>Autor</th>
                        <th>ID Publicación</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comentarios.length > 0 ? (
                        comentarios.map((com) => (
                          <tr key={com.id}>
                            <td>{com.id}</td>
                            <td className="comment-cell">{com.contenido}</td>
                            <td>{com.autor_nombre || `Usuario ${com.usuario_id}`}</td>
                            <td>{com.publicacion_id}</td>
                            <td>{com.fecha_creacion ? new Date(com.fecha_creacion).toLocaleDateString() : 'N/A'}</td>
                            <td>
                              <button
                                className="btn-action delete"
                                onClick={() => eliminarComentario(com.id)}
                                title="Eliminar comentario"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="no-data">No hay comentarios disponibles</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Botón para volver */}
      <div className="admin-footer">
        <button className="btn-back" onClick={() => navigate('/principal')}>
          ← Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default Admin;
