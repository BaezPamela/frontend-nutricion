const db = require('./db');

const Transaccion = {
    // Obtener transacción por ID de pedido
    getByPedidoId: async (pedidoId) => {
        try {
            console.log('💳 Modelo TRANSACCION - Buscando transacción para pedido:', pedidoId);
            
            const result = await db.execute(
                'SELECT * FROM transacciones WHERE pedido_id = ? ORDER BY created_at DESC LIMIT 1',
                [pedidoId]
            );
            
            console.log('💳 Modelo TRANSACCION - Resultado CRUDO:', result);
            
            let transacciones = [];
            if (Array.isArray(result) && result.length > 0) {
                if (Array.isArray(result[0])) {
                    transacciones = result[0];
                } else if (result[0]) {
                    transacciones = result;
                }
            } else if (result) {
                transacciones = result;
            }
            
            if (!Array.isArray(transacciones)) {
                transacciones = [transacciones];
            }
            
            console.log(`💳 Modelo TRANSACCION: ${transacciones.length} transacciones encontradas`);
            
            // Si no hay transacciones, retornar null en lugar de error
            if (transacciones.length === 0) {
                console.log('💳 Modelo TRANSACCION - No hay transacciones para este pedido');
                return null;
            }
            
            console.log('✅ Modelo TRANSACCION - Transacción encontrada:', transacciones[0].id);
            return transacciones[0];
            
        } catch (error) {
            console.error('❌ Error en Transaccion.getByPedidoId:', error);
            // En caso de error, retornar null en lugar de lanzar error
            return null;
        }
    },

    // Crear nueva transacción
    create: async (transaccionData) => {
        try {
            const { pedido_id, metodo_pago, monto, estado, datos_pago } = transaccionData;
            
            console.log('💳 Modelo TRANSACCION CREATE - Creando transacción para pedido:', pedido_id);
            
            const result = await db.execute(
                'INSERT INTO transacciones (pedido_id, metodo_pago, monto, estado, datos_pago) VALUES (?, ?, ?, ?, ?)',
                [pedido_id, metodo_pago, monto, estado, JSON.stringify(datos_pago)]
            );
            
            console.log('💳 Modelo TRANSACCION CREATE - Resultado completo:', result);
            
            let insertId = 0;
            if (Array.isArray(result) && result.length > 0) {
                if (result[0] && typeof result[0] === 'object' && 'insertId' in result[0]) {
                    insertId = result[0].insertId;
                } else if (result[0] && typeof result[0] === 'object') {
                    insertId = result[0].insertId || 0;
                }
            } 
            else if (result && typeof result === 'object' && 'insertId' in result) {
                insertId = result.insertId;
            }
            
            console.log('✅ Modelo TRANSACCION CREATE - Transacción creada, ID:', insertId);
            return insertId;
            
        } catch (error) {
            console.error('❌ Modelo TRANSACCION CREATE - Error:', error);
            throw error;
        }
    },

    // Actualizar estado de transacción
    updateEstado: async (id, estado, datos_respuesta = null) => {
        try {
            console.log('✏️ Modelo TRANSACCION UPDATE - Actualizando transacción:', id, 'a estado:', estado);
            
            let query = 'UPDATE transacciones SET estado = ?';
            let params = [estado];
            
            if (datos_respuesta) {
                query += ', datos_respuesta = ?';
                params.push(JSON.stringify(datos_respuesta));
            }
            
            query += ' WHERE id = ?';
            params.push(id);
            
            const result = await db.execute(query, params);
            
            console.log('✏️ Modelo TRANSACCION UPDATE - Resultado:', result);
            
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
            
            console.log('✏️ Modelo TRANSACCION UPDATE - Affected Rows:', affectedRows);
            return affectedRows > 0;
            
        } catch (error) {
            console.error('❌ Modelo TRANSACCION UPDATE - Error:', error);
            throw error;
        }
    },

    // Obtener transacciones por estado
    getByEstado: async (estado) => {
        try {
            console.log('🔍 Modelo TRANSACCION - Buscando transacciones con estado:', estado);
            
            const result = await db.execute(
                'SELECT t.*, p.numero_pedido, c.nombre as cliente_nombre ' +
                'FROM transacciones t ' +
                'LEFT JOIN pedidos p ON t.pedido_id = p.id ' +
                'LEFT JOIN clientes c ON p.cliente_id = c.id ' +
                'WHERE t.estado = ? ' +
                'ORDER BY t.created_at DESC',
                [estado]
            );
            
            let transacciones = [];
            if (Array.isArray(result) && result.length > 0) {
                if (Array.isArray(result[0])) {
                    transacciones = result[0];
                } else if (result[0]) {
                    transacciones = result;
                }
            } else if (result) {
                transacciones = result;
            }
            
            if (!Array.isArray(transacciones)) {
                transacciones = [transacciones];
            }
            
            console.log(`🔍 Modelo TRANSACCION: ${transacciones.length} transacciones encontradas con estado ${estado}`);
            return transacciones;
            
        } catch (error) {
            console.error('❌ Modelo TRANSACCION GET BY ESTADO - Error:', error);
            throw error;
        }
    }
};

module.exports = Transaccion;