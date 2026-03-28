const { Op } = require('sequelize');
const {
  Paquete,
  ImagenPaquete,
  Itinerario,
  Etiqueta,
  CategoriaEtiqueta,
  Destino,
  Usuario,
  CostoPaquete,
  AlojamientoPaquete,
  Hotel,
} = require('../models');

// ── Helpers ──

const includeBase = [
  { model: ImagenPaquete, as: 'imagenes' },
  { model: Etiqueta, as: 'etiquetas', include: [{ model: CategoriaEtiqueta, as: 'categoria' }] },
  { model: Destino, as: 'destinos' },
  { model: AlojamientoPaquete, as: 'alojamientos', separate: true },
];

const includeCompleto = [
  { model: ImagenPaquete, as: 'imagenes', separate: true, order: [['orden', 'ASC']] },
  { model: Itinerario, as: 'itinerario', separate: true, order: [['orden', 'ASC']] },
  { model: Etiqueta, as: 'etiquetas', include: [{ model: CategoriaEtiqueta, as: 'categoria' }] },
  { model: Destino, as: 'destinos' },
  { model: Usuario, as: 'creador', attributes: ['nombre'] },
  { model: CostoPaquete, as: 'costos', separate: true, order: [['id', 'ASC']] },
  { model: AlojamientoPaquete, as: 'alojamientos', separate: true, include: [{ model: Hotel, as: 'hotel' }] },
];

function calcPrecioDesde(paquete) {
  const aloj = paquete.alojamientos || [];
  const precios = aloj.flatMap((a) =>
    ['precio_single','precio_doble','precio_triple','precio_cuadruple','precio_menor','precio_infante']
      .map((k) => a[k])
      .filter((v) => v != null && Number(v) > 0)
  );
  return precios.length > 0 ? Math.min(...precios.map(Number)) : null;
}

function buildOrden(orden) {
  switch (orden) {
    case 'precio_asc':
      return [['precio_adulto', 'ASC']];
    case 'precio_desc':
      return [['precio_adulto', 'DESC']];
    case 'duracion':
      return [['duracion_dias', 'ASC']];
    case 'recientes':
    default:
      return [['creado_en', 'DESC']];
  }
}

// ── listar ──

const listar = async (req, res, next) => {
  try {
    const {
      pagina, page,
      limite = 12,
      orden, ordenar,
      busqueda,
      destino,
      temporada,
      transporte,
      experiencia,
      etiqueta,
      precio_min,
      precio_max,
      duracion_min,
      duracion_max,
      disponible,
      destacado,
    } = req.query;

    // Accept both naming conventions (frontend uses page/ordenar, legacy uses pagina/orden)
    const paginaFinal = page || pagina || 1;
    const ordenFinal = ordenar || orden;

    const where = {};

    // Public (no session) only see available
    if (!req.session || !req.session.usuario) {
      where.disponible = true;
    } else if (disponible !== undefined) {
      where.disponible = disponible === 'true';
    }

    if (destacado !== undefined) {
      where.destacado = destacado === 'true';
    }

    if (busqueda) {
      where[Op.or] = [
        { titulo: { [Op.like]: `%${busqueda}%` } },
        { resumen: { [Op.like]: `%${busqueda}%` } },
        { descripcion: { [Op.like]: `%${busqueda}%` } },
      ];
    }

    if (precio_min) where.precio_adulto = { ...where.precio_adulto, [Op.gte]: Number(precio_min) };
    if (precio_max) where.precio_adulto = { ...where.precio_adulto, [Op.lte]: Number(precio_max) };
    if (duracion_min) where.duracion_dias = { ...where.duracion_dias, [Op.gte]: Number(duracion_min) };
    if (duracion_max) where.duracion_dias = { ...where.duracion_dias, [Op.lte]: Number(duracion_max) };

    // Collect ID constraints from separate filter types, then intersect
    const idConstraints = [];

    // Destino filter via Destino model (not etiquetas)
    if (destino) {
      const destinoSlugs = destino.split(',');
      const destinosEncontrados = await Destino.findAll({ where: { slug: { [Op.in]: destinoSlugs } } });
      const destinoIds = destinosEncontrados.map((d) => d.id);
      if (destinoIds.length > 0) {
        const paquetesConDestino = await Paquete.findAll({
          attributes: ['id'],
          include: [{
            model: Destino,
            as: 'destinos',
            where: { id: { [Op.in]: destinoIds } },
            attributes: [],
          }],
          raw: true,
        });
        idConstraints.push(paquetesConDestino.map((p) => p.id));
      } else {
        idConstraints.push([]);
      }
    }

    // Tag-based filtering: temporada, transporte, experiencia (legacy params) + etiqueta (frontend param)
    const tagSlugs = [];
    if (temporada) tagSlugs.push(...temporada.split(','));
    if (transporte) tagSlugs.push(...transporte.split(','));
    if (experiencia) tagSlugs.push(...experiencia.split(','));
    if (etiqueta) tagSlugs.push(...etiqueta.split(','));

    if (tagSlugs.length > 0) {
      const etiquetas = await Etiqueta.findAll({ where: { slug: { [Op.in]: tagSlugs } } });
      const etiquetaIds = etiquetas.map((e) => e.id);
      if (etiquetaIds.length > 0) {
        const paqueteEtiquetas = await Paquete.findAll({
          attributes: ['id'],
          include: [{
            model: Etiqueta,
            as: 'etiquetas',
            where: { id: { [Op.in]: etiquetaIds } },
            attributes: [],
          }],
          raw: true,
        });
        idConstraints.push(paqueteEtiquetas.map((p) => p.id));
      } else {
        idConstraints.push([]);
      }
    }

    // Intersect all ID constraints
    if (idConstraints.length > 0) {
      let ids = idConstraints[0];
      for (let i = 1; i < idConstraints.length; i++) {
        const set = new Set(idConstraints[i]);
        ids = ids.filter((id) => set.has(id));
      }
      where.id = { [Op.in]: ids.length > 0 ? ids : [0] };
    }

    const lim = Math.min(Math.max(Number(limite), 1), 100);
    const pag = Math.max(Number(paginaFinal), 1);
    const offset = (pag - 1) * lim;

    const { count: total, rows: paquetes } = await Paquete.findAndCountAll({
      where,
      include: includeBase,
      order: buildOrden(ordenFinal),
      limit: lim,
      offset,
      distinct: true,
    });

    const paquetesConPrecio = paquetes.map((p) => {
      const pj = p.toJSON();
      const desde = calcPrecioDesde(pj);
      return { ...pj, precio_desde: desde ?? pj.precio_adulto };
    });
    res.json({
      paquetes: paquetesConPrecio,
      total,
      pagina: pag,
      totalPaginas: Math.ceil(total / lim),
    });
  } catch (err) {
    next(err);
  }
};

// ── destacados ──

const destacados = async (req, res, next) => {
  try {
    const paquetesRaw = await Paquete.findAll({
      where: { destacado: true, disponible: true },
      include: includeBase,
      limit: 10,
      order: [['creado_en', 'DESC']],
    });
    const paquetes = paquetesRaw.map((p) => {
      const pj = p.toJSON();
      const desde = calcPrecioDesde(pj);
      return { ...pj, precio_desde: desde ?? pj.precio_adulto };
    });
    res.json({ paquetes });
  } catch (err) {
    next(err);
  }
};

// ── obtenerPorId ── (admin use)

const obtenerPorId = async (req, res, next) => {
  try {
    const paqueteRaw = await Paquete.findByPk(req.params.id, { include: includeCompleto });
    if (!paqueteRaw) return res.status(404).json({ error: 'Paquete no encontrado' });
    const pj = paqueteRaw.toJSON();
    const desde = calcPrecioDesde(pj);
    const paquete = { ...pj, precio_desde: desde ?? pj.precio_adulto };
    res.json({ paquete });
  } catch (err) {
    next(err);
  }
};

// ── obtenerPorSlug ──

const obtenerPorSlug = async (req, res, next) => {
  try {
    const paqueteRaw = await Paquete.findOne({
      where: { slug: req.params.slug },
      include: includeCompleto,
    });

    if (!paqueteRaw) return res.status(404).json({ error: 'Paquete no encontrado' });
    const pj = paqueteRaw.toJSON();
    const desde = calcPrecioDesde(pj);
    const paquete = { ...pj, precio_desde: desde ?? pj.precio_adulto };
    res.json({ paquete });
  } catch (err) {
    next(err);
  }
};

// ── crear ──

const crear = async (req, res, next) => {
  try {
    const { etiquetas_ids, destinos_ids, itinerario: itinerarioData, costos: costosData, alojamientos: alojamientosData, ...datos } = req.body;
    datos.creado_por = req.session.usuario.id;

    const paquete = await Paquete.create(datos);

    if (etiquetas_ids && etiquetas_ids.length > 0) {
      await paquete.setEtiquetas(etiquetas_ids);
    }

    if (destinos_ids && destinos_ids.length > 0) {
      await paquete.setDestinos(destinos_ids);
    }

    if (itinerarioData && itinerarioData.length > 0) {
      await Itinerario.bulkCreate(
        itinerarioData.map((item) => ({ ...item, paquete_id: paquete.id }))
      );
    }

    if (costosData && costosData.length > 0) {
      const hoy = new Date().toISOString().slice(0, 10);
      await CostoPaquete.bulkCreate(
        costosData.map((c) => ({ ...c, fecha_cotizacion: c.fecha_cotizacion || hoy, paquete_id: paquete.id }))
      );
    }

    if (alojamientosData && alojamientosData.length > 0) {
      await AlojamientoPaquete.bulkCreate(
        alojamientosData.map((a) => ({ ...a, paquete_id: paquete.id }))
      );
    }

    const completo = await Paquete.findByPk(paquete.id, { include: includeCompleto });
    res.status(201).json({ paquete: completo });
  } catch (err) {
    next(err);
  }
};

// ── actualizar ──

const actualizar = async (req, res, next) => {
  try {
    const paquete = await Paquete.findByPk(req.params.id);
    if (!paquete) return res.status(404).json({ error: 'Paquete no encontrado' });

    const { etiquetas_ids, destinos_ids, itinerario: itinerarioData, costos: costosData, alojamientos: alojamientosData, ...datos } = req.body;
    await paquete.update(datos);

    if (etiquetas_ids !== undefined) {
      await paquete.setEtiquetas(etiquetas_ids);
    }

    if (destinos_ids !== undefined) {
      await paquete.setDestinos(destinos_ids);
    }

    if (itinerarioData !== undefined) {
      await Itinerario.destroy({ where: { paquete_id: paquete.id } });
      if (itinerarioData.length > 0) {
        await Itinerario.bulkCreate(
          itinerarioData.map((item) => ({ ...item, paquete_id: paquete.id }))
        );
      }
    }

    if (costosData !== undefined) {
      await CostoPaquete.destroy({ where: { paquete_id: paquete.id } });
      if (costosData.length > 0) {
        const hoy = new Date().toISOString().slice(0, 10);
        await CostoPaquete.bulkCreate(
          costosData.map((c) => ({ ...c, fecha_cotizacion: c.fecha_cotizacion || hoy, paquete_id: paquete.id }))
        );
      }
    }

    if (alojamientosData !== undefined) {
      await AlojamientoPaquete.destroy({ where: { paquete_id: paquete.id } });
      if (alojamientosData.length > 0) {
        await AlojamientoPaquete.bulkCreate(
          alojamientosData.map((a) => ({ ...a, paquete_id: paquete.id }))
        );
      }
    }

    const completo = await Paquete.findByPk(paquete.id, { include: includeCompleto });
    res.json({ paquete: completo });
  } catch (err) {
    next(err);
  }
};

// ── toggleDisponible ──

const toggleDisponible = async (req, res, next) => {
  try {
    const paquete = await Paquete.findByPk(req.params.id);
    if (!paquete) return res.status(404).json({ error: 'Paquete no encontrado' });

    await paquete.update({ disponible: !paquete.disponible });
    res.json({ paquete });
  } catch (err) {
    next(err);
  }
};

// ── eliminar ──

const eliminar = async (req, res, next) => {
  try {
    const paquete = await Paquete.findByPk(req.params.id);
    if (!paquete) return res.status(404).json({ error: 'Paquete no encontrado' });

    await paquete.destroy();
    res.json({ mensaje: 'Paquete eliminado correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, destacados, obtenerPorId, obtenerPorSlug, crear, actualizar, toggleDisponible, eliminar };
