const crypto = require('crypto');
const { Op } = require('sequelize');
const { Cotizacion, CotizacionAlojamiento, Destino, Hotel, Usuario } = require('../models');

async function enriquecerDestinos(cotJson) {
  const ids = Array.isArray(cotJson.destinos_ids) && cotJson.destinos_ids.length > 0
    ? cotJson.destinos_ids
    : (cotJson.destino_id ? [cotJson.destino_id] : []);
  if (!ids.length) return [];
  return Destino.findAll({ where: { id: { [Op.in]: ids } }, attributes: ['id', 'nombre', 'pais', 'imagen'] });
}

const INCLUDE_FULL = [
  { model: Destino, as: 'destino' },
  {
    model: CotizacionAlojamiento,
    as: 'alojamientos',
    include: [{ model: Hotel, as: 'hotel' }],
  },
];

exports.listar = async (req, res) => {
  try {
    const { busqueda } = req.query;
    const esAdmin = req.session.usuario.rol === 'admin';
    const where = {};
    if (!esAdmin) where.usuario_id = req.session.usuario.id;
    if (busqueda) where.nombre_pasajero = { [Op.like]: `%${busqueda}%` };

    const cotizaciones = await Cotizacion.findAll({
      where,
      include: [
        { model: Destino,  as: 'destino',  attributes: ['id', 'nombre', 'pais'] },
        { model: Usuario,  as: 'usuario',  attributes: ['id', 'nombre'] },
      ],
      order: [['creado_en', 'DESC']],
    });
    res.json({ cotizaciones });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const c = await Cotizacion.findByPk(req.params.id, { include: INCLUDE_FULL });
    if (!c) return res.status(404).json({ error: 'No encontrada' });
    const esAdmin = req.session.usuario.rol === 'admin';
    if (!esAdmin && c.usuario_id !== req.session.usuario.id) return res.status(403).json({ error: 'Sin permiso' });
    const cotJson = c.toJSON();
    cotJson.destinos_extra = await enriquecerDestinos(cotJson);
    res.json({ cotizacion: cotJson });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.obtenerPorToken = async (req, res) => {
  try {
    const c = await Cotizacion.findOne({ where: { token: req.params.token }, include: INCLUDE_FULL });
    if (!c) return res.status(404).json({ error: 'No encontrada' });
    const cotJson = c.toJSON();
    cotJson.destinos_extra = await enriquecerDestinos(cotJson);
    res.json({ cotizacion: cotJson });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.uploadImagen = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió archivo' });
  res.json({ url: `/uploads/cotizaciones/${req.file.filename}` });
};

exports.crear = async (req, res) => {
  try {
    const { nombre_pasajero, destino_id, destinos_ids, duracion_dias, duracion_noches, incluye, no_incluye, condiciones, contacto_metodo, contacto_dato, itinerario_tipo, itinerario_pnr, itinerario_imagen, alojamientos } = req.body;
    const token = crypto.randomUUID().replace(/-/g, '');

    const cot = await Cotizacion.create({
      nombre_pasajero,
      destino_id:        destino_id || null,
      destinos_ids:      Array.isArray(destinos_ids) ? destinos_ids : [],
      duracion_dias:     duracion_dias || null,
      duracion_noches:   duracion_noches || null,
      incluye:           incluye    || [],
      no_incluye:        no_incluye || [],
      condiciones:       condiciones || null,
      contacto_metodo:   contacto_metodo || null,
      contacto_dato:     contacto_dato || null,
      itinerario_tipo:   itinerario_tipo || null,
      itinerario_pnr:    itinerario_pnr || null,
      itinerario_imagen: itinerario_imagen || null,
      token,
      usuario_id: req.session.usuario.id,
    });

    if (Array.isArray(alojamientos) && alojamientos.length) {
      await CotizacionAlojamiento.bulkCreate(
        alojamientos.map((a) => ({ ...a, cotizacion_id: cot.id }))
      );
    }

    const full = await Cotizacion.findByPk(cot.id, { include: INCLUDE_FULL });
    res.status(201).json({ cotizacion: full });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.actualizar = async (req, res) => {
  try {
    const cot = await Cotizacion.findByPk(req.params.id);
    if (!cot) return res.status(404).json({ error: 'No encontrada' });
    const esAdmin = req.session.usuario.rol === 'admin';
    if (!esAdmin && cot.usuario_id !== req.session.usuario.id) return res.status(403).json({ error: 'Sin permiso' });

    const { nombre_pasajero, destino_id, destinos_ids, duracion_dias, duracion_noches, incluye, no_incluye, condiciones, contacto_metodo, contacto_dato, itinerario_tipo, itinerario_pnr, itinerario_imagen, alojamientos } = req.body;

    await cot.update({
      nombre_pasajero,
      destino_id:        destino_id || null,
      destinos_ids:      Array.isArray(destinos_ids) ? destinos_ids : [],
      duracion_dias:     duracion_dias || null,
      duracion_noches:   duracion_noches || null,
      incluye:           incluye    || [],
      no_incluye:        no_incluye || [],
      condiciones:       condiciones || null,
      contacto_metodo:   contacto_metodo || null,
      contacto_dato:     contacto_dato || null,
      itinerario_tipo:   itinerario_tipo || null,
      itinerario_pnr:    itinerario_pnr || null,
      itinerario_imagen: itinerario_imagen || null,
    });

    if (Array.isArray(alojamientos)) {
      await CotizacionAlojamiento.destroy({ where: { cotizacion_id: cot.id } });
      if (alojamientos.length) {
        await CotizacionAlojamiento.bulkCreate(
          alojamientos.map((a) => ({ ...a, cotizacion_id: cot.id }))
        );
      }
    }

    const full = await Cotizacion.findByPk(cot.id, { include: INCLUDE_FULL });
    res.json({ cotizacion: full });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.duplicar = async (req, res) => {
  try {
    const original = await Cotizacion.findByPk(req.params.id, { include: INCLUDE_FULL });
    if (!original) return res.status(404).json({ error: 'No encontrada' });
    const esAdmin = req.session.usuario.rol === 'admin';
    if (!esAdmin && original.usuario_id !== req.session.usuario.id) return res.status(403).json({ error: 'Sin permiso' });

    const token = crypto.randomUUID().replace(/-/g, '');
    const nueva = await Cotizacion.create({
      nombre_pasajero:   original.nombre_pasajero,
      destino_id:        original.destino_id,
      destinos_ids:      original.destinos_ids || [],
      duracion_dias:     original.duracion_dias,
      duracion_noches:   original.duracion_noches,
      incluye:           original.incluye,
      no_incluye:        original.no_incluye,
      condiciones:       original.condiciones,
      contacto_metodo:   original.contacto_metodo,
      contacto_dato:     original.contacto_dato,
      itinerario_tipo:   original.itinerario_tipo,
      itinerario_pnr:    original.itinerario_pnr,
      itinerario_imagen: original.itinerario_imagen,
      token,
      usuario_id: req.session.usuario.id,
    });

    if (original.alojamientos?.length) {
      await CotizacionAlojamiento.bulkCreate(
        original.alojamientos.map((a) => ({
          cotizacion_id:    nueva.id,
          hotel_id:         a.hotel_id,
          regimen:          a.regimen,
          precio_single:    a.precio_single,
          precio_doble:     a.precio_doble,
          precio_triple:    a.precio_triple,
          precio_cuadruple: a.precio_cuadruple,
          precio_menor:     a.precio_menor,
          precio_infante:   a.precio_infante,
        }))
      );
    }

    const full = await Cotizacion.findByPk(nueva.id, { include: INCLUDE_FULL });
    res.status(201).json({ cotizacion: full });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.eliminar = async (req, res) => {
  try {
    const cot = await Cotizacion.findByPk(req.params.id);
    if (!cot) return res.status(404).json({ error: 'No encontrada' });
    const esAdmin = req.session.usuario.rol === 'admin';
    if (!esAdmin && cot.usuario_id !== req.session.usuario.id) return res.status(403).json({ error: 'Sin permiso' });
    await CotizacionAlojamiento.destroy({ where: { cotizacion_id: cot.id } });
    await cot.destroy();
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
