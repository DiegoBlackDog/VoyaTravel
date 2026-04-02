const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');
const comprimirImagen = require('../middleware/comprimirImagen');
const ctrl = require('../controllers/cotizacionController');

const uploadDir = path.join(__dirname, '../uploads/cotizaciones');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const imgStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `cot_${Date.now()}${ext}`);
  },
});
const imgUpload = multer({ storage: imgStorage, limits: { fileSize: 20 * 1024 * 1024 } });

// Public — no auth required
router.get('/public/:token', ctrl.obtenerPorToken);

// Upload imagen (must be before /:id routes)
router.post('/upload-imagen', requireAuth, requireMinRole('editor'), imgUpload.single('imagen'), comprimirImagen(1200), ctrl.uploadImagen);

// Editor+
router.get('/',    requireAuth, requireMinRole('editor'), ctrl.listar);
router.get('/:id', requireAuth, requireMinRole('editor'), ctrl.obtenerPorId);
router.post('/',   requireAuth, requireMinRole('editor'), ctrl.crear);
router.put('/:id', requireAuth, requireMinRole('editor'), ctrl.actualizar);
router.post('/:id/duplicar', requireAuth, requireMinRole('editor'), ctrl.duplicar);
router.delete('/:id', requireAuth, requireMinRole('editor'), ctrl.eliminar);

module.exports = router;
