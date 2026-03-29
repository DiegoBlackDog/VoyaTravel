const { Op } = require('sequelize');
const { Aeropuerto } = require('../models');

exports.listar = async (req, res) => {
  try {
    const { busqueda } = req.query;
    const where = {};
    if (busqueda) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${busqueda}%` } },
        { ciudad:  { [Op.like]: `%${busqueda}%` } },
        { pais:    { [Op.like]: `%${busqueda}%` } },
        { iata:    { [Op.like]: `%${busqueda}%` } },
        { icao:    { [Op.like]: `%${busqueda}%` } },
      ];
    }
    const aeropuertos = await Aeropuerto.findAll({ where, order: [['nombre', 'ASC']] });
    res.json({ aeropuertos });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const a = await Aeropuerto.findByPk(req.params.id);
    if (!a) return res.status(404).json({ error: 'No encontrado' });
    res.json({ aeropuerto: a });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.crear = async (req, res) => {
  try {
    const { nombre, ciudad, pais, iata, icao } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const a = await Aeropuerto.create({
      nombre: nombre.trim(),
      ciudad: ciudad?.trim() || null,
      pais:   pais?.trim()   || null,
      iata:   iata?.trim().toUpperCase() || null,
      icao:   icao?.trim().toUpperCase() || null,
    });
    res.status(201).json({ aeropuerto: a });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.actualizar = async (req, res) => {
  try {
    const a = await Aeropuerto.findByPk(req.params.id);
    if (!a) return res.status(404).json({ error: 'No encontrado' });
    const { nombre, ciudad, pais, iata, icao } = req.body;
    await a.update({
      nombre: nombre?.trim() || a.nombre,
      ciudad: ciudad?.trim() ?? a.ciudad,
      pais:   pais?.trim()   ?? a.pais,
      iata:   iata?.trim().toUpperCase() ?? a.iata,
      icao:   icao?.trim().toUpperCase() ?? a.icao,
    });
    res.json({ aeropuerto: a });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.eliminar = async (req, res) => {
  try {
    const a = await Aeropuerto.findByPk(req.params.id);
    if (!a) return res.status(404).json({ error: 'No encontrado' });
    await a.destroy();
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.importarExcel = async (req, res) => {
  try {
    const XLSX = require('xlsx');
    if (!req.file) return res.status(400).json({ error: 'No se recibió archivo' });
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    const registros = rows
      .slice(0)
      .filter((r) => r[0] || r[1])
      .map((r) => ({
        nombre: String(r[0] || '').trim(),
        ciudad: String(r[1] || '').trim() || null,
        pais:   String(r[2] || '').trim() || null,
        iata:   String(r[3] || '').trim().toUpperCase() || null,
        icao:   String(r[4] || '').trim().toUpperCase() || null,
      }))
      .filter((r) => r.nombre);

    if (!registros.length) return res.status(400).json({ error: 'Sin datos válidos' });
    await Aeropuerto.bulkCreate(registros);
    res.json({ importados: registros.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
