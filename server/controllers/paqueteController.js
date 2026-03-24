const { Op } = require('sequelize');
const {
  Paquete,
  ImagenPaquete,
  Itinerario,
  Etiqueta,
  CategoriaEtiqueta,
  Destino,
  Usuario,
} = require('../models');

// ── Helpers ──

const includeBase = [
  { model: ImagenPaquete, as: 'imagenes' },
  { model: Etiqueta, as: 'etiquetas', include: [{ model: CategoriaEtiqueta, as: 'categoria' }] },
  { model: Destino, as: 'destinos' },
];

const includeCompleto = [
  { model: ImagenPaquete, as: 'imagenes', separate: true, order: [['orden', 'ASC']] },
  { model: Itinerario, as: 'itinerario', separate: true, order: [['orden', 'ASC']] },
  { model: Etiqueta, as: 'etiquetas', include: [{ model: CategoriaEtiqueta, as: 'categoria' }] },
  { model: Destino, as: 'destinos' },
  { model: Usuario, as: 'creador', attributes: ['nombre'] },
];

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
      pagina = 1,
      limite = 12,
      orden,
      busqueda,
      destino,
      temporada,
      transporte,
      experiencia,
      precio_min,
      precio_max,
      duracion_min,
      duracion_max,
      disponible,
      destacado,
    } = req.query;

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

    // Tag-based filtering: collect slugs from destino, temporada, transporte, experiencia
    const tagSlugs = [];
    if (destino) tagSlugs.push(...destino.split(','));
    if (temporada) tagSlugs.push(...temporada.split(','));
    if (transporte) tagSlugs.push(...transporte.split(','));
    if (experiencia) tagSlugs.push(...experiencia.split(','));

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
        const paqueteIds = paqueteEtiquetas.map((p) => p.id);
        where.id = { [Op.in]: paqueteIds.length > 0 ? paqueteIds : [0] };
      } else {
        where.id = { [Op.in]: [0] };
      }
    }

    const lim = Math.min(Math.max(Number(limite), 1), 100);
    const pag = Math.max(Number(pagina), 1);
    const offset = (pag - 1) * lim;

    const { count: total, rows: paquetes } = await Paquete.findAndCountAll({
      where,
      include: includeBase,
      order: buildOrden(orden),
      limit: lim,
      offset,
      distinct: true,
    });

    res.json({
      paquetes,
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
    const paquetes = await Paquete.findAll({
      where: { destacado: true, disponible: true },
      include: includeBase,
      limit: 10,
      order: [['creado_en', 'DESC']],
    });
    res.json({ paquetes });
  } catch (err) {
    next(err);
  }
};

// ── obtenerPorSlug ──

const obtenerPorSlug = async (req, res, next) => {
  try {
    const paquete = await Paquete.findOne({
      where: { slug: req.params.slug },
      include: includeCompleto,
    });

    if (!paquete) return res.status(404).json({ error: 'Paquete no encontrado' });
    res.json({ paquete });
  } catch (err) {
    next(err);
  }
};

// ── crear ──

const crear = async (req, res, next) => {
  try {
    const { etiquetas_ids, destinos_ids, itinerario: itinerarioData, ...datos } = req.body;
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

    const { etiquetas_ids, destinos_ids, itinerario: itinerarioData, ...datos } = req.body;
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

module.exports = { listar, destacados, obtenerPorSlug, crear, actualizar, toggleDisponible, eliminar };
