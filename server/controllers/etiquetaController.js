const { CategoriaEtiqueta, Etiqueta } = require('../models');

// ── listar ── categories with their etiquetas, ordered by nombre
const listar = async (req, res, next) => {
  try {
    const categorias = await CategoriaEtiqueta.findAll({
      include: [{ model: Etiqueta, as: 'etiquetas' }],
      order: [['nombre', 'ASC'], [{ model: Etiqueta, as: 'etiquetas' }, 'nombre', 'ASC']],
    });
    res.json({ categorias });
  } catch (err) {
    next(err);
  }
};

// ── crearCategoria ──
const crearCategoria = async (req, res, next) => {
  try {
    const categoria = await CategoriaEtiqueta.create(req.body);
    res.status(201).json({ categoria });
  } catch (err) {
    next(err);
  }
};

// ── crear ──
const crear = async (req, res, next) => {
  try {
    const etiqueta = await Etiqueta.create(req.body);
    res.status(201).json({ etiqueta });
  } catch (err) {
    next(err);
  }
};

// ── actualizar ──
const actualizar = async (req, res, next) => {
  try {
    const etiqueta = await Etiqueta.findByPk(req.params.id);
    if (!etiqueta) return res.status(404).json({ error: 'Etiqueta no encontrada' });

    await etiqueta.update(req.body);
    res.json({ etiqueta });
  } catch (err) {
    next(err);
  }
};

// ── eliminar ──
const eliminar = async (req, res, next) => {
  try {
    const etiqueta = await Etiqueta.findByPk(req.params.id);
    if (!etiqueta) return res.status(404).json({ error: 'Etiqueta no encontrada' });

    await etiqueta.destroy();
    res.json({ mensaje: 'Etiqueta eliminada correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, crearCategoria, crear, actualizar, eliminar };
