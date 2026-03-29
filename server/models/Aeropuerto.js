const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Aeropuerto = sequelize.define('Aeropuerto', {
  nombre:  { type: DataTypes.STRING(200), allowNull: false },
  ciudad:  { type: DataTypes.STRING(100) },
  pais:    { type: DataTypes.STRING(100) },
  iata:    { type: DataTypes.STRING(10) },
  icao:    { type: DataTypes.STRING(10) },
}, {
  tableName: 'aeropuertos',
  timestamps: false,
});

module.exports = Aeropuerto;
