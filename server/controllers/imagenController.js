const fs = require('fs');
const path = require('path');
const { ImagenPaquete } = require('../models');

// ── subir ── handle req.files array, create ImagenPaquete records
const subir = async (req, res, next) => {
  try {
    const { paqueteId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se enviaron imágenes' });
    }

    const imagenes = await Promise.all(
      req.files.map((file, index) =>
        ImagenPaquete.create({
          paquete_id: paqueteId,
          ruta_imagen: `/uploads/paquetes/${file.filename}`,
          orden: index,
          es_portada: false,
        })
      )
    );

    res.status(201).json({ imagenes });
  } catch (err) {
    next(err);
  }
};

// ── eliminar ── delete file from disk + delete record
const eliminar = async (req, res, next) => {
  try {
    const imagen = await ImagenPaquete.findByPk(req.params.id);
    if (!imagen) return res.status(404).json({ error: 'Imagen no encontrada' });

    // Delete file from disk
    const filePath = path.join(__dirname, '..', imagen.ruta_imagen);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await imagen.destroy();
    res.json({ mensaje: 'Imagen eliminada correctamente' });
  } catch (err) {
    next(err);
  }
};

// ── actualizarOrden ── update orden and es_portada
const actualizarOrden = async (req, res, next) => {
  try {
    const imagen = await ImagenPaquete.findByPk(req.params.id);
    if (!imagen) return res.status(404).json({ error: 'Imagen no encontrada' });

    const { orden, es_portada } = req.body;
    await imagen.update({ orden, es_portada });
    res.json({ imagen });
  } catch (err) {
    next(err);
  }
};

module.exports = { subir, eliminar, actualizarOrden };
