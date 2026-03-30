const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CotizacionAlojamiento = sequelize.define('CotizacionAlojamiento', {
  cotizacion_id:    { type: DataTypes.INTEGER, allowNull: false },
  grupo:            { type: DataTypes.INTEGER },
  destino_id:       { type: DataTypes.INTEGER },
  hotel_id:         { type: DataTypes.INTEGER },
  regimen:          { type: DataTypes.STRING(50) },
  noches:           { type: DataTypes.INTEGER },
  precio_single:    { type: DataTypes.DECIMAL(10, 2) },
  precio_doble:     { type: DataTypes.DECIMAL(10, 2) },
  precio_triple:    { type: DataTypes.DECIMAL(10, 2) },
  precio_cuadruple: { type: DataTypes.DECIMAL(10, 2) },
  precio_menor:     { type: DataTypes.DECIMAL(10, 2) },
  precio_infante:   { type: DataTypes.DECIMAL(10, 2) },
}, {
  tableName: 'cotizacion_alojamientos',
  timestamps: false,
});

module.exports = CotizacionAlojamiento;
