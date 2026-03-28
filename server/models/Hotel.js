const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Hotel = sequelize.define('Hotel', {
  nombre: { type: DataTypes.STRING(200), allowNull: false },
  ciudad: { type: DataTypes.STRING(100) },
  web_url: { type: DataTypes.STRING(500) },
}, { tableName: 'hoteles', timestamps: false });

module.exports = Hotel;
