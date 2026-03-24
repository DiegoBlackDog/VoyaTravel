const { Destino } = require('../models');

// ── listar ──
const listar = async (req, res, next) => {
  try {
    const destinos = await Destino.findAll({ order: [['nombre', 'ASC']] });
    res.json({ destinos });
  } catch (err) { next(err); }
};

// ── crear ──
const crear = async (req, res, next) => {
  try {
    const destino = await Destino.create(req.body);
    res.status(201).json({ destino });
  } catch (err) { next(err); }
};

// ── actualizar ──
const actualizar = async (req, res, next) => {
  try {
    const destino = await Destino.findByPk(req.params.id);
    if (!destino) return res.status(404).json({ error: 'Destino no encontrado' });
    await destino.update(req.body);
    res.json({ destino });
  } catch (err) { next(err); }
};

// ── subirImagen ──
const subirImagen = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    const destino = await Destino.findByPk(req.params.id);
    if (!destino) return res.status(404).json({ error: 'Destino no encontrado' });
    const imagenUrl = `/uploads/destinos/${req.file.filename}`;
    await destino.update({ imagen: imagenUrl });
    res.json({ destino, imagen: imagenUrl });
  } catch (err) { next(err); }
};

// ── eliminar ──
const eliminar = async (req, res, next) => {
  try {
    const destino = await Destino.findByPk(req.params.id);
    if (!destino) return res.status(404).json({ error: 'Destino no encontrado' });
    await destino.destroy();
    res.json({ mensaje: 'Destino eliminado correctamente' });
  } catch (err) { next(err); }
};

module.exports = { listar, crear, actualizar, eliminar, subirImagen };
