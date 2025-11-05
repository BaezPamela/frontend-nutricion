const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.get('/', pedidoController.getAll);
router.get('/estadisticas', pedidoController.getEstadisticas);
router.get('/estadisticas/avanzadas', pedidoController.getEstadisticasAvanzadas); 
router.get('/search', pedidoController.search);
router.get('/categoria/:categoria', pedidoController.getByCategory);
router.get('/tipo/:tipo', pedidoController.getByType);
router.get('/:id', pedidoController.getById);
router.post('/', pedidoController.create);
router.put('/:id/estado', pedidoController.updateEstado);
router.delete('/:id', pedidoController.delete);

module.exports = router;