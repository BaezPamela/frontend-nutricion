// ===== ESTADISTICAS MANAGER =====


const EstadisticasManager = {
    // Cargar estadísticas REALES desde el servidor
    async cargarEstadisticas() {
        try {
            console.log('🔄 EstadisticasManager - Cargando estadísticas REALES...');
            
            const token = localStorage.getItem('adminToken');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const response = await fetch('/api/pedidos/estadisticas/avanzadas', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📡 EstadisticasManager - Respuesta recibida:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }
            
            const estadisticas = await response.json();
            console.log('📊 EstadisticasManager - Estadísticas REALES recibidas:', estadisticas);
            
            this.renderizarEstadisticas(estadisticas);
            this.actualizarStatsCards(estadisticas);
            
            return estadisticas;
            
        } catch (error) {
            console.error('❌ EstadisticasManager - Error cargando estadísticas REALES:', error);
            
            // Fallback a datos de prueba TEMPORAL
            console.log('🔄 Fallback a datos de prueba temporal...');
            this.cargarEstadisticasDePrueba();
        }
    },

    
    // En el EstadisticasManager, actualiza renderizarEstadisticas:
renderizarEstadisticas(estadisticas) {
    console.log('🎯 EstadisticasManager - Renderizando estadísticas detalladas...');
    
    // Verificar que tenemos datos
    if (!estadisticas) {
        console.error('❌ EstadisticasManager - No hay datos de estadísticas');
        this.mostrarError('No hay datos disponibles');
        return;
    }

    // Convertir strings a números
    const stats = {
        total_pedidos: parseInt(estadisticas.total_pedidos) || 0,
        ingresos_totales: parseFloat(estadisticas.ingresos_totales) || 0,
        promedio_pedido: parseFloat(estadisticas.promedio_pedido) || 0,
        pedidos_entregados: parseInt(estadisticas.pedidos_entregados) || 0,
        pedidos_pendientes: parseInt(estadisticas.pedidos_pendientes) || 0,
        pedidos_cancelados: parseInt(estadisticas.pedidos_cancelados) || 0,
        pedidos_este_mes: parseInt(estadisticas.pedidos_este_mes) || 0,
        ingresos_este_mes: parseFloat(estadisticas.ingresos_este_mes) || 0
    };

    console.log('📈 EstadisticasManager - Datos REALES procesados:', stats);

    // Actualizar elementos de estadísticas detalladas
    this.actualizarElemento('estadistica-ventas-totales', this.formatearMoneda(stats.ingresos_totales));
    this.actualizarElemento('estadistica-total-pedidos', stats.total_pedidos);
    this.actualizarElemento('estadistica-pedidos-entregados', stats.pedidos_entregados);
    this.actualizarElemento('estadistica-pedidos-cancelados', stats.pedidos_cancelados); // NUEVO
    this.actualizarElemento('estadistica-ingresos-mes', this.formatearMoneda(stats.ingresos_este_mes));
    this.actualizarElemento('estadistica-pedidos-mes', stats.pedidos_este_mes);
    
    console.log('✅ EstadisticasManager - Estadísticas REALES renderizadas');
},

    // Actualizar las cards de stats principales
    actualizarStatsCards(estadisticas) {
        console.log('🔄 EstadisticasManager - Actualizando stats cards principales...');
        
        const stats = {
            total_pedidos: parseInt(estadisticas.total_pedidos) || 0,
            ingresos_totales: parseFloat(estadisticas.ingresos_totales) || 0
        };

        // Actualizar la card de estadísticas en el grid principal
        const statsPedidos = document.getElementById('stats-pedidos');
        const statsIngresos = document.getElementById('stats-ingresos');
        
        if (statsPedidos) {
            statsPedidos.textContent = stats.total_pedidos;
            console.log('✅ EstadisticasManager - stats-pedidos actualizado:', stats.total_pedidos);
        } else {
            console.warn('⚠️ EstadisticasManager - Elemento stats-pedidos no encontrado');
        }
        
        if (statsIngresos) {
            statsIngresos.textContent = `Ingresos: ${this.formatearMoneda(stats.ingresos_totales)}`;
            console.log('✅ EstadisticasManager - stats-ingresos actualizado');
        } else {
            console.warn('⚠️ EstadisticasManager - Elemento stats-ingresos no encontrado');
        }
        
        console.log('✅ EstadisticasManager - Stats cards actualizadas');
    },

    // Helper para actualizar elementos
    actualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
            elemento.classList.remove('error');
            console.log(`✅ EstadisticasManager - Actualizado #${id}: ${valor}`);
        } else {
            console.error(`❌ EstadisticasManager - Elemento #${id} no encontrado`);
        }
    },

    // Formatear moneda
    formatearMoneda(valor) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(valor);
    },

    // Mostrar error
   mostrarError(mensaje) {
    console.error('❌ EstadisticasManager - Mostrando error:', mensaje);
    
    const elementos = [
        'estadistica-ventas-totales',
        'estadistica-total-pedidos', 
        'estadistica-pedidos-entregados',
        'estadistica-pedidos-cancelados', 
        'estadistica-ingresos-mes',
        'estadistica-pedidos-mes'
    ];
    
    elementos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = 'Error';
            elemento.style.color = '#ff4444';
            elemento.classList.add('error');
        }
    });
},

    // Función para probar con datos de ejemplo
    cargarEstadisticasDePrueba() {
        console.log('🧪 EstadisticasManager - Cargando estadísticas de prueba...');
        
        const estadisticasPrueba = {
            total_pedidos: 11,
            ingresos_totales: '54811.88',
            promedio_pedido: '4982.898182',
            pedidos_entregados: 7,
            pedidos_pendientes: 2,
            pedidos_confirmados: 0,
            pedidos_enviados: 1,
            pedidos_cancelados: 1,
            pedidos_este_mes: 11,
            ingresos_este_mes: '54811.88',
            promedio_mensual: '4982.898182',
            pedidos_esta_semana: 11
        };
        
        this.renderizarEstadisticas(estadisticasPrueba);
        this.actualizarStatsCards(estadisticasPrueba);
        
        console.log('✅ EstadisticasManager - Estadísticas de prueba cargadas');
    },

    // Sistema de actualización automática
    inicializarAutoActualizacion() {
        console.log('🔄 EstadisticasManager - Iniciando auto-actualización...');
        
        // Actualizar cada 30 segundos
        this.intervalId = setInterval(() => {
            console.log('🔄 EstadisticasManager - Actualización automática...');
            this.cargarEstadisticas();
        }, 30000); // 30 segundos
        
        // También actualizar cuando la ventana gana foco
        window.addEventListener('focus', () => {
            console.log('🔄 EstadisticasManager - Ventana enfocada, actualizando...');
            this.cargarEstadisticas();
        });
    },

    detenerAutoActualizacion() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            console.log('🛑 EstadisticasManager - Auto-actualización detenida');
        }
    },

    // Función para forzar actualización manual
    actualizar() {
        console.log('🔄 EstadisticasManager - Actualización manual forzada');
        this.cargarEstadisticas();
    }
};

// ===== FUNCIONES PRINCIPALES DEL DASHBOARD =====

// Función para cargar los datos del usuario
function loadUserData() {
    const adminData = getAdminData();
    if (adminData) {
        document.getElementById('userName').textContent = adminData.nombre;
        document.getElementById('welcomeName').textContent = adminData.nombre;
    } else {
        console.warn('⚠️ No se encontraron datos de administrador');
    }
}

// Función para toggle del sidebar en móviles
function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
}

// Función para manejar el logout
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();

            // Forzar logout
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            
            // Redirigir inmediatamente
            window.location.href = 'login.html';
        });
    }
}

// Función para configurar event listeners
function setupEventListeners() {
    // Configurar botón de nuevo producto
    const btnNuevoProducto = document.getElementById('btnNuevoProducto');
    if (btnNuevoProducto) {
        btnNuevoProducto.addEventListener('click', abrirModalProducto);
    }
    
    // Asegurar que la función sea global para onclick en HTML
    window.abrirModalProducto = abrirModalProducto;
}

// Función para cargar los datos del dashboard
async function loadDashboardData() {
    try {
        console.log('🔄 Cargando datos del dashboard...');
        
        // Cargar datos del usuario
        loadUserData();
        
        // Cargar estadísticas PRIMERO (son las más importantes)
        await EstadisticasManager.cargarEstadisticas();
        
        // Cargar productos
        if (typeof ProductosManager !== 'undefined') {
            await ProductosManager.mostrarProductos();
        } 
        // Cargar recetas
        if (typeof RecetasManager !== 'undefined' && RecetasManager.mostrarRecetas) {
            await RecetasManager.mostrarRecetas();
        }
         // Cargar posts del blog
        if (typeof BlogManager !== 'undefined' && BlogManager.mostrarPosts) {
            await BlogManager.mostrarPosts();
        }
         // Cargar tienda
        if (typeof TiendaManager !== 'undefined' && TiendaManager.inicializar) {
            await TiendaManager.inicializar();
            await TiendaManager.cargarProductosParaTienda();
        }

       console.log('✅ Datos del dashboard cargados correctamente');
        
    } catch (error) {
        console.error('❌ Error cargando datos del dashboard:', error);
    }
}

// Funciones globales para el modal de productos
function abrirModalProducto() {
    if (typeof ProductosManager !== 'undefined' && ProductosManager.abrirModalNuevo) {
        ProductosManager.abrirModalNuevo();
    } else {
        console.error('❌ ProductosManager.abrirModalNuevo no está disponible');
        alert('El sistema de productos no está cargado correctamente. Recarga la página.');
    }
}

function cerrarModalProducto() {
    if (typeof ProductosManager !== 'undefined' && ProductosManager.ocultarModal) {
        ProductosManager.ocultarModal();
    }
}

function guardarProducto(event) {
    if (typeof ProductosManager !== 'undefined' && ProductosManager.guardarProducto) {
        ProductosManager.guardarProducto(event);
    } else {
        event.preventDefault();
        alert('Error: No se puede guardar el producto');
    }
}

// Funciones globales para el modal de recetas
function abrirModalReceta() {
    if (typeof RecetasManager !== 'undefined' && RecetasManager.abrirModalNueva) {
        RecetasManager.abrirModalNueva();
    } else {
        console.error('❌ RecetasManager no está disponible');
    }
}

function cerrarModalReceta() {
    if (typeof RecetasManager !== 'undefined' && RecetasManager.ocultarModalReceta) {
        RecetasManager.ocultarModalReceta();
    }
}

function cerrarModalRecetaCompleta() {
    if (typeof RecetasManager !== 'undefined' && RecetasManager.ocultarModalRecetaCompleta) {
        RecetasManager.ocultarModalRecetaCompleta();
    }
}

function guardarReceta(event) {
    if (typeof RecetasManager !== 'undefined' && RecetasManager.guardarReceta) {
        RecetasManager.guardarReceta(event);
    } else {
        event.preventDefault();
        alert('Error: No se puede guardar la receta');
    }
}

// Funciones globales para el modal del blog
function abrirModalBlog() {
    if (typeof BlogManager !== 'undefined' && BlogManager.abrirModalNuevo) {
        BlogManager.abrirModalNuevo();
    } else {
        console.error('❌ BlogManager no está disponible');
    }
}

function cerrarModalBlog() {
    if (typeof BlogManager !== 'undefined' && BlogManager.ocultarModalBlog) {
        BlogManager.ocultarModalBlog();
    }
}

function cerrarModalPostCompleto() {
    if (typeof BlogManager !== 'undefined' && BlogManager.ocultarModalPostCompleto) {
        BlogManager.ocultarModalPostCompleto();
    }
}

function guardarPost(event) {
    if (typeof BlogManager !== 'undefined' && BlogManager.guardarPost) {
        BlogManager.guardarPost(event);
    } else {
        event.preventDefault();
        alert('Error: No se puede guardar el post');
    }
}

// Función de inicialización principal
function initializeDashboard() {
    console.log('🚀 Inicializando dashboard...');
    
    // 1. Verificar autenticación
    if (typeof checkAuthentication === 'function' && !checkAuthentication()) {
        console.warn('⚠️ Usuario no autenticado, redirigiendo...');
        return;
    }
    
    // 2. Configurar todos los event listeners
    setupEventListeners();
    setupMobileMenu();
    setupLogout();
    
    // 3. INICIAR AUTO-ACTUALIZACIÓN DE ESTADÍSTICAS
    if (typeof EstadisticasManager !== 'undefined' && EstadisticasManager.inicializarAutoActualizacion) {
        EstadisticasManager.inicializarAutoActualizacion();
    }
    
    // 4. Cargar datos iniciales
    loadDashboardData();
    
    console.log('✅ Dashboard inicializado correctamente');
}

// Función mejorada para navegar a secciones específicas
function navegarASeccion(idSeccion, event = null) {
    // Prevenir comportamiento por defecto si es un evento de clic
    if (event) {
        event.preventDefault();
    }
    
    const seccion = document.getElementById(idSeccion);
    if (seccion) {
        // Cerrar sidebar si está en móvil
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
        
        // Calcular posición exacta considerando header fijo si lo tienes
        const headerOffset = 80; // Ajusta según la altura de tu header
        const elementPosition = seccion.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        // Scroll suave a la sección
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
        // Actualizar URL sin recargar la página
        history.pushState(null, null, `#${idSeccion}`);
        
        // Si es la sección de blog, actualizar posts
        if (idSeccion === 'seccion-blog' && window.BlogManager) {
            setTimeout(() => {
                BlogManager.mostrarPosts();
            }, 500);
        }
        
        console.log('📍 Navegando a sección:', idSeccion);
        
    } else {
        console.error('❌ No se encontró la sección:', idSeccion);
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Retraso mínimo para asegurar que todos los scripts estén cargados
    setTimeout(() => {
        initializeDashboard();
    }, 100);
});

// ===== FUNCIONES DE UTILIDAD =====

// Función para mostrar notificaciones (puedes mejorar esto después)
function showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    // Aquí puedes implementar notificaciones bonitas con Toast o similar
}

// Función para manejar errores globalmente
function handleError(error, context = '') {
    console.error(`❌ Error en ${context}:`, error);
    showNotification(`Error: ${error.message}`, 'error');
}

// Función para verificar elementos de estadísticas (debug - opcional)
function verificarElementosEstadisticas() {
    const elementos = [
        'estadistica-ventas-totales',
        'estadistica-total-pedidos',
        'estadistica-pedidos-entregados', 
        'estadistica-promedio-pedido',
        'estadistica-ingresos-mes',
        'estadistica-pedidos-mes',
        'stats-pedidos',
        'stats-ingresos'
    ];
    
    console.log('🔍 Verificando elementos de estadísticas:');
    elementos.forEach(id => {
        const elemento = document.getElementById(id);
        console.log(`- #${id}:`, elemento ? '✅ Existe' : '❌ No existe');
    });
}

// Hacerlo global para poder llamarlo desde la consola
window.EstadisticasManager = EstadisticasManager;
window.recargarEstadisticas = () => EstadisticasManager.cargarEstadisticas();
window.verificarElementosEstadisticas = verificarElementosEstadisticas;

// Recargar estadísticas cada 30 segundos (backup)
setInterval(() => {
    console.log('🔄 Recargando estadísticas automáticamente...');
    if (typeof EstadisticasManager !== 'undefined' && EstadisticasManager.cargarEstadisticas) {
        EstadisticasManager.cargarEstadisticas();
    }
}, 30000);