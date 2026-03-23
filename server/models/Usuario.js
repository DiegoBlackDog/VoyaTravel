const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  contrasena: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  rol: {
    type: DataTypes.ENUM('admin', 'editor', 'visor'),
    allowNull: false,
    defaultValue: 'visor',
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'usuarios',
});

module.exports = Usuario;
