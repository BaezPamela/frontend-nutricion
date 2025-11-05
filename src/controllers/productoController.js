const Producto = require('../models/Producto');

const productoController = {
    getAll: async (req, res) => {
        try {
            console.log('🟢 Controlador: Iniciando getAll...');
            
            const productos = await Producto.getAll();
            
            console.log('📋 Controlador: Productos recibidos del modelo:', productos);
            console.log('🔎 Controlador: Tipo de datos:', typeof productos);
            console.log('🔎 Controlador: Es array?', Array.isArray(productos));
            console.log('🔎 Controlador: Cantidad de elementos:', productos.length);
            
            // DEBUG: Ver contenido real
            if (productos && productos.length > 0) {
                console.log('🔍 Controlador: Primer producto:', productos[0]);
                console.log('🔍 Controlador: Todos los nombres:', productos.map(p => p.nombre));
            }
            
            console.log(`✅ Controlador: Enviando ${productos.length} productos al frontend`);
            
            res.json(productos);
            
        } catch (error) {
            console.error('💥 Controlador: Error en getAll:', error);
            res.status(500).json([]);
        }
    },

    // Obtener producto por ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            console.log('🔍 GET BY ID - Solicitando producto ID:', id);
            
            const producto = await Producto.getById(id);
            
            if (!producto) {
                console.log('❌ GET BY ID - Producto no encontrado');
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            
            console.log('✅ GET BY ID - Producto encontrado:', producto.nombre);
            res.json(producto);
            
        } catch (error) {
            console.error('❌ GET BY ID - Error:', error);
            res.status(500).json({ error: 'Error al obtener el producto' });
        }
    },

    // Crear nuevo producto
    create: async (req, res) => {
        try {
            console.log('🆕 CREATE - Creando nuevo producto:', req.body);
            
            const { nombre, descripcion, imagen, precio, stock, categoria } = req.body;

            // Validaciones básicas
            if (!nombre || !precio || !stock) {
                console.log('❌ CREATE - Faltan campos requeridos');
                return res.status(400).json({ error: 'Nombre, precio y stock son requeridos' });
            }

            const productoId = await Producto.create({
                nombre,
                descripcion: descripcion || '',
                imagen: imagen || '',
                precio: parseFloat(precio),
                stock: parseInt(stock),
                categoria: categoria || 'general'
            });

            console.log('✅ CREATE - Producto creado exitosamente, ID:', productoId);
            
            res.status(201).json({ 
                message: 'Producto creado exitosamente',
                id: productoId 
            });
        } catch (error) {
            console.error('❌ CREATE - Error:', error);
            res.status(500).json({ error: 'Error al crear el producto' });
        }
    },

    // Actualizar producto
    update: async (req, res) => {
        try {
            const { id } = req.params;
            console.log('✏️ UPDATE - Actualizando producto ID:', id, 'Datos:', req.body);
            
            const { nombre, descripcion, imagen, precio, stock, categoria } = req.body;

            const updated = await Producto.update(id, {
                nombre,
                descripcion,
                imagen,
                precio: parseFloat(precio),
                stock: parseInt(stock),
                categoria
            });

            if (!updated) {
                console.log('❌ UPDATE - Producto no encontrado');
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            console.log('✅ UPDATE - Producto actualizado exitosamente');
            res.json({ message: 'Producto actualizado exitosamente' });
        } catch (error) {
            console.error('❌ UPDATE - Error:', error);
            res.status(500).json({ error: 'Error al actualizar el producto' });
        }
    },

    // Eliminar producto
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            console.log('🗑️ DELETE - Eliminando producto ID:', id);
            
            const deleted = await Producto.delete(id);

            if (!deleted) {
                console.log('❌ DELETE - Producto no encontrado');
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            console.log('✅ DELETE - Producto eliminado exitosamente');
            res.json({ message: 'Producto eliminado exitosamente' });
        } catch (error) {
            console.error('❌ DELETE - Error:', error);
            res.status(500).json({ error: 'Error al eliminar el producto: ' + error.message });
        }
    }
};

module.exports = productoController;