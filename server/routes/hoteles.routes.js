const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');
const { listar, crear, actualizar, eliminar, upsert } = require('../controllers/hotelController');

router.get('/', requireAuth, requireMinRole('editor'), listar);
router.post('/', requireAuth, requireMinRole('editor'), crear);
router.post('/upsert', requireAuth, requireMinRole('editor'), upsert);
router.put('/:id', requireAuth, requireMinRole('editor'), actualizar);
router.delete('/:id', requireAuth, requireMinRole('admin'), eliminar);

module.exports = router;
