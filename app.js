require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const productoRoutes = require('./src/routes/productoRoutes');
const recetaRoutes = require('./src/routes/recetaRoutes');
const postRoutes = require('./src/routes/postRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const pedidoRoutes = require('./src/routes/pedidoRoutes');
const transaccionRoutes = require('./src/routes/transaccionRoutes');

const app = express();




// Middlewares
app.use(cors({
    origin:  ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/productos', productoRoutes);
app.use('/api/recetas', recetaRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/transacciones', transaccionRoutes);

// Importar y probar la base de datos
const db = require('./src/models/db');
db.testConnection().then(success => {
    if (!success) {
        console.log('⚠️  El servidor iniciará pero la base de datos no está conectada');
    }
});

// Rutas de API
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Rutas para páginas de admin
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin/login.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin/dashboard.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin/dashboard.html'));
});

// Ruta de la API principal - 
app.get('/api', (req, res) => {
    res.json({ 
        message: 'API de Nutrición Coaching',
        version: '1.0.0',
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register'
            },
            productos: {
                getAll: 'GET /api/productos',
                getById: 'GET /api/productos/:id',
                create: 'POST /api/productos',
                update: 'PUT /api/productos/:id',
                delete: 'DELETE /api/productos/:id'
            },
            recetas: {
                 getAll: 'GET /api/recetas',
                getById: 'GET /api/recetas/:id',
                create: 'POST /api/recetas',
                update: 'PUT /api/recetas/:id',
                delete: 'DELETE /api/recetas/:id',
                search: 'GET /api/recetas/search?query=...',
                byCategory: 'GET /api/recetas/categoria/:categoria'
            },
            posts: {
                // Rutas públicas
                publicados: 'GET /api/posts/public',
                porCategoria: 'GET /api/posts/public/categoria/:categoria',
                porTipo: 'GET /api/posts/public/tipo/:tipo',
                buscar: 'GET /api/posts/public/search?query=...',
                // Rutas admin
                getAll: 'GET /api/posts',
                getById: 'GET /api/posts/:id',
                create: 'POST /api/posts',
                update: 'PUT /api/posts/:id',
                delete: 'DELETE /api/posts/:id'
            },
            clientes: {
                getAll: 'GET /api/clientes',
                getById: 'GET /api/clientes/:id',
                create: 'POST /api/clientes',
                update: 'PUT /api/clientes/:id'
            },
            pedidos: {
                getAll: 'GET /api/pedidos',
                getById: 'GET /api/pedidos/:id',
                create: 'POST /api/pedidos',
                updateEstado: 'PUT /api/pedidos/:id/estado',
                estadisticas: 'GET /api/pedidos/estadisticas'
            },
            transacciones: {
                create: 'POST /api/transacciones',
                getByPedidoId: 'GET /api/transacciones/pedido/:pedido_id',
                updateEstado: 'PUT /api/transacciones/:transaccion_id/estado'
            }

        }
    });
});



// Ruta básica de inicio
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenido a Nutrición Coaching API',
        documentation: 'Visita /api para más información',
        admin: 'Visita /admin/login para acceder al panel'
    });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal!' });
});

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});
// Agrega esto antes de las otras rutas para debug
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'API funcionando',
        timestamp: new Date().toISOString()
    });
});





// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📋 API docs: http://localhost:${PORT}/api`);
    console.log(`🔐 Admin login: http://localhost:${PORT}/admin/login`);
    console.log(`🏠 Home: http://localhost:${PORT}`);
});
