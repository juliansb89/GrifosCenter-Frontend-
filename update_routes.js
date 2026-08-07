const fs = require('fs');

function updateRoutes() {
    const facturasPath = 'C:\\Users\\jjuli\\Desktop\\PROYECTO OFICIAL JSlaser\\Backend\\app\\routes\\routes.facturas.js';
    let facturasCode = fs.readFileSync(facturasPath, 'utf8');
    
    // Update import
    facturasCode = facturasCode.replace(
        "import { procesarFactura, getFacturas, getFacturaById } from '../controllers/controller.facturas.js';",
        "import { procesarFactura, getFacturas, getFacturaById, validarCupon, cancelarFactura, getTotalIngresos } from '../controllers/controller.facturas.js';"
    );
    
    // Add routes before export default router;
    const facturasRoutesToAdd = `
router.post('/cupones/validar', (req, res, next) => {
    // #swagger.tags = ['Facturas']
    next();
}, validarCupon);

router.put('/:id/cancelar', (req, res, next) => {
    // #swagger.tags = ['Facturas']
    next();
}, cancelarFactura);

router.get('/reportes/ingresos', (req, res, next) => {
    // #swagger.tags = ['Facturas']
    next();
}, getTotalIngresos);

`;
    facturasCode = facturasCode.replace('export default router;', facturasRoutesToAdd + 'export default router;');
    fs.writeFileSync(facturasPath, facturasCode);
    console.log('Facturas routes updated');

    const productosPath = 'C:\\Users\\jjuli\\Desktop\\PROYECTO OFICIAL JSlaser\\Backend\\app\\routes\\routes.productos.js';
    let productosCode = fs.readFileSync(productosPath, 'utf8');
    
    // Update import
    productosCode = productosCode.replace(
        "import { getProductos, getProductoById, crearProducto, actualizarProducto, eliminarProducto } from '../controllers/controller.productos.js';",
        "import { getProductos, getProductoById, crearProducto, actualizarProducto, eliminarProducto, getProductosMasVendidos, getProductosFaltantes } from '../controllers/controller.productos.js';"
    );
    
    // Add routes before export default router;
    const productosRoutesToAdd = `
router.get('/reportes/mas-vendidos', (req, res, next) => {
    // #swagger.tags = ['Productos']
    next();
}, getProductosMasVendidos);

router.get('/reportes/faltantes', (req, res, next) => {
    // #swagger.tags = ['Productos']
    next();
}, getProductosFaltantes);

`;
    productosCode = productosCode.replace('export default router;', productosRoutesToAdd + 'export default router;');
    fs.writeFileSync(productosPath, productosCode);
    console.log('Productos routes updated');
}

updateRoutes();
