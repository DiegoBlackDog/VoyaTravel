const { Configuracion } = require('../models');

// ── obtener ── return all as {clave: valor} object
const obtener = async (req, res, next) => {
  try {
    const registros = await Configuracion.findAll();
    const config = {};
    registros.forEach((r) => {
      config[r.clave] = r.valor;
    });
    res.json({ configuracion: config });
  } catch (err) {
    next(err);
  }
};

// ── actualizar ── find by req.params.clave, update valor
const actualizar = async (req, res, next) => {
  try {
    const registro = await Configuracion.findOne({ where: { clave: req.params.clave } });
    if (!registro) return res.status(404).json({ error: 'Configuración no encontrada' });

    await registro.update({ valor: req.body.valor });
    res.json({ configuracion: registro });
  } catch (err) {
    next(err);
  }
};

module.exports = { obtener, actualizar };
