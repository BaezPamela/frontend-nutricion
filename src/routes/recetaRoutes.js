const express = require('express');
const router = express.Router();
const recetaController = require('../controllers/recetaController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas CRUD para recetas
router.get('/', recetaController.getAll);
router.get('/search', recetaController.search);
router.get('/categoria/:categoria', recetaController.getByCategory);
router.get('/:id', recetaController.getById);
router.post('/', recetaController.create);
router.put('/:id', recetaController.update);
router.delete('/:id', recetaController.delete);

module.exports = router;