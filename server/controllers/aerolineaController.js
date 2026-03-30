const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { Aerolinea } = require('../models');

exports.listar = async (req, res) => {
  try {
    const { busqueda } = req.query;
    const where = {};
    if (busqueda) {
      where[Op.or] = [
        { nombre:      { [Op.like]: `%${busqueda}%` } },
        { iata:        { [Op.like]: `%${busqueda}%` } },
        { icao:        { [Op.like]: `%${busqueda}%` } },
        { pais_region: { [Op.like]: `%${busqueda}%` } },
      ];
    }
    const aerolineas = await Aerolinea.findAll({ where, order: [['nombre', 'ASC']] });
    res.json({ aerolineas });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.obtenerPorId = async (req, res) => {
  try {
    const a = await Aerolinea.findByPk(req.params.id);
    if (!a) return res.status(404).json({ error: 'No encontrada' });
    res.json({ aerolinea: a });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.crear = async (req, res) => {
  try {
    const { iata, icao, nombre, pais_region } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const imagen = req.file ? `/uploads/aerolineas/${req.file.filename}` : null;
    const a = await Aerolinea.create({
      iata:        iata?.trim().toUpperCase() || null,
      icao:        icao?.trim().toUpperCase() || null,
      nombre:      nombre.trim(),
      pais_region: pais_region?.trim() || null,
      imagen,
    });
    res.status(201).json({ aerolinea: a });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.actualizar = async (req, res) => {
  try {
    const a = await Aerolinea.findByPk(req.params.id);
    if (!a) return res.status(404).json({ error: 'No encontrada' });
    const { iata, icao, nombre, pais_region } = req.body;
    let imagen = a.imagen;
    if (req.file) {
      // Delete old image if exists
      if (a.imagen) {
        const old = path.join(__dirname, '../', a.imagen);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      imagen = `/uploads/aerolineas/${req.file.filename}`;
    }
    await a.update({
      iata:        iata?.trim().toUpperCase() ?? a.iata,
      icao:        icao?.trim().toUpperCase() ?? a.icao,
      nombre:      nombre?.trim() || a.nombre,
      pais_region: pais_region?.trim() ?? a.pais_region,
      imagen,
    });
    res.json({ aerolinea: a });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.eliminar = async (req, res) => {
  try {
    const a = await Aerolinea.findByPk(req.params.id);
    if (!a) return res.status(404).json({ error: 'No encontrada' });
    if (a.imagen) {
      const filePath = path.join(__dirname, '../', a.imagen);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await a.destroy();
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.eliminarBulk = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ error: 'Se requiere un array de ids.' });

    const aerolineas = await Aerolinea.findAll({ where: { id: { [Op.in]: ids } } });
    for (const a of aerolineas) {
      if (a.imagen) {
        const filePath = path.join(__dirname, '../', a.imagen);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      await a.destroy();
    }
    res.json({ eliminados: aerolineas.length });
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
      .filter((r) => r[2])
      .map((r) => ({
        iata:        String(r[0] || '').trim().toUpperCase() || null,
        icao:        String(r[1] || '').trim().toUpperCase() || null,
        nombre:      String(r[2] || '').trim(),
        pais_region: String(r[3] || '').trim() || null,
      }))
      .filter((r) => r.nombre);

    if (!registros.length) return res.status(400).json({ error: 'Sin datos válidos' });
    await Aerolinea.bulkCreate(registros);
    res.json({ importados: registros.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
