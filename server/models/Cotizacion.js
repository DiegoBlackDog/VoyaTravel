const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cotizacion = sequelize.define('Cotizacion', {
  nombre_pasajero: { type: DataTypes.STRING(200), allowNull: false },
  destino_id:      { type: DataTypes.INTEGER },
  usuario_id:      { type: DataTypes.INTEGER },
  duracion_dias:   { type: DataTypes.INTEGER },
  duracion_noches: { type: DataTypes.INTEGER },
  incluye: {
    type: DataTypes.TEXT,
    get() { try { return JSON.parse(this.getDataValue('incluye') || '[]'); } catch { return []; } },
    set(v) { this.setDataValue('incluye', JSON.stringify(v || [])); },
  },
  no_incluye: {
    type: DataTypes.TEXT,
    get() { try { return JSON.parse(this.getDataValue('no_incluye') || '[]'); } catch { return []; } },
    set(v) { this.setDataValue('no_incluye', JSON.stringify(v || [])); },
  },
  condiciones:      { type: DataTypes.TEXT },
  contacto_metodo:  { type: DataTypes.ENUM('Whatsapp', 'Email', 'Teléfono') },
  contacto_dato:    { type: DataTypes.STRING(200) },
  token:            { type: DataTypes.STRING(64), unique: true },
}, {
  tableName: 'cotizaciones',
  timestamps: true,
});

module.exports = Cotizacion;
