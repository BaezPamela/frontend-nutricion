const db = require('./db');

const Post = {
    // Obtener todos los posts
    getAll: async () => {
        try {
            console.log('📝 Modelo POST: Ejecutando consulta para obtener TODOS los posts...');
            
            const result = await db.execute('SELECT * FROM posts ORDER BY created_at DESC');
            
            console.log('📝 Modelo POST: Resultado CRUDO:', result);
            
            // ✅ USAR EL MISMO PATRÓN QUE RECETA
            let posts = [];
            
            // Intentar extraer de diferentes formas
            if (Array.isArray(result) && result.length > 0) {
                // Probar con result[0] primero
                if (Array.isArray(result[0])) {
                    posts = result[0];
                } 
                // Si result[0] no es array, usar result directamente
                else if (result[0]) {
                    posts = result;
                }
            } else if (result) {
                posts = result;
            }
            
            // Asegurar que es un array
            if (!Array.isArray(posts)) {
                console.log('📝 Modelo POST: Posts no es array, convirtiendo...');
                posts = [posts];
            }
            
            console.log(`📝 Modelo POST: ${posts.length} posts encontrados`);
            
            return posts;
            
        } catch (error) {
            console.error('❌ Error en Post.getAll:', error);
            throw error;
        }
    },

    // Obtener posts publicados
    getPublicados: async () => {
        try {
            console.log('📝 Modelo POST: Obteniendo posts publicados...');
            
            const result = await db.execute('SELECT * FROM posts WHERE estado = "publicado" ORDER BY created_at DESC');
            
            let posts = [];
            
            if (Array.isArray(result) && result.length > 0) {
                if (Array.isArray(result[0])) {
                    posts = result[0];
                } else if (result[0]) {
                    posts = result;
                }
            } else if (result) {
                posts = result;
            }
            
            if (!Array.isArray(posts)) {
                posts = [posts];
            }
            
            console.log(`📝 Modelo POST: ${posts.length} posts publicados encontrados`);
            return posts;
            
        } catch (error) {
            console.error('❌ Error en Post.getPublicados:', error);
            throw error;
        }
    },

    // Obtener post por ID
    getById: async (id) => {
        try {
            console.log('🔍 Modelo POST GET BY ID - Buscando post ID:', id);
            
            const result = await db.execute('SELECT * FROM posts WHERE id = ?', [id]);
            
            console.log('🔍 Modelo POST GET BY ID - Resultado completo:', result);
            
            // Manejar diferentes estructuras de respuesta
            let rows = [];
            if (Array.isArray(result) && result.length > 0) {
                rows = Array.isArray(result[0]) ? result[0] : result;
            } else {
                rows = result;
            }
            
            console.log('🔍 Modelo POST GET BY ID - Filas encontradas:', rows);
            
            if (rows && rows.length > 0) {
                console.log('✅ Modelo POST GET BY ID - Post encontrado:', rows[0].titulo);
                return rows[0];
            } else {
                console.log('❌ Modelo POST GET BY ID - Post no encontrado');
                return null;
            }
            
        } catch (error) {
            console.error('❌ Modelo POST GET BY ID - Error:', error);
            throw error;
        }
    },

    // Crear nuevo post
    create: async (postData) => {
        try {
            const { 
                titulo, contenido, resumen, imagen, categoria, tipo, 
                url_video, libro_autor, libro_enlace, estado 
            } = postData;
            
            console.log('📝 Modelo POST CREATE - Creando post:', { titulo, categoria, tipo, estado });
            
            const result = await db.execute(
                `INSERT INTO posts 
                (titulo, contenido, resumen, imagen, categoria, tipo, url_video, libro_autor, libro_enlace, estado) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [titulo, contenido, resumen, imagen, categoria, tipo, url_video, libro_autor, libro_enlace, estado]
            );
            
            console.log('📝 Modelo POST CREATE - Resultado completo:', result);
            
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
            
            console.log('✅ Modelo POST CREATE - Post creado, ID:', insertId);
            return insertId;
            
        } catch (error) {
            console.error('❌ Modelo POST CREATE - Error:', error);
            throw error;
        }
    },

    // Actualizar post
    update: async (id, postData) => {
        try {
            const { 
                titulo, contenido, resumen, imagen, categoria, tipo, 
                url_video, libro_autor, libro_enlace, estado 
            } = postData;
            
            console.log('✏️ Modelo POST UPDATE - Actualizando post ID:', id);
            
            const result = await db.execute(
                `UPDATE posts SET 
                titulo = ?, contenido = ?, resumen = ?, imagen = ?, categoria = ?, tipo = ?, 
                url_video = ?, libro_autor = ?, libro_enlace = ?, estado = ? 
                WHERE id = ?`,
                [titulo, contenido, resumen, imagen, categoria, tipo, url_video, libro_autor, libro_enlace, estado, id]
            );
            
            console.log('✏️ Modelo POST UPDATE - Resultado completo:', result);
            
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
            
            console.log('✏️ Modelo POST UPDATE - Affected Rows:', affectedRows);
            return affectedRows > 0;
            
        } catch (error) {
            console.error('❌ Modelo POST UPDATE - Error:', error);
            throw error;
        }
    },

    // Eliminar post
    delete: async (id) => {
        try {
            console.log('🗑️ Modelo POST DELETE - Eliminando post ID:', id);
            
            const result = await db.execute('DELETE FROM posts WHERE id = ?', [id]);
            
            console.log('🗑️ Modelo POST DELETE - Resultado completo:', result);
            
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
            
            console.log('🗑️ Modelo POST DELETE - Affected Rows:', affectedRows);
            return affectedRows > 0;
            
        } catch (error) {
            console.error('❌ Modelo POST DELETE - Error:', error);
            throw error;
        }
    },

    // Obtener posts por categoría
    getByCategory: async (categoria) => {
        try {
            console.log('📝 Modelo POST: Obteniendo posts por categoría:', categoria);
            
            const result = await db.execute('SELECT * FROM posts WHERE categoria = ? AND estado = "publicado" ORDER BY created_at DESC', [categoria]);
            
            let posts = [];
            
            if (Array.isArray(result) && result.length > 0) {
                if (Array.isArray(result[0])) {
                    posts = result[0];
                } else if (result[0]) {
                    posts = result;
                }
            } else if (result) {
                posts = result;
            }
            
            if (!Array.isArray(posts)) {
                posts = [posts];
            }
            
            console.log(`📝 Modelo POST: ${posts.length} posts encontrados en categoría ${categoria}`);
            return posts;
            
        } catch (error) {
            console.error('❌ Error en Post.getByCategory:', error);
            throw error;
        }
    },

    // Obtener posts por tipo
    getByType: async (tipo) => {
        try {
            console.log('📝 Modelo POST: Obteniendo posts por tipo:', tipo);
            
            const result = await db.execute('SELECT * FROM posts WHERE tipo = ? AND estado = "publicado" ORDER BY created_at DESC', [tipo]);
            
            let posts = [];
            
            if (Array.isArray(result) && result.length > 0) {
                if (Array.isArray(result[0])) {
                    posts = result[0];
                } else if (result[0]) {
                    posts = result;
                }
            } else if (result) {
                posts = result;
            }
            
            if (!Array.isArray(posts)) {
                posts = [posts];
            }
            
            return posts;
            
        } catch (error) {
            console.error('❌ Error en Post.getByType:', error);
            throw error;
        }
    },

    // Buscar posts
    search: async (query) => {
        try {
            console.log('🔍 Modelo POST: Buscando posts con query:', query);
            
            const result = await db.execute(
                'SELECT * FROM posts WHERE (titulo LIKE ? OR contenido LIKE ? OR resumen LIKE ?) AND estado = "publicado" ORDER BY created_at DESC',
                [`%${query}%`, `%${query}%`, `%${query}%`]
            );
            
            let posts = [];
            
            if (Array.isArray(result) && result.length > 0) {
                if (Array.isArray(result[0])) {
                    posts = result[0];
                } else if (result[0]) {
                    posts = result;
                }
            } else if (result) {
                posts = result;
            }
            
            if (!Array.isArray(posts)) {
                posts = [posts];
            }
            
            console.log(`🔍 Modelo POST: ${posts.length} posts encontrados en búsqueda`);
            return posts;
            
        } catch (error) {
            console.error('❌ Error en Post.search:', error);
            throw error;
        }
    }
};

module.exports = Post;