const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { sessionConfig } = require('./config/session');
const { sequelize } = require('./models');

const app = express();

// ── Middleware ──
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionConfig));

// ── Static uploads — allow cross-origin image loading in dev ──
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// ── API Routes ──
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/paquetes', require('./routes/paquetes.routes'));
app.use('/api/etiquetas', require('./routes/etiquetas.routes'));
app.use('/api/destinos', require('./routes/destinos.routes'));
app.use('/api/imagenes', require('./routes/imagenes.routes'));
app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api/contacto', require('./routes/contacto.routes'));
app.use('/api/testimonios', require('./routes/testimonios.routes'));
app.use('/api/configuracion', require('./routes/configuracion.routes'));
app.use('/api/hoteles', require('./routes/hoteles.routes'));
app.use('/api/operadores', require('./routes/operadores.routes'));
app.use('/api/cotizaciones', require('./routes/cotizaciones.routes'));
app.use('/api/aeropuertos', require('./routes/aeropuertos.routes'));
app.use('/api/aerolineas',  require('./routes/aerolineas.routes'));

// ── Production: serve client build ──
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message,
  });
});

// ── Start server ──
const PORT = process.env.PORT || 4000;

sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}).catch((err) => {
  console.error('Error al sincronizar la base de datos:', err);
  process.exit(1);
});

module.exports = app;
