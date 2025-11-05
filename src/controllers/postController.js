const Post = require('../models/Post');

const postController = {
    // Obtener todos los posts (admin)
    getAll: async (req, res) => {
        try {
            const posts = await Post.getAll();
            res.json(posts);
        } catch (error) {
            console.error('Error en postController.getAll:', error);
            res.status(500).json({ error: 'Error al obtener posts' });
        }
    },

    // Obtener posts publicados (público)
    getPublicados: async (req, res) => {
        try {
            const posts = await Post.getPublicados();
            res.json(posts);
        } catch (error) {
            console.error('Error en postController.getPublicados:', error);
            res.status(500).json({ error: 'Error al obtener posts publicados' });
        }
    },

    // Obtener post por ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const post = await Post.getById(id);
            
            if (!post) {
                return res.status(404).json({ error: 'Post no encontrado' });
            }
            
            res.json(post);
        } catch (error) {
            console.error('Error en postController.getById:', error);
            res.status(500).json({ error: 'Error al obtener el post' });
        }
    },

    // Crear nuevo post
    create: async (req, res) => {
        try {
            const { 
                titulo, contenido, resumen, imagen, categoria, tipo, 
                url_video, libro_autor, libro_enlace, estado 
            } = req.body;

            // Validaciones básicas
            if (!titulo || !contenido) {
                return res.status(400).json({ error: 'Título y contenido son requeridos' });
            }

            const postId = await Post.create({
                titulo,
                contenido,
                resumen: resumen || '',
                imagen: imagen || '',
                categoria: categoria || 'nutricion',
                tipo: tipo || 'articulo',
                url_video: url_video || '',
                libro_autor: libro_autor || '',
                libro_enlace: libro_enlace || '',
                estado: estado || 'borrador'
            });

            res.status(201).json({ 
                message: 'Post creado exitosamente',
                id: postId 
            });
        } catch (error) {
            console.error('Error en postController.create:', error);
            res.status(500).json({ error: 'Error al crear el post' });
        }
    },

    // Actualizar post
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { 
                titulo, contenido, resumen, imagen, categoria, tipo, 
                url_video, libro_autor, libro_enlace, estado 
            } = req.body;

            const updated = await Post.update(id, {
                titulo,
                contenido,
                resumen,
                imagen,
                categoria,
                tipo,
                url_video,
                libro_autor,
                libro_enlace,
                estado
            });

            if (!updated) {
                return res.status(404).json({ error: 'Post no encontrado' });
            }

            res.json({ message: 'Post actualizado exitosamente' });
        } catch (error) {
            console.error('Error en postController.update:', error);
            res.status(500).json({ error: 'Error al actualizar el post' });
        }
    },

    // Eliminar post
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await Post.delete(id);

            if (!deleted) {
                return res.status(404).json({ error: 'Post no encontrado' });
            }

            res.json({ message: 'Post eliminado exitosamente' });
        } catch (error) {
            console.error('Error en postController.delete:', error);
            res.status(500).json({ error: 'Error al eliminar el post' });
        }
    },

    // Obtener posts por categoría
    getByCategory: async (req, res) => {
        try {
            const { categoria } = req.params;
            const posts = await Post.getByCategory(categoria);
            res.json(posts);
        } catch (error) {
            console.error('Error en postController.getByCategory:', error);
            res.status(500).json({ error: 'Error al obtener posts por categoría' });
        }
    },

    // Obtener posts por tipo
    getByType: async (req, res) => {
        try {
            const { tipo } = req.params;
            const posts = await Post.getByType(tipo);
            res.json(posts);
        } catch (error) {
            console.error('Error en postController.getByType:', error);
            res.status(500).json({ error: 'Error al obtener posts por tipo' });
        }
    },

    // Buscar posts
    search: async (req, res) => {
        try {
            const { query } = req.query;
            const posts = await Post.search(query);
            res.json(posts);
        } catch (error) {
            console.error('Error en postController.search:', error);
            res.status(500).json({ error: 'Error al buscar posts' });
        }
    }
};

module.exports = postController;