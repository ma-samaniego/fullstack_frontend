import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../css/home.css';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({
    usuarios: 0,
    hilos: 0,
    comentarios: 0
  });

  useEffect(() => {
    // Activar las animaciones después de que el componente se monte
    setTimeout(() => setIsVisible(true), 100);

    // Cargar estadísticas desde el backend
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      // Obtener número de hilos
      const resPublicaciones = await api.get('/api/publicaciones');
      const totalHilos = resPublicaciones.data.length;

      // Obtener número de usuarios (asumiendo que existe un endpoint)
      let totalUsuarios = 0;
      try {
        const resUsuarios = await api.get('/api/v1/usuarios');
        totalUsuarios = resUsuarios.data.length;
      } catch (err) {
        // Si no existe el endpoint, usar el número de autores únicos
        const autoresUnicos = new Set(resPublicaciones.data.map((pub: any) => pub.authorname));
        totalUsuarios = autoresUnicos.size;
      }

      // Cargar comentarios en paralelo (más rápido)
      let totalComentarios = 0;
      try {
        const comentariosPromises = resPublicaciones.data.map((pub: any) =>
          api.get(`/api/comentarios/publicacion/${pub.id}`).catch(() => ({ data: [] }))
        );
        const comentariosResults = await Promise.all(comentariosPromises);
        totalComentarios = comentariosResults.reduce((sum, res) => sum + res.data.length, 0);
      } catch (err) {
        console.error('Error cargando comentarios', err);
      }

      setStats({
        usuarios: totalUsuarios,
        hilos: totalHilos,
        comentarios: totalComentarios
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  return (
    <div className="home-container">
      {/* Partículas animadas de fondo */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i}`}></div>
        ))}
      </div>

      {/* Contenido principal */}
      <div className={`hero-section ${isVisible ? 'fade-in' : ''}`}>
        <div className="logo-container">
          <h1 className="logo-text">
            <span className="pixel-letter">P</span>
            <span className="pixel-letter">i</span>
            <span className="pixel-letter">x</span>
            <span className="pixel-letter">e</span>
            <span className="pixel-letter">l</span>
            <span className="pixel-letter">H</span>
            <span className="pixel-letter">u</span>
            <span className="pixel-letter">b</span>
          </h1>
          <div className="logo-underline"></div>
        </div>

        <p className={`hero-subtitle ${isVisible ? 'slide-up' : ''}`}>
          Tu comunidad de desarrollo y creatividad digital
        </p>

        <div className={`features-grid ${isVisible ? 'fade-in-delayed' : ''}`}>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Foros Dinámicos</h3>
            <p>Participa en conversaciones sobre tecnología y desarrollo</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Creatividad</h3>
            <p>Comparte tus proyectos y descubre inspiración</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Innovación</h3>
            <p>Mantente al día con las últimas tendencias tech</p>
          </div>
        </div>

        <div className={`cta-buttons ${isVisible ? 'bounce-in' : ''}`}>
          <Link to="/principal" className="btn-primary-custom">
            <span>Explorar Hilos</span>
            <div className="btn-glow"></div>
          </Link>
          <Link to="/donaciones" className="btn-secondary-custom">
            <span>Apoyar el Proyecto</span>
          </Link>
        </div>

        {/* Elementos decorativos flotantes */}
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      {/* Sección de estadísticas con animación */}
      <div className={`stats-section ${isVisible ? 'slide-up-delayed' : ''}`}>
        <div className="stat-item">
          <h2 className="stat-number">{stats.usuarios}</h2>
          <p className="stat-label">Usuarios Activos</p>
        </div>
        <div className="stat-item">
          <h2 className="stat-number">{stats.hilos}</h2>
          <p className="stat-label">Hilos Creados</p>
        </div>
        <div className="stat-item">
          <h2 className="stat-number">{stats.comentarios}</h2>
          <p className="stat-label">Comentarios</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
