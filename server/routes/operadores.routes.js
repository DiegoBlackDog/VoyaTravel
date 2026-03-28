const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');
const { listar, crear, actualizar, eliminar } = require('../controllers/operadorController');

router.get('/', requireAuth, requireMinRole('editor'), listar);
router.post('/', requireAuth, requireMinRole('editor'), crear);
router.put('/:id', requireAuth, requireMinRole('editor'), actualizar);
router.delete('/:id', requireAuth, requireMinRole('admin'), eliminar);

module.exports = router;
