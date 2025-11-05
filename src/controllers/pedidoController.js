const Pedido = require('../models/Pedido');
const Transaccion = require('../models/Transaccion');

const pedidoController = {
    // Obtener todos los pedidos
    getAll: async (req, res) => {
        try {
            console.log('📦 Controlador PEDIDO - Obteniendo todos los pedidos...');
            const pedidos = await Pedido.getAll();
            
            // Para cada pedido, obtener los items
            const pedidosConItems = await Promise.all(
                pedidos.map(async (pedido) => {
                    const items = await Pedido.getItems(pedido.id);
                    return { ...pedido, items };
                })
            );
            
            console.log(`📦 Controlador PEDIDO - Enviando ${pedidosConItems.length} pedidos con items`);
            res.json(pedidosConItems);
        } catch (error) {
            console.error('❌ Error en pedidoController.getAll:', error);
            res.status(500).json({ error: 'Error al obtener pedidos' });
        }
    },

    // Obtener pedido por ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            console.log('🔍 Controlador PEDIDO - Obteniendo pedido ID:', id);
            
            const pedido = await Pedido.getById(id);
            
            if (!pedido) {
                console.log('❌ Controlador PEDIDO - Pedido no encontrado ID:', id);
                return res.status(404).json({ error: 'Pedido no encontrado' });
            }
            
            const items = await Pedido.getItems(id);
            
            // Manejar transacción de forma segura
            let transaccion = null;
            try {
                transaccion = await Transaccion.getByPedidoId(id);
                console.log('💳 Controlador PEDIDO - Transacción encontrada:', transaccion ? 'Sí' : 'No');
            } catch (transaccionError) {
                console.log('💳 Controlador PEDIDO - No hay transacción para este pedido o error:', transaccionError.message);
                // No hacemos nada, transaccion sigue siendo null
            }
            
            console.log('✅ Controlador PEDIDO - Pedido encontrado:', pedido.numero_pedido);
            res.json({ 
                ...pedido, 
                items, 
                transaccion: transaccion // Puede ser null
            });
        } catch (error) {
            console.error('❌ Error en pedidoController.getById:', error);
            res.status(500).json({ error: 'Error al obtener el pedido' });
        }
    },

    // Crear nuevo pedido
    create: async (req, res) => {
        try {
            const { cliente_id, total, metodo_pago, direccion_envio, notas, items } = req.body;

            console.log('🆕 Controlador PEDIDO - Creando pedido para cliente:', cliente_id);
            console.log('📋 Datos del pedido:', { total, metodo_pago, items: items.length });

            // Validaciones básicas
            if (!cliente_id || !total || !items || items.length === 0) {
                console.log('❌ Controlador PEDIDO - Datos incompletos');
                return res.status(400).json({ error: 'Cliente, total e items son requeridos' });
            }

            const resultado = await Pedido.create({
                cliente_id: parseInt(cliente_id),
                total: parseFloat(total),
                metodo_pago: metodo_pago || 'mercadopago',
                direccion_envio: direccion_envio || '',
                notas: notas || '',
                items: items.map(item => ({
                    producto_id: parseInt(item.producto_id),
                    cantidad: parseInt(item.cantidad),
                    precio_unitario: parseFloat(item.precio_unitario),
                    subtotal: parseFloat(item.subtotal)
                }))
            });

            console.log('✅ Controlador PEDIDO - Pedido creado exitosamente:', resultado.numero_pedido);
            
            res.status(201).json({ 
                message: 'Pedido creado exitosamente',
                pedido: resultado
            });
        } catch (error) {
            console.error('❌ Error en pedidoController.create:', error);
            res.status(500).json({ error: 'Error al crear el pedido: ' + error.message });
        }
    },

    // Actualizar estado del pedido
    updateEstado: async (req, res) => {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            console.log('✏️ Controlador PEDIDO - Actualizando estado del pedido:', id, 'a:', estado);

            const estadosPermitidos = ['pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado'];
            
            if (!estadosPermitidos.includes(estado)) {
                console.log('❌ Controlador PEDIDO - Estado no válido:', estado);
                return res.status(400).json({ error: 'Estado no válido' });
            }

            const updated = await Pedido.updateEstado(id, estado);

            if (!updated) {
                console.log('❌ Controlador PEDIDO - Pedido no encontrado para actualizar ID:', id);
                return res.status(404).json({ error: 'Pedido no encontrado' });
            }

            console.log('✅ Controlador PEDIDO - Estado del pedido actualizado ID:', id);
            res.json({ message: 'Estado del pedido actualizado exitosamente' });
        } catch (error) {
            console.error('❌ Error en pedidoController.updateEstado:', error);
            res.status(500).json({ error: 'Error al actualizar el estado del pedido' });
        }
    },

    // Obtener estadísticas de pedidos
    getEstadisticas: async (req, res) => {
        try {
            console.log('📊 Controlador PEDIDO - Obteniendo estadísticas...');
            const estadisticas = await Pedido.getEstadisticas();
            res.json(estadisticas);
        } catch (error) {
            console.error('❌ Error en pedidoController.getEstadisticas:', error);
            res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
    },

    //  Obtener estadísticas avanzadas de pedidos
    getEstadisticasAvanzadas: async (req, res) => {
        try {
            console.log('📊 Controlador PEDIDO - Obteniendo estadísticas avanzadas...');
           

          // Usar estadísticas avanzadas corregidas
        const estadisticas = await Pedido.getEstadisticasAvanzadas();
        
        console.log('📊 Controlador PEDIDO - Estadísticas a enviar:', estadisticas);
        res.json(estadisticas);
        
    } catch (error) {
        console.error('❌ Error en pedidoController.getEstadisticasAvanzadas:', error);
        
        // Fallback a estadísticas básicas si fallan las avanzadas
        console.log('⚠️ Fallback a estadísticas básicas...');
        try {
            const estadisticasBasicas = await Pedido.getEstadisticas();
            res.json(estadisticasBasicas);
        } catch (fallbackError) {
            res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
    }
},

    // Funciones adicionales (si las tienes)
    search: async (req, res) => {
        try {
            // Tu código de búsqueda aquí
            res.json([]);
        } catch (error) {
            console.error('Error en pedidoController.search:', error);
            res.status(500).json({ error: 'Error al buscar pedidos' });
        }
    },

    getByCategory: async (req, res) => {
        try {
            // Tu código por categoría aquí
            res.json([]);
        } catch (error) {
            console.error('Error en pedidoController.getByCategory:', error);
            res.status(500).json({ error: 'Error al obtener pedidos por categoría' });
        }
    },

    getByType: async (req, res) => {
        try {
            // Tu código por tipo aquí
            res.json([]);
        } catch (error) {
            console.error('Error en pedidoController.getByType:', error);
            res.status(500).json({ error: 'Error al obtener pedidos por tipo' });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await Pedido.delete(id);

            if (!deleted) {
                return res.status(404).json({ error: 'Pedido no encontrado' });
            }

            res.json({ message: 'Pedido eliminado exitosamente' });
        } catch (error) {
            console.error('Error en pedidoController.delete:', error);
            res.status(500).json({ error: 'Error al eliminar el pedido' });
        }
    }
};

module.exports = pedidoController;