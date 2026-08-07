const fs = require('fs');

const appendContent = `

// 4. Validar cupón de descuento
export const validarCupon = async (req, res) => {
    try {
        const { codigo } = req.body;
        const [cupon] = await pool.query('SELECT * FROM cupones WHERE codigo = ? AND activo = TRUE', [codigo]);
        if (cupon.length === 0) return res.status(404).json({ message: 'Cupón no válido o expirado' });
        res.status(200).json(cupon[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al validar cupón', error: error.message });
    }
};

// 5. Cancelar factura/pedido
export const cancelarFactura = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE facturas SET estado = ? WHERE Id_factura = ?', ['Cancelado', id]);
        res.status(200).json({ message: 'Pedido cancelado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cancelar pedido', error: error.message });
    }
};

// 6. Reporte: Total de ingresos generados
export const getTotalIngresos = async (req, res) => {
    try {
        const query = "SELECT SUM(total) as ingresos_totales FROM facturas WHERE estado != 'Cancelado'";
        const [resultado] = await pool.query(query);
        res.status(200).json({ ingresos_totales: resultado[0].ingresos_totales || 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};
`;

const path = 'C:\\Users\\jjuli\\Desktop\\PROYECTO OFICIAL JSlaser\\Backend\\app\\controllers\\controller.facturas.js';
fs.appendFileSync(path, appendContent);
console.log('Appended facturas correctly');
