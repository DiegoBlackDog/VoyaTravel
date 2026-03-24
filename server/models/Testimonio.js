const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Testimonio = sequelize.define('Testimonio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  viaje: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  fecha_viaje: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  imagen_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  orden: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  calificacion: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 5,
  },
  fuente: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'manual',
  },
}, {
  tableName: 'testimonios',
  updatedAt: false,
});

module.exports = Testimonio;
