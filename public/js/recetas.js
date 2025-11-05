// Funciones para gestionar recetas
const RecetasManager = {
    recetaEditando: null,

   async obtenerRecetas() {
    try {
        console.log('🍳 Solicitando recetas...');
        
         const token = localStorage.getItem('adminToken');
        console.log('🔐 Token disponible:', token ? 'SÍ' : 'NO');
        
        const response = await fetch('http://localhost:3000/api/recetas', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📋 Estado de la respuesta:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const recetas = await response.json();
        console.log('📦 Recetas recibidas (directo):', recetas);
        console.log('📦 Tipo:', typeof recetas);
        console.log('📦 Es array?', Array.isArray(recetas));
        console.log('📦 Cantidad:', Array.isArray(recetas) ? recetas.length : 'No es array');
        
        // ✅ DEBUG ADICIONAL: Ver contenido real
        if (Array.isArray(recetas) && recetas.length > 0) {
            console.log('🔍 Primera receta del array:', recetas[0]);
            console.log('🔍 IDs de recetas:', recetas.map(r => r.id));
        } else {
            console.log('🔍 Array vacío o no es array');
        }
        
        return Array.isArray(recetas) ? recetas : [];
        
    } catch (error) {
        console.error('❌ Error obteniendo recetas:', error);
        this.mostrarError('Error al cargar las recetas: ' + error.message);
        return [];
    }
},
    // Mostrar recetas en el dashboard
   async mostrarRecetas() {
        try {
            console.log('🔄 Mostrando recetas...');
            const recetas = await this.obtenerRecetas();
            this.actualizarEstadisticas(recetas);
            this.mostrarListaRecetas(recetas);
        } catch (error) {
            console.error('❌ Error mostrando recetas:', error);
        }
    },
    
    // Actualizar estadísticas
    actualizarEstadisticas(recetas) {
        if (!Array.isArray(recetas)) {
            recetas = [];
        }

        console.log(`📊 Actualizando estadísticas para ${recetas.length} recetas`);

        // Actualizar contador de recetas (segunda tarjeta de stats)
        const recetaCountElement = document.querySelector('.stat-card:nth-child(2) h3');
        if (recetaCountElement) {
            recetaCountElement.textContent = recetas.length;
        }
    },

    // Mostrar lista de recetas
    mostrarListaRecetas(recetas) {
        const container = document.getElementById('recetas-container');
        if (!container) {
            console.error('❌ No se encontró el contenedor de recetas');
            return;
        }

        if (!Array.isArray(recetas) || recetas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <h3>No hay recetas</h3>
                    <p>Comienza agregando tu primera receta</p>
                </div>
            `;
            return;
        }

        console.log(`🎨 Renderizando ${recetas.length} recetas...`);
        
        container.innerHTML = recetas.map(receta => `
            <div class="receta-card" data-id="${receta.id}">
                <div class="receta-imagen">
                    <i class="fas fa-utensils"></i>
                    <div class="receta-categoria-badge">${this.getCategoriaIcon(receta.categoria)} ${receta.categoria}</div>
                </div>
                <div class="receta-info">
                    <h4>${receta.nombre}</h4>
                    <p class="receta-descripcion">${receta.descripcion_corta || 'Sin descripción'}</p>
                    <div class="receta-detalles">
                        <span class="receta-tiempo"><i class="fas fa-clock"></i> ${receta.tiempo || 'No especificado'}</span>
                        <span class="receta-dificultad ${receta.dificultad?.toLowerCase()}">${receta.dificultad || 'Fácil'}</span>
                    </div>
                    <div class="receta-ingredientes">
                        <strong>Ingredientes:</strong> 
                        ${receta.ingredientes ? receta.ingredientes.substring(0, 100) + (receta.ingredientes.length > 100 ? '...' : '') : 'No especificados'}
                    </div>
                </div>
                <div class="receta-acciones">
                    <button class="btn-ver" onclick="RecetasManager.verReceta(${receta.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-editar" onclick="RecetasManager.editarReceta(${receta.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-eliminar" onclick="RecetasManager.eliminarReceta(${receta.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        console.log('✅ Recetas renderizadas correctamente');
    },

    // Obtener ícono según categoría
    getCategoriaIcon(categoria) {
        const iconos = {
            'Desayuno': '🥞',
            'Almuerzo': '🍽️',
            'Merienda': '☕',
            'Cena': '🌙',
            'Snacks': '🍎',
            'Smoothies': '🥤'
        };
        return iconos[categoria] || '📝';
    },

    // Abrir modal para nueva receta
    abrirModalNueva() {
        console.log('➕ Abriendo modal para nueva receta');
        this.recetaEditando = null;
        document.getElementById('modalRecetaTitle').textContent = 'Nueva Receta';
        document.getElementById('modalRecetaSubmitBtn').textContent = 'Crear Receta';
        document.getElementById('recetaForm').reset();
        this.mostrarModalReceta();
    },

    // Abrir modal para editar receta
    async abrirModalEditar(id) {
        try {
            console.log('✏️ Abriendo modal para editar receta ID:', id);
            this.recetaEditando = id;
            const receta = await authFetch(`http://localhost:3000/api/recetas/${id}`);
            
            if (receta) {
                document.getElementById('modalRecetaTitle').textContent = 'Editar Receta';
                document.getElementById('modalRecetaSubmitBtn').textContent = 'Actualizar Receta';
                
                // Llenar el formulario
                document.getElementById('recetaNombre').value = receta.nombre || '';
                document.getElementById('recetaDescripcion').value = receta.descripcion_corta || '';
                document.getElementById('recetaIngredientes').value = receta.ingredientes || '';
                document.getElementById('recetaPreparacion').value = receta.preparacion || '';
                document.getElementById('recetaTiempo').value = receta.tiempo || '';
                document.getElementById('recetaDificultad').value = receta.dificultad || 'Fácil';
                document.getElementById('recetaCategoria').value = receta.categoria || 'Desayuno';
                document.getElementById('recetaImagen').value = receta.imagen || '';
                
                this.mostrarModalReceta();
            }
        } catch (error) {
            this.mostrarError('Error al cargar la receta: ' + error.message);
        }
    },

    // Ver receta completa
    async verReceta(id) {
        try {
            const receta = await authFetch(`http://localhost:3000/api/recetas/${id}`);
            if (receta) {
                this.mostrarModalRecetaCompleta(receta);
            }
        } catch (error) {
            this.mostrarError('Error al cargar la receta: ' + error.message);
        }
    },

    // Mostrar modal de receta completa
    mostrarModalRecetaCompleta(receta) {
        const modal = document.getElementById('recetaCompletaModal');
        const contenido = document.getElementById('recetaCompletaContenido');
        
        contenido.innerHTML = `
            <div class="receta-completa">
                <h2>${receta.nombre}</h2>
                <div class="receta-meta">
                    <span class="categoria">${this.getCategoriaIcon(receta.categoria)} ${receta.categoria}</span>
                    <span class="tiempo"><i class="fas fa-clock"></i> ${receta.tiempo}</span>
                    <span class="dificultad ${receta.dificultad?.toLowerCase()}">${receta.dificultad}</span>
                </div>
                
                ${receta.descripcion_corta ? `<p class="descripcion">${receta.descripcion_corta}</p>` : ''}
                
                <div class="receta-seccion">
                    <h3><i class="fas fa-list"></i> Ingredientes</h3>
                    <div class="ingredientes">${this.formatearTexto(receta.ingredientes)}</div>
                </div>
                
                <div class="receta-seccion">
                    <h3><i class="fas fa-mortar-pestle"></i> Preparación</h3>
                    <div class="preparacion">${this.formatearTexto(receta.preparacion)}</div>
                </div>
            </div>
        `;
        
        modal.classList.add('show');
    },

    // Formatear texto (convertir saltos de línea en <br>)
    formatearTexto(texto) {
        return texto ? texto.replace(/\n/g, '<br>') : '';
    },

    // Mostrar modal de receta
    mostrarModalReceta() {
        document.getElementById('recetaModal').classList.add('show');
    },

    // Ocultar modal de receta
    ocultarModalReceta() {
        document.getElementById('recetaModal').classList.remove('show');
        this.recetaEditando = null;
    },

    // Ocultar modal de receta completa
    ocultarModalRecetaCompleta() {
        document.getElementById('recetaCompletaModal').classList.remove('show');
    },

    // Guardar receta (crear o actualizar)
    async guardarReceta(event) {
        event.preventDefault();
        console.log('💾 Guardando receta...');
        
        const formData = new FormData(event.target);
        const recetaData = {
            nombre: formData.get('nombre'),
            descripcion_corta: formData.get('descripcion_corta'),
            ingredientes: formData.get('ingredientes'),
            preparacion: formData.get('preparacion'),
            tiempo: formData.get('tiempo'),
            dificultad: formData.get('dificultad'),
            categoria: formData.get('categoria'),
            imagen: formData.get('imagen')
        };

        try {
            if (this.recetaEditando) {
                await authFetch(`http://localhost:3000/api/recetas/${this.recetaEditando}`, {
                    method: 'PUT',
                    body: JSON.stringify(recetaData)
                });
                this.mostrarMensaje('✅ Receta actualizada correctamente');
            } else {
                await authFetch('http://localhost:3000/api/recetas', {
                    method: 'POST',
                    body: JSON.stringify(recetaData)
                });
                this.mostrarMensaje('✅ Receta creada correctamente');
            }

            this.ocultarModalReceta();
            // Recargar recetas después de guardar
            setTimeout(() => {
                this.mostrarRecetas();
            }, 500);
            
        } catch (error) {
            this.mostrarError('Error al guardar la receta: ' + error.message);
        }
    },

    // Eliminar receta
    async eliminarReceta(id) {
        if (!confirm('¿Estás seguro de eliminar esta receta?')) return;

        try {
            console.log('🗑️ Intentando eliminar receta ID:', id);
            await authFetch(`http://localhost:3000/api/recetas/${id}`, {
                method: 'DELETE'
            });
            
            this.mostrarMensaje('✅ Receta eliminada correctamente');
            // Recargar recetas después de eliminar
            setTimeout(() => {
                this.mostrarRecetas();
            }, 500);
            
        } catch (error) {
            this.mostrarError('Error al eliminar la receta: ' + error.message);
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
    editarReceta(id) {
        this.abrirModalEditar(id);
    }
};
// Funciones globales para los modales (necesarias para el HTML)
function cerrarModalReceta() {
    RecetasManager.ocultarModalReceta();
}

function cerrarModalRecetaCompleta() {
    RecetasManager.ocultarModalRecetaCompleta();
}

function guardarReceta(event) {
    RecetasManager.guardarReceta(event);
}

// Inicializar gestor de recetas al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    RecetasManager.mostrarRecetas();
});