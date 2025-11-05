const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas CRUD para clientes
router.get('/', clienteController.getAll);
router.get('/estadisticas', clienteController.getEstadisticas);
router.get('/search', clienteController.search);
router.get('/:id', clienteController.getById);
router.post('/', clienteController.create);
router.put('/:id', clienteController.update);

module.exports = router;