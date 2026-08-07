const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const viewsRoutes = require('./app/routes/routes.views');

const app = express();
const PORT = process.env.PORT || 4000;

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/', viewsRoutes);

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).render('404', { title: 'Página no encontrada' });
});

app.listen(PORT, () => {
    console.log(`Frontend ejecutándose en http://localhost:${PORT}`);
});
