const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CategoriaEtiqueta = sequelize.define('CategoriaEtiqueta', {
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
}, {
  tableName: 'categorias_etiqueta',
  timestamps: false,
});

module.exports = CategoriaEtiqueta;
