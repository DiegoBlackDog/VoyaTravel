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
};
