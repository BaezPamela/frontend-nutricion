const db = require('./db');

const Pedido = {
    // Obtener todos los pedidos
    getAll: async () => {
        try {
            console.log('📦 Modelo PEDIDO: Obteniendo todos los pedidos...');
            
            const result = await db.execute(`
                SELECT p.*, c.nombre as cliente_nombre, c.email as cliente_email 
                FROM pedidos p 
                LEFT JOIN clientes c ON p.cliente_id = c.id 
                ORDER BY p.created_at DESC
            `);
            
            console.log('📦 Modelo PEDIDO: Resultado CRUDO:', result);
            
            let pedidos = [];
            if (Array.isArray(result) && result.length > 0) {
                if (Array.isArray(result[0])) {
                    pedidos = result[0];
                } else if (result[0]) {
                    pedidos = result;
                }
            } else if (result) {
                pedidos = result;
            }
            
            if (!Array.isArray(pedidos)) {
                console.log('📦 Modelo PEDIDO: Pedidos no es array, convirtiendo...');
                pedidos = [pedidos];
            }
            
            console.log(`📦 Modelo PEDIDO: ${pedidos.length} pedidos encontrados`);
            return pedidos;
            
        } catch (error) {
            console.error('❌ Error en Pedido.getAll:', error);
            throw error;
        }
    },

    // Obtener pedido por ID
    getById: async (id) => {
        try {
            console.log('🔍 Modelo PEDIDO GET BY ID - Buscando pedido ID:', id);
            
            const result = await db.execute(`
                SELECT p.*, c.nombre as cliente_nombre, c.email as cliente_email, 
                       c.telefono as cliente_telefono, c.direccion as cliente_direccion,
                       c.ciudad as cliente_ciudad, c.codigo_postal as cliente_codigo_postal
                FROM pedidos p 
                LEFT JOIN clientes c ON p.cliente_id = c.id 
                WHERE p.id = ?
            `, [id]);
            
            console.log('🔍 Modelo PEDIDO GET BY ID - Resultado completo:', result);
            
            let rows = [];
            if (Array.isArray(result) && result.length > 0) {
                rows = Array.isArray(result[0]) ? result[0] : result;
            } else {
                rows = result;
            }
            
            console.log('🔍 Modelo PEDIDO GET BY ID - Filas encontradas:', rows);
            
            if (rows && rows.length > 0) {
                console.log('✅ Modelo PEDIDO GET BY ID - Pedido encontrado:', rows[0].numero_pedido);
                return rows[0];
            } else {
                console.log('❌ Modelo PEDIDO GET BY ID - Pedido no encontrado');
                return null;
            }
            
        } catch (error) {
            console.error('❌ Modelo PEDIDO GET BY ID - Error:', error);
            throw error;
        }
    },

    // Obtener items del pedido
    getItems: async (pedidoId) => {
        try {
            console.log('📋 Modelo PEDIDO GET ITEMS - Obteniendo items para pedido:', pedidoId);
            
            const result = await db.execute(`
                SELECT pi.*, pr.nombre as producto_nombre, pr.imagen as producto_imagen
                FROM pedido_items pi
                LEFT JOIN productos pr ON pi.producto_id = pr.id
                WHERE pi.pedido_id = ?
            `, [pedidoId]);
            
            let items = [];
            if (Array.isArray(result) && result.length > 0) {
                if (Array.isArray(result[0])) {
                    items = result[0];
                } else if (result[0]) {
                    items = result;
                }
            } else if (result) {
                items = result;
            }
            
            if (!Array.isArray(items)) {
                items = [items];
            }
            
            console.log(`📋 Modelo PEDIDO GET ITEMS: ${items.length} items encontrados`);
            return items;
            
        } catch (error) {
            console.error('❌ Modelo PEDIDO GET ITEMS - Error:', error);
            throw error;
        }
    },

    // Crear nuevo pedido CON TRANSACCIONES
    create: async (pedidoData) => {
        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            const { cliente_id, total, metodo_pago, direccion_envio, notas, items } = pedidoData;
            
            console.log('🆕 Modelo PEDIDO CREATE - Creando pedido para cliente:', cliente_id);
            console.log('🛒 Items del pedido:', items);

            // 1. Crear el pedido
            const [pedidoResult] = await connection.execute(
                'INSERT INTO pedidos (cliente_id, total, metodo_pago, direccion_envio, notas) VALUES (?, ?, ?, ?, ?)',
                [cliente_id, total, metodo_pago, direccion_envio, notas]
            );
            
            const pedidoId = pedidoResult.insertId;
            console.log('✅ Modelo PEDIDO CREATE - Pedido creado, ID:', pedidoId);

            // 2. Crear los items del pedido
            for (const item of items) {
                console.log('📦 Agregando item:', item);
                await connection.execute(
                    'INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
                    [pedidoId, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal]
                );
            }

            // 3. Obtener el número de pedido generado
            const [pedidoRows] = await connection.execute('SELECT numero_pedido FROM pedidos WHERE id = ?', [pedidoId]);
            const numeroPedido = pedidoRows[0].numero_pedido;
            
            // 4. Confirmar la transacción
            await connection.commit();
            
            console.log('✅ Modelo PEDIDO CREATE - Pedido completado, número:', numeroPedido);

            return {
                id: pedidoId,
                numero_pedido: numeroPedido
            };

        } catch (error) {
            // Revertir la transacción en caso de error
            if (connection) {
                await connection.rollback();
                console.log('🔄 Transacción revertida debido a error');
            }
            console.error('❌ Modelo PEDIDO CREATE - Error:', error);
            throw error;
        } finally {
            // Liberar la conexión
            if (connection) {
                connection.release();
            }
        }
    },

    // Actualizar estado del pedido
    updateEstado: async (id, estado) => {
        try {
            console.log('✏️ Modelo PEDIDO UPDATE ESTADO - Actualizando pedido:', id, 'a estado:', estado);
            
            const result = await db.execute(
                'UPDATE pedidos SET estado = ? WHERE id = ?',
                [estado, id]
            );
            
            console.log('✏️ Modelo PEDIDO UPDATE ESTADO - Resultado:', result);
            
            let affectedRows = 0;
            if (Array.isArray(result) && result.length > 0) {
                if (result[0] && typeof result[0] === 'object' && 'affectedRows' in result[0]) {
                    affectedRows = result[0].affectedRows;
                } else if (result[0] && typeof result[0] === 'object') {
                    affectedRows = result[0].affectedRows || 0;
                }
            } 
            else if (result && typeof result === 'object' && 'affectedRows' in result) {
                affectedRows = result.affectedRows;
            }
            
            console.log('✏️ Modelo PEDIDO UPDATE ESTADO - Affected Rows:', affectedRows);
            return affectedRows > 0;
            
        } catch (error) {
            console.error('❌ Modelo PEDIDO UPDATE ESTADO - Error:', error);
            throw error;
        }
    },

    // Obtener pedidos por cliente
    getByCliente: async (clienteId) => {
        try {
            console.log('👤 Modelo PEDIDO GET BY CLIENTE - Buscando pedidos para cliente:', clienteId);
            
            const result = await db.execute(`
                SELECT p.* 
                FROM pedidos p 
                WHERE p.cliente_id = ? 
                ORDER BY p.created_at DESC
            `, [clienteId]);
            
            let pedidos = [];
            if (Array.isArray(result) && result.length > 0) {
                if (Array.isArray(result[0])) {
                    pedidos = result[0];
                } else if (result[0]) {
                    pedidos = result;
                }
            } else if (result) {
                pedidos = result;
            }
            
            if (!Array.isArray(pedidos)) {
                pedidos = [pedidos];
            }
            
            console.log(`👤 Modelo PEDIDO GET BY CLIENTE: ${pedidos.length} pedidos encontrados`);
            return pedidos;
            
        } catch (error) {
            console.error('❌ Modelo PEDIDO GET BY CLIENTE - Error:', error);
            throw error;
        }
    },

    // Obtener estadísticas de pedidos
getEstadisticas: async () => {
    try {
        console.log('📊 Modelo PEDIDO - Obteniendo estadísticas...');
        
        const result = await db.execute(`
            SELECT 
                COUNT(*) as total_pedidos,
                SUM(total) as ingresos_totales,
                AVG(total) as promedio_pedido,
                COUNT(CASE WHEN estado = 'entregado' THEN 1 END) as pedidos_entregados,
                COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pedidos_pendientes
            FROM pedidos
        `);
        
        let estadisticas = {};
        if (Array.isArray(result) && result.length > 0) {
            if (Array.isArray(result[0])) {
                estadisticas = result[0][0] || {};
            } else if (result[0]) {
                estadisticas = result[0] || {};
            }
        } else if (result) {
            estadisticas = result;
        }
        
        console.log('📊 Modelo PEDIDO - Estadísticas:', estadisticas);
        return estadisticas;
        
    } catch (error) {
        console.error('❌ Modelo PEDIDO ESTADISTICAS - Error:', error);
        throw error;
    }
},

// Obtener estadísticas avanzadas de pedidos
getEstadisticasAvanzadas: async () => {
    try {
        console.log('📊 Modelo PEDIDO - Obteniendo estadísticas avanzadas...');
        
      const query = `
            SELECT 
                -- Totales generales (EXCLUYENDO cancelados)
                COUNT(CASE WHEN estado != 'cancelado' THEN 1 END) as total_pedidos,
                SUM(CASE WHEN estado != 'cancelado' THEN total ELSE 0 END) as ingresos_totales,
                AVG(CASE WHEN estado != 'cancelado' THEN total ELSE NULL END) as promedio_pedido,
                
                -- Por estado
                COUNT(CASE WHEN estado = 'entregado' THEN 1 END) as pedidos_entregados,
                COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pedidos_pendientes,
                COUNT(CASE WHEN estado = 'confirmado' THEN 1 END) as pedidos_confirmados,
                COUNT(CASE WHEN estado = 'enviado' THEN 1 END) as pedidos_enviados,
                COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) as pedidos_cancelados,
                
                -- Mensual (EXCLUYENDO cancelados)
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND estado != 'cancelado' THEN 1 END) as pedidos_este_mes,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND estado != 'cancelado' THEN total ELSE 0 END) as ingresos_este_mes,
                
                -- Promedio mensual (últimos 3 meses, excluyendo cancelados)
                (SELECT AVG(total) FROM pedidos WHERE created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH) AND estado != 'cancelado') as promedio_mensual,
                
                -- Tendencias (excluyendo cancelados)
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND estado != 'cancelado' THEN 1 END) as pedidos_esta_semana
                
            FROM pedidos
        `;
        
        console.log('📊 Modelo PEDIDO - Ejecutando query:', query);
        const result = await db.execute(query);
        console.log('📊 Modelo PEDIDO - Resultado SQL CRUDO:', result);
        
        let estadisticas = {};
        if (Array.isArray(result) && result.length > 0) {
            if (Array.isArray(result[0])) {
                estadisticas = result[0][0] || {};
            } else if (result[0]) {
                estadisticas = result[0] || {};
            }
        } else if (result) {
            estadisticas = result;
        }
        
        console.log('📊 Modelo PEDIDO - Estadísticas procesadas:', estadisticas);
        return estadisticas;
        
    } catch (error) {
        console.error('❌ Modelo PEDIDO ESTADISTICAS AVANZADAS - Error:', error);
        throw error;
    }
}, 
            
};

module.exports = Pedido;