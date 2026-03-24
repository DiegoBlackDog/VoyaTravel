const bcrypt = require('bcrypt');
const { Usuario } = require('../models');

// ── listar ── exclude contrasena
const listar = async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['contrasena'] },
    });
    res.json({ usuarios });
  } catch (err) {
    next(err);
  }
};

// ── crear ── bcrypt hash 12 rounds, handle unique email error
const crear = async (req, res, next) => {
  try {
    const { contrasena, ...datos } = req.body;
    datos.contrasena = await bcrypt.hash(contrasena, 12);

    const usuario = await Usuario.create(datos);
    const { contrasena: _, ...sinContrasena } = usuario.toJSON();
    res.status(201).json({ usuario: sinContrasena });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    next(err);
  }
};

// ── actualizar ── optional password re-hash
const actualizar = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { contrasena, ...datos } = req.body;
    if (contrasena) {
      datos.contrasena = await bcrypt.hash(contrasena, 12);
    }

    await usuario.update(datos);
    const { contrasena: _, ...sinContrasena } = usuario.toJSON();
    res.json({ usuario: sinContrasena });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    next(err);
  }
};

// ── eliminar ── prevent self-delete
const eliminar = async (req, res, next) => {
  try {
    if (String(req.session.usuario.id) === String(req.params.id)) {
      return res.status(400).json({ error: 'No puede eliminar su propia cuenta' });
    }

    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    await usuario.destroy();
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, crear, actualizar, eliminar };
