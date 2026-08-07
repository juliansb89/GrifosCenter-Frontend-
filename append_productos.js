const fs = require('fs');

const appendContent = `

// 6. Reporte: Productos más vendidos
export const getProductosMasVendidos = async (req, res) => {
    try {
        const query = \`
            SELECT p.Id_producto, p.nombre, SUM(d.cantidad) as total_vendido 
            FROM detalles_factura d 
            JOIN productos p ON d.Id_producto = p.Id_producto 
            JOIN facturas f ON d.Id_factura = f.Id_factura 
            WHERE f.estado != 'Cancelado' 
            GROUP BY p.Id_producto, p.nombre 
            ORDER BY total_vendido DESC 
            LIMIT 10
        \`;
        const [productos] = await pool.query(query);
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};

// 7. Reporte: Productos faltantes o con bajo stock
export const getProductosFaltantes = async (req, res) => {
    try {
        const [productos] = await pool.query('SELECT * FROM productos WHERE stock < 10 ORDER BY stock ASC');
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};
`;

const path = 'C:\\Users\\jjuli\\Desktop\\PROYECTO OFICIAL JSlaser\\Backend\\app\\controllers\\controller.productos.js';
fs.appendFileSync(path, appendContent);
console.log('Appended productos correctly');
