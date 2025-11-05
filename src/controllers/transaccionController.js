const Transaccion = require('../models/Transaccion');

const transaccionController = {
    // Crear transacción
    create: async (req, res) => {
        try {
            const { pedido_id, transaccion_id, metodo_pago, estado, monto, datos_respuesta } = req.body;

            if (!pedido_id || !transaccion_id || !monto) {
                return res.status(400).json({ error: 'Pedido ID, transacción ID y monto son requeridos' });
            }

            const transaccionId = await Transaccion.create({
                pedido_id: parseInt(pedido_id),
                transaccion_id,
                metodo_pago: metodo_pago || 'mercadopago',
                estado: estado || 'pendiente',
                monto: parseFloat(monto),
                datos_respuesta: datos_respuesta || ''
            });

            res.status(201).json({ 
                message: 'Transacción creada exitosamente',
                id: transaccionId 
            });
        } catch (error) {
            console.error('Error en transaccionController.create:', error);
            res.status(500).json({ error: 'Error al crear la transacción' });
        }
    },

    // Actualizar estado de transacción
    updateEstado: async (req, res) => {
        try {
            const { transaccion_id } = req.params;
            const { estado, datos_respuesta } = req.body;

            const estadosPermitidos = ['pendiente', 'aprobado', 'rechazado', 'error'];
            
            if (!estadosPermitidos.includes(estado)) {
                return res.status(400).json({ error: 'Estado no válido' });
            }

            const updated = await Transaccion.updateEstado(transaccion_id, estado, datos_respuesta);

            if (!updated) {
                return res.status(404).json({ error: 'Transacción no encontrada' });
            }

            res.json({ message: 'Estado de transacción actualizado exitosamente' });
        } catch (error) {
            console.error('Error en transaccionController.updateEstado:', error);
            res.status(500).json({ error: 'Error al actualizar el estado de la transacción' });
        }
    },

    // Obtener transacción por ID de pedido
    getByPedidoId: async (req, res) => {
        try {
            const { pedido_id } = req.params;
            const transaccion = await Transaccion.getByPedidoId(pedido_id);
            
            if (!transaccion) {
                return res.status(404).json({ error: 'Transacción no encontrada' });
            }
            
            res.json(transaccion);
        } catch (error) {
            console.error('Error en transaccionController.getByPedidoId:', error);
            res.status(500).json({ error: 'Error al obtener la transacción' });
        }
    }
};

module.exports = transaccionController;