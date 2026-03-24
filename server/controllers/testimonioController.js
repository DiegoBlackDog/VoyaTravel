const { Testimonio } = require('../models');

// ── listar ── public: only activo=true; admin session: all
const listar = async (req, res, next) => {
  try {
    const where = {};
    if (!req.session || !req.session.usuario) {
      where.activo = true;
    }

    const testimonios = await Testimonio.findAll({
      where,
      order: [['orden', 'ASC']],
    });
    res.json({ testimonios });
  } catch (err) {
    next(err);
  }
};

// ── crear ──
const crear = async (req, res, next) => {
  try {
    const testimonio = await Testimonio.create(req.body);
    res.status(201).json({ testimonio });
  } catch (err) {
    next(err);
  }
};

// ── actualizar ──
const actualizar = async (req, res, next) => {
  try {
    const testimonio = await Testimonio.findByPk(req.params.id);
    if (!testimonio) return res.status(404).json({ error: 'Testimonio no encontrado' });

    await testimonio.update(req.body);
    res.json({ testimonio });
  } catch (err) {
    next(err);
  }
};

// ── eliminar ──
const eliminar = async (req, res, next) => {
  try {
    const testimonio = await Testimonio.findByPk(req.params.id);
    if (!testimonio) return res.status(404).json({ error: 'Testimonio no encontrado' });

    await testimonio.destroy();
    res.json({ mensaje: 'Testimonio eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, crear, actualizar, eliminar };
