const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Operador = sequelize.define('Operador', {
  nombre: { type: DataTypes.STRING(200), allowNull: false },
  comision: { type: DataTypes.DECIMAL(5, 2) },
  contacto: { type: DataTypes.STRING(200) },
  telefono: { type: DataTypes.STRING(50) },
}, { tableName: 'operadores', timestamps: false });

module.exports = Operador;
