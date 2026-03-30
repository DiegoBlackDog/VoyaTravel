const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cotizacion = sequelize.define('Cotizacion', {
  nombre_pasajero: { type: DataTypes.STRING(200), allowNull: true },
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
  destinos_ids: {
    type: DataTypes.TEXT,
    get() { try { return JSON.parse(this.getDataValue('destinos_ids') || '[]'); } catch { return []; } },
    set(v) { this.setDataValue('destinos_ids', JSON.stringify(v || [])); },
  },
  condiciones:      { type: DataTypes.TEXT },
  contacto_metodo:   { type: DataTypes.ENUM('Whatsapp', 'Email', 'Teléfono') },
  contacto_dato:     { type: DataTypes.STRING(200) },
  itinerario_tipo:   { type: DataTypes.STRING(20) },
  itinerario_pnr:    { type: DataTypes.TEXT },
  itinerario_imagen: { type: DataTypes.STRING(500) },
  token:             { type: DataTypes.STRING(64), unique: true },
}, {
  tableName: 'cotizaciones',
  timestamps: true,
});

module.exports = Cotizacion;
