const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Aerolinea = sequelize.define('Aerolinea', {
  iata:        { type: DataTypes.STRING(10) },
  icao:        { type: DataTypes.STRING(10) },
  nombre:      { type: DataTypes.STRING(200), allowNull: false },
  pais_region: { type: DataTypes.STRING(100) },
  imagen:      { type: DataTypes.STRING(500) },
}, {
  tableName: 'aerolineas',
  timestamps: false,
});

module.exports = Aerolinea;
