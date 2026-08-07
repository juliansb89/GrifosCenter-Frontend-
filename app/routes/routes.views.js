const express = require('express');
const router = express.Router();
const viewsController = require('../controllers/controller.views');
const { verifySession, verifyRole } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', viewsController.getHome);
router.get('/login', viewsController.getLogin);
router.post('/login', viewsController.postLogin);
router.post('/register', viewsController.postRegister);
router.get('/logout', viewsController.logout);
router.get('/catalogo', viewsController.getCatalogo);
router.get('/categoria/:id', viewsController.getProductosPorCategoria);
router.get('/categorias', viewsController.getCategorias);
router.get('/mi-carrito', viewsController.getCarrito);
router.post('/checkout', viewsController.postCheckout);
router.get('/soporte', viewsController.getSoporte);
router.get('/mis-facturas', viewsController.getMisFacturas);

// Rutas protegidas (Requieren sesión)
router.use(verifySession);

router.get('/menu', viewsController.getMenu);
router.get('/dashboard-admin', verifyRole('Empleado'), viewsController.getDashboardAdmin);

// Rutas Administrativas (Solo Empleados)
const modulos = ['empleados', 'clientes-admin', 'productos', 'facturacion', 'usuarios', 'cupones'];

modulos.forEach(modulo => {
    // Listar
    router.get(`/${modulo}`, verifyRole('Empleado'), (req, res) => viewsController.getList(req, res, modulo));
    // Crear (Mostrar formulario y Procesar)
    router.get(`/${modulo}/crear`, verifyRole('Empleado'), (req, res) => viewsController.getCrear(req, res, modulo));
    router.post(`/${modulo}/crear`, verifyRole('Empleado'), (req, res) => viewsController.postCrear(req, res, modulo));
    // Editar (Mostrar formulario y Procesar)
    router.get(`/${modulo}/editar/:id`, verifyRole('Empleado'), (req, res) => viewsController.getEditar(req, res, modulo));
    router.post(`/${modulo}/editar/:id`, verifyRole('Empleado'), (req, res) => viewsController.postEditar(req, res, modulo));
});

module.exports = router;
