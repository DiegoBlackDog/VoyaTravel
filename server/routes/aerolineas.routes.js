const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');
const ctrl = require('../controllers/aerolineaController');

const imgStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/aerolineas/')),
  filename:    (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});
const imgUpload = multer({
  storage: imgStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fileSize: 3 * 1024 * 1024 },
});
const memUpload = multer({ storage: multer.memoryStorage() });
const auth = [requireAuth, requireMinRole('editor')];

router.get('/',       ...auth, ctrl.listar);
router.get('/:id',    ...auth, ctrl.obtenerPorId);
router.post('/',      ...auth, imgUpload.single('imagen'), ctrl.crear);
router.put('/:id',    ...auth, imgUpload.single('imagen'), ctrl.actualizar);
router.delete('/bulk', ...auth, ctrl.eliminarBulk);
router.delete('/:id', ...auth, ctrl.eliminar);
router.post('/importar/excel', ...auth, memUpload.single('archivo'), ctrl.importarExcel);

module.exports = router;
