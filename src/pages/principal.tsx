import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // instancia de axios
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/principal.css';

// Interfaz que coincide con PublicationModel.java
interface Publicacion {
    id: number;
    userid: number;
    category: string;
    imageUri?: string | null; // Puede ser string o null
    title: string;
    description: string;
    authorname: string;
    createDt: string;
    likes: number;
}

const categories = ['Shooter', 'RPG', 'Indie', 'Noticias', 'Retro', 'Tecnología'];

const Principal: React.FC = () => {
 const [hilos, setHilos] = useState<Publicacion[]>([]); // lista de publicaciones
 const [loading, setLoading] = useState(true); // indicador de carga de publicaciones
 const [activeCategory, setActiveCategory] = useState('Shooter'); // categoría activa para filtrar

 // Estados del formulario para crear nuevo hilo
 const [categoria, setCategoria] = useState('');
 const [titulo, setTitulo] = useState('');
 const [descripcion, setDescripcion] = useState('');
 const [urlImagen, setUrlImagen] = useState('');

 const navigate = useNavigate();

 // Calcular estadísticas de categorías (MEMOIZADO)
 const topCategories = useMemo(() => {
   const stats: { [key: string]: number } = {};
   hilos.forEach(hilo => {
     stats[hilo.category] = (stats[hilo.category] || 0) + 1;
   });
   // Ordenar por cantidad de publicaciones
   return Object.entries(stats)
     .sort((a, b) => b[1] - a[1])
     .slice(0, 3);
 }, [hilos]);

 // 1. Cargar publicaciones reales al montar el componente
 // Cargar publicaciones al montar
 useEffect(() => {
   fetchPublicaciones();
 }, []);

 const fetchPublicaciones = async () => {
    try {
        // Endpoint del Gateway -> Microservicio Publicaciones
        const response = await api.get('/api/publicaciones');
        setHilos(response.data);
    } catch (error) {
        console.error("Error cargando publicaciones", error);
    } finally {
        setLoading(false);
    }
 };

 // Cuando se hace click en una tarjeta, navegamos al detalle pasando el objeto hilo en el state
 const handleCardClick = (hilo: Publicacion) => {
   navigate(`/hilo/${hilo.id}`, { state: { hilo } });
 };

 // Enviar nueva publicación al backend
 const handleSubmitHilo = async () => {
   if (!categoria || !titulo.trim() || !descripcion.trim()) { 
       alert("Completa los campos obligatorios"); return; 
   }

   const usuarioId = Number(localStorage.getItem('usuario_id'));
   const autorNombre = localStorage.getItem('nombre_usuario') || 'Anonimo';

   const nuevaPubli = {
       userid: usuarioId,
       category: categoria,
       // Si no se proporciona URL, enviamos null
       imageUri: urlImagen.trim() !== "" ? urlImagen : null,
       title: titulo,
       description: descripcion,
       authorname: autorNombre,
       status: "ACTIVE"
   };

   try {
       // POST a /api/publicaciones/publicar
       const response = await api.post('/api/publicaciones/publicar', nuevaPubli);

       // Insertar la nueva publicación al principio de la lista local
       setHilos([response.data, ...hilos]);

       // Limpiar formulario
       setCategoria(''); setTitulo(''); setDescripcion(''); setUrlImagen('');

       // Intentar cerrar el modal si existe
       const btnCerrar = document.querySelector('#addHiloModal .btn-close') as HTMLElement;
       if (btnCerrar) {
         btnCerrar.click();
       }
   } catch (error: any) {
       console.error(error);
       if (error.response?.data?.message) {
         alert(`Error: ${error.response.data.message}`);
       } else {
         alert("Error al crear la publicación. Asegúrate de que la descripción no sea muy larga (máximo 255 caracteres).");
       }
   }
 };

 // Filtramos localmente por categoría y ordenamos por likes (MEMOIZADO)
 const filteredHilos = useMemo(() => {
   return hilos
     .filter(hilo => hilo.category === activeCategory)
     .sort((a, b) => b.likes - a.likes);
 }, [hilos, activeCategory]);

 return (
   <>
     <div className="main-wrapper">
       <div className="layout-with-sidebars">
         {/* SIDEBAR IZQUIERDO */}
         <aside className="sidebar sidebar-left">
           <div className="sidebar-card">
             <h3 className="sidebar-title">🏠 Inicio</h3>
             <p className="sidebar-text">Tu página principal de PixelHub</p>
           </div>

           <div className="sidebar-card">
             <h3 className="sidebar-title">📊 Tendencias</h3>
             <div className="trending-topics">
               {topCategories.length > 0 ? (
                 topCategories.map(([category, count], index) => (
                   <div key={category} className="trending-item" onClick={() => setActiveCategory(category)}>
                     <span className="trending-rank">{index + 1}</span>
                     <div className="trending-info">
                       <p className="trending-name">{category}</p>
                       <span className="trending-count">{count} {count === 1 ? 'publicación' : 'publicaciones'}</span>
                     </div>
                   </div>
                 ))
               ) : (
                 <p className="sidebar-text" style={{ textAlign: 'center', opacity: 0.6 }}>
                   No hay publicaciones aún
                 </p>
               )}
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

         {/* CONTENIDO PRINCIPAL */}
         <main className="main-content-center">
           {/* Header integrado con categorías */}
           <div className="principal-header-integrated">
           <div className="header-top">
             <div className="header-content">
               <h2 className="title-gradient">Explora PixelHub</h2>
               <p className="subtitle">Descubre las últimas discusiones de la comunidad</p>
             </div>
             <div className="header-stats">
               <div className="stat-box">
                 <span className="stat-number">{hilos.length}</span>
                 <span className="stat-label">Hilos</span>
               </div>
               <div className="stat-box">
                 <span className="stat-number">{categories.length}</span>
                 <span className="stat-label">Categorías</span>
               </div>
             </div>
           </div>

           {/* Categorías integradas en el mismo contenedor */}
           <div className="categories-integrated">
             <div className="categories-nav">
               {categories.map((cat) => (
                 <button
                   key={cat}
                   className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                   onClick={() => setActiveCategory(cat)}
                 >
                   {cat}
                 </button>
               ))}
             </div>
             <button type="button" className="btn-pixelhub-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }} data-bs-toggle="modal" data-bs-target="#addHiloModal">
               <span className="plus-icon">+</span>
               <span className="btn-text">Crear Hilo</span>
             </button>
           </div>
         </div>

         {/* Listado mejorado con grid */}
         <div className="hilos-grid">
           {loading ? (
             <div className="loading-container">
               <div className="loading-spinner-custom"></div>
               <p className="loading-text">Cargando hilos...</p>
             </div>
           ) : filteredHilos.length > 0 ? (
            filteredHilos.map((hilo) => (
             <div className="hilo-card" key={hilo.id} onClick={() => handleCardClick(hilo)}>
               <div className="hilo-content">
                 <div className="hilo-header">
                   <span className="category-badge">{hilo.category}</span>
                 </div>
                 <h3 className="hilo-title">{hilo.title}</h3>
                 <p className="hilo-description">{hilo.description}</p>
                 <div className="hilo-footer">
                   <div className="author-info">
                     <div className="author-avatar">{hilo.authorname.charAt(0).toUpperCase()}</div>
                     <div className="author-details">
                       <span className="author-name">{hilo.authorname}</span>
                       <span className="post-date">{hilo.createDt ? new Date(hilo.createDt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                     </div>
                   </div>
                   <button className="btn-pixelhub-link" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Ver más →</button>
                 </div>
               </div>
             </div>
           ))
           ) : (
             <div className="no-hilos">
               <div className="no-hilos-icon">📭</div>
               <p className="no-hilos-text">No hay hilos en esta categoría</p>
               <button className="btn-pixelhub-primary" data-bs-toggle="modal" data-bs-target="#addHiloModal">
                 Crear el primero
               </button>
             </div>
           )}
         </div>
       </main>

       {/* SIDEBAR DERECHO */}
       <aside className="sidebar sidebar-right">
         <div className="sidebar-card">
           <h3 className="sidebar-title">🔥 Más Populares</h3>
           <div className="popular-posts">
             {hilos.slice(0, 5).sort((a, b) => b.likes - a.likes).map((hilo, index) => (
               <div key={hilo.id} className="popular-post-item" onClick={() => handleCardClick(hilo)}>
                 <span className="popular-rank">#{index + 1}</span>
                 <div className="popular-info">
                   <p className="popular-title">{hilo.title}</p>
                 </div>
               </div>
             ))}
           </div>
         </div>

         <div className="sidebar-card">
           <h3 className="sidebar-title">👥 Comunidad</h3>
           <div className="community-stats">
             <div className="community-stat">
               <span className="stat-value">{hilos.length}</span>
               <span className="stat-text">Publicaciones Totales</span>
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

     {/* Modal para añadir hilo */}
     <div className="modal fade" id="addHiloModal" tabIndex={-1} aria-hidden="true">
       <div className="modal-dialog">
         <div className="modal-content custom-modal">
           <div className="modal-header custom-modal-header">
             <h5 className="modal-title">Nueva Publicación</h5>
             <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
           </div>
           <div className="modal-body">
             <form>
               <div className="mb-3">
                 <label className="form-label">Categoría</label>
                 <select className="form-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                   <option value="" disabled>Selecciona...</option>
                   {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                 </select>
               </div>
               <div className="mb-3">
                 <label className="form-label">Título</label>
                 <input type="text" className="form-control" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título breve" />
               </div>
               <div className="mb-3">
                 <label className="form-label">Descripción</label>
                 <textarea className="form-control" rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Contenido del post..." maxLength={255}></textarea>
                 <small className="form-text text-white-50">{descripcion.length}/255 caracteres</small>
               </div>
               <div className="mb-3">
                 <label className="form-label">URL Imagen (Opcional)</label>
                 <input type="url" className="form-control" value={urlImagen} onChange={(e) => setUrlImagen(e.target.value)} placeholder="https://..." />
               </div>
               <button type="button" onClick={handleSubmitHilo} className="btn-pixelhub-primary btn-pixelhub-full">Publicar</button>
             </form>
           </div>
         </div>
       </div>
     </div>
   </>
 );
};

export default Principal;