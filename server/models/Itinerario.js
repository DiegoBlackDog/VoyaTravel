const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Itinerario = sequelize.define('Itinerario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  paquete_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'paquetes',
      key: 'id',
    },
  },
  numero_dia: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  orden: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'itinerario',
  timestamps: false,
});

module.exports = Itinerario;
