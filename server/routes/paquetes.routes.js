const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { body } = require('express-validator');
const { validar } = require('../middleware/validacion');
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');
const {
  listar,
  destacados,
  obtenerPorId,
  obtenerPorSlug,
  crear,
  actualizar,
  toggleDisponible,
  eliminar,
  uploadItinerarioImagen,
} = require('../controllers/paqueteController');

const uploadDir = path.join(__dirname, '../uploads/itinerarios');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const imgStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `itin_${Date.now()}${ext}`);
  },
});
const imgUpload = multer({ storage: imgStorage, limits: { fileSize: 8 * 1024 * 1024 } });

// Upload (before /:slug wildcard)
router.post('/upload-itinerario-imagen', requireAuth, requireMinRole('editor'), imgUpload.single('imagen'), uploadItinerarioImagen);

// Public
router.get('/', listar);
router.get('/destacados', destacados);
router.get('/id/:id', requireAuth, requireMinRole('editor'), obtenerPorId);
router.get('/:slug', obtenerPorSlug);

// Editor+
router.post(
  '/',
  requireAuth,
  requireMinRole('editor'),
  [
    body('titulo').notEmpty().withMessage('El titulo es requerido'),
    body('slug').notEmpty().withMessage('El slug es requerido'),
    body('duracion_dias').if(body('duracion_dias').notEmpty()).isInt({ min: 1 }).withMessage('La duracion en dias debe ser un entero positivo'),
    body('precio_adulto').if(body('precio_adulto').notEmpty()).isFloat({ min: 0 }).withMessage('El precio adulto debe ser un numero positivo'),
  ],
  validar,
  crear
);

router.put('/:id', requireAuth, requireMinRole('editor'), actualizar);
router.patch('/:id/disponible', requireAuth, requireMinRole('editor'), toggleDisponible);

// Admin
router.delete('/:id', requireAuth, requireMinRole('admin'), eliminar);

module.exports = router;
