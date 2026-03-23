const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Configuracion = sequelize.define('Configuracion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clave: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  valor: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tipo: {
    type: DataTypes.ENUM('texto', 'numero', 'json'),
    allowNull: false,
    defaultValue: 'texto',
  },
}, {
  tableName: 'configuracion',
  timestamps: false,
});

module.exports = Configuracion;
