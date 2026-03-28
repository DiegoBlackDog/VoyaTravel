const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Paquete = sequelize.define('Paquete', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resumen: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  incluye: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('incluye');
      try {
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    },
    set(val) {
      this.setDataValue('incluye', JSON.stringify(val));
    },
  },
  no_incluye: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('no_incluye');
      try {
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    },
    set(val) {
      this.setDataValue('no_incluye', JSON.stringify(val));
    },
  },
  condiciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  duracion_dias: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  duracion_noches: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  precio_adulto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  precio_nino: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  precio_infante: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  moneda: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD',
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  destacado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  creado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id',
    },
  },
}, {
  tableName: 'paquetes',
});

module.exports = Paquete;
