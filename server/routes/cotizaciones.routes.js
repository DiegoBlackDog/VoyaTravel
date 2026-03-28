const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');
const ctrl = require('../controllers/cotizacionController');

// Public — no auth required
router.get('/public/:token', ctrl.obtenerPorToken);

// Editor+
router.get('/',    requireAuth, requireMinRole('editor'), ctrl.listar);
router.get('/:id', requireAuth, requireMinRole('editor'), ctrl.obtenerPorId);
router.post('/',   requireAuth, requireMinRole('editor'), ctrl.crear);
router.put('/:id', requireAuth, requireMinRole('editor'), ctrl.actualizar);
router.post('/:id/duplicar', requireAuth, requireMinRole('editor'), ctrl.duplicar);
router.delete('/:id', requireAuth, requireMinRole('editor'), ctrl.eliminar);

module.exports = router;
