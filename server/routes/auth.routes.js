const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { validar } = require('../middleware/validacion');
const { requireAuth } = require('../middleware/auth');
const { login, logout, me } = require('../controllers/authController');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de inicio de sesión. Intente de nuevo en 15 minutos.' },
});

router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('contrasena').notEmpty().withMessage('La contraseña es requerida'),
  ],
  validar,
  login
);

router.post('/logout', requireAuth, logout);

router.get('/me', me);

module.exports = router;
