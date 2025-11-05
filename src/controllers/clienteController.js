const Cliente = require('../models/Cliente');

const clienteController = {
    // Obtener todos los clientes
    getAll: async (req, res) => {
        try {
            console.log('👥 Controlador CLIENTE - Obteniendo todos los clientes...');
            const clientes = await Cliente.getAll();
            console.log(`👥 Controlador CLIENTE - Enviando ${clientes.length} clientes`);
            res.json(clientes);
        } catch (error) {
            console.error('❌ Error en clienteController.getAll:', error);
            res.status(500).json({ error: 'Error al obtener clientes' });
        }
    },

    // Obtener cliente por ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            console.log('🔍 Controlador CLIENTE - Obteniendo cliente ID:', id);
            
            const cliente = await Cliente.getById(id);
            
            if (!cliente) {
                console.log('❌ Controlador CLIENTE - Cliente no encontrado ID:', id);
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }
            
            console.log('✅ Controlador CLIENTE - Cliente encontrado:', cliente.nombre);
            res.json(cliente);
            
        } catch (error) {
            console.error('❌ Error en clienteController.getById:', error);
            res.status(500).json({ error: 'Error al obtener el cliente' });
        }
    },

    // Crear nuevo cliente
    create: async (req, res) => {
        try {
            const { nombre, email, telefono, direccion, ciudad, codigo_postal } = req.body;

            console.log('👤 Controlador CLIENTE - Creando cliente:', { nombre, email });

            // Validaciones
            if (!nombre || !email) {
                return res.status(400).json({ error: 'Nombre y email son requeridos' });
            }

            // Verificar si el email ya existe
            const clienteExistente = await Cliente.getByEmail(email);
            if (clienteExistente) {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }

            const clienteId = await Cliente.create({
                nombre,
                email,
                telefono: telefono || '',
                direccion: direccion || '',
                ciudad: ciudad || '',
                codigo_postal: codigo_postal || ''
            });

            console.log('✅ Controlador CLIENTE - Cliente creado ID:', clienteId);
            
            res.status(201).json({ 
                message: 'Cliente creado exitosamente',
                id: clienteId 
            });
            
        } catch (error) {
            console.error('❌ Error en clienteController.create:', error);
            res.status(500).json({ error: 'Error al crear el cliente' });
        }
    },

    // Actualizar cliente
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, email, telefono, direccion, ciudad, codigo_postal } = req.body;

            console.log('✏️ Controlador CLIENTE - Actualizando cliente ID:', id);

            const updated = await Cliente.update(id, {
                nombre,
                email,
                telefono,
                direccion,
                ciudad,
                codigo_postal
            });

            if (!updated) {
                console.log('❌ Controlador CLIENTE - Cliente no encontrado para actualizar ID:', id);
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }

            console.log('✅ Controlador CLIENTE - Cliente actualizado ID:', id);
            res.json({ message: 'Cliente actualizado exitosamente' });
            
        } catch (error) {
            console.error('❌ Error en clienteController.update:', error);
            res.status(500).json({ error: 'Error al actualizar el cliente' });
        }
    },

    // Buscar clientes
    search: async (req, res) => {
        try {
            const { query } = req.query;
            console.log('🔍 Controlador CLIENTE - Buscando clientes:', query);
            
            if (!query) {
                return res.status(400).json({ error: 'Query de búsqueda requerido' });
            }

            const clientes = await Cliente.search(query);
            console.log(`🔍 Controlador CLIENTE - ${clientes.length} clientes encontrados en búsqueda`);
            res.json(clientes);
            
        } catch (error) {
            console.error('❌ Error en clienteController.search:', error);
            res.status(500).json({ error: 'Error al buscar clientes' });
        }
    },

    // Obtener estadísticas de clientes
    getEstadisticas: async (req, res) => {
        try {
            console.log('📊 Controlador CLIENTE - Obteniendo estadísticas...');
            const estadisticas = await Cliente.getEstadisticas();
            res.json(estadisticas);
        } catch (error) {
            console.error('❌ Error en clienteController.getEstadisticas:', error);
            res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
    }
};

module.exports = clienteController;