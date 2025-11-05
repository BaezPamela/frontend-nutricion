// Funciones para gestionar la tienda
const TiendaManager = {
    carrito: [],
    clienteSeleccionado: null,
    todosLosClientes: [],

    // DEBUG: Función para verificar estado
    debugEstadisticas: function() {
        console.log('🐛 DEBUG - Estado de TiendaManager:');
        console.log('🐛 Carrito:', this.carrito);
        console.log('🐛 Cliente seleccionado:', this.clienteSeleccionado);
    },

    // Inicializar la tienda
    async inicializar() {
        await this.cargarClientes();
        await this.cargarPedidos();
        await this.cargarProductosParaTienda();
        this.inicializarCarrito();
        this.inicializarFiltroClientes();
        
        console.log('🔄 TiendaManager - Estadísticas se cargan desde dashboard.js');
    },

    // Inicializar filtro de clientes
    inicializarFiltroClientes() {
        const filtroInput = document.getElementById('filtro-clientes');
        if (filtroInput) {
            filtroInput.addEventListener('input', (e) => {
                this.filtrarClientes(e.target.value);
            });
        }
    },

    // Filtrar clientes
    filtrarClientes(termino) {
        if (!termino) {
            this.mostrarClientes(this.todosLosClientes);
            return;
        }

        const terminoLower = termino.toLowerCase();
        const clientesFiltrados = this.todosLosClientes.filter(cliente => 
            cliente.nombre.toLowerCase().includes(terminoLower) ||
            cliente.email.toLowerCase().includes(terminoLower) ||
            (cliente.telefono && cliente.telefono.includes(termino)) ||
            (cliente.ciudad && cliente.ciudad.toLowerCase().includes(terminoLower))
        );

        this.mostrarClientes(clientesFiltrados);
    },

    // Cargar clientes
    async cargarClientes() {
        try {
            console.log('👥 Cargando clientes...');
            const clientes = await authFetch('http://localhost:3000/api/clientes');
            this.todosLosClientes = clientes;
            this.mostrarClientes(clientes);
        } catch (error) {
            console.error('❌ Error cargando clientes:', error);
        }
    },

    // Cargar pedidos
    async cargarPedidos() {
        try {
            console.log('📦 Cargando pedidos...');
            const pedidos = await authFetch('http://localhost:3000/api/pedidos');
            this.mostrarPedidos(pedidos);
        } catch (error) {
            console.error('❌ Error cargando pedidos:', error);
        }
    },

    // Función para actualizar estadísticas después de cambios
    async actualizarEstadisticasGlobales() {
        console.log('🔄 TiendaManager - Actualizando estadísticas globales...');
        
        // Usar el EstadisticasManager global si está disponible
        if (window.EstadisticasManager && typeof window.EstadisticasManager.actualizar === 'function') {
            console.log('✅ Usando EstadisticasManager global para actualizar...');
            await window.EstadisticasManager.actualizar();
        } else if (window.recargarEstadisticas) {
            console.log('✅ Usando recargarEstadisticas global...');
            await window.recargarEstadisticas();
        } else {
            console.log('⚠️ EstadisticasManager no disponible, recargando página...');
            // Fallback: recargar la página para ver cambios
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    },

    // Cargar productos para la tienda
    async cargarProductosParaTienda() {
        try {
            console.log('🛍️ Cargando productos para tienda...');
            const productos = await authFetch('http://localhost:3000/api/productos');
            this.mostrarProductosParaTienda(productos);
        } catch (error) {
            console.error('❌ Error cargando productos para tienda:', error);
        }
    },

    // Mostrar productos en la sección de tienda
    mostrarProductosParaTienda(productos) {
        const container = document.getElementById('productos-tienda-container');
        if (!container) return;

        if (!Array.isArray(productos) || productos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>No hay productos</h3>
                    <p>Agrega productos para que aparezcan en la tienda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = productos.map(producto => `
            <div class="producto-tienda-card">
                <div class="producto-tienda-imagen">
                    <i class="fas fa-cube"></i>
                </div>
                <div class="producto-tienda-info">
                    <h4>${producto.nombre}</h4>
                    <div class="producto-tienda-precio">$${parseFloat(producto.precio).toLocaleString('es-AR')}</div>
                    <div class="producto-tienda-stock">Stock: ${producto.stock}</div>
                    <button class="btn-agregar-carrito" 
                            onclick="TiendaManager.agregarAlCarrito(${JSON.stringify(producto).replace(/"/g, '&quot;')})"
                            ${producto.stock <= 0 ? 'disabled' : ''}>
                        ${producto.stock <= 0 ? '❌ Sin Stock' : '🛒 Agregar al Carrito'}
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Mostrar clientes
    mostrarClientes(clientes) {
        const container = document.getElementById('clientes-container');
        if (!container) return;

        if (!Array.isArray(clientes) || clientes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No hay clientes</h3>
                    <p>Los clientes aparecerán aquí cuando realicen pedidos</p>
                </div>
            `;
            return;
        }

        container.innerHTML = clientes.map(cliente => `
            <div class="cliente-card" data-id="${cliente.id}">
                <div class="cliente-info">
                    <h4>${cliente.nombre}</h4>
                    <p class="cliente-email">📧 ${cliente.email}</p>
                    ${cliente.telefono ? `<p class="cliente-telefono">📞 ${cliente.telefono}</p>` : ''}
                    <p class="cliente-direccion">📍 ${cliente.ciudad || 'Sin ciudad'} - ${cliente.codigo_postal || 'Sin CP'}</p>
                </div>
                <div class="cliente-acciones">
                    <button class="btn-seleccionar" onclick="TiendaManager.seleccionarCliente(${cliente.id})">
                        <i class="fas fa-shopping-cart"></i> Seleccionar
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Mostrar pedidos
    mostrarPedidos(pedidos) {
        const container = document.getElementById('pedidos-container');
        if (!container) return;

        if (!Array.isArray(pedidos) || pedidos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>No hay pedidos</h3>
                    <p>Los pedidos aparecerán aquí cuando los clientes realicen compras</p>
                </div>
            `;
            return;
        }

        container.innerHTML = pedidos.map(pedido => `
            <div class="pedido-card" data-id="${pedido.id}">
                <div class="pedido-header">
                    <div class="pedido-info">
                        <h4>Pedido #${pedido.numero_pedido}</h4>
                        <p class="pedido-cliente">👤 ${pedido.cliente_nombre} (${pedido.cliente_email})</p>
                    </div>
                    <div class="pedido-estado ${pedido.estado}">
                        ${this.getEstadoIcon(pedido.estado)} ${this.formatearEstado(pedido.estado)}
                    </div>
                </div>
                
                <div class="pedido-detalles">
                    <div class="pedido-items">
                        <strong>Productos:</strong>
                        ${pedido.items && pedido.items.length > 0 ? 
                            pedido.items.map(item => `
                                <div class="pedido-item">
                                    ${item.producto_nombre} - ${item.cantidad} x $${parseFloat(item.precio_unitario).toLocaleString('es-AR')} = $${parseFloat(item.subtotal).toLocaleString('es-AR')}
                                </div>
                            `).join('') : 
                            'No hay items'
                        }
                    </div>
                    
                    <div class="pedido-totales">
                        <div class="pedido-total">
                            <strong>Total: $${parseFloat(pedido.total).toLocaleString('es-AR')}</strong>
                        </div>
                        <div class="pedido-metodo">
                            💳 ${this.formatearMetodoPago(pedido.metodo_pago)}
                        </div>
                        <div class="pedido-fecha">
                            📅 ${new Date(pedido.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                
                <div class="pedido-acciones">
                    <select onchange="TiendaManager.cambiarEstadoPedido(${pedido.id}, this.value)" class="estado-select">
                        <option value="pendiente" ${pedido.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="confirmado" ${pedido.estado === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                        <option value="en_preparacion" ${pedido.estado === 'en_preparacion' ? 'selected' : ''}>En Preparación</option>
                        <option value="enviado" ${pedido.estado === 'enviado' ? 'selected' : ''}>Enviado</option>
                        <option value="entregado" ${pedido.estado === 'entregado' ? 'selected' : ''}>Entregado</option>
                        <option value="cancelado" ${pedido.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                    
                    <button class="btn-ver-pedido" onclick="TiendaManager.verPedido(${pedido.id})">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Obtener ícono según estado
    getEstadoIcon(estado) {
        const iconos = {
            'pendiente': '⏳',
            'confirmado': '✅',
            'en_preparacion': '👨‍🍳',
            'enviado': '🚚',
            'entregado': '📦',
            'cancelado': '❌'
        };
        return iconos[estado] || '📝';
    },

    // Formatear estado para mostrar
    formatearEstado(estado) {
        const estados = {
            'pendiente': 'Pendiente',
            'confirmado': 'Confirmado',
            'en_preparacion': 'En Preparación',
            'enviado': 'Enviado',
            'entregado': 'Entregado',
            'cancelado': 'Cancelado'
        };
        return estados[estado] || estado;
    },

    // Formatear método de pago
    formatearMetodoPago(metodo) {
        const metodos = {
            'mercadopago': 'MercadoPago',
            'paypal': 'PayPal',
            'transferencia': 'Transferencia',
            'efectivo': 'Efectivo'
        };
        return metodos[metodo] || metodo;
    },

    // Inicializar carrito
    inicializarCarrito() {
        this.carrito = JSON.parse(localStorage.getItem('carrito_tienda')) || [];
        this.actualizarCarrito();
    },

    // Actualizar carrito en la UI
    actualizarCarrito() {
        const contador = document.getElementById('carrito-contador');
        const totalElement = document.getElementById('carrito-total');
        const itemsContainer = document.getElementById('carrito-items');
        
        if (contador) {
            contador.textContent = this.carrito.reduce((sum, item) => sum + item.cantidad, 0);
        }
        
        if (totalElement) {
            const total = this.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            totalElement.textContent = `Total: $${total.toLocaleString('es-AR')}`;
        }
        
        if (itemsContainer) {
            if (this.carrito.length === 0) {
                itemsContainer.innerHTML = '<p class="carrito-vacio">El carrito está vacío</p>';
            } else {
                itemsContainer.innerHTML = this.carrito.map(item => `
                    <div class="carrito-item">
                        <div class="carrito-item-info">
                            <strong>${item.nombre}</strong>
                            <p>$${parseFloat(item.precio).toLocaleString('es-AR')} x ${item.cantidad} = $${(item.precio * item.cantidad).toLocaleString('es-AR')}</p>
                        </div>
                        <div class="carrito-item-acciones">
                            <button onclick="TiendaManager.actualizarCantidad(${item.id}, ${item.cantidad - 1})">-</button>
                            <span>${item.cantidad}</span>
                            <button onclick="TiendaManager.actualizarCantidad(${item.id}, ${item.cantidad + 1})">+</button>
                            <button onclick="TiendaManager.eliminarDelCarrito(${item.id})" class="btn-eliminar">🗑️</button>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        // Guardar en localStorage
        localStorage.setItem('carrito_tienda', JSON.stringify(this.carrito));
    },

    // Agregar producto al carrito
    agregarAlCarrito(producto) {
        const itemExistente = this.carrito.find(item => item.id === producto.id);
        
        if (itemExistente) {
            itemExistente.cantidad += 1;
        } else {
            this.carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1,
                imagen: producto.imagen
            });
        }
        
        this.actualizarCarrito();
        this.mostrarMensaje(`✅ ${producto.nombre} agregado al carrito`);
    },

    // Actualizar cantidad en carrito
    actualizarCantidad(productoId, nuevaCantidad) {
        if (nuevaCantidad <= 0) {
            this.eliminarDelCarrito(productoId);
            return;
        }
        
        const item = this.carrito.find(item => item.id === productoId);
        if (item) {
            item.cantidad = nuevaCantidad;
            this.actualizarCarrito();
        }
    },

    // Eliminar producto del carrito
    eliminarDelCarrito(productoId) {
        this.carrito = this.carrito.filter(item => item.id !== productoId);
        this.actualizarCarrito();
    },

    // Vaciar carrito
    vaciarCarrito() {
        this.carrito = [];
        this.actualizarCarrito();
        this.mostrarMensaje('🛒 Carrito vaciado');
    },

    // Seleccionar cliente
    async seleccionarCliente(clienteId) {
        try {
            const cliente = await authFetch(`/api/clientes/${clienteId}`);
            this.clienteSeleccionado = cliente;
            this.mostrarMensaje(`✅ Cliente seleccionado: ${cliente.nombre}`);
            
            // Actualizar UI para mostrar cliente seleccionado
            document.querySelectorAll('.cliente-card').forEach(card => {
                card.classList.remove('seleccionado');
            });
            document.querySelector(`.cliente-card[data-id="${clienteId}"]`).classList.add('seleccionado');
            
        } catch (error) {
            this.mostrarError('Error al seleccionar cliente: ' + error.message);
        }
    },

    // Cambiar estado del pedido
    async cambiarEstadoPedido(pedidoId, nuevoEstado) {
        try {
            await authFetch(`/api/pedidos/${pedidoId}/estado`, {
                method: 'PUT',
                body: JSON.stringify({ estado: nuevoEstado })
            });
            
            this.mostrarMensaje(`✅ Estado del pedido actualizado a: ${this.formatearEstado(nuevoEstado)}`);
            
            // ✅ ACTUALIZAR ESTADÍSTICAS GLOBALES DESPUÉS DE CAMBIAR ESTADO
            await this.actualizarEstadisticasGlobales();
            
            // Recargar pedidos para mostrar cambios
            await this.cargarPedidos();
            
        } catch (error) {
            this.mostrarError('Error al cambiar estado del pedido: ' + error.message);
        }
    },

    // Ver pedido completo
    async verPedido(pedidoId) {
        try {
            const pedido = await authFetch(`/api/pedidos/${pedidoId}`);
            this.mostrarModalPedido(pedido);
        } catch (error) {
            this.mostrarError('Error al cargar el pedido: ' + error.message);
        }
    },

    // Mostrar modal de pedido
    mostrarModalPedido(pedido) {
        // Implementar modal de pedido completo
        alert(`Detalles del Pedido #${pedido.numero_pedido}\nCliente: ${pedido.cliente_nombre}\nTotal: $${parseFloat(pedido.total).toLocaleString('es-AR')}`);
    },

    // Crear nuevo pedido desde el carrito
    async crearPedidoDesdeCarrito() {
        if (this.carrito.length === 0) {
            this.mostrarError('El carrito está vacío');
            return;
        }
        
        if (!this.clienteSeleccionado) {
            this.mostrarError('Debe seleccionar un cliente primero');
            return;
        }
        
        try {
            const total = this.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            const items = this.carrito.map(item => ({
                producto_id: item.id,
                cantidad: item.cantidad,
                precio_unitario: item.precio,
                subtotal: item.precio * item.cantidad
            }));
            
            const pedidoData = {
                cliente_id: this.clienteSeleccionado.id,
                total: total,
                metodo_pago: 'mercadopago',
                direccion_envio: this.clienteSeleccionado.direccion || '',
                notas: 'Pedido creado desde el dashboard',
                items: items
            };
            
            const resultado = await authFetch('/api/pedidos', {
                method: 'POST',
                body: JSON.stringify(pedidoData)
            });
            
            this.mostrarMensaje(`✅ Pedido creado exitosamente: ${resultado.pedido.numero_pedido}`);
            this.vaciarCarrito();
            
            // ✅ ACTUALIZAR ESTADÍSTICAS GLOBALES DESPUÉS DE CREAR PEDIDO
            await this.actualizarEstadisticasGlobales();
            
            // Recargar pedidos para mostrar el nuevo
            await this.cargarPedidos();
            
        } catch (error) {
            this.mostrarError('Error al crear el pedido: ' + error.message);
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
    }
};

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    if (typeof TiendaManager !== 'undefined') {
        TiendaManager.inicializar();
    }
});