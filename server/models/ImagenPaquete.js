const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ImagenPaquete = sequelize.define('ImagenPaquete', {
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
  ruta_imagen: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  texto_alt: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  orden: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  es_portada: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'imagenes_paquete',
  timestamps: false,
});

module.exports = ImagenPaquete;
