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

// ── actualizar ── upsert by clave
const actualizar = async (req, res, next) => {
  try {
    const [registro] = await Configuracion.upsert({
      clave: req.params.clave,
      valor: req.body.valor ?? '',
      tipo: 'texto',
    });
    res.json({ configuracion: registro });
  } catch (err) {
    next(err);
  }
};

module.exports = { obtener, actualizar };
