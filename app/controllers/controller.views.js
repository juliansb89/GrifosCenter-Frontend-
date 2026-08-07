const axios = require('axios');
require('dotenv').config();

// URL Base del Backend
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000/api';

const viewsController = {
    getHome: (req, res) => {
        // Redirigir la raíz al catálogo (página principal estilo E-commerce)
        res.redirect('/catalogo');
    },

    getLogin: (req, res) => {
        // Si ya tiene sesión, redirigir al menú
        if (req.cookies.token) {
            return res.redirect('/menu');
        }
        res.render('login', { title: 'Login - Grifos Center', error: null });
    },

    postLogin: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            // Conexión real con el Backend para validar credenciales y obtener JWT
            const response = await axios.post(`${BACKEND_URL}/login`, { email, password });
            
            // Asumimos que el backend envía: { token: '...', role: 'Empleado', name: 'Juan', userId: 1 }
            const { token, role, name, userId } = response.data;
            
            // Guardamos el JWT real en la cookie
            res.cookie('token', token, { httpOnly: true });
            res.cookie('role', role, { httpOnly: true });
            res.cookie('name', name || 'Usuario');
            res.cookie('userId', userId);

            res.redirect('/menu');
        } catch (error) {
            console.error('Error en login:', error.message);
            res.render('login', { title: 'Login', error: 'Credenciales inválidas o error de red' });
        }
    },

    postRegister: async (req, res) => {
        try {
            const { nombre_completo, email, password, tipo, clave_admin } = req.body;
            
            // Llamar al backend para registrar
            await axios.post(`${BACKEND_URL}/login/register`, {
                nombre_completo,
                email,
                password,
                tipo,
                clave_admin
            });

            // Si se registra con éxito, hacer login automáticamente
            const loginResponse = await axios.post(`${BACKEND_URL}/login`, { email, password });
            const { token, role, name, userId } = loginResponse.data;
            
            res.cookie('token', token, { httpOnly: true });
            res.cookie('role', role, { httpOnly: true });
            res.cookie('name', name || 'Usuario');
            res.cookie('userId', userId);

            res.redirect('/menu');
        } catch (error) {
            console.error('Error en registro:', error.message);
            const errorMessage = error.response?.data?.message || 'Error al intentar registrarse';
            res.render('login', { title: 'Login', error: errorMessage });
        }
    },

    logout: (req, res) => {
        res.clearCookie('token');
        res.clearCookie('role');
        res.clearCookie('name');
        res.clearCookie('userId');
        res.redirect('/');
    },

    getMenu: (req, res) => {
        const role = req.cookies.role;
        const name = req.cookies.name;
        res.render('menu', { title: 'Menú Principal', role, name });
    },

    getDashboardAdmin: async (req, res) => {
        const role = req.cookies.role;
        const name = req.cookies.name;
        const token = req.cookies.token;
        
        let ingresos = 0;
        let historialMensual = [];
        let masVendidos = [];
        let faltantes = [];

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const [ingresosRes, masVendidosRes, faltantesRes] = await Promise.all([
                axios.get(`${BACKEND_URL}/facturas/reportes/ingresos`, config),
                axios.get(`${BACKEND_URL}/productos/reportes/mas-vendidos`, config),
                axios.get(`${BACKEND_URL}/productos/reportes/faltantes`, config)
            ]);

            ingresos = ingresosRes.data.ingresos_totales;
            historialMensual = ingresosRes.data.historial_mensual || [];
            masVendidos = masVendidosRes.data;
            faltantes = faltantesRes.data;
        } catch (error) {
            console.error('Error cargando dashboard admin:', error.message);
        }

        res.render('dashboard-admin', { 
            title: 'Dashboard Administrativo', 
            role, 
            name, 
            ingresos, 
            historialMensual,
            masVendidos, 
            faltantes 
        });
    },

    getList: async (req, res, modulo) => {
        const role = req.cookies.role;
        const name = req.cookies.name;
        const token = req.cookies.token;
        
        let items = [];
        try {
            let backendPath = modulo.toLowerCase();
            if (backendPath === 'clientes-admin') backendPath = 'clientes';
            if (backendPath === 'facturacion') backendPath = 'facturas';

            const response = await axios.get(`${BACKEND_URL}/${backendPath}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            items = response.data;
        } catch (error) {
            console.error(`Error obteniendo ${modulo}:`, error.message);
        }
        
        let moduloTitulo = modulo.charAt(0).toUpperCase() + modulo.slice(1);
        if (modulo === 'productos') {
            moduloTitulo = 'Productos y Servicios';
        }
        
        let errorMsg = req.query.error || null;
        res.render('listar', { title: `Gestión de ${moduloTitulo}`, modulo, items, role, name, error: errorMsg });
    },

    getCrear: async (req, res, modulo) => {
        const role = req.cookies.role;
        const name = req.cookies.name;
        const fields = getFieldsForModulo(modulo);
        let moduloTitulo = modulo.charAt(0).toUpperCase() + modulo.slice(1);
        if (modulo === 'productos') {
            moduloTitulo = 'Productos y Servicios';
        }
        let errorMsg = req.query.error || null;
        res.render('crear', { title: `Crear ${moduloTitulo}`, modulo, fields, role, name, error: errorMsg });
    },

    postCrear: async (req, res, modulo) => {
        try {
            let backendPath = modulo.toLowerCase();
            if (backendPath === 'clientes-admin') backendPath = 'clientes';
            if (backendPath === 'facturacion') backendPath = 'facturas';

            const formData = req.body;
            await axios.post(`${BACKEND_URL}/${backendPath}`, formData);
            res.redirect(`/${modulo}`);
        } catch (error) {
            console.error(`Error creando ${modulo}:`, error.message);
            const msg = error.response?.data?.message || 'Error al intentar guardar el registro';
            res.redirect(`/${modulo}/crear?error=${encodeURIComponent(msg)}`);
        }
    },

    getEditar: async (req, res, modulo) => {
        const role = req.cookies.role;
        const name = req.cookies.name;
        const token = req.cookies.token;
        const { id } = req.params;
        const fields = getFieldsForModulo(modulo);
        let moduloTitulo = modulo.charAt(0).toUpperCase() + modulo.slice(1);
        if (modulo === 'productos') {
            moduloTitulo = 'Productos y Servicios';
        }
        
        let data = {};
        try {
            let backendPath = modulo.toLowerCase();
            if (backendPath === 'clientes-admin') backendPath = 'clientes';
            if (backendPath === 'facturacion') backendPath = 'facturas';

            const response = await axios.get(`${BACKEND_URL}/${backendPath}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // El backend a veces devuelve un arreglo, si es arreglo tomamos el primero
            data = Array.isArray(response.data) ? response.data[0] : response.data;
        } catch (error) {
            console.error(`Error cargando datos para editar ${modulo}:`, error.message);
        }
        
        res.render('editar', { title: `Editar ${moduloTitulo}`, modulo, fields, data, id, role, name });
    },

    postEditar: async (req, res, modulo) => {
        try {
            let backendPath = modulo.toLowerCase();
            if (backendPath === 'clientes-admin') backendPath = 'clientes';
            if (backendPath === 'facturacion') backendPath = 'facturas';

            const { id } = req.params;
            const formData = req.body;
            await axios.put(`${BACKEND_URL}/${backendPath}/${id}`, formData);
            res.redirect(`/${modulo}`);
        } catch (error) {
            console.error(`Error editando ${modulo}:`, error.message);
            const msg = error.response?.data?.message || 'Error al actualizar el registro';
            res.redirect(`/${modulo}?error=${encodeURIComponent(msg)}`);
        }
    },

    getCatalogo: async (req, res) => {
        const role = req.cookies.role || null;
        const name = req.cookies.name || null;
        
        let categorias = [];
        try {
            // Conexión real a la base de datos para traer las categorías
            const response = await axios.get(`${BACKEND_URL}/categorias`);
            categorias = response.data;
        } catch (error) {
            console.error('Error al cargar categorias:', error.message);
        }

        res.render('catalogo', { title: 'Catálogo de Categorías', categorias, role, name });
    },

    getProductosPorCategoria: async (req, res) => {
        const role = req.cookies.role || null;
        const name = req.cookies.name || null;
        const categoriaId = req.params.id; // ID numérico real de la categoría (ej: 1, 2)

        let productosFiltrados = [];
        let tituloCategoria = 'Productos';

        try {
            // Traer todos los productos y filtrar (o crear una ruta en backend /api/categorias/:id/productos)
            const responseProductos = await axios.get(`${BACKEND_URL}/productos`);
            const todosLosProductos = responseProductos.data;
            
            // Filtrar por el id de la categoría (el backend manda ints, la url puede ser string, así que usamos ==)
            productosFiltrados = todosLosProductos.filter(p => p.id_categoria == categoriaId || p.Id_categoria == categoriaId);

            // Obtener el nombre de la categoría actual para el título
            const responseCategorias = await axios.get(`${BACKEND_URL}/categorias`);
            const categorias = responseCategorias.data;
            const categoriaActual = categorias.find(c => c.id_categoria == categoriaId);
            
            if (categoriaActual) {
                tituloCategoria = categoriaActual.nombre;
            }
        } catch (error) {
            console.error('Error al cargar productos:', error.message);
        }

        res.render('productos-categoria', { 
            title: tituloCategoria, 
            categoriaId,
            items: productosFiltrados, 
            role, 
            name 
        });
    },

    getCarrito: (req, res) => {
        const role = req.cookies.role || null;
        const name = req.cookies.name || null;
        res.render('carrito', { title: 'Mi Carrito', role, name });
    },

    postCheckout: async (req, res) => {
        try {
            const token = req.cookies.token;
            const id_cliente = req.cookies.userId;
            const role = req.cookies.role;
            const { total, carrito, codigo_cupon } = req.body;
            
            if (!id_cliente || !token) {
                return res.status(401).json({ success: false, message: 'Debes iniciar sesión para comprar' });
            }

            if (role !== 'Cliente') {
                return res.status(403).json({ success: false, message: 'Los empleados no pueden realizar compras. Inicia sesión como Cliente.' });
            }
            
            const payload = { id_cliente, total, carrito };
            if (codigo_cupon) {
                payload.codigo_cupon = codigo_cupon;
            }

            const response = await axios.post(`${BACKEND_URL}/facturas`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            res.status(200).json({ success: true, id_factura: response.data.id_factura });
        } catch (error) {
            console.error('Error al procesar checkout:', error.message);
            res.status(500).json({ success: false, message: 'Error procesando la factura' });
        }
    },

    getCategorias: (req, res) => {
        const role = req.cookies.role || null;
        const name = req.cookies.name || null;
        res.render('categorias', { title: 'Categorías', role, name });
    },

    getMisFacturas: async (req, res) => {
        const role = req.cookies.role || null;
        const name = req.cookies.name || null;
        const id_cliente = req.cookies.userId;
        const token = req.cookies.token;

        let facturas = [];
        try {
            if (id_cliente && token) {
                const response = await axios.get(`${BACKEND_URL}/facturas`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Filtrar facturas que correspondan a este cliente
                const facturasCliente = response.data.filter(f => f.Id_cliente == id_cliente);
                
                // Formatear para la vista
                facturas = facturasCliente.map(f => ({
                    id: f.Id_factura,
                    fecha: new Date(f.fecha).toLocaleDateString('es-CO'),
                    raw_fecha: f.fecha, // para el cálculo en JS
                    total: parseFloat(f.total),
                    estado: f.estado || 'Completado'
                }));
            }
        } catch (error) {
            console.error('Error al cargar mis facturas:', error.message);
        }

        res.render('mis-facturas', { title: 'Mis Compras', facturas, role, name });
    },

    getSoporte: (req, res) => {
        const role = req.cookies.role || null;
        const name = req.cookies.name || null;
        res.render('soporte', { title: 'Soporte Técnico', role, name });
    }
};

// Helper para definir los campos de cada formulario según la tabla
function getFieldsForModulo(modulo) {
    switch (modulo) {
        case 'clientes-admin':
            return [
                { name: 'nombre_completo', label: 'Nombre Completo', type: 'text', required: true },
                { name: 'email', label: 'Correo Electrónico', type: 'email', required: true },
                { name: 'password', label: 'Contraseña', type: 'password', required: true },
                { name: 'telefono', label: 'Teléfono', type: 'text', required: true },
                { name: 'direccion', label: 'Dirección', type: 'text', required: true }
            ];
        case 'empleados':
            return [
                { name: 'nombre_completo', label: 'Nombre Completo', type: 'text', required: true },
                { name: 'email', label: 'Correo Electrónico', type: 'email', required: true },
                { name: 'password', label: 'Contraseña', type: 'password', required: true },
                { name: 'cargo', label: 'Cargo', type: 'text', required: true },
                { name: 'salario', label: 'Salario ($)', type: 'number', required: true }
            ];
        case 'usuarios':
            return [
                { name: 'nombre_completo', label: 'Nombre Completo', type: 'text', required: true },
                { name: 'email', label: 'Correo Electrónico', type: 'email', required: true },
                { name: 'password', label: 'Contraseña', type: 'password', required: true },
                { name: 'rol', label: 'Rol de Usuario', type: 'text', required: true }
            ];
        case 'productos':
            return [
                { 
                    name: 'id_categoria', 
                    label: 'Categoría', 
                    type: 'select', 
                    options: [
                        { value: 1, text: 'Grifería para Baños' },
                        { value: 2, text: 'Grifería para Cocina' },
                        { value: 3, text: 'Tinas y Spas' },
                        { value: 4, text: 'Accesorios' },
                        { value: 5, text: 'Eléctricos y Cocina' }
                    ],
                    required: true 
                },
                { name: 'nombre', label: 'Nombre del Producto', type: 'text', required: true },
                { name: 'descripcion', label: 'Descripción', type: 'text', required: true },
                { name: 'precio', label: 'Precio ($)', type: 'number', required: true },
                { name: 'stock', label: 'Stock Disponible', type: 'number', required: true },
                { name: 'imagen_url', label: 'URL de la Imagen (pega el link aquí)', type: 'text', required: false }
            ];
        case 'facturacion':
            return [
                { name: 'id_cliente', label: 'ID Cliente', type: 'number', required: true },
                { name: 'total', label: 'Total ($)', type: 'number', required: true }
            ];
        case 'cupones':
            return [
                { name: 'nombre', label: 'Nombre del Cupón', type: 'text', required: true },
                { name: 'codigo', label: 'Código', type: 'text', required: true },
                { name: 'descuento_porcentaje', label: 'Descuento (%)', type: 'number', required: true }
            ];
        default:
            return [];
    }
}

module.exports = viewsController;
