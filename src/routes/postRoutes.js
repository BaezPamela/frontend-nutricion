const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas CRUD para posts
router.get('/', postController.getAll);
router.get('/publicados', postController.getPublicados);
router.get('/search', postController.search);
router.get('/categoria/:categoria', postController.getByCategory);
router.get('/tipo/:tipo', postController.getByType);
router.get('/:id', postController.getById);
router.post('/', postController.create);
router.put('/:id', postController.update);
router.delete('/:id', postController.delete);

module.exports = router;