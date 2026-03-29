const sequelize = require('../config/database');

const Usuario = require('./Usuario');
const Paquete = require('./Paquete');
const ImagenPaquete = require('./ImagenPaquete');
const Itinerario = require('./Itinerario');
const CategoriaEtiqueta = require('./CategoriaEtiqueta');
const Etiqueta = require('./Etiqueta');
const Destino = require('./Destino');
const Testimonio = require('./Testimonio');
const Configuracion = require('./Configuracion');
const CostoPaquete = require('./CostoPaquete');
const Hotel = require('./Hotel');
const AlojamientoPaquete = require('./AlojamientoPaquete');
const Operador = require('./Operador');
const Cotizacion = require('./Cotizacion');
const CotizacionAlojamiento = require('./CotizacionAlojamiento');
const Aeropuerto = require('./Aeropuerto');
const Aerolinea = require('./Aerolinea');

// ── Associations ──

// Usuario 1:N → Paquete
Usuario.hasMany(Paquete, { foreignKey: 'creado_por', as: 'paquetes' });
Paquete.belongsTo(Usuario, { foreignKey: 'creado_por', as: 'creador' });

// Paquete 1:N → ImagenPaquete
Paquete.hasMany(ImagenPaquete, { foreignKey: 'paquete_id', as: 'imagenes', onDelete: 'CASCADE' });
ImagenPaquete.belongsTo(Paquete, { foreignKey: 'paquete_id' });

// Paquete 1:N → Itinerario
Paquete.hasMany(Itinerario, { foreignKey: 'paquete_id', as: 'itinerario', onDelete: 'CASCADE' });
Itinerario.belongsTo(Paquete, { foreignKey: 'paquete_id' });

// CategoriaEtiqueta 1:N → Etiqueta
CategoriaEtiqueta.hasMany(Etiqueta, { foreignKey: 'categoria_id', as: 'etiquetas' });
Etiqueta.belongsTo(CategoriaEtiqueta, { foreignKey: 'categoria_id', as: 'categoria' });

// Paquete N:M → Etiqueta
Paquete.belongsToMany(Etiqueta, { through: 'paquete_etiquetas', foreignKey: 'paquete_id', otherKey: 'etiqueta_id', as: 'etiquetas', timestamps: false });
Etiqueta.belongsToMany(Paquete, { through: 'paquete_etiquetas', foreignKey: 'etiqueta_id', otherKey: 'paquete_id', as: 'paquetes', timestamps: false });

// Paquete N:M → Destino
Paquete.belongsToMany(Destino, { through: 'paquete_destinos', foreignKey: 'paquete_id', otherKey: 'destino_id', as: 'destinos', timestamps: false });
Destino.belongsToMany(Paquete, { through: 'paquete_destinos', foreignKey: 'destino_id', otherKey: 'paquete_id', as: 'paquetes', timestamps: false });

// Paquete 1:N → CostoPaquete
Paquete.hasMany(CostoPaquete, { foreignKey: 'paquete_id', as: 'costos', onDelete: 'CASCADE' });
CostoPaquete.belongsTo(Paquete, { foreignKey: 'paquete_id' });

// Destino 1:N → Hotel
Destino.hasMany(Hotel, { foreignKey: 'destino_id', as: 'hoteles', onDelete: 'CASCADE' });
Hotel.belongsTo(Destino, { foreignKey: 'destino_id', as: 'destino' });

// Paquete 1:N → AlojamientoPaquete
Paquete.hasMany(AlojamientoPaquete, { foreignKey: 'paquete_id', as: 'alojamientos', onDelete: 'CASCADE' });
AlojamientoPaquete.belongsTo(Paquete, { foreignKey: 'paquete_id' });
AlojamientoPaquete.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel' });
Hotel.hasMany(AlojamientoPaquete, { foreignKey: 'hotel_id' });

// Usuario 1:N → Cotizacion
Usuario.hasMany(Cotizacion, { foreignKey: 'usuario_id', as: 'cotizaciones' });
Cotizacion.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Destino 1:N → Cotizacion
Destino.hasMany(Cotizacion, { foreignKey: 'destino_id', as: 'cotizaciones' });
Cotizacion.belongsTo(Destino, { foreignKey: 'destino_id', as: 'destino' });

// Cotizacion 1:N → CotizacionAlojamiento
Cotizacion.hasMany(CotizacionAlojamiento, { foreignKey: 'cotizacion_id', as: 'alojamientos', onDelete: 'CASCADE' });
CotizacionAlojamiento.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id' });
CotizacionAlojamiento.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel' });
Hotel.hasMany(CotizacionAlojamiento, { foreignKey: 'hotel_id' });

module.exports = {
  sequelize,
  Usuario,
  Paquete,
  ImagenPaquete,
  Itinerario,
  CategoriaEtiqueta,
  Etiqueta,
  Destino,
  Testimonio,
  Configuracion,
  CostoPaquete,
  Hotel,
  AlojamientoPaquete,
  Operador,
  Cotizacion,
  CotizacionAlojamiento,
  Aeropuerto,
  Aerolinea,
};
