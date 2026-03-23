const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Etiqueta = sequelize.define('Etiqueta', {
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
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categorias_etiqueta',
      key: 'id',
    },
  },
}, {
  tableName: 'etiquetas',
  timestamps: false,
});

module.exports = Etiqueta;
