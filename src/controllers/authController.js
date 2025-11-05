const Admin = require('../models/admin');
const { generateToken } = require('../utils/jwt');
const db = require('../models/db'); 



// Función para login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
           console.log('🔐 Intento de login:', { 
            email: email, 
            password: password ? '****' : 'undefined' 
            
        });



        // Validaciones
        if (!email || !password) {
            console.log('❌ Campos faltantes');
            return res.status(400).json({ 
                error: 'Email y contraseña son requeridos' 
            });
        }

        // Buscar administrador
        console.log('🔍 Buscando admin en BD para email:', email);
        const admin = await Admin.findByEmail(email);

        if (!admin) {
            console.log('❌ Admin no encontrado en BD para email:', email);
            return res.status(401).json({ 
                error: 'Credenciales incorrectas' 
            });
            
        }
        console.log('✅ Admin encontrado en BD:', {
            id: admin.id,
            email: admin.email,
            nombre: admin.nombre,
            passwordHash: admin.password ? '****' : 'undefined'
        });
           
             // Verificar contraseña

             console.log('🔑 Verificando contraseña...');
             console.log('Password input:', password);
             console.log('Password hash en BD:', admin.password);

        const isValidPassword = await Admin.verifyPassword(password, admin.password);
        console.log('🔑 Resultado de verificación:', isValidPassword);
        if (!isValidPassword) {
            console.log('❌ Contraseña INCORRECTA');
            console.log('Input:', password);
            console.log('Hash en BD:', admin.password);
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }
            console.log('✅ Contraseña VÁLIDA - Login exitoso');
        
        
            // Generar token
        const token = generateToken({
            id: admin.id,
            nombre: admin.nombre,
            email: admin.email
        });

        res.json({
            message: 'Login exitoso',
            token,
            admin: {
                id: admin.id,
                nombre: admin.nombre,
                email: admin.email
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


// Función para registro
const register = async (req, res) => {
    try {
        const { nombre, email, password, confirmPassword } = req.body;

        // Validaciones
        if (!nombre || !email || !password || !confirmPassword) {
            return res.status(400).json({ 
                error: 'Todos los campos son requeridos' 
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ 
                error: 'Las contraseñas no coinciden' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'La contraseña debe tener al menos 6 caracteres' 
            });
        }

        // Verificar si el email ya existe
        const existingAdmin = await Admin.findByEmail(email);
        if (existingAdmin) {
            return res.status(400).json({ 
                error: 'El email ya está registrado' 
            });
        }

        // Crear administrador
        const adminId = await Admin.create(nombre, email, password);

        res.status(201).json({ 
            message: 'Administrador creado exitosamente',
            adminId 
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    login,
    register
};