
const { pool, execute } = require('./src/models/db'); 

const debugAdmin = async () => {
    try {
        const email = 'baezpamelaj@gmail.com';
        
        console.log('🔍 Buscando admin con email:', email);
        
      
        
        // 1. Primero probar la conexión
        try {
            const connection = await pool.getConnection();
            console.log('✅ Conexión a BD establecida');
            connection.release();
        } catch (connError) {
            console.error('❌ Error al conectar a BD:', connError.message);
            return;
        }
        
        // 2. Usar la función execute que ya tienes
        try {
            const rows = await execute(
                'SELECT * FROM administradores WHERE email = ?', 
                [email]
            );
            
            console.log('📊 Resultados encontrados:', rows.length);
            
            if (rows.length > 0) {
                console.log('✅ Admin encontrado:');
                console.log({
                    id: rows[0].id,
                    nombre: rows[0].nombre,
                    email: rows[0].email,
                    password: rows[0].password ? '**** (hash presente)' : 'NULL'
                });
                
                // Verificar el hash específico
                console.log('🔑 Hash almacenado:', rows[0].password);
                
            } else {
                console.log('❌ NO se encontró el admin');
            }
            
        } catch (queryError) {
            console.error('❌ Error en la consulta:', queryError.message);
        }
        
    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
};

debugAdmin();  