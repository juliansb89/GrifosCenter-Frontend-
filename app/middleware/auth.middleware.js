const authMiddleware = {
    verifySession: (req, res, next) => {
        const token = req.cookies.token;
        if (!token) {
            return res.redirect('/login');
        }
        // Aquí podríamos validar el token contra el backend o desencriptarlo
        next();
    },

    verifyRole: (requiredRole) => {
        return (req, res, next) => {
            const userRole = req.cookies.role;
            
            // Si la ruta requiere 'Empleado', permitimos a cualquier trabajador interno (Administrador, etc.) que no sea 'Cliente'
            if (requiredRole === 'Empleado' && userRole && userRole !== 'Cliente') {
                return next();
            }
            
            if (userRole !== requiredRole) {
                return res.status(403).send('Acceso denegado: No tienes los permisos necesarios.');
            }
            next();
        };
    }
};

module.exports = authMiddleware;
