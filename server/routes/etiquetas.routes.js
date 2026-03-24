const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');
const { listar, crearCategoria, crear, actualizar, eliminar } = require('../controllers/etiquetaController');

// Public
router.get('/', listar);

// Editor+
router.post('/categorias', requireAuth, requireMinRole('editor'), crearCategoria);
router.post('/', requireAuth, requireMinRole('editor'), crear);
router.put('/:id', requireAuth, requireMinRole('editor'), actualizar);

// Admin
router.delete('/:id', requireAuth, requireMinRole('admin'), eliminar);

module.exports = router;
