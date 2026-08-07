const mysql = require('mysql2/promise');

async function migrate() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'grifos center'
    });

    try {
        console.log('Creando tabla cupones...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cupones (
                Id_cupon INT AUTO_INCREMENT PRIMARY KEY,
                codigo VARCHAR(50) NOT NULL UNIQUE,
                descuento_porcentaje DECIMAL(5,2) NOT NULL,
                activo BOOLEAN DEFAULT TRUE
            );
        `);

        console.log('Insertando cupones de prueba...');
        await pool.query(`
            INSERT IGNORE INTO cupones (codigo, descuento_porcentaje) VALUES 
            ('BIENVENIDA10', 10.00),
            ('DESCUENTO20', 20.00),
            ('GRIFOS50', 50.00);
        `);

        console.log('Agregando columna estado a facturas...');
        try {
            await pool.query(`
                ALTER TABLE facturas ADD COLUMN estado VARCHAR(20) DEFAULT 'Completado';
            `);
            console.log('Columna estado agregada.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('La columna estado ya existe, ignorando.');
            } else {
                throw err;
            }
        }

        console.log('Migración completada con éxito.');
    } catch (error) {
        console.error('Error durante la migración:', error);
    } finally {
        await pool.end();
    }
}

migrate();
