const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { authenticateToken } = require('../middleware/authMiddleware');



// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas CRUD para productos
router.get('/', productoController.getAll);
router.get('/:id', productoController.getById);
router.post('/', productoController.create);
router.put('/:id', productoController.update);
router.delete('/:id', productoController.delete);


module.exports = router;