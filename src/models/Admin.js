
const db = require('./db');
const bcrypt = require('bcrypt');
const { execute } = require('./db');

const findByEmail = async (email) => {
    try {
        console.log('🔍 [Admin.js] Buscando:', email);

        const rows = await execute(
            'SELECT * FROM administradores WHERE email = ?', 
            [email]
        );
        console.log('📊 [Admin.js] Resultados:', rows.length);
        
        // Verificar si rows existe y tiene al menos un elemento
        if (rows && rows.length > 0) {
            console.log('✅ [Admin.js] Admin encontrado');
            return rows[0]; 
        }
        console.log('❌ [Admin.js] Admin NO encontrado');
        return null; 
        
    } catch (error) {
        console.error('Error en findByEmail:', error);
        throw error;
    }
};


const create = async (nombre, email, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await execute(
            'INSERT INTO administradores (nombre, email, password) VALUES (?, ?, ?)',
            [nombre, email, hashedPassword]
        );
        return result.insertId;
    } catch (error) {
        console.error('Error en create:', error);
        throw error;
    }
};

const verifyPassword = async (plainPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        console.error('Error en verifyPassword:', error);
        throw error;
    }
};

module.exports = {
    findByEmail,
    create,
    verifyPassword
};
