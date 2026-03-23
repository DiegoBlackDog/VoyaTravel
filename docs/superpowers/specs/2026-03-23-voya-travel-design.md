# Voyâ — Diseño de Plataforma Web para Agencia de Viajes

## Resumen

Plataforma web para la agencia de viajes Voyâ, una marca joven y moderna de Uruguay. Incluye sitio público con catálogo de paquetes de viaje filtrables y panel de administración con roles para gestionar todo el contenido. Deploy en cPanel con Node.js App.

## Stack Tecnológico

### Frontend
- **React 18** con Vite como bundler
- **React Router v6** para navegación SPA
- **Axios** para llamadas HTTP
- **React Hook Form** para formularios
- **React Helmet** para SEO (meta tags)
- **Swiper** para carruseles (destacados, testimonios)
- **React Icons** para iconografía
- **CSS Modules** para estilos con scope

### Backend
- **Node.js + Express** como API REST
- **Sequelize** como ORM para MySQL
- **MySQL2** como driver
- **express-session** + **express-mysql-session** para autenticación
- **bcrypt** para hash de contraseñas
- **multer** para upload de imágenes
- **nodemailer** para envío de emails
- **express-rate-limit** para rate limiting
- **helmet** para headers de seguridad
- **cors** para control de acceso
- **express-validator** para validación de inputs

### Infraestructura
- cPanel con Node.js App
- MySQL 8.x (creado desde cPanel)
- SSL/HTTPS (configurado en cPanel)

## Identidad de Marca

### Colores
| Nombre | Pantone | Hex | Uso |
|--------|---------|-----|-----|
| Verde principal | 2243 C | `#378966` | Color primario, navbar, botones, CTAs |
| Salmón | 7416 C | `#fc7c5e` | Acentos, badges, botones secundarios |
| Negro | Black 2C | `#1d1d1b` | Textos, fondos oscuros, footer |
| Crema | 663 C | `#f7efed` | Fondos claros, inputs, cards |
| Amarillo | 136 C | `#ffc757` | Acentos terciarios, badges temporada |

### Tipografías
- **Supertuba Light** — titulares y palabras destacadas
- **Geomanist Light** — párrafos y textos largos

### Logo
- "voyâ" en minúsculas con acento de casita en la â
- Versiones: principal, negativo (sobre verde, salmón, amarillo)

## Arquitectura

### Enfoque: Monolito React SPA + Express API

Un solo repositorio con `client/` (React/Vite) y `server/` (Express). En producción, Express sirve los archivos estáticos del build de React y expone la API bajo `/api/`.

### Estructura de Carpetas

```
voya-travel/
├── client/                          # React SPA (Vite)
│   ├── public/
│   │   ├── favicon.ico
│   │   └── robots.txt
│   ├── src/
│   │   ├── assets/                  # fuentes, imágenes, SVGs
│   │   │   ├── fonts/
│   │   │   ├── images/
│   │   │   └── icons/
│   │   ├── components/
│   │   │   ├── layout/              # Header, Footer, Navbar, WhatsAppButton
│   │   │   ├── ui/                  # Button, Card, Input, Modal, Spinner, Tag
│   │   │   ├── paquetes/            # PaqueteCard, PaqueteGaleria, PaqueteItinerario, PaqueteFiltros, FormularioConsulta
│   │   │   └── admin/               # PaqueteForm, PaqueteTabla, ImageUploader, ItinerarioEditor
│   │   ├── pages/
│   │   │   ├── public/              # HomePage, PaquetesPage, PaqueteDetallePage, NosotrosPage, ContactoPage
│   │   │   └── admin/               # LoginPage, DashboardPage, PaquetesListPage, PaqueteEditPage, EtiquetasPage, UsuariosPage
│   │   ├── hooks/                   # useAuth, usePaquetes, useFiltros
│   │   ├── context/                 # AuthContext
│   │   ├── services/                # api.js, authService, paqueteService, contactoService
│   │   ├── styles/                  # global.css, variables.css, reset.css
│   │   ├── utils/                   # formatPrecio, slugify
│   │   ├── App.jsx
│   │   ├── Router.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
├── server/                          # Express API
│   ├── config/
│   │   ├── database.js              # conexión Sequelize
│   │   ├── session.js               # config sesiones
│   │   └── email.js                 # config nodemailer
│   ├── models/                      # modelos Sequelize
│   │   ├── index.js
│   │   ├── Usuario.js
│   │   ├── Paquete.js
│   │   ├── ImagenPaquete.js
│   │   ├── Itinerario.js
│   │   ├── Etiqueta.js
│   │   ├── CategoriaEtiqueta.js
│   │   ├── Destino.js
│   │   ├── Testimonio.js
│   │   └── Configuracion.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── paquetes.routes.js
│   │   ├── etiquetas.routes.js
│   │   ├── destinos.routes.js
│   │   ├── imagenes.routes.js
│   │   ├── usuarios.routes.js
│   │   ├── contacto.routes.js
│   │   ├── testimonios.routes.js
│   │   └── configuracion.routes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── paqueteController.js
│   │   ├── etiquetaController.js
│   │   ├── destinoController.js
│   │   ├── imagenController.js
│   │   ├── usuarioController.js
│   │   ├── contactoController.js
│   │   ├── testimonioController.js
│   │   └── configuracionController.js
│   ├── middleware/
│   │   ├── auth.js                  # verificar sesión activa
│   │   ├── roles.js                 # verificar permisos por rol
│   │   ├── upload.js                # config multer (solo imágenes, max 5MB)
│   │   └── validacion.js            # express-validator schemas
│   ├── uploads/
│   │   └── paquetes/
│   └── app.js                       # entry point Express
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Base de Datos MySQL

### Tablas

#### usuarios
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | INT | PK, AUTO_INCREMENT |
| nombre | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | UNIQUE, NOT NULL |
| contrasena | VARCHAR(255) | NOT NULL (bcrypt hash) |
| rol | ENUM('admin','editor','visor') | NOT NULL, DEFAULT 'visor' |
| activo | BOOLEAN | DEFAULT true |
| creado_en | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| actualizado_en | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |

#### paquetes
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | INT | PK, AUTO_INCREMENT |
| titulo | VARCHAR(200) | NOT NULL |
| slug | VARCHAR(200) | UNIQUE, NOT NULL |
| descripcion | TEXT | |
| resumen | TEXT | |
| incluye | TEXT | JSON array |
| no_incluye | TEXT | JSON array |
| condiciones | TEXT | |
| duracion_dias | INT | NOT NULL |
| duracion_noches | INT | |
| precio_adulto | DECIMAL(10,2) | NOT NULL |
| precio_nino | DECIMAL(10,2) | |
| precio_infante | DECIMAL(10,2) | |
| moneda | VARCHAR(10) | DEFAULT 'USD' |
| disponible | BOOLEAN | DEFAULT true |
| destacado | BOOLEAN | DEFAULT false |
| creado_por | INT | FK → usuarios.id |
| creado_en | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| actualizado_en | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |

#### imagenes_paquete
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | INT | PK, AUTO_INCREMENT |
| paquete_id | INT | FK → paquetes.id, ON DELETE CASCADE |
| ruta_imagen | VARCHAR(500) | NOT NULL |
| texto_alt | VARCHAR(200) | |
| orden | INT | DEFAULT 0 |
| es_portada | BOOLEAN | DEFAULT false |

#### itinerario
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | INT | PK, AUTO_INCREMENT |
| paquete_id | INT | FK → paquetes.id, ON DELETE CASCADE |
| numero_dia | INT | NOT NULL |
| titulo | VARCHAR(200) | NOT NULL |
| descripcion | TEXT | |
| orden | INT | DEFAULT 0 |

#### categorias_etiqueta
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | INT | PK, AUTO_INCREMENT |
| nombre | VARCHAR(100) | NOT NULL |
| slug | VARCHAR(100) | UNIQUE, NOT NULL |

Categorías predefinidas: Temporada, Tipo de transporte, Tipo de viaje, **Tipo de experiencia** (Relax, Aventura, Circuitos, Grupal, Eventos, Terrestre, Exótico).

> **Nota**: Las categorías "País" y "Región" NO se usan como etiquetas — esa información geográfica se maneja exclusivamente a través de la tabla `destinos` (con columnas `pais` y `region`) y la pivote `paquete_destinos`. Los filtros de país/región en el frontend consultan la tabla `destinos`, no las etiquetas.

#### etiquetas
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | INT | PK, AUTO_INCREMENT |
| nombre | VARCHAR(100) | NOT NULL |
| slug | VARCHAR(100) | UNIQUE, NOT NULL |
| categoria_id | INT | FK → categorias_etiqueta.id |

#### paquete_etiquetas (pivote)
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| paquete_id | INT | FK → paquetes.id, ON DELETE CASCADE |
| etiqueta_id | INT | FK → etiquetas.id, ON DELETE CASCADE |
| | | PK compuesta (paquete_id, etiqueta_id) |

#### destinos
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | INT | PK, AUTO_INCREMENT |
| nombre | VARCHAR(150) | NOT NULL |
| slug | VARCHAR(150) | UNIQUE, NOT NULL |
| pais | VARCHAR(100) | |
| region | VARCHAR(100) | |

#### paquete_destinos (pivote)
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| paquete_id | INT | FK → paquetes.id, ON DELETE CASCADE |
| destino_id | INT | FK → destinos.id, ON DELETE CASCADE |
| | | PK compuesta (paquete_id, destino_id) |

#### testimonios
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | INT | PK, AUTO_INCREMENT |
| nombre | VARCHAR(100) | NOT NULL |
| texto | TEXT | NOT NULL |
| viaje | VARCHAR(200) | |
| fecha_viaje | VARCHAR(50) | |
| imagen_url | VARCHAR(500) | |
| activo | BOOLEAN | DEFAULT true |
| orden | INT | DEFAULT 0 |
| creado_en | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

#### configuracion
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| id | INT | PK, AUTO_INCREMENT |
| clave | VARCHAR(100) | UNIQUE, NOT NULL |
| valor | TEXT | |
| tipo | ENUM('texto','numero','json') | DEFAULT 'texto' |

Claves predefinidas: `estadistica_paquetes`, `estadistica_paises`, `estadistica_actividades`, `estadistica_viajeros`, `whatsapp_numero`, `email_contacto`, `telefono_contacto`.

#### sesiones
| Columna | Tipo | Restricciones |
|---------|------|---------------|
| session_id | VARCHAR(128) | PK |
| expira | INT | |
| datos | MEDIUMTEXT | |

### Relaciones
- usuarios 1:N → paquetes (creado_por)
- paquetes 1:N → imagenes_paquete
- paquetes 1:N → itinerario
- paquetes N:M → etiquetas (vía paquete_etiquetas)
- paquetes N:M → destinos (vía paquete_destinos)
- categorias_etiqueta 1:N → etiquetas

## Rutas

### Públicas (React Router)
| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | HomePage | Hero, buscador, carrusel destacados, tipos de viaje, estadísticas, testimonios |
| `/paquetes` | PaquetesPage | Catálogo con filtros laterales, grid/lista, ordenamiento |
| `/paquetes/:slug` | PaqueteDetallePage | Detalle completo, galería, itinerario, formulario consulta |
| `/nosotros` | NosotrosPage | Info de la agencia |
| `/contacto` | ContactoPage | Formulario de contacto general |

### Admin (protegidas por AuthContext)
| Ruta | Componente | Rol mínimo |
|------|-----------|------------|
| `/admin/login` | LoginPage | Público |
| `/admin` | DashboardPage | visor |
| `/admin/paquetes` | PaquetesListPage | visor |
| `/admin/paquetes/nuevo` | PaqueteEditPage | editor |
| `/admin/paquetes/:id` | PaqueteEditPage | editor |
| `/admin/etiquetas` | EtiquetasPage | editor |
| `/admin/testimonios` | TestimoniosPage | editor |
| `/admin/configuracion` | ConfiguracionPage | admin |
| `/admin/usuarios` | UsuariosPage | admin |

### API (Express)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Iniciar sesión |
| POST | `/api/auth/logout` | Sí | Cerrar sesión |
| GET | `/api/auth/me` | Sí | Usuario actual |
| GET | `/api/paquetes` | No | Listar paquetes (con filtros, paginación) |
| GET | `/api/paquetes/destacados` | No | Paquetes destacados |
| GET | `/api/paquetes/:slug` | No | Detalle de paquete |
| POST | `/api/paquetes` | editor | Crear paquete |
| PUT | `/api/paquetes/:id` | editor | Editar paquete |
| PATCH | `/api/paquetes/:id/disponible` | editor | Toggle disponibilidad |
| DELETE | `/api/paquetes/:id` | admin | Eliminar paquete |
| POST | `/api/imagenes/:paqueteId` | editor | Subir imágenes |
| DELETE | `/api/imagenes/:id` | editor | Eliminar imagen |
| PUT | `/api/imagenes/:id/orden` | editor | Reordenar imagen |
| GET | `/api/etiquetas` | No | Listar etiquetas (agrupadas por categoría) |
| POST | `/api/etiquetas` | editor | Crear etiqueta |
| PUT | `/api/etiquetas/:id` | editor | Editar etiqueta |
| DELETE | `/api/etiquetas/:id` | admin | Eliminar etiqueta |
| GET | `/api/destinos` | No | Listar destinos |
| POST | `/api/destinos` | editor | Crear destino |
| PUT | `/api/destinos/:id` | editor | Editar destino |
| DELETE | `/api/destinos/:id` | admin | Eliminar destino |
| POST | `/api/contacto` | No | Enviar consulta por email (rate-limited) |
| GET | `/api/testimonios` | No | Listar testimonios activos |
| POST | `/api/testimonios` | editor | Crear testimonio |
| PUT | `/api/testimonios/:id` | editor | Editar testimonio |
| DELETE | `/api/testimonios/:id` | admin | Eliminar testimonio |
| GET | `/api/configuracion` | No | Obtener configuración pública |
| PUT | `/api/configuracion/:clave` | admin | Actualizar configuración |
| GET | `/api/usuarios` | admin | Listar usuarios |
| POST | `/api/usuarios` | admin | Crear usuario |
| PUT | `/api/usuarios/:id` | admin | Editar usuario |
| DELETE | `/api/usuarios/:id` | admin | Eliminar usuario |

## Permisos por Rol

| Acción | Admin | Editor | Visor |
|--------|-------|--------|-------|
| Ver paquetes (admin) | ✅ | ✅ | ✅ |
| Crear paquetes | ✅ | ✅ | ❌ |
| Editar paquetes | ✅ | ✅ | ❌ |
| Ocultar/Mostrar paquetes | ✅ | ✅ | ❌ |
| Eliminar paquetes | ✅ | ❌ | ❌ |
| Gestionar etiquetas/destinos | ✅ | ✅ | ❌ |
| Gestionar testimonios | ✅ | ✅ | ❌ |
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Editar configuración | ✅ | ❌ | ❌ |

## Diseño de Páginas

### HomePage
1. **Top bar** verde con redes sociales, teléfono y email
2. **Navbar** blanco con logo, links de navegación y botón WhatsApp
3. **Hero** con gradiente verde, título y subtítulo
4. **Buscador moderno** flotante sobre el hero con campos: Destino, Temporada, Días, Presupuesto
5. **Carrusel de paquetes destacados** con Swiper — cards con badge de temporada, iconos de servicios (avión, hotel, comidas, etc.), precio prominente
6. **Sección "Tu tipo de viaje"** — grid visual con categorías: Relax, Aventura, Circuitos, Grupal, Eventos, Terrestre, Exótico. Cada una linkea a `/paquetes?experiencia=X`
7. **Sección "¿Por qué Voyâ?"** — 4 columnas: Mejor Precio, Viajá Seguro, Experiencia Local, Financiación
8. **Barra de estadísticas** — fondo oscuro con contadores animados: Paquetes, Países, Actividades, Viajeros (datos desde tabla configuracion)
9. **Testimonios** — carrusel con foto, cita, nombre y viaje
10. **Footer** — 4 columnas: logo + descripción, navegación, explorar, contacto + redes sociales

### PaquetesPage
1. Header con título y subtítulo
2. **Sidebar de filtros**: Destino (checkboxes con contadores), Precio (range slider), Duración (range slider), Temporada (checkboxes), Transporte (checkboxes), Experiencia (checkboxes)
3. Barra superior: contador de resultados, ordenamiento (recientes, precio asc/desc, duración), toggle vista grid/lista
4. Grid de PaqueteCards con paginación

### PaqueteDetallePage
1. Breadcrumb
2. Título, duración, estado de disponibilidad
3. **Galería de imágenes** con Swiper (dots navigation)
4. **Etiquetas** del paquete como badges
5. **Resumen** descriptivo
6. **Incluye / No incluye** en dos columnas con iconos ✅/❌
7. **Itinerario** día a día con timeline vertical
8. **Condiciones del servicio**
9. **Sidebar derecho fijo**:
   - Bloque de precio principal (desde U$S X por adulto)
   - Desglose precios: adulto, niño, infante
   - Formulario de consulta: nombre, email, celular, adultos, niños, infantes, mensaje
   - Botón "Enviar Consulta" (envía email)
   - Botón "Consultar por WhatsApp" (abre wa.me con mensaje pre-armado)

### NosotrosPage
- Historia de la agencia
- Misión y visión
- Equipo (opcional, contenido estático)

### ContactoPage
- Formulario de contacto general (nombre, email, teléfono, mensaje)
- Información de contacto
- Mapa (opcional, embed de Google Maps)

### Panel Admin
- **Layout**: sidebar oscuro con navegación + área de contenido
- **DashboardPage**: resumen con contadores (paquetes activos, ocultos, total consultas)
- **PaquetesListPage**: tabla con búsqueda, filtros rápidos (todos/disponibles/ocultos/destacados), acciones por fila (editar, toggle visibilidad, eliminar), paginación
- **PaqueteEditPage**: formulario completo con tabs o secciones: info básica, precios, incluye/no incluye, itinerario (editor drag-and-drop de días), imágenes (upload con preview y reordenamiento), etiquetas y destinos
- **EtiquetasPage**: CRUD de categorías y etiquetas
- **UsuariosPage**: CRUD de usuarios (solo admin)

## Seguridad

- **Autenticación**: express-session con MySQL store. Cookies httpOnly, secure, sameSite
- **Passwords**: bcrypt con 12 salt rounds
- **Autorización**: middleware de roles que verifica sesión + rol mínimo por ruta
- **Headers**: helmet.js (CSP, X-Frame-Options, X-Content-Type-Options, etc.)
- **Rate limiting**: express-rate-limit en `/api/auth/login` (5 intentos/15min) y `/api/contacto` (3 envíos/15min)
- **Validación**: express-validator en todas las rutas de escritura. Sanitización de HTML
- **Upload**: multer con filtro de MIME types (image/jpeg, image/png, image/webp), límite 5MB, nombres generados con UUID
- **CORS**: configurado para permitir solo el dominio propio
- **SQL Injection**: prevenido por Sequelize (queries parametrizados)
- **XSS**: sanitización de inputs + CSP headers

## Deploy en cPanel

1. `npm run build` en `client/` genera archivos estáticos en `client/dist/`
2. Configurar Node.js App en cPanel apuntando a `server/app.js`
3. Express sirve `client/dist/` como archivos estáticos en producción
4. React Router: Express devuelve `index.html` para cualquier ruta que no sea `/api/*`
5. Crear base de datos MySQL desde cPanel, configurar credenciales en `.env`
6. `server/uploads/` persiste las imágenes subidas
7. Configurar SMTP desde cPanel para nodemailer

## Idioma

Todo el sitio, base de datos (nombres de tablas y columnas), y panel admin están en **español**.

## Decisiones Técnicas

- **SPA sin SSR**: aceptamos limitación SEO a cambio de simplicidad en cPanel. Mitigación con react-helmet para meta tags dinámicos y `vite-plugin-prerender` para generar HTML estático de las rutas públicas principales (`/`, `/nosotros`, `/contacto`) en build time
- **Sequelize como ORM**: abstracción sobre MySQL que simplifica queries, migraciones y relaciones
- **CSS Modules**: evitan colisiones de nombres sin overhead de CSS-in-JS
- **express-session con MySQL**: sesiones persistentes que sobreviven reinicios del servidor
- **Tabla configuracion**: permite editar estadísticas, WhatsApp y datos de contacto desde el admin sin deploy
- **JSON en incluye/no_incluye**: flexibilidad para listas de longitud variable sin tablas adicionales
