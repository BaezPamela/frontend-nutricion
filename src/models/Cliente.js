const db = require('./db');

const Cliente = {
    // Obtener todos los clientes
    getAll: async () => {
        try {
            console.log('👥 Modelo CLIENTE: Ejecutando consulta para obtener TODOS los clientes...');
            
            const result = await db.execute('SELECT * FROM clientes ORDER BY created_at DESC');
            
            console.log('👥 Modelo CLIENTE: Resultado CRUDO:', result);
            
            // ✅ USAR EL MISMO PATRÓN QUE RECETA Y POST
            let clientes = [];
            
            if (Array.isArray(result) && result.length > 0) {
                if (Array.isArray(result[0])) {
                    clientes = result[0];
                } else if (result[0]) {
                    clientes = result;
                }
            } else if (result) {
                clientes = result;
            }
            
            if (!Array.isArray(clientes)) {
                console.log('👥 Modelo CLIENTE: Clientes no es array, convirtiendo...');
                clientes = [clientes];
            }
            
            console.log(`👥 Modelo CLIENTE: ${clientes.length} clientes encontrados`);
            
            // ✅ DEBUG: Mostrar primeros clientes
            if (clientes.length > 0) {
                console.log('🔍 Primeros 3 clientes:', clientes.slice(0, 3));
            }
            
            return clientes;
            
        } catch (error) {
            console.error('❌ Error en Cliente.getAll:', error);
            throw error;
        }
    },

    // Obtener cliente por ID
    getById: async (id) => {
        try {
            console.log('🔍 Modelo CLIENTE GET BY ID - Buscando cliente ID:', id);
            
            const result = await db.execute('SELECT * FROM clientes WHERE id = ?', [id]);
            
            console.log('🔍 Modelo CLIENTE GET BY ID - Resultado completo:', result);
            
            let rows = [];
            if (Array.isArray(result) && result.length > 0) {
                rows = Array.isArray(result[0]) ? result[0] : result;
            } else {
                rows = result;
            }
            
            console.log('🔍 Modelo CLIENTE GET BY ID - Filas encontradas:', rows);
            
            if (rows && rows.length > 0) {
                console.log('✅ Modelo CLIENTE GET BY ID - Cliente encontrado:', rows[0].nombre);
                return rows[0];
            } else {
                console.log('❌ Modelo CLIENTE GET BY ID - Cliente no encontrado');
                return null;
            }
            
        } catch (error) {
            console.error('❌ Modelo CLIENTE GET BY ID - Error:', error);
            throw error;
        }
    },

    // Obtener cliente por email
    getByEmail: async (email) => {
        try {
            console.log('📧 Modelo CLIENTE GET BY EMAIL - Buscando cliente:', email);
            
            const result = await db.execute('SELECT * FROM clientes WHERE email = ?', [email]);
            
            console.log('📧 Modelo CLIENTE GET BY EMAIL - Resultado completo:', result);
            
            let rows = [];
            if (Array.isArray(result) && result.length > 0) {
                rows = Array.isArray(result[0]) ? result[0] : result;
            } else {
                rows = result;
            }
            
            console.log('📧 Modelo CLIENTE GET BY EMAIL - Filas encontradas:', rows);
            
            if (rows && rows.length > 0) {
                console.log('✅ Modelo CLIENTE GET BY EMAIL - Cliente encontrado:', rows[0].nombre);
                return rows[0];
            } else {
                console.log('❌ Modelo CLIENTE GET BY EMAIL - Cliente no encontrado');
                return null;
            }
            
        } catch (error) {
            console.error('❌ Modelo CLIENTE GET BY EMAIL - Error:', error);
            throw error;
        }
    },

    // Crear nuevo cliente
    create: async (clienteData) => {
        try {
            const { nombre, email, telefono, direccion, ciudad, codigo_postal } = clienteData;
            
            console.log('👤 Modelo CLIENTE CREATE - Creando cliente:', { nombre, email });
            
            const result = await db.execute(
                'INSERT INTO clientes (nombre, email, telefono, direccion, ciudad, codigo_postal) VALUES (?, ?, ?, ?, ?, ?)',
                [nombre, email, telefono, direccion, ciudad, codigo_postal]
            );
            
            console.log('👤 Modelo CLIENTE CREATE - Resultado completo:', result);
            
            let insertId = 0;
            if (Array.isArray(result) && result.length > 0) {
                if (result[0] && typeof result[0] === 'object' && 'insertId' in result[0]) {
                    insertId = result[0].insertId;
                } else if (result[0] && typeof result[0] === 'object') {
                    insertId = result[0].insertId || 0;
                }
            } 
            else if (result && typeof result === 'object' && 'insertId' in result) {
                insertId = result.insertId;
            }
            
            console.log('✅ Modelo CLIENTE CREATE - Cliente creado, ID:', insertId);
            return insertId;
            
        } catch (error) {
            console.error('❌ Modelo CLIENTE CREATE - Error:', error);
            throw error;
        }
    },

    // Actualizar cliente
    update: async (id, clienteData) => {
        try {
            const { nombre, email, telefono, direccion, ciudad, codigo_postal } = clienteData;
            
            console.log('✏️ Modelo CLIENTE UPDATE - Actualizando cliente ID:', id);
            
            const result = await db.execute(
                'UPDATE clientes SET nombre = ?, email = ?, telefono = ?, direccion = ?, ciudad = ?, codigo_postal = ? WHERE id = ?',
                [nombre, email, telefono, direccion, ciudad, codigo_postal, id]
            );
            
            console.log('✏️ Modelo CLIENTE UPDATE - Resultado completo:', result);
            
            let affectedRows = 0;
            if (Array.isArray(result) && result.length > 0) {
                if (result[0] && typeof result[0] === 'object' && 'affectedRows' in result[0]) {
                    affectedRows = result[0].affectedRows;
                } else if (result[0] && typeof result[0] === 'object') {
                    affectedRows = result[0].affectedRows || 0;
                }
            } 
            else if (result && typeof result === 'object' && 'affectedRows' in result) {
                affectedRows = result.affectedRows;
            }
            
            console.log('✏️ Modelo CLIENTE UPDATE - Affected Rows:', affectedRows);
            return affectedRows > 0;
            
        } catch (error) {
            console.error('❌ Modelo CLIENTE UPDATE - Error:', error);
            throw error;
        }
    },

    // Buscar clientes por nombre o email
    search: async (query) => {
        try {
            console.log('🔍 Modelo CLIENTE SEARCH - Buscando:', query);
            
            const result = await db.execute(
                'SELECT * FROM clientes WHERE nombre LIKE ? OR email LIKE ? ORDER BY nombre',
                [`%${query}%`, `%${query}%`]
            );
            
            let clientes = [];
            if (Array.isArray(result) && result.length > 0) {
                if (Array.isArray(result[0])) {
                    clientes = result[0];
                } else if (result[0]) {
                    clientes = result;
                }
            } else if (result) {
                clientes = result;
            }
            
            if (!Array.isArray(clientes)) {
                clientes = [clientes];
            }
            
            console.log(`🔍 Modelo CLIENTE SEARCH: ${clientes.length} clientes encontrados`);
            return clientes;
            
        } catch (error) {
            console.error('❌ Modelo CLIENTE SEARCH - Error:', error);
            throw error;
        }
    },

    // Obtener estadísticas de clientes
    getEstadisticas: async () => {
        try {
            console.log('📊 Modelo CLIENTE - Obteniendo estadísticas...');
            
            const result = await db.execute(`
                SELECT 
                    COUNT(*) as total_clientes,
                    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as clientes_30_dias,
                    (SELECT COUNT(*) FROM pedidos WHERE pedidos.cliente_id = clientes.id) as total_pedidos
                FROM clientes
            `);
            
            let estadisticas = {};
            if (Array.isArray(result) && result.length > 0) {
                if (Array.isArray(result[0])) {
                    estadisticas = result[0][0] || {};
                } else if (result[0]) {
                    estadisticas = result[0] || {};
                }
            } else if (result) {
                estadisticas = result;
            }
            
            console.log('📊 Modelo CLIENTE - Estadísticas:', estadisticas);
            return estadisticas;
            
        } catch (error) {
            console.error('❌ Modelo CLIENTE ESTADISTICAS - Error:', error);
            throw error;
        }
    }
};

module.exports = Cliente;