const { Hotel, Destino } = require('../models');
const { Op } = require('sequelize');

const listar = async (req, res, next) => {
  try {
    const { destinos, busqueda, destino_id } = req.query;
    const whereHotel = {};

    if (destino_id) whereHotel.destino_id = Number(destino_id);
    else if (destinos) {
      const ids = destinos.split(',').map(Number).filter(Boolean);
      whereHotel.destino_id = { [Op.in]: ids };
    }
    if (busqueda) whereHotel.nombre = { [Op.like]: `%${busqueda}%` };

    const hoteles = await Hotel.findAll({
      where: whereHotel,
      include: [{ model: Destino, as: 'destino', attributes: ['id', 'nombre', 'pais'] }],
      order: [['nombre', 'ASC']],
    });
    res.json({ hoteles });
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const { nombre, destino_id, ciudad, web_url, estrellas } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const hotel = await Hotel.create({ nombre: nombre.trim(), destino_id: destino_id || null, ciudad: ciudad?.trim() || null, web_url: web_url?.trim() || null, estrellas: estrellas != null ? Number(estrellas) : null });
    const completo = await Hotel.findByPk(hotel.id, { include: [{ model: Destino, as: 'destino', attributes: ['id', 'nombre', 'pais'] }] });
    res.status(201).json({ hotel: completo });
  } catch (err) { next(err); }
};

const actualizar = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);
    if (!hotel) return res.status(404).json({ error: 'Hotel no encontrado' });
    const { nombre, destino_id, ciudad, web_url, estrellas } = req.body;
    await hotel.update({ nombre: nombre?.trim() || hotel.nombre, destino_id: destino_id ?? hotel.destino_id, ciudad: ciudad?.trim() ?? hotel.ciudad, web_url: web_url?.trim() ?? hotel.web_url, estrellas: estrellas !== undefined ? (estrellas != null ? Number(estrellas) : null) : hotel.estrellas });
    const completo = await Hotel.findByPk(hotel.id, { include: [{ model: Destino, as: 'destino', attributes: ['id', 'nombre', 'pais'] }] });
    res.json({ hotel: completo });
  } catch (err) { next(err); }
};

const eliminar = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);
    if (!hotel) return res.status(404).json({ error: 'Hotel no encontrado' });
    await hotel.destroy();
    res.json({ mensaje: 'Hotel eliminado' });
  } catch (err) { next(err); }
};

// Legacy upsert - kept for compatibility with package form
const upsert = async (req, res, next) => {
  try {
    const { nombre, destino_id } = req.body;
    const [hotel] = await Hotel.findOrCreate({ where: { nombre, destino_id }, defaults: { nombre, destino_id } });
    res.json({ hotel });
  } catch (err) { next(err); }
};

module.exports = { listar, crear, actualizar, eliminar, upsert };
