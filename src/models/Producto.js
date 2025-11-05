const db = require('./db');

// Obtener TODOS los productos
const Producto = {
    getAll: async () => {
    try {
        console.log('🔍 Modelo: Ejecutando consulta para obtener TODOS los productos...');
        
        const result = await db.execute('SELECT * FROM productos ORDER BY id ASC');
        
        console.log('📊 Modelo: Resultado completo:', result);
        console.log('📊 Modelo: Tipo de resultado:', typeof result);
        console.log('📊 Modelo: Es array?', Array.isArray(result));
        
        // ✅ CORRECCIÓN: result YA es el array de productos directamente
        let productos = result;
        
        // Validar que sea un array
        if (!Array.isArray(productos)) {
            console.warn('⚠️ Modelo: Resultado no es array, forzando conversión');
            productos = [];
        }
        
        console.log(`📊 Modelo: ${productos.length} productos encontrados`);
        
        if (productos.length > 0) {
            console.log('🔍 Modelo: Primer producto:', productos[0]);
            console.log('🔍 Modelo: Todos los IDs:', productos.map(p => p.id));
        } else {
            console.log('⚠️ Modelo: No se encontraron productos');
        }
        
        return productos;
        
    } catch (error) {
        console.error('❌ Modelo: Error en Producto.getAll:', error);
        throw error;
    }
},
   
    // Obtener producto por ID
    getById: async (id) => {
        try {
            const result = await db.execute('SELECT * FROM productos WHERE id = ?', [id]);
        
        // ✅ result ya es el array directamente
        if (Array.isArray(result) && result.length > 0) {
            return result[0]; // Devolver el primer producto
        }
        return null;
        
    } catch (error) {
        console.error('Error en Producto.getById:', error);
        throw error;
    }
}, 

    // Crear nuevo producto
    create: async (productoData) => {
        try {
            const { nombre, descripcion, imagen, precio, stock, categoria } = productoData;
        
        const result = await db.execute(
            'INSERT INTO productos (nombre, descripcion, imagen, precio, stock, categoria) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, descripcion, imagen, precio, stock, categoria]
        );
        
        // ✅ result ya contiene el resultado de la inserción
        console.log('✅ Modelo: Resultado de inserción:', result);
        return result.insertId || result[0]?.insertId;
        
    } catch (error) {
        console.error('Error en Producto.create:', error);
        throw error;
    }
},

    // Actualizar producto
   update: async (id, productoData) => {
    try {
        const { nombre, descripcion, imagen, precio, stock, categoria } = productoData;
        
        const result = await db.execute(
            'UPDATE productos SET nombre = ?, descripcion = ?, imagen = ?, precio = ?, stock = ?, categoria = ? WHERE id = ?',
            [nombre, descripcion, imagen, precio, stock, categoria, id]
        );
        
        // Manejo simple de affectedRows
        let affectedRows = 0;
        if (Array.isArray(result) && result[0] && result[0].affectedRows) {
            affectedRows = result[0].affectedRows;
        } else if (result && result.affectedRows) {
            affectedRows = result.affectedRows;
        }
        
        return affectedRows > 0;
        
    } catch (error) {
        console.error('Error en Producto.update:', error);
        throw error;
    }
},
    // Eliminar producto
   delete: async (id) => {
    try {
        const result = await db.execute('DELETE FROM productos WHERE id = ?', [id]);
        
        // ✅ Verificar affectedRows directamente
        console.log('🗑️ Resultado DELETE:', result);
        const affectedRows = result.affectedRows || result[0]?.affectedRows;
        return affectedRows > 0;
        
    } catch (error) {
        console.error('❌ Error en Producto.delete:', error);
        throw error;
    }
},
    // Buscar productos por categoría
    getByCategory: async (categoria) => {
        try {
            const [rows] = await db.execute('SELECT * FROM productos WHERE categoria = ? ORDER BY nombre', [categoria]);
            return rows;
        } catch (error) {
            console.error('Error en Producto.getByCategory:', error);
            throw error;
        }
    }
};


module.exports = Producto;