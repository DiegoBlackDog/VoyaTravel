const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CostoPaquete = sequelize.define('CostoPaquete', {
  operador: { type: DataTypes.STRING(100), allowNull: false },
  sistema:  { type: DataTypes.STRING(50),  allowNull: false },
  tipo:     { type: DataTypes.STRING(50),  allowNull: false },
  bruto:    { type: DataTypes.DECIMAL(10, 2) },
  neto:     { type: DataTypes.DECIMAL(10, 2) },
  fecha_cotizacion: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  notas: { type: DataTypes.TEXT },
}, {
  tableName: 'costos_paquete',
  timestamps: false,
});

module.exports = CostoPaquete;
