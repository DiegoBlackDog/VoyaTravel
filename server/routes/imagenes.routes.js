const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');
const upload = require('../middleware/upload');
const comprimirImagen = require('../middleware/comprimirImagen');
const { subir, eliminar, actualizarOrden } = require('../controllers/imagenController');

// Editor+
router.post('/:paqueteId', requireAuth, requireMinRole('editor'), upload.array('imagenes', 10), comprimirImagen(1400), subir);
router.delete('/:id', requireAuth, requireMinRole('editor'), eliminar);
router.put('/:id/orden', requireAuth, requireMinRole('editor'), actualizarOrden);

module.exports = router;
