const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { validar } = require('../middleware/validacion');
const { enviarConsulta } = require('../controllers/contactoController');

const contactoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Demasiadas solicitudes, intente más tarde' },
});

router.post(
  '/',
  contactoLimiter,
  [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('El email no es válido'),
    body('mensaje').notEmpty().withMessage('El mensaje es requerido'),
  ],
  validar,
  enviarConsulta
);

module.exports = router;
