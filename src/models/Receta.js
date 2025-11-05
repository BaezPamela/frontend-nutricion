const db = require('./db');

const Receta = {
    // Obtener todas las recetas
   getAll: async () => {
    try {
        console.log('🍳 Modelo: Ejecutando consulta para obtener TODAS las recetas...');
        
        const result = await db.execute('SELECT * FROM recetas ORDER BY created_at DESC');
        
        console.log('🍳 Modelo: Resultado CRUDO:', result);
        
        // ✅ SIMPLIFICAR: Probar diferentes formas de extraer los datos
        let recetas = [];
        
        // Intentar extraer de diferentes formas
        if (Array.isArray(result) && result.length > 0) {
            // Probar con result[0] primero
            if (Array.isArray(result[0])) {
                recetas = result[0];
            } 
            // Si result[0] no es array, usar result directamente
            else if (result[0]) {
                recetas = result;
            }
        } else if (result) {
            recetas = result;
        }
        
        // Asegurar que es un array
        if (!Array.isArray(recetas)) {
            console.log('🍳 Modelo: Recetas no es array, convirtiendo...');
            recetas = [recetas];
        }
        
        console.log(`🍳 Modelo: ${recetas.length} recetas encontradas`);
        
        return recetas;
        
    } catch (error) {
        console.error('❌ Error en Receta.getAll:', error);
        throw error;
    }
},

    // Obtener receta por ID
    getById: async (id) => {
    try {
        console.log('🔍 Modelo GET BY ID - Buscando receta ID:', id);
        
        const result = await db.execute('SELECT * FROM recetas WHERE id = ?', [id]);
        
        console.log('🔍 Modelo GET BY ID - Resultado completo:', result);
        
        // Manejar diferentes estructuras de respuesta
        let rows = [];
        if (Array.isArray(result) && result.length > 0) {
            rows = Array.isArray(result[0]) ? result[0] : result;
        } else {
            rows = result;
        }
        
        console.log('🔍 Modelo GET BY ID - Filas encontradas:', rows);
        
        if (rows && rows.length > 0) {
            console.log('✅ Modelo GET BY ID - Receta encontrada:', rows[0].nombre);
            return rows[0];
        } else {
            console.log('❌ Modelo GET BY ID - Receta no encontrada');
            return null;
        }
        
    } catch (error) {
        console.error('❌ Modelo GET BY ID - Error:', error);
        throw error;
    }
},

    // Crear nueva receta
   create: async (recetaData) => {
    try {
        const { nombre, imagen, descripcion_corta, ingredientes, preparacion, tiempo, dificultad, categoria } = recetaData;
        
        console.log('📝 Modelo CREATE - Creando receta:', recetaData);
        
        const result = await db.execute(
            'INSERT INTO recetas (nombre, imagen, descripcion_corta, ingredientes, preparacion, tiempo, dificultad, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, imagen, descripcion_corta, ingredientes, preparacion, tiempo, dificultad, categoria]
        );
        
        console.log('📝 Modelo CREATE - Resultado completo:', result);
        
        // Manejar diferentes estructuras de respuesta
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
        
        console.log('✅ Modelo CREATE - Receta creada, ID:', insertId);
        return insertId;
        
    } catch (error) {
        console.error('❌ Modelo CREATE - Error:', error);
        throw error;
    }
},

    // Actualizar receta
    update: async (id, recetaData) => {
    try {
        const { nombre, imagen, descripcion_corta, ingredientes, preparacion, tiempo, dificultad, categoria } = recetaData;
        
        console.log('✏️ Modelo UPDATE - Actualizando receta ID:', id);
        
        const result = await db.execute(
            'UPDATE recetas SET nombre = ?, imagen = ?, descripcion_corta = ?, ingredientes = ?, preparacion = ?, tiempo = ?, dificultad = ?, categoria = ? WHERE id = ?',
            [nombre, imagen, descripcion_corta, ingredientes, preparacion, tiempo, dificultad, categoria, id]
        );
        
        console.log('✏️ Modelo UPDATE - Resultado completo:', result);
        
        // Manejar diferentes estructuras de respuesta
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
        
        console.log('✏️ Modelo UPDATE - Affected Rows:', affectedRows);
        return affectedRows > 0;
        
    } catch (error) {
        console.error('❌ Modelo UPDATE - Error:', error);
        throw error;
    }
},
    // Eliminar receta
    delete: async (id) => {
    try {
        console.log('🗑️ Modelo DELETE - Eliminando receta ID:', id);
        
        // ✅ CORREGIR: No usar destructuración [result]
        const result = await db.execute('DELETE FROM recetas WHERE id = ?', [id]);
        
        console.log('🗑️ Modelo DELETE - Resultado completo:', result);
        
        // Manejar diferentes estructuras de respuesta
        let affectedRows = 0;
        
        if (Array.isArray(result) && result.length > 0) {
            // Caso: [rows, fields]
            if (result[0] && typeof result[0] === 'object' && 'affectedRows' in result[0]) {
                affectedRows = result[0].affectedRows;
            } else if (result[0] && typeof result[0] === 'object') {
                affectedRows = result[0].affectedRows || 0;
            }
        } 
        // Caso: resultado directo como objeto
        else if (result && typeof result === 'object' && 'affectedRows' in result) {
            affectedRows = result.affectedRows;
        }
        
        console.log('🗑️ Modelo DELETE - Affected Rows:', affectedRows);
        return affectedRows > 0;
        
    } catch (error) {
        console.error('❌ Modelo DELETE - Error:', error);
        throw error;
    }
},
    // Obtener recetas por categoría
    getByCategory: async (categoria) => {
        try {
            const [rows] = await db.execute('SELECT * FROM recetas WHERE categoria = ? ORDER BY nombre', [categoria]);
            return rows;
        } catch (error) {
            console.error('Error en Receta.getByCategory:', error);
            throw error;
        }
    },

    // Buscar recetas por nombre
    search: async (query) => {
        try {
            const [rows] = await db.execute('SELECT * FROM recetas WHERE nombre LIKE ? ORDER BY nombre', [`%${query}%`]);
            return rows;
        } catch (error) {
            console.error('Error en Receta.search:', error);
            throw error;
        }
    }
};

module.exports = Receta;