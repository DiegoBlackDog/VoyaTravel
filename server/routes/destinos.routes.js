const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');
const { listar, crear, actualizar, eliminar, subirImagen } = require('../controllers/destinoController');

const uploadDestino = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/destinos/')),
    filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
  }),
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(allowed.includes(file.mimetype) ? null : new Error('Solo JPEG, PNG o WebP'), allowed.includes(file.mimetype));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Public
router.get('/', listar);

// Editor+
router.post('/', requireAuth, requireMinRole('editor'), crear);
router.put('/:id', requireAuth, requireMinRole('editor'), actualizar);
router.post('/:id/imagen', requireAuth, requireMinRole('editor'), uploadDestino.single('imagen'), subirImagen);

// Admin
router.delete('/:id', requireAuth, requireMinRole('admin'), eliminar);

module.exports = router;
