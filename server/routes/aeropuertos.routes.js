const router = require('express').Router();
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');
const ctrl = require('../controllers/aeropuertoController');

const memUpload = multer({ storage: multer.memoryStorage() });
const auth = [requireAuth, requireMinRole('editor')];

router.get('/',       ...auth, ctrl.listar);
router.get('/:id',    ...auth, ctrl.obtenerPorId);
router.post('/',      ...auth, ctrl.crear);
router.put('/:id',    ...auth, ctrl.actualizar);
router.delete('/:id', ...auth, ctrl.eliminar);
router.post('/importar/excel', ...auth, memUpload.single('archivo'), ctrl.importarExcel);

module.exports = router;
