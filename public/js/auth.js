// Variables globales
let adminToken = localStorage.getItem('adminToken');
let adminData = localStorage.getItem('adminData') ? JSON.parse(localStorage.getItem('adminData')) : null;

// Función para obtener datos del admin
function getAdminData() {
    const adminData = localStorage.getItem('adminData');
    return adminData ? JSON.parse(adminData) : null;
}

// Función para verificar autenticación
function checkAuthentication() {
    const adminToken = localStorage.getItem('adminToken');
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const currentPage = pathParts[pathParts.length - 1];

    console.log('🔍 Verificando autenticación:');
    console.log(' - Token:', adminToken ? 'SÍ' : 'NO');
    console.log(' - Página actual:', currentPage);
    console.log(' - Path completo:', currentPath);

    // Si estamos en login.html y YA tenemos token, redirigir a dashboard
    if (adminToken && (currentPage === 'login.html' || currentPage === '')) {
        console.log('✅ Ya autenticado, redirigiendo a dashboard...');
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Si estamos en dashboard.html y NO tenemos token, redirigir a login
    if (!adminToken && currentPage === 'dashboard.html') {
        console.log('❌ No autenticado, redirigiendo a login...');
        window.location.href = 'login.html';
        return false;
    }
    
    return adminToken && adminToken !== 'null';
}

// Función para hacer login
async function login(email, password) {
    try {
        // ✅ URL ABSOLUTA CORRECTA
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        // ✅ Manejar respuesta HTTP
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en login');
        }

        const data = await response.json();

        // Guardar token y datos en localStorage-
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        
        // Actualizar variables globales
        adminToken = data.token;
        adminData = data.admin;
        
        // Redirigir al dashboard
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message || 'Error de conexión', 'error');
    }
}

// Función para hacer logout
function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    adminToken = null;
    adminData = null;
    window.location.href = 'login.html';
}

// Función para mostrar mensajes
function showMessage(text, type = 'success') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = `message-${type}`;
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}
// Función para hacer peticiones autenticadas
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('adminToken');

    console.log('🔐 authFetch - URL:', url);
    console.log('🔐 authFetch - Token disponible:', token ? 'SÍ' : 'NO');
    console.log('🔐 authFetch - Token (inicio):', token ? token.substring(0, 20) + '...' : 'N/A');

    if (!token) {
        throw new Error('No hay token de autenticación');
    }

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    const mergedOptions = { ...defaultOptions, ...options };
    
    const response = await fetch(url, mergedOptions);
    
    // Si el token expiró, hacer logout
    if (response.status === 401) {
        logout();
        throw new Error('Sesión expirada');
    }

    // Si es otro error
    if (!response.ok) {
        console.error('❌ Error en la respuesta:', response.status);
        const errorText = await response.text();
        console.error('❌ Detalles del error:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
    }
     return response.json();
   
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();

    // Manejar formulario de login si existe
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            login(email, password);
        });
    }
});