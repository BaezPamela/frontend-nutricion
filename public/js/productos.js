const ProductosManager = {
    productoEditando: null,

    // Método para probar conexión con backend
    async probarConexionBackend() {
        try {
            console.log('🧪 Probando conexión con backend real...');
            
            // Probar GET /api/productos
            const productos = await authFetch('http://localhost:3000/api/productos');
            console.log('✅ GET /api/productos funciona:', productos.length, 'productos');
            
            // Probar que tenemos al menos un producto para probar edición
            if (productos.length > 0) {
                const primerProducto = productos[0];
                console.log('📝 Producto de prueba para edición:', primerProducto.id, primerProducto.nombre);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error conectando con backend real:', error);
            
            // Mostrar ayuda específica según el error
            if (error.message.includes('401')) {
                this.mostrarError('Error de autenticación. Por favor, inicia sesión nuevamente.');
            } else if (error.message.includes('404')) {
                this.mostrarError('Ruta no encontrada. Verifica que el backend esté corriendo.');
            } else {
                this.mostrarError('Error de conexión: ' + error.message);
            }
            
            return false;
        }
    },

    // Obtener todos los productos
    async obtenerProductos() {
        try {
            console.log('🔄 Solicitando productos...');
            const productos = await authFetch('http://localhost:3000/api/productos');
            console.log('📦 Productos recibidos:', productos);
            
            if (!Array.isArray(productos)) {
                console.warn('⚠️ Productos no es array, forzando conversión');
                return [];
            }
            
            console.log(`✅ ${productos.length} productos listos para mostrar`);
            return productos;
            
        } catch (error) {
            console.error('❌ Error obteniendo productos:', error);
            
            // Fallback: usar datos de prueba si la ruta real falla
            console.log('🔄 Usando datos de prueba como fallback...');
            const response = await fetch('http://localhost:3000/api/test-productos');
            if (response.ok) {
                const data = await response.json();
                return data.productos || data;
            }
            
            this.mostrarError('Error al cargar los productos: ' + error.message);
            return [];
        }
    },

    // Mostrar productos en el dashboard
    async mostrarProductos() {
        try {
            const productos = await this.obtenerProductos();
            this.actualizarEstadisticas(productos);
            this.mostrarListaProductos(productos);
        } catch (error) {
            console.error('❌ Error mostrando productos:', error);
        }
    },

    // Actualizar estadísticas
    actualizarEstadisticas(productos) {
        if (!Array.isArray(productos)) {
            console.warn('⚠️ Productos no es un array:', productos);
            productos = [];
        }

        console.log(`📊 Actualizando estadísticas para ${productos.length} productos`);

        // Actualizar contador de productos
        const productCountElement = document.querySelector('.stat-card:nth-child(1) h3');
        if (productCountElement) {
            productCountElement.textContent = productos.length;
        }
        
        // Calcular valor total del inventario
        if (productos.length > 0) {
            const valorTotal = productos.reduce((total, producto) => {
                return total + (parseFloat(producto.precio) * parseInt(producto.stock));
            }, 0);
            
            console.log(`💰 Valor total del inventario: ${valorTotal.toFixed(2)}`);
        }
    },

    // Mostrar lista de productos
    mostrarListaProductos(productos) {
        const container = document.getElementById('productos-container');
       
        if (!container) {
            console.error('❌ No se encontró el contenedor de productos');
            return;
        }

        if (!Array.isArray(productos) || productos.length === 0) {
            console.log('📭 No hay productos o no es un array');
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>No hay productos</h3>
                    <p>Comienza agregando tu primer producto</p>
                </div>
            `;
            return;
        }

        console.log(`🔄 Renderizando ${productos.length} productos...`);
        
        container.innerHTML = productos.map(producto => `
            <div class="producto-card" data-id="${producto.id}">
                <div class="producto-imagen">
                    <i class="fas fa-cube"></i>
                    <div class="imagen-texto">${producto.nombre ? producto.nombre.substring(0, 2).toUpperCase() : 'PD'}</div>
                </div>
                <div class="producto-info">
                    <h4>${producto.nombre || 'Sin nombre'}</h4>
                    <p class="producto-descripcion">${producto.descripcion || 'Sin descripción'}</p>
                    <div class="producto-detalles">
                        <span class="producto-precio">$${parseFloat(producto.precio || 0).toFixed(2)}</span>
                        <span class="producto-stock">Stock: ${producto.stock || 0}</span>
                        <span class="producto-categoria">${producto.categoria || 'General'}</span>
                    </div>
                </div>
                <div class="producto-acciones">
                    <button class="btn-editar" onclick="ProductosManager.editarProducto(${producto.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-eliminar" onclick="ProductosManager.eliminarProducto(${producto.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        console.log('✅ Productos renderizados correctamente');
    },

    // Obtener un producto por ID
    async obtenerProductoPorId(id) {
        try {
            console.log('🔍 Obteniendo producto por ID:', id);
            const producto = await authFetch(`http://localhost:3000/api/productos/${id}`);
            return producto;
        } catch (error) {
            console.error('❌ Error obteniendo producto por ID:', error);
            throw new Error('No se pudo cargar el producto');
        }
    },

    // Abrir modal para nuevo producto
    abrirModalNuevo() {
        console.log('➕ Abriendo modal para nuevo producto');
        this.productoEditando = null;
        
        // ✅ VERIFICAR que los elementos existen antes de modificarlos
        const modalTitle = document.getElementById('modalTitle');
        const modalSubmitBtn = document.getElementById('modalSubmitBtn');
        const productoForm = document.getElementById('productoForm');
        
        if (modalTitle) {
            modalTitle.textContent = 'Nuevo Producto';
        }
        if (modalSubmitBtn) {
            modalSubmitBtn.textContent = 'Crear Producto';
        }
        if (productoForm) {
            productoForm.reset();
        }
        
        this.mostrarModal();
    },

    // Abrir modal para editar producto
    async abrirModalEditar(id) {
        try {
            console.log('✏️ Abriendo modal para editar producto ID:', id);
            this.productoEditando = id;
            const producto = await this.obtenerProductoPorId(id);
            
            if (producto) {
                // ✅ VERIFICAR que los elementos existen
                const modalTitle = document.getElementById('modalTitle');
                const modalSubmitBtn = document.getElementById('modalSubmitBtn');
                
                if (modalTitle) {
                    modalTitle.textContent = 'Editar Producto';
                }
                if (modalSubmitBtn) {
                    modalSubmitBtn.textContent = 'Actualizar Producto';
                }
                
                // Llenar el formulario con los datos del producto
                this.llenarFormulario(producto);
                this.mostrarModal();
            }
        } catch (error) {
            this.mostrarError('Error al cargar el producto: ' + error.message);
        }
    },

    // Nuevo método para llenar el formulario
    llenarFormulario(producto) {
        // ✅ VERIFICAR cada elemento antes de asignar valores
        const nombreInput = document.getElementById('productoNombre');
        const descripcionInput = document.getElementById('productoDescripcion');
        const precioInput = document.getElementById('productoPrecio');
        const stockInput = document.getElementById('productoStock');
        const categoriaInput = document.getElementById('productoCategoria');
        const imagenInput = document.getElementById('productoImagen');
        
        if (nombreInput) nombreInput.value = producto.nombre || '';
        if (descripcionInput) descripcionInput.value = producto.descripcion || '';
        if (precioInput) precioInput.value = producto.precio || '';
        if (stockInput) stockInput.value = producto.stock || '';
        if (categoriaInput) categoriaInput.value = producto.categoria || 'general';
        if (imagenInput) imagenInput.value = producto.imagen || '';
    },

    // Mostrar modal
    mostrarModal() {
        const modal = document.getElementById('productoModal');
        if (modal) {
            modal.classList.add('show');
        } else {
            console.error('❌ No se encontró el modal con ID "productoModal"');
        }
    },

    // Ocultar modal
    ocultarModal() {
        const modal = document.getElementById('productoModal');
        if (modal) {
            modal.classList.remove('show');
        }
        this.productoEditando = null;
    },

    // Guardar producto (crear o actualizar)
    async guardarProducto(event) {
        event.preventDefault();
        console.log('💾 Guardando producto...');
        
        const formData = new FormData(event.target);
        const productoData = {
            nombre: formData.get('nombre'),
            descripcion: formData.get('descripcion'),
            precio: parseFloat(formData.get('precio')),
            stock: parseInt(formData.get('stock')),
            categoria: formData.get('categoria'),
            imagen: formData.get('imagen') || ''
        };

        try {
            if (this.productoEditando) {
                // Actualizar producto existente
                console.log('🔄 Actualizando producto ID:', this.productoEditando);
                await authFetch(`http://localhost:3000/api/productos/${this.productoEditando}`, {
                    method: 'PUT',
                    body: JSON.stringify(productoData)
                });
                this.mostrarMensaje('✅ Producto actualizado correctamente');
            } else {
                // Crear nuevo producto
                console.log('🆕 Creando nuevo producto');
                await authFetch('http://localhost:3000/api/productos', {
                    method: 'POST',
                    body: JSON.stringify(productoData)
                });
                this.mostrarMensaje('✅ Producto creado correctamente');
            }

            this.ocultarModal();
            console.log('🔄 Forzando recarga de productos...');
            await this.mostrarProductos(); 
            
        } catch (error) {
            this.mostrarError('Error al guardar el producto: ' + error.message);
        }
    },

    // Funciones de editar y eliminar
    editarProducto: function(id) {
        console.log('✏️ Editando producto ID:', id);
        this.abrirModalEditar(id);
    },

    eliminarProducto: async function(id) {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            console.log('🗑️ Intentando eliminar producto ID:', id);
            await authFetch(`http://localhost:3000/api/productos/${id}`, {
                method: 'DELETE'
            });
            
            this.mostrarMensaje('✅ Producto eliminado correctamente');
            await this.mostrarProductos();
            
        } catch (error) {
            this.mostrarError('Error al eliminar el producto: ' + error.message);
        }
    },

    // Mostrar mensaje de éxito
    mostrarMensaje(mensaje) {
        console.log('💬 Mensaje:', mensaje);
        alert(mensaje);
    },

    // Mostrar error
    mostrarError(mensaje) {
        console.error('❌ Error:', mensaje);
        alert(mensaje);
    }
};

// Función para verificar elementos del modal
const verificarElementosModal = () => {
    const elementosRequeridos = [
        'productoModal',
        'modalTitle', 
        'modalSubmitBtn',
        'productoForm',
        'productoNombre',
        'productoDescripcion',
        'productoPrecio',
        'productoStock',
        'productoCategoria',
        'productoImagen'
    ];
    
    console.log('🔍 Verificando elementos del modal:');
    elementosRequeridos.forEach(id => {
        const elemento = document.getElementById(id);
        console.log(`   ${id}: ${elemento ? '✅' : '❌'}`);
    });
};

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', async function() {
    // Cargar productos automáticamente al cargar el dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        console.log('🚀 Inicializando dashboard...');
        
        // Verificar elementos del modal
        verificarElementosModal();
        
        // Probar conexión con backend real
        const conexionExitosa = await ProductosManager.probarConexionBackend();
        
        if (conexionExitosa) {
            console.log('✅ Usando backend real para operaciones CRUD');
        } else {
            console.log('⚠️ Usando modo simulación para operaciones CRUD');
        }
        
        ProductosManager.mostrarProductos();
    }
});
