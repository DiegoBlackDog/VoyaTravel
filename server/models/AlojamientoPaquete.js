const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AlojamientoPaquete = sequelize.define('AlojamientoPaquete', {
  regimen: { type: DataTypes.STRING(50) },
  precio_single:     { type: DataTypes.DECIMAL(10,2) },
  precio_doble:      { type: DataTypes.DECIMAL(10,2) },
  precio_triple:     { type: DataTypes.DECIMAL(10,2) },
  precio_cuadruple:  { type: DataTypes.DECIMAL(10,2) },
  precio_menor:      { type: DataTypes.DECIMAL(10,2) },
  precio_infante:    { type: DataTypes.DECIMAL(10,2) },
}, {
  tableName: 'alojamientos_paquete',
  timestamps: false,
});

module.exports = AlojamientoPaquete;
