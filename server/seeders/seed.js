const bcrypt = require('bcrypt');
const { sequelize, Usuario, CategoriaEtiqueta, Etiqueta, Configuracion } = require('../models');

async function seed() {
  try {
    console.log('Sincronizando base de datos (force: true)...');
    await sequelize.sync({ force: true });
    console.log('Tablas recreadas.');

    // ── Admin user ──
    const hash = await bcrypt.hash('admin123', 12);
    await Usuario.create({
      nombre: 'Administrador',
      email: 'admin@voya.com',
      contrasena: hash,
      rol: 'admin',
      activo: true,
    });
    console.log('Usuario admin creado.');

    // ── Tag categories and tags ──
    const categoriasData = [
      {
        nombre: 'Temporada',
        slug: 'temporada',
        etiquetas: ['Verano', 'Invierno', 'Primavera', 'Otoño', 'Todo el año'],
      },
      {
        nombre: 'Tipo de transporte',
        slug: 'tipo-de-transporte',
        etiquetas: ['Aéreo', 'Terrestre', 'Crucero', 'Mixto'],
      },
      {
        nombre: 'Tipo de viaje',
        slug: 'tipo-de-viaje',
        etiquetas: ['Circuito', 'Estadía', 'Escapada'],
      },
      {
        nombre: 'Tipo de experiencia',
        slug: 'tipo-de-experiencia',
        etiquetas: ['Relax', 'Aventura', 'Circuitos', 'Grupal', 'Eventos', 'Terrestre', 'Exótico'],
      },
    ];

    for (const cat of categoriasData) {
      const categoria = await CategoriaEtiqueta.create({
        nombre: cat.nombre,
        slug: cat.slug,
      });

      for (const nombre of cat.etiquetas) {
        const baseSlug = nombre
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-');
        const slug = `${cat.slug}-${baseSlug}`;
        await Etiqueta.create({
          nombre,
          slug,
          categoria_id: categoria.id,
        });
      }
    }
    console.log('Categorías y etiquetas creadas.');

    // ── Default configuration ──
    const configData = [
      { clave: 'estadistica_paquetes', valor: '120+', tipo: 'texto' },
      { clave: 'estadistica_paises', valor: '30+', tipo: 'texto' },
      { clave: 'estadistica_actividades', valor: '50+', tipo: 'texto' },
      { clave: 'estadistica_viajeros', valor: '10K+', tipo: 'texto' },
      { clave: 'whatsapp_numero', valor: '', tipo: 'texto' },
      { clave: 'email_contacto', valor: '', tipo: 'texto' },
      { clave: 'telefono_contacto', valor: '', tipo: 'texto' },
    ];

    await Configuracion.bulkCreate(configData);
    console.log('Configuración por defecto creada.');

    console.log('Seed completado exitosamente.');
    process.exit(0);
  } catch (err) {
    console.error('Error en seed:', err);
    process.exit(1);
  }
}

seed();
