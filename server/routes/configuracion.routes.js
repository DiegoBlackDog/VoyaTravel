const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');
const { obtener, actualizar } = require('../controllers/configuracionController');

// Public
router.get('/', obtener);

// Admin
router.put('/:clave', requireAuth, requireMinRole('admin'), actualizar);

module.exports = router;
