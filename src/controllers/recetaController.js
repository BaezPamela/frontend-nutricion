const Receta = require('../models/Receta');

const recetaController = {
    getAll: async (req, res) => {
        try {
            const recetas = await Receta.getAll();
            res.json(recetas);
        } catch (error) {
            console.error('Error en recetaController.getAll:', error);
            res.status(500).json({ error: 'Error al obtener recetas' });
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const receta = await Receta.getById(id);
            
            if (!receta) {
                return res.status(404).json({ error: 'Receta no encontrada' });
            }
            
            res.json(receta);
        } catch (error) {
            console.error('Error en recetaController.getById:', error);
            res.status(500).json({ error: 'Error al obtener la receta' });
        }
    },

    create: async (req, res) => {
        try {
            const { nombre, imagen, descripcion_corta, ingredientes, preparacion, tiempo, dificultad, categoria } = req.body;

            if (!nombre || !ingredientes || !preparacion) {
                return res.status(400).json({ error: 'Nombre, ingredientes y preparación son requeridos' });
            }

            const recetaId = await Receta.create({
                nombre,
                imagen: imagen || '',
                descripcion_corta: descripcion_corta || '',
                ingredientes,
                preparacion,
                tiempo: tiempo || '',
                dificultad: dificultad || 'Fácil',
                categoria: categoria || 'Desayuno'
            });

            res.status(201).json({ 
                message: 'Receta creada exitosamente',
                id: recetaId 
            });
        } catch (error) {
            console.error('Error en recetaController.create:', error);
            res.status(500).json({ error: 'Error al crear la receta' });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, imagen, descripcion_corta, ingredientes, preparacion, tiempo, dificultad, categoria } = req.body;

            const updated = await Receta.update(id, {
                nombre,
                imagen,
                descripcion_corta,
                ingredientes,
                preparacion,
                tiempo,
                dificultad,
                categoria
            });

            if (!updated) {
                return res.status(404).json({ error: 'Receta no encontrada' });
            }

            res.json({ message: 'Receta actualizada exitosamente' });
        } catch (error) {
            console.error('Error en recetaController.update:', error);
            res.status(500).json({ error: 'Error al actualizar la receta' });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await Receta.delete(id);

            if (!deleted) {
                return res.status(404).json({ error: 'Receta no encontrada' });
            }

            res.json({ message: 'Receta eliminada exitosamente' });
        } catch (error) {
            console.error('Error en recetaController.delete:', error);
            res.status(500).json({ error: 'Error al eliminar la receta' });
        }
    },

    getByCategory: async (req, res) => {
        try {
            const { categoria } = req.params;
            const recetas = await Receta.getByCategory(categoria);
            res.json(recetas);
        } catch (error) {
            console.error('Error en recetaController.getByCategory:', error);
            res.status(500).json({ error: 'Error al obtener recetas por categoría' });
        }
    },

    search: async (req, res) => {
        try {
            const { query } = req.query;
            const recetas = await Receta.search(query);
            res.json(recetas);
        } catch (error) {
            console.error('Error en recetaController.search:', error);
            res.status(500).json({ error: 'Error al buscar recetas' });
        }
    }
};

module.exports = recetaController;