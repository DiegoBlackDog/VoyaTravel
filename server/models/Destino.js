const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Destino = sequelize.define('Destino', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  pais: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  tableName: 'destinos',
  timestamps: false,
});

module.exports = Destino;
