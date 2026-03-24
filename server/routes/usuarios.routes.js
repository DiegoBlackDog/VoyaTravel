const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');
const { listar, crear, actualizar, eliminar } = require('../controllers/usuarioController');

// All routes require admin
router.use(requireAuth, requireMinRole('admin'));

router.get('/', listar);
router.post('/', crear);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

module.exports = router;
