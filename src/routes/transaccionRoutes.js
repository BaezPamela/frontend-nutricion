const express = require('express');
const router = express.Router();
const transaccionController = require('../controllers/transaccionController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.post('/', transaccionController.create);
router.get('/pedido/:pedido_id', transaccionController.getByPedidoId);
router.put('/:transaccion_id/estado', transaccionController.updateEstado);

module.exports = router;