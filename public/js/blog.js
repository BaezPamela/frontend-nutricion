// Funciones para gestionar el blog
const BlogManager = {
    postEditando: null,

    // Obtener todos los posts
    async obtenerPosts() {
        try {
            console.log('📝 Solicitando posts...');
            const token = localStorage.getItem('adminToken');
            console.log('🔐 Token disponible:', token ? 'SÍ' : 'NO');
            
            const response = await fetch('http://localhost:3000/api/posts', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📋 Estado de la respuesta:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const posts = await response.json();
            console.log('📦 Posts recibidos:', posts);
            console.log('📦 Tipo:', typeof posts);
            console.log('📦 Es array?', Array.isArray(posts));
            console.log('📦 Cantidad:', Array.isArray(posts) ? posts.length : 'No es array');
            
            // ✅ DEBUG ADICIONAL: Ver contenido real
            if (Array.isArray(posts) && posts.length > 0) {
                console.log('🔍 Primer post del array:', posts[0]);
                console.log('🔍 IDs de posts:', posts.map(p => p.id));
            } else {
                console.log('🔍 Array vacío o no es array');
            }
            
            return Array.isArray(posts) ? posts : [];
            
        } catch (error) {
            console.error('❌ Error obteniendo posts:', error);
            this.mostrarError('Error al cargar los posts: ' + error.message);
            return [];
        }
    },

    // Mostrar posts en el dashboard
    async mostrarPosts() {
        try {
            const posts = await this.obtenerPosts();
            this.actualizarEstadisticas(posts);
            this.mostrarListaPosts(posts);
        } catch (error) {
            console.error('❌ Error mostrando posts:', error);
        }
    },

    // Actualizar estadísticas
    actualizarEstadisticas(posts) {
        if (!Array.isArray(posts)) posts = [];
        
        console.log(`📊 Actualizando estadísticas para ${posts.length} posts`);

        // Contar posts por estado
        const publicados = posts.filter(p => p.estado === 'publicado').length;
        const borradores = posts.filter(p => p.estado === 'borrador').length;

        // Actualizar contador de posts (tercera tarjeta de stats)
        const postCountElement = document.querySelector('.stat-card:nth-child(3) h3');
        if (postCountElement) {
            postCountElement.textContent = posts.length;
        }

        console.log(`📈 Posts publicados: ${publicados}, Borradores: ${borradores}`);
    },

    // Mostrar lista de posts
    mostrarListaPosts(posts) {
        const container = document.getElementById('blog-container');
        if (!container) {
            console.error('❌ No se encontró el contenedor del blog');
            return;
        }

        if (!Array.isArray(posts) || posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <h3>No hay posts</h3>
                    <p>Comienza agregando tu primer artículo</p>
                </div>
            `;
            return;
        }

        console.log(`🎨 Renderizando ${posts.length} posts...`);
        
        container.innerHTML = posts.map(post => `
            <div class="post-card" data-id="${post.id}">
                <div class="post-header">
                    <h4>${post.titulo || 'Sin título'}</h4>
                    <div class="post-meta">
                        <span class="post-categoria ${post.categoria}">${this.getCategoriaIcon(post.categoria)} ${this.formatearCategoria(post.categoria)}</span>
                        <span class="post-tipo ${post.tipo}">${this.getTipoIcon(post.tipo)} ${this.formatearTipo(post.tipo)}</span>
                        <span class="post-estado ${post.estado}">${post.estado === 'publicado' ? '✅ Publicado' : '📝 Borrador'}</span>
                    </div>
                </div>
                
                <div class="post-content">
                    <p class="post-resumen">${post.resumen || 'Sin resumen...'}</p>
                    
                    ${post.libro_autor ? `
                        <div class="post-libro">
                            <strong>📚 Libro:</strong> ${post.libro_autor}
                        </div>
                    ` : ''}
                    
                    ${post.url_video ? `
                        <div class="post-video">
                            <strong>🎥 Video:</strong> ${post.url_video.substring(0, 50)}...
                        </div>
                    ` : ''}
                </div>
                
                <div class="post-footer">
                    <div class="post-fecha">
                        <small>Creado: ${new Date(post.created_at).toLocaleDateString()}</small>
                    </div>
                    <div class="post-acciones">
                        <button class="btn-ver" onclick="BlogManager.verPost(${post.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-editar" onclick="BlogManager.editarPost(${post.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-eliminar" onclick="BlogManager.eliminarPost(${post.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        console.log('✅ Posts renderizados correctamente');
    },

    // Obtener ícono según categoría
    getCategoriaIcon(categoria) {
        const iconos = {
            'nutricion': '🥗',
            'yoga': '🧘‍♀️',
            'relax': '😌',
            'meditacion': '🧠',
            'bienestar': '💖'
        };
        return iconos[categoria] || '📄';
    },

    // Formatear categoría para mostrar
    formatearCategoria(categoria) {
        const categorias = {
            'nutricion': 'Nutrición',
            'yoga': 'Yoga',
            'relax': 'Relax',
            'meditacion': 'Meditación',
            'bienestar': 'Bienestar'
        };
        return categorias[categoria] || categoria;
    },

    // Obtener ícono según tipo
    getTipoIcon(tipo) {
        const iconos = {
            'articulo': '📝',
            'video': '🎥',
            'libro': '📚'
        };
        return iconos[tipo] || '📄';
    },

    // Formatear tipo para mostrar
    formatearTipo(tipo) {
        const tipos = {
            'articulo': 'Artículo',
            'video': 'Video',
            'libro': 'Libro'
        };
        return tipos[tipo] || tipo;
    },

    // Abrir modal para nuevo post
    abrirModalNuevo() {
        console.log('➕ Abriendo modal para nuevo post');
        this.postEditando = null;
        document.getElementById('modalBlogTitle').textContent = 'Nuevo Post';
        document.getElementById('modalBlogSubmitBtn').textContent = 'Crear Post';
        document.getElementById('blogForm').reset();
        
        // Mostrar/ocultar campos según tipo
        this.mostrarCamposPorTipo('articulo');
        
        this.mostrarModalBlog();
    },

    // Abrir modal para editar post
    async abrirModalEditar(id) {
        try {
            console.log('✏️ Abriendo modal para editar post ID:', id);
            this.postEditando = id;
            const token = localStorage.getItem('adminToken');
            
            const response = await fetch(`http://localhost:3000/api/posts/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const post = await response.json();
            
            if (post) {
                document.getElementById('modalBlogTitle').textContent = 'Editar Post';
                document.getElementById('modalBlogSubmitBtn').textContent = 'Actualizar Post';
                
                // Llenar el formulario
                document.getElementById('blogTitulo').value = post.titulo || '';
                document.getElementById('blogResumen').value = post.resumen || '';
                document.getElementById('blogContenido').value = post.contenido || '';
                document.getElementById('blogCategoria').value = post.categoria || 'nutricion';
                document.getElementById('blogTipo').value = post.tipo || 'articulo';
                document.getElementById('blogEstado').value = post.estado || 'borrador';
                document.getElementById('blogImagen').value = post.imagen || '';
                document.getElementById('blogVideoUrl').value = post.url_video || '';
                document.getElementById('blogLibroAutor').value = post.libro_autor || '';
                document.getElementById('blogLibroEnlace').value = post.libro_enlace || '';
                
                // Mostrar/ocultar campos según tipo
                this.mostrarCamposPorTipo(post.tipo);
                
                this.mostrarModalBlog();
            }
        } catch (error) {
            this.mostrarError('Error al cargar el post: ' + error.message);
        }
    },

    // Mostrar/ocultar campos según tipo de post
    mostrarCamposPorTipo(tipo) {
        const videoFields = document.getElementById('videoFields');
        const libroFields = document.getElementById('libroFields');
        
        if (videoFields) videoFields.style.display = tipo === 'video' ? 'block' : 'none';
        if (libroFields) libroFields.style.display = tipo === 'libro' ? 'block' : 'none';
    },

    // Ver post completo
    async verPost(id) {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:3000/api/posts/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const post = await response.json();
            if (post) {
                this.mostrarModalPostCompleto(post);
            }
        } catch (error) {
            this.mostrarError('Error al cargar el post: ' + error.message);
        }
    },

    // Mostrar modal de post completo
    mostrarModalPostCompleto(post) {
        const modal = document.getElementById('postCompletoModal');
        const contenido = document.getElementById('postCompletoContenido');
        
        contenido.innerHTML = `
            <div class="post-completo">
                <h2>${post.titulo}</h2>
                <div class="post-meta-completo">
                    <span class="categoria">${this.getCategoriaIcon(post.categoria)} ${this.formatearCategoria(post.categoria)}</span>
                    <span class="tipo">${this.getTipoIcon(post.tipo)} ${this.formatearTipo(post.tipo)}</span>
                    <span class="estado ${post.estado}">${post.estado === 'publicado' ? '✅ Publicado' : '📝 Borrador'}</span>
                    <span class="fecha">📅 ${new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                
                ${post.resumen ? `
                    <div class="post-resumen-completo">
                        <h3>Resumen</h3>
                        <p>${post.resumen}</p>
                    </div>
                ` : ''}
                
                ${post.url_video ? `
                    <div class="post-video-completo">
                        <h3>🎥 Video</h3>
                        <p><a href="${post.url_video}" target="_blank">${post.url_video}</a></p>
                    </div>
                ` : ''}
                
                ${post.libro_autor ? `
                    <div class="post-libro-completo">
                        <h3>📚 Libro Recomendado</h3>
                        <p><strong>Autor:</strong> ${post.libro_autor}</p>
                        ${post.libro_enlace ? `<p><strong>Enlace:</strong> <a href="${post.libro_enlace}" target="_blank">Ver libro</a></p>` : ''}
                    </div>
                ` : ''}
                
                <div class="post-contenido-completo">
                    <h3>Contenido</h3>
                    <div class="contenido-texto">${this.formatearTexto(post.contenido)}</div>
                </div>
            </div>
        `;
        
        modal.classList.add('show');
    },

    // Formatear texto (convertir saltos de línea en <br>)
    formatearTexto(texto) {
        return texto ? texto.replace(/\n/g, '<br>') : '';
    },

    // Mostrar modal de blog
    mostrarModalBlog() {
        document.getElementById('blogModal').classList.add('show');
    },

    // Ocultar modal de blog
    ocultarModalBlog() {
        document.getElementById('blogModal').classList.remove('show');
        this.postEditando = null;
    },

    // Ocultar modal de post completo
    ocultarModalPostCompleto() {
        document.getElementById('postCompletoModal').classList.remove('show');
    },

    // Guardar post (crear o actualizar)
    async guardarPost(event) {
        event.preventDefault();
        console.log('💾 Guardando post...');
        
        const formData = new FormData(event.target);
        const postData = {
            titulo: formData.get('titulo'),
            resumen: formData.get('resumen'),
            contenido: formData.get('contenido'),
            imagen: formData.get('imagen'),
            categoria: formData.get('categoria'),
            tipo: formData.get('tipo'),
            estado: formData.get('estado'),
            url_video: formData.get('url_video'),
            libro_autor: formData.get('libro_autor'),
            libro_enlace: formData.get('libro_enlace')
        };

        try {
            const token = localStorage.getItem('adminToken');
            const url = this.postEditando 
                ? `http://localhost:3000/api/posts/${this.postEditando}`
                : 'http://localhost:3000/api/posts';
                
            const method = this.postEditando ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (this.postEditando) {
                this.mostrarMensaje('✅ Post actualizado correctamente');
            } else {
                this.mostrarMensaje('✅ Post creado correctamente');
            }

            this.ocultarModalBlog();
            // Recargar posts después de guardar
            setTimeout(() => {
                this.mostrarPosts();
            }, 500);
            
        } catch (error) {
            this.mostrarError('Error al guardar el post: ' + error.message);
        }
    },

    // Eliminar post
    async eliminarPost(id) {
        if (!confirm('¿Estás seguro de eliminar este post?')) return;

        try {
            console.log('🗑️ Intentando eliminar post ID:', id);
            const token = localStorage.getItem('adminToken');
            
            const response = await fetch(`http://localhost:3000/api/posts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            this.mostrarMensaje('✅ Post eliminado correctamente');
            // Recargar posts después de eliminar
            setTimeout(() => {
                this.mostrarPosts();
            }, 500);
            
        } catch (error) {
            this.mostrarError('Error al eliminar el post: ' + error.message);
        }
    },

    // Mostrar mensaje
    mostrarMensaje(mensaje) {
        console.log('💬 Mensaje:', mensaje);
        alert(mensaje);
    },

    // Mostrar error
    mostrarError(mensaje) {
        console.error('❌ Error:', mensaje);
        alert(mensaje);
    },

    // Funciones de editar y ver
    editarPost(id) {
        this.abrirModalEditar(id);
    }
};

// Funciones globales para los modales (necesarias para el HTML)
function cerrarModalBlog() {
    BlogManager.ocultarModalBlog();
}

function cerrarModalPostCompleto() {
    BlogManager.ocultarModalPostCompleto();
}

function guardarPost(event) {
    BlogManager.guardarPost(event);
}

// Inicialización del blog
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando BlogManager...');
    
    // Inicializar event listeners
    const tipoSelect = document.getElementById('blogTipo');
    if (tipoSelect) {
        tipoSelect.addEventListener('change', function() {
            BlogManager.mostrarCamposPorTipo(this.value);
        });
    }
    
    // Cargar posts automáticamente
    setTimeout(() => {
        BlogManager.mostrarPosts();
    }, 1000);
});