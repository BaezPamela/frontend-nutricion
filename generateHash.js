// generateHash.js
const bcrypt = require('bcrypt');

const generateHash = async () => {
    try {
        const password = 'Pamelita2024!'; 
        
        // Generar el hash
        const hash = await bcrypt.hash(password, 10);
        
        console.log('🔐 Contraseña:', password);
        console.log('🔑 Hash generado:', hash);
        console.log('\n📋 Copia ESTE hash para usarlo en SQL:');
        console.log('================================');
        console.log(hash);
        console.log('================================');

    } catch (error) {
        console.error('❌ Error generando hash:', error);
    }
};

// Ejecutar la función
generateHash();