const { Operador } = require('../models');
const { Op } = require('sequelize');

const listar = async (req, res, next) => {
  try {
    const { busqueda } = req.query;
    const where = {};
    if (busqueda) where.nombre = { [Op.like]: `%${busqueda}%` };
    const operadores = await Operador.findAll({ where, order: [['nombre', 'ASC']] });
    res.json({ operadores });
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const { nombre, comision, contacto, telefono } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const operador = await Operador.create({ nombre: nombre.trim(), comision: comision || null, contacto: contacto?.trim() || null, telefono: telefono?.trim() || null });
    res.status(201).json({ operador });
  } catch (err) { next(err); }
};

const actualizar = async (req, res, next) => {
  try {
    const op = await Operador.findByPk(req.params.id);
    if (!op) return res.status(404).json({ error: 'Operador no encontrado' });
    const { nombre, comision, contacto, telefono } = req.body;
    await op.update({ nombre: nombre?.trim() || op.nombre, comision: comision ?? op.comision, contacto: contacto?.trim() ?? op.contacto, telefono: telefono?.trim() ?? op.telefono });
    res.json({ operador: op });
  } catch (err) { next(err); }
};

const eliminar = async (req, res, next) => {
  try {
    const op = await Operador.findByPk(req.params.id);
    if (!op) return res.status(404).json({ error: 'Operador no encontrado' });
    await op.destroy();
    res.json({ mensaje: 'Operador eliminado' });
  } catch (err) { next(err); }
};

module.exports = { listar, crear, actualizar, eliminar };
