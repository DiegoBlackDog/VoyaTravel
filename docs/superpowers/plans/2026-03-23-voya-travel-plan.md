# Voyâ Travel Agency — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack travel agency platform with public catalog, filtering, and admin panel for managing travel packages.

**Architecture:** React 18 SPA (Vite) + Express API + MySQL via Sequelize. Monolith with `client/` and `server/` directories. Express serves React build in production. Session-based auth with role-based access control.

**Tech Stack:** React 18, Vite, React Router v6, Express, Sequelize, MySQL2, bcrypt, multer, nodemailer, Swiper, React Hook Form, CSS Modules.

**Spec:** `docs/superpowers/specs/2026-03-23-voya-travel-design.md`

---

## Phase 1: Project Setup & Backend Foundation

### Task 1: Initialize project and install dependencies

**Files:**
- Create: `package.json`
- Create: `client/package.json`
- Create: `server/package.json`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] **Step 1: Initialize root package.json**

```bash
cd C:/Users/dgrod/voya-travel
npm init -y
```

Edit `package.json`:

```json
{
  "name": "voya-travel",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "build": "cd client && npm run build",
    "start": "cd server && node app.js",
    "seed": "cd server && node seeders/seed.js"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

- [ ] **Step 2: Initialize server package.json and install backend deps**

```bash
mkdir -p server
cd server && npm init -y
npm install express mysql2 sequelize express-session express-mysql-session bcrypt multer nodemailer cors helmet express-rate-limit express-validator uuid dotenv
npm install -D nodemon
```

Add to `server/package.json` scripts:

```json
{
  "scripts": {
    "dev": "nodemon app.js",
    "start": "node app.js"
  }
}
```

- [ ] **Step 3: Initialize client with Vite + React**

```bash
cd C:/Users/dgrod/voya-travel
npm create vite@latest client -- --template react
cd client
npm install react-router-dom axios react-hook-form react-helmet-async swiper react-icons
npm install -D vite-plugin-prerender
```

- [ ] **Step 4: Create .env.example**

Create `.env.example`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=voya_travel
DB_USER=root
DB_PASS=

# Session
SESSION_SECRET=cambiar-en-produccion-usar-string-largo-random

# Email (SMTP)
SMTP_HOST=mail.tudominio.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@voya.com
SMTP_PASS=
EMAIL_FROM=info@voya.com
EMAIL_TO=info@voya.com

# WhatsApp
WHATSAPP_NUMBER=59899123456

# App
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:5173
```

- [ ] **Step 5: Update .gitignore**

Update `.gitignore`:

```
node_modules/
.env
server/uploads/paquetes/*
!server/uploads/paquetes/.gitkeep
client/dist/
.superpowers/
*.log
```

- [ ] **Step 6: Create directory structure**

```bash
cd C:/Users/dgrod/voya-travel
mkdir -p server/{config,models,routes,controllers,middleware,uploads/paquetes,seeders}
touch server/uploads/paquetes/.gitkeep
mkdir -p client/src/{assets/{fonts,images,icons},components/{layout,ui,paquetes,admin},pages/{public,admin},hooks,context,services,styles,utils}
```

- [ ] **Step 7: Install root deps and commit**

```bash
cd C:/Users/dgrod/voya-travel
npm install
git add -A
git commit -m "chore: initialize project structure with dependencies"
```

---

### Task 2: Database configuration and Sequelize setup

**Files:**
- Create: `server/config/database.js`
- Create: `.env` (local, not committed)

- [ ] **Step 1: Create .env from example**

Copy `.env.example` to `.env` and fill in local MySQL credentials.

- [ ] **Step 2: Create database config**

Create `server/config/database.js`:

```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'creado_en',
      updatedAt: 'actualizado_en',
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
```

- [ ] **Step 3: Verify connection**

Create a quick test: run `node -e "const db = require('./server/config/database'); db.authenticate().then(() => console.log('OK')).catch(e => console.error(e))"` from root (after creating the MySQL database).

- [ ] **Step 4: Commit**

```bash
git add server/config/database.js
git commit -m "feat: add Sequelize database configuration"
```

---

### Task 3: Define Sequelize models

**Files:**
- Create: `server/models/Usuario.js`
- Create: `server/models/Paquete.js`
- Create: `server/models/ImagenPaquete.js`
- Create: `server/models/Itinerario.js`
- Create: `server/models/CategoriaEtiqueta.js`
- Create: `server/models/Etiqueta.js`
- Create: `server/models/Destino.js`
- Create: `server/models/Testimonio.js`
- Create: `server/models/Configuracion.js`
- Create: `server/models/index.js`

- [ ] **Step 1: Create Usuario model**

Create `server/models/Usuario.js`:

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  contrasena: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  rol: {
    type: DataTypes.ENUM('admin', 'editor', 'visor'),
    allowNull: false,
    defaultValue: 'visor',
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'usuarios',
});

module.exports = Usuario;
```

- [ ] **Step 2: Create Paquete model**

Create `server/models/Paquete.js`:

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Paquete = sequelize.define('Paquete', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
  },
  descripcion: {
    type: DataTypes.TEXT,
  },
  resumen: {
    type: DataTypes.TEXT,
  },
  incluye: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('incluye');
      return val ? JSON.parse(val) : [];
    },
    set(val) {
      this.setDataValue('incluye', JSON.stringify(val));
    },
  },
  no_incluye: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('no_incluye');
      return val ? JSON.parse(val) : [];
    },
    set(val) {
      this.setDataValue('no_incluye', JSON.stringify(val));
    },
  },
  condiciones: {
    type: DataTypes.TEXT,
  },
  duracion_dias: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  duracion_noches: {
    type: DataTypes.INTEGER,
  },
  precio_adulto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  precio_nino: {
    type: DataTypes.DECIMAL(10, 2),
  },
  precio_infante: {
    type: DataTypes.DECIMAL(10, 2),
  },
  moneda: {
    type: DataTypes.STRING(10),
    defaultValue: 'USD',
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  destacado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  creado_por: {
    type: DataTypes.INTEGER,
    references: { model: 'usuarios', key: 'id' },
  },
}, {
  tableName: 'paquetes',
});

module.exports = Paquete;
```

- [ ] **Step 3: Create ImagenPaquete model**

Create `server/models/ImagenPaquete.js`:

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ImagenPaquete = sequelize.define('ImagenPaquete', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  paquete_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'paquetes', key: 'id' },
  },
  ruta_imagen: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  texto_alt: {
    type: DataTypes.STRING(200),
  },
  orden: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  es_portada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'imagenes_paquete',
  timestamps: false,
});

module.exports = ImagenPaquete;
```

- [ ] **Step 4: Create Itinerario model**

Create `server/models/Itinerario.js`:

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Itinerario = sequelize.define('Itinerario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  paquete_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'paquetes', key: 'id' },
  },
  numero_dia: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
  },
  orden: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'itinerario',
  timestamps: false,
});

module.exports = Itinerario;
```

- [ ] **Step 5: Create CategoriaEtiqueta and Etiqueta models**

Create `server/models/CategoriaEtiqueta.js`:

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CategoriaEtiqueta = sequelize.define('CategoriaEtiqueta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'categorias_etiqueta',
  timestamps: false,
});

module.exports = CategoriaEtiqueta;
```

Create `server/models/Etiqueta.js`:

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Etiqueta = sequelize.define('Etiqueta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    references: { model: 'categorias_etiqueta', key: 'id' },
  },
}, {
  tableName: 'etiquetas',
  timestamps: false,
});

module.exports = Etiqueta;
```

- [ ] **Step 6: Create Destino model**

Create `server/models/Destino.js`:

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Destino = sequelize.define('Destino', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
  },
  pais: {
    type: DataTypes.STRING(100),
  },
  region: {
    type: DataTypes.STRING(100),
  },
}, {
  tableName: 'destinos',
  timestamps: false,
});

module.exports = Destino;
```

- [ ] **Step 7: Create Testimonio and Configuracion models**

Create `server/models/Testimonio.js`:

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Testimonio = sequelize.define('Testimonio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  viaje: {
    type: DataTypes.STRING(200),
  },
  fecha_viaje: {
    type: DataTypes.STRING(50),
  },
  imagen_url: {
    type: DataTypes.STRING(500),
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  orden: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'testimonios',
  updatedAt: false,
});

module.exports = Testimonio;
```

Create `server/models/Configuracion.js`:

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Configuracion = sequelize.define('Configuracion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clave: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  valor: {
    type: DataTypes.TEXT,
  },
  tipo: {
    type: DataTypes.ENUM('texto', 'numero', 'json'),
    defaultValue: 'texto',
  },
}, {
  tableName: 'configuracion',
  timestamps: false,
});

module.exports = Configuracion;
```

- [ ] **Step 8: Create models index with associations**

Create `server/models/index.js`:

```javascript
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

// Usuario -> Paquete (1:N)
Usuario.hasMany(Paquete, { foreignKey: 'creado_por', as: 'paquetes' });
Paquete.belongsTo(Usuario, { foreignKey: 'creado_por', as: 'creador' });

// Paquete -> ImagenPaquete (1:N)
Paquete.hasMany(ImagenPaquete, { foreignKey: 'paquete_id', as: 'imagenes', onDelete: 'CASCADE' });
ImagenPaquete.belongsTo(Paquete, { foreignKey: 'paquete_id' });

// Paquete -> Itinerario (1:N)
Paquete.hasMany(Itinerario, { foreignKey: 'paquete_id', as: 'itinerario', onDelete: 'CASCADE' });
Itinerario.belongsTo(Paquete, { foreignKey: 'paquete_id' });

// CategoriaEtiqueta -> Etiqueta (1:N)
CategoriaEtiqueta.hasMany(Etiqueta, { foreignKey: 'categoria_id', as: 'etiquetas' });
Etiqueta.belongsTo(CategoriaEtiqueta, { foreignKey: 'categoria_id', as: 'categoria' });

// Paquete <-> Etiqueta (N:M)
Paquete.belongsToMany(Etiqueta, {
  through: 'paquete_etiquetas',
  foreignKey: 'paquete_id',
  otherKey: 'etiqueta_id',
  as: 'etiquetas',
  timestamps: false,
});
Etiqueta.belongsToMany(Paquete, {
  through: 'paquete_etiquetas',
  foreignKey: 'etiqueta_id',
  otherKey: 'paquete_id',
  as: 'paquetes',
  timestamps: false,
});

// Paquete <-> Destino (N:M)
Paquete.belongsToMany(Destino, {
  through: 'paquete_destinos',
  foreignKey: 'paquete_id',
  otherKey: 'destino_id',
  as: 'destinos',
  timestamps: false,
});
Destino.belongsToMany(Paquete, {
  through: 'paquete_destinos',
  foreignKey: 'destino_id',
  otherKey: 'paquete_id',
  as: 'paquetes',
  timestamps: false,
});

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
```

- [ ] **Step 9: Commit**

```bash
git add server/models/
git commit -m "feat: add all Sequelize models with associations"
```

---

### Task 4: Express app setup with middleware

**Files:**
- Create: `server/app.js`
- Create: `server/config/session.js`
- Create: `server/config/email.js`

- [ ] **Step 1: Create session config**

Create `server/config/session.js`:

```javascript
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  createDatabaseTable: true,
  schema: {
    tableName: 'sesiones',
    columnNames: {
      session_id: 'session_id',
      expires: 'expira',
      data: 'datos',
    },
  },
});

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  },
};

module.exports = { sessionConfig, sessionStore };
```

- [ ] **Step 2: Create email config**

Create `server/config/email.js`:

```javascript
const nodemailer = require('nodemailer');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

module.exports = transporter;
```

- [ ] **Step 3: Create Express app**

Create `server/app.js`:

```javascript
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { sequelize } = require('./models');
const { sessionConfig } = require('./config/session');

// Import routes
const authRoutes = require('./routes/auth.routes');
const paquetesRoutes = require('./routes/paquetes.routes');
const etiquetasRoutes = require('./routes/etiquetas.routes');
const destinosRoutes = require('./routes/destinos.routes');
const imagenesRoutes = require('./routes/imagenes.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const contactoRoutes = require('./routes/contacto.routes');
const testimoniosRoutes = require('./routes/testimonios.routes');
const configuracionRoutes = require('./routes/configuracion.routes');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : process.env.CLIENT_URL,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session(sessionConfig));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/paquetes', paquetesRoutes);
app.use('/api/etiquetas', etiquetasRoutes);
app.use('/api/destinos', destinosRoutes);
app.use('/api/imagenes', imagenesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/testimonios', testimoniosRoutes);
app.use('/api/configuracion', configuracionRoutes);

// Serve React in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;

sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor Voyâ corriendo en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error conectando a la base de datos:', err);
  });

module.exports = app;
```

- [ ] **Step 4: Create placeholder route files**

Create each route file as a minimal Express router so the app boots without errors. Every file follows this pattern:

```javascript
// server/routes/auth.routes.js (and similarly for all route files)
const router = require('express').Router();
module.exports = router;
```

Create these files: `auth.routes.js`, `paquetes.routes.js`, `etiquetas.routes.js`, `destinos.routes.js`, `imagenes.routes.js`, `usuarios.routes.js`, `contacto.routes.js`, `testimonios.routes.js`, `configuracion.routes.js`.

- [ ] **Step 5: Test that server boots**

```bash
cd C:/Users/dgrod/voya-travel
npm run dev:server
```

Expected: "Servidor Voyâ corriendo en puerto 4000" and tables created in MySQL.

- [ ] **Step 6: Commit**

```bash
git add server/
git commit -m "feat: add Express app with middleware, session, and email config"
```

---

### Task 5: Auth middleware and auth routes

**Files:**
- Create: `server/middleware/auth.js`
- Create: `server/middleware/roles.js`
- Modify: `server/routes/auth.routes.js`
- Create: `server/controllers/authController.js`

- [ ] **Step 1: Create auth middleware**

Create `server/middleware/auth.js`:

```javascript
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
};

module.exports = { requireAuth };
```

- [ ] **Step 2: Create roles middleware**

Create `server/middleware/roles.js`:

```javascript
const ROLES_JERARQUIA = { admin: 3, editor: 2, visor: 1 };

const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.session || !req.session.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    const rolUsuario = req.session.usuario.rol;
    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({ error: 'No tiene permisos para esta acción' });
    }
    next();
  };
};

// Shorthand: requires at least this role level
const requireMinRole = (rolMinimo) => {
  const nivelMinimo = ROLES_JERARQUIA[rolMinimo];
  return (req, res, next) => {
    if (!req.session || !req.session.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    const nivelUsuario = ROLES_JERARQUIA[req.session.usuario.rol];
    if (nivelUsuario < nivelMinimo) {
      return res.status(403).json({ error: 'No tiene permisos para esta acción' });
    }
    next();
  };
};

module.exports = { requireRole, requireMinRole };
```

- [ ] **Step 3: Create auth controller**

Create `server/controllers/authController.js`:

```javascript
const bcrypt = require('bcrypt');
const { Usuario } = require('../models');

const login = async (req, res) => {
  try {
    const { email, contrasena } = req.body;
    const usuario = await Usuario.findOne({ where: { email, activo: true } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const valido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!valido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    req.session.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };
    res.json({ usuario: req.session.usuario });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid');
    res.json({ mensaje: 'Sesión cerrada' });
  });
};

const me = (req, res) => {
  if (!req.session.usuario) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  res.json({ usuario: req.session.usuario });
};

module.exports = { login, logout, me };
```

- [ ] **Step 4: Wire up auth routes**

Update `server/routes/auth.routes.js`:

```javascript
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { login, logout, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de login, intente de nuevo en 15 minutos' },
});

const { validar } = require('../middleware/validacion');

router.post('/login', loginLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('contrasena').notEmpty().withMessage('Contraseña requerida'),
  validar,
], login);

router.post('/logout', requireAuth, logout);
router.get('/me', me);

module.exports = router;
```

- [ ] **Step 5: Commit**

```bash
git add server/middleware/ server/controllers/authController.js server/routes/auth.routes.js
git commit -m "feat: add auth system with login, logout, session, and role middleware"
```

---

### Task 6: Seed script with admin user and initial data

**Files:**
- Create: `server/seeders/seed.js`

- [ ] **Step 1: Create seed script**

Create `server/seeders/seed.js`:

```javascript
const bcrypt = require('bcrypt');
const { sequelize, Usuario, CategoriaEtiqueta, Etiqueta, Configuracion } = require('../models');

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Tablas creadas.');

    // Admin user
    const hash = await bcrypt.hash('admin123', 12);
    await Usuario.create({
      nombre: 'Administrador',
      email: 'admin@voya.com',
      contrasena: hash,
      rol: 'admin',
      activo: true,
    });
    console.log('Usuario admin creado (admin@voya.com / admin123)');

    // Tag categories and tags
    const categorias = [
      {
        nombre: 'Temporada', slug: 'temporada',
        etiquetas: [
          { nombre: 'Verano', slug: 'verano' },
          { nombre: 'Invierno', slug: 'invierno' },
          { nombre: 'Primavera', slug: 'primavera' },
          { nombre: 'Otoño', slug: 'otono' },
          { nombre: 'Todo el año', slug: 'todo-el-ano' },
        ],
      },
      {
        nombre: 'Tipo de transporte', slug: 'tipo-transporte',
        etiquetas: [
          { nombre: 'Aéreo', slug: 'aereo' },
          { nombre: 'Terrestre', slug: 'terrestre' },
          { nombre: 'Crucero', slug: 'crucero' },
          { nombre: 'Mixto', slug: 'mixto' },
        ],
      },
      {
        nombre: 'Tipo de viaje', slug: 'tipo-viaje',
        etiquetas: [
          { nombre: 'Circuito', slug: 'circuito' },
          { nombre: 'Estadía', slug: 'estadia' },
          { nombre: 'Escapada', slug: 'escapada' },
        ],
      },
      {
        nombre: 'Tipo de experiencia', slug: 'tipo-experiencia',
        etiquetas: [
          { nombre: 'Relax', slug: 'relax' },
          { nombre: 'Aventura', slug: 'aventura' },
          { nombre: 'Circuitos', slug: 'circuitos' },
          { nombre: 'Grupal', slug: 'grupal' },
          { nombre: 'Eventos', slug: 'eventos' },
          { nombre: 'Terrestre', slug: 'terrestre-exp' },
          { nombre: 'Exótico', slug: 'exotico' },
        ],
      },
    ];

    for (const cat of categorias) {
      const categoria = await CategoriaEtiqueta.create({
        nombre: cat.nombre,
        slug: cat.slug,
      });
      for (const etiq of cat.etiquetas) {
        await Etiqueta.create({
          nombre: etiq.nombre,
          slug: etiq.slug,
          categoria_id: categoria.id,
        });
      }
    }
    console.log('Categorías y etiquetas creadas.');

    // Configuration defaults
    const configs = [
      { clave: 'estadistica_paquetes', valor: '120+', tipo: 'texto' },
      { clave: 'estadistica_paises', valor: '30+', tipo: 'texto' },
      { clave: 'estadistica_actividades', valor: '50+', tipo: 'texto' },
      { clave: 'estadistica_viajeros', valor: '10K+', tipo: 'texto' },
      { clave: 'whatsapp_numero', valor: process.env.WHATSAPP_NUMBER || '59899123456', tipo: 'texto' },
      { clave: 'email_contacto', valor: 'info@voya.com', tipo: 'texto' },
      { clave: 'telefono_contacto', valor: '+598 99 123 456', tipo: 'texto' },
    ];
    await Configuracion.bulkCreate(configs);
    console.log('Configuración inicial creada.');

    console.log('\n✅ Seed completado exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
};

seed();
```

- [ ] **Step 2: Run seed**

```bash
cd C:/Users/dgrod/voya-travel
npm run seed
```

Expected: Tables created, admin user, categories, tags, and config created.

- [ ] **Step 3: Commit**

```bash
git add server/seeders/
git commit -m "feat: add seed script with admin user, tag categories, and config defaults"
```

---

## Phase 2: Backend API — CRUD Endpoints

### Task 7: Paquetes CRUD controller and routes

**Files:**
- Create: `server/controllers/paqueteController.js`
- Create: `server/middleware/validacion.js`
- Modify: `server/routes/paquetes.routes.js`

- [ ] **Step 1: Create validation middleware**

Create `server/middleware/validacion.js`:

```javascript
const { validationResult } = require('express-validator');

const validar = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  next();
};

module.exports = { validar };
```

- [ ] **Step 2: Create paquete controller**

Create `server/controllers/paqueteController.js`:

```javascript
const { Op } = require('sequelize');
const { Paquete, ImagenPaquete, Itinerario, Etiqueta, Destino, CategoriaEtiqueta, Usuario } = require('../models');

const listar = async (req, res) => {
  try {
    const {
      pagina = 1,
      limite = 12,
      orden = 'recientes',
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
    // Only show available packages on public requests (no session = public)
    if (!req.session?.usuario) {
      where.disponible = true;
    } else if (disponible !== undefined) {
      where.disponible = disponible === 'true';
    }

    if (destacado === 'true') where.destacado = true;
    if (busqueda) {
      where[Op.or] = [
        { titulo: { [Op.like]: `%${busqueda}%` } },
        { descripcion: { [Op.like]: `%${busqueda}%` } },
      ];
    }
    if (precio_min) where.precio_adulto = { ...where.precio_adulto, [Op.gte]: parseFloat(precio_min) };
    if (precio_max) where.precio_adulto = { ...where.precio_adulto, [Op.lte]: parseFloat(precio_max) };
    if (duracion_min) where.duracion_dias = { ...where.duracion_dias, [Op.gte]: parseInt(duracion_min) };
    if (duracion_max) where.duracion_dias = { ...where.duracion_dias, [Op.lte]: parseInt(duracion_max) };

    // Ordering
    let orderClause;
    switch (orden) {
      case 'precio_asc': orderClause = [['precio_adulto', 'ASC']]; break;
      case 'precio_desc': orderClause = [['precio_adulto', 'DESC']]; break;
      case 'duracion': orderClause = [['duracion_dias', 'ASC']]; break;
      default: orderClause = [['creado_en', 'DESC']];
    }

    // Tag-based filtering via includes
    const includeEtiquetas = {
      model: Etiqueta,
      as: 'etiquetas',
      through: { attributes: [] },
      include: [{ model: CategoriaEtiqueta, as: 'categoria', attributes: ['slug'] }],
    };

    const includeDestinos = {
      model: Destino,
      as: 'destinos',
      through: { attributes: [] },
    };

    // Build tag where clause for filtering
    const etiquetaWhere = {};
    const tagFilters = [];
    if (temporada) tagFilters.push(temporada);
    if (transporte) tagFilters.push(transporte);
    if (experiencia) tagFilters.push(experiencia);

    // For tag filtering, we need a subquery approach
    let paqueteIds = null;
    if (tagFilters.length > 0 || destino) {
      const filterConditions = {};

      if (tagFilters.length > 0) {
        const paquetesConTags = await Paquete.findAll({
          attributes: ['id'],
          include: [{
            model: Etiqueta,
            as: 'etiquetas',
            where: { slug: { [Op.in]: tagFilters } },
            through: { attributes: [] },
          }],
          raw: true,
        });
        paqueteIds = paquetesConTags.map(p => p.id);
      }

      if (destino) {
        const paquetesConDestino = await Paquete.findAll({
          attributes: ['id'],
          include: [{
            model: Destino,
            as: 'destinos',
            where: { slug: destino },
            through: { attributes: [] },
          }],
          raw: true,
        });
        const idsDestino = paquetesConDestino.map(p => p.id);
        paqueteIds = paqueteIds
          ? paqueteIds.filter(id => idsDestino.includes(id))
          : idsDestino;
      }

      if (paqueteIds !== null) {
        where.id = { [Op.in]: paqueteIds };
      }
    }

    const offset = (parseInt(pagina) - 1) * parseInt(limite);
    const { count, rows } = await Paquete.findAndCountAll({
      where,
      include: [
        { model: ImagenPaquete, as: 'imagenes', attributes: ['id', 'ruta_imagen', 'texto_alt', 'orden', 'es_portada'] },
        includeEtiquetas,
        includeDestinos,
      ],
      order: orderClause,
      limit: parseInt(limite),
      offset,
      distinct: true,
    });

    res.json({
      paquetes: rows,
      total: count,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(count / parseInt(limite)),
    });
  } catch (error) {
    console.error('Error listando paquetes:', error);
    res.status(500).json({ error: 'Error al obtener paquetes' });
  }
};

const destacados = async (req, res) => {
  try {
    const paquetes = await Paquete.findAll({
      where: { destacado: true, disponible: true },
      include: [
        { model: ImagenPaquete, as: 'imagenes', attributes: ['id', 'ruta_imagen', 'texto_alt', 'es_portada'] },
        { model: Etiqueta, as: 'etiquetas', through: { attributes: [] } },
        { model: Destino, as: 'destinos', through: { attributes: [] } },
      ],
      order: [['creado_en', 'DESC']],
      limit: 10,
    });
    res.json({ paquetes });
  } catch (error) {
    console.error('Error obteniendo destacados:', error);
    res.status(500).json({ error: 'Error al obtener paquetes destacados' });
  }
};

const obtenerPorSlug = async (req, res) => {
  try {
    const paquete = await Paquete.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: ImagenPaquete, as: 'imagenes', order: [['orden', 'ASC']] },
        { model: Itinerario, as: 'itinerario', order: [['orden', 'ASC']] },
        { model: Etiqueta, as: 'etiquetas', through: { attributes: [] }, include: [{ model: CategoriaEtiqueta, as: 'categoria' }] },
        { model: Destino, as: 'destinos', through: { attributes: [] } },
        { model: Usuario, as: 'creador', attributes: ['nombre'] },
      ],
    });
    if (!paquete) {
      return res.status(404).json({ error: 'Paquete no encontrado' });
    }
    res.json({ paquete });
  } catch (error) {
    console.error('Error obteniendo paquete:', error);
    res.status(500).json({ error: 'Error al obtener paquete' });
  }
};

const crear = async (req, res) => {
  try {
    const { etiquetas_ids, destinos_ids, itinerario, ...datos } = req.body;
    datos.creado_por = req.session.usuario.id;
    const paquete = await Paquete.create(datos);

    if (etiquetas_ids?.length) await paquete.setEtiquetas(etiquetas_ids);
    if (destinos_ids?.length) await paquete.setDestinos(destinos_ids);
    if (itinerario?.length) {
      await Itinerario.bulkCreate(
        itinerario.map((item, i) => ({ ...item, paquete_id: paquete.id, orden: i }))
      );
    }

    const paqueteCompleto = await Paquete.findByPk(paquete.id, {
      include: [
        { model: Etiqueta, as: 'etiquetas', through: { attributes: [] } },
        { model: Destino, as: 'destinos', through: { attributes: [] } },
        { model: Itinerario, as: 'itinerario' },
      ],
    });
    res.status(201).json({ paquete: paqueteCompleto });
  } catch (error) {
    console.error('Error creando paquete:', error);
    res.status(500).json({ error: 'Error al crear paquete' });
  }
};

const actualizar = async (req, res) => {
  try {
    const paquete = await Paquete.findByPk(req.params.id);
    if (!paquete) return res.status(404).json({ error: 'Paquete no encontrado' });

    const { etiquetas_ids, destinos_ids, itinerario, ...datos } = req.body;
    await paquete.update(datos);

    if (etiquetas_ids !== undefined) await paquete.setEtiquetas(etiquetas_ids);
    if (destinos_ids !== undefined) await paquete.setDestinos(destinos_ids);
    if (itinerario !== undefined) {
      await Itinerario.destroy({ where: { paquete_id: paquete.id } });
      if (itinerario.length) {
        await Itinerario.bulkCreate(
          itinerario.map((item, i) => ({ ...item, paquete_id: paquete.id, orden: i }))
        );
      }
    }

    const paqueteCompleto = await Paquete.findByPk(paquete.id, {
      include: [
        { model: ImagenPaquete, as: 'imagenes' },
        { model: Etiqueta, as: 'etiquetas', through: { attributes: [] } },
        { model: Destino, as: 'destinos', through: { attributes: [] } },
        { model: Itinerario, as: 'itinerario' },
      ],
    });
    res.json({ paquete: paqueteCompleto });
  } catch (error) {
    console.error('Error actualizando paquete:', error);
    res.status(500).json({ error: 'Error al actualizar paquete' });
  }
};

const toggleDisponible = async (req, res) => {
  try {
    const paquete = await Paquete.findByPk(req.params.id);
    if (!paquete) return res.status(404).json({ error: 'Paquete no encontrado' });
    await paquete.update({ disponible: !paquete.disponible });
    res.json({ paquete });
  } catch (error) {
    console.error('Error toggle disponible:', error);
    res.status(500).json({ error: 'Error al cambiar disponibilidad' });
  }
};

const eliminar = async (req, res) => {
  try {
    const paquete = await Paquete.findByPk(req.params.id);
    if (!paquete) return res.status(404).json({ error: 'Paquete no encontrado' });
    await paquete.destroy();
    res.json({ mensaje: 'Paquete eliminado' });
  } catch (error) {
    console.error('Error eliminando paquete:', error);
    res.status(500).json({ error: 'Error al eliminar paquete' });
  }
};

module.exports = { listar, destacados, obtenerPorSlug, crear, actualizar, toggleDisponible, eliminar };
```

- [ ] **Step 3: Wire up paquetes routes**

Update `server/routes/paquetes.routes.js`:

```javascript
const router = require('express').Router();
const { body } = require('express-validator');
const { listar, destacados, obtenerPorSlug, crear, actualizar, toggleDisponible, eliminar } = require('../controllers/paqueteController');
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');
const { validar } = require('../middleware/validacion');

const validarPaquete = [
  body('titulo').notEmpty().trim().escape().withMessage('Título requerido'),
  body('slug').notEmpty().trim().withMessage('Slug requerido'),
  body('duracion_dias').isInt({ min: 1 }).withMessage('Duración en días requerida'),
  body('precio_adulto').isFloat({ min: 0 }).withMessage('Precio adulto requerido'),
  validar,
];

// Public
router.get('/', listar);
router.get('/destacados', destacados);
router.get('/:slug', obtenerPorSlug);

// Protected (editor+)
router.post('/', requireAuth, requireMinRole('editor'), validarPaquete, crear);
router.put('/:id', requireAuth, requireMinRole('editor'), actualizar);
router.patch('/:id/disponible', requireAuth, requireMinRole('editor'), toggleDisponible);

// Protected (admin only)
router.delete('/:id', requireAuth, requireMinRole('admin'), eliminar);

module.exports = router;
```

- [ ] **Step 4: Commit**

```bash
git add server/controllers/paqueteController.js server/routes/paquetes.routes.js server/middleware/validacion.js
git commit -m "feat: add paquetes CRUD with filtering, pagination, and role-based access"
```

---

### Task 8: Remaining CRUD controllers and routes

**Files:**
- Create: `server/controllers/etiquetaController.js`
- Create: `server/controllers/destinoController.js`
- Create: `server/controllers/imagenController.js`
- Create: `server/controllers/usuarioController.js`
- Create: `server/controllers/contactoController.js`
- Create: `server/controllers/testimonioController.js`
- Create: `server/controllers/configuracionController.js`
- Create: `server/middleware/upload.js`
- Modify: all remaining route files

- [ ] **Step 1: Create upload middleware**

Create `server/middleware/upload.js`:

```javascript
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/paquetes'));
  },
  filename: (req, file, cb) => {
    const ext = MIME_TYPES[file.mimetype];
    cb(null, `${uuidv4()}.${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (MIME_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo JPG, PNG y WebP.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
```

- [ ] **Step 2: Create etiqueta controller and routes**

Create `server/controllers/etiquetaController.js`:

```javascript
const { Etiqueta, CategoriaEtiqueta } = require('../models');

const listar = async (req, res) => {
  try {
    const categorias = await CategoriaEtiqueta.findAll({
      include: [{ model: Etiqueta, as: 'etiquetas' }],
      order: [['nombre', 'ASC'], [{ model: Etiqueta, as: 'etiquetas' }, 'nombre', 'ASC']],
    });
    res.json({ categorias });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener etiquetas' });
  }
};

const crearCategoria = async (req, res) => {
  try {
    const categoria = await CategoriaEtiqueta.create(req.body);
    res.status(201).json({ categoria });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

const crear = async (req, res) => {
  try {
    const etiqueta = await Etiqueta.create(req.body);
    res.status(201).json({ etiqueta });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear etiqueta' });
  }
};

const actualizar = async (req, res) => {
  try {
    const etiqueta = await Etiqueta.findByPk(req.params.id);
    if (!etiqueta) return res.status(404).json({ error: 'Etiqueta no encontrada' });
    await etiqueta.update(req.body);
    res.json({ etiqueta });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar etiqueta' });
  }
};

const eliminar = async (req, res) => {
  try {
    const etiqueta = await Etiqueta.findByPk(req.params.id);
    if (!etiqueta) return res.status(404).json({ error: 'Etiqueta no encontrada' });
    await etiqueta.destroy();
    res.json({ mensaje: 'Etiqueta eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar etiqueta' });
  }
};

module.exports = { listar, crearCategoria, crear, actualizar, eliminar };
```

Update `server/routes/etiquetas.routes.js`:

```javascript
const router = require('express').Router();
const { listar, crearCategoria, crear, actualizar, eliminar } = require('../controllers/etiquetaController');
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');

router.get('/', listar);
router.post('/categorias', requireAuth, requireMinRole('editor'), crearCategoria);
router.post('/', requireAuth, requireMinRole('editor'), crear);
router.put('/:id', requireAuth, requireMinRole('editor'), actualizar);
router.delete('/:id', requireAuth, requireMinRole('admin'), eliminar);

module.exports = router;
```

- [ ] **Step 3: Create destino controller and routes**

Create `server/controllers/destinoController.js`:

```javascript
const { Destino } = require('../models');

const listar = async (req, res) => {
  try {
    const destinos = await Destino.findAll({ order: [['nombre', 'ASC']] });
    res.json({ destinos });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener destinos' });
  }
};

const crear = async (req, res) => {
  try {
    const destino = await Destino.create(req.body);
    res.status(201).json({ destino });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear destino' });
  }
};

const actualizar = async (req, res) => {
  try {
    const destino = await Destino.findByPk(req.params.id);
    if (!destino) return res.status(404).json({ error: 'Destino no encontrado' });
    await destino.update(req.body);
    res.json({ destino });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar destino' });
  }
};

const eliminar = async (req, res) => {
  try {
    const destino = await Destino.findByPk(req.params.id);
    if (!destino) return res.status(404).json({ error: 'Destino no encontrado' });
    await destino.destroy();
    res.json({ mensaje: 'Destino eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar destino' });
  }
};

module.exports = { listar, crear, actualizar, eliminar };
```

Update `server/routes/destinos.routes.js`:

```javascript
const router = require('express').Router();
const { listar, crear, actualizar, eliminar } = require('../controllers/destinoController');
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');

router.get('/', listar);
router.post('/', requireAuth, requireMinRole('editor'), crear);
router.put('/:id', requireAuth, requireMinRole('editor'), actualizar);
router.delete('/:id', requireAuth, requireMinRole('admin'), eliminar);

module.exports = router;
```

- [ ] **Step 4: Create imagen controller and routes**

Create `server/controllers/imagenController.js`:

```javascript
const path = require('path');
const fs = require('fs');
const { ImagenPaquete } = require('../models');

const subir = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se enviaron imágenes' });
    }
    const imagenes = await Promise.all(
      req.files.map((file, i) =>
        ImagenPaquete.create({
          paquete_id: req.params.paqueteId,
          ruta_imagen: `/uploads/paquetes/${file.filename}`,
          texto_alt: req.body.texto_alt || '',
          orden: i,
          es_portada: i === 0 && req.body.es_portada === 'true',
        })
      )
    );
    res.status(201).json({ imagenes });
  } catch (error) {
    console.error('Error subiendo imágenes:', error);
    res.status(500).json({ error: 'Error al subir imágenes' });
  }
};

const eliminar = async (req, res) => {
  try {
    const imagen = await ImagenPaquete.findByPk(req.params.id);
    if (!imagen) return res.status(404).json({ error: 'Imagen no encontrada' });

    // Delete file from disk
    const filePath = path.join(__dirname, '..', imagen.ruta_imagen);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await imagen.destroy();
    res.json({ mensaje: 'Imagen eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
};

const actualizarOrden = async (req, res) => {
  try {
    const imagen = await ImagenPaquete.findByPk(req.params.id);
    if (!imagen) return res.status(404).json({ error: 'Imagen no encontrada' });
    await imagen.update({ orden: req.body.orden, es_portada: req.body.es_portada });
    res.json({ imagen });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar imagen' });
  }
};

module.exports = { subir, eliminar, actualizarOrden };
```

Update `server/routes/imagenes.routes.js`:

```javascript
const router = require('express').Router();
const { subir, eliminar, actualizarOrden } = require('../controllers/imagenController');
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');
const upload = require('../middleware/upload');

router.post('/:paqueteId', requireAuth, requireMinRole('editor'), upload.array('imagenes', 10), subir);
router.delete('/:id', requireAuth, requireMinRole('editor'), eliminar);
router.put('/:id/orden', requireAuth, requireMinRole('editor'), actualizarOrden);

module.exports = router;
```

- [ ] **Step 5: Create usuario, contacto, testimonio, and configuracion controllers and routes**

Create `server/controllers/usuarioController.js`:

```javascript
const bcrypt = require('bcrypt');
const { Usuario } = require('../models');

const listar = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['contrasena'] },
      order: [['creado_en', 'DESC']],
    });
    res.json({ usuarios });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const crear = async (req, res) => {
  try {
    const { contrasena, ...datos } = req.body;
    datos.contrasena = await bcrypt.hash(contrasena, 12);
    const usuario = await Usuario.create(datos);
    const { contrasena: _, ...sinContrasena } = usuario.toJSON();
    res.status(201).json({ usuario: sinContrasena });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

const actualizar = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    const { contrasena, ...datos } = req.body;
    if (contrasena) datos.contrasena = await bcrypt.hash(contrasena, 12);
    await usuario.update(datos);
    const { contrasena: _, ...sinContrasena } = usuario.toJSON();
    res.json({ usuario: sinContrasena });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

const eliminar = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (usuario.id === req.session.usuario.id) {
      return res.status(400).json({ error: 'No puede eliminarse a sí mismo' });
    }
    await usuario.destroy();
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

module.exports = { listar, crear, actualizar, eliminar };
```

Create `server/controllers/contactoController.js`:

```javascript
const transporter = require('../config/email');

const enviarConsulta = async (req, res) => {
  try {
    const { nombre, email, celular, mensaje, paquete_titulo, adultos, ninos, infantes } = req.body;

    // Sanitize inputs for HTML email
    const esc = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const html = `
      <h2>Nueva consulta desde Voyâ</h2>
      ${paquete_titulo ? `<p><strong>Paquete:</strong> ${esc(paquete_titulo)}</p>` : ''}
      <p><strong>Nombre:</strong> ${esc(nombre)}</p>
      <p><strong>Email:</strong> ${esc(email)}</p>
      <p><strong>Celular:</strong> ${esc(celular) || 'No proporcionado'}</p>
      ${adultos ? `<p><strong>Adultos:</strong> ${esc(adultos)}</p>` : ''}
      ${ninos ? `<p><strong>Niños:</strong> ${esc(ninos)}</p>` : ''}
      ${infantes ? `<p><strong>Infantes:</strong> ${esc(infantes)}</p>` : ''}
      <p><strong>Mensaje:</strong></p>
      <p>${esc(mensaje)}</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: paquete_titulo
        ? `Consulta sobre: ${paquete_titulo}`
        : 'Nueva consulta desde el sitio web',
      html,
    });

    res.json({ mensaje: 'Consulta enviada correctamente' });
  } catch (error) {
    console.error('Error enviando email:', error);
    res.status(500).json({ error: 'Error al enviar la consulta' });
  }
};

module.exports = { enviarConsulta };
```

Create `server/controllers/testimonioController.js`:

```javascript
const { Testimonio } = require('../models');

const listar = async (req, res) => {
  try {
    const where = req.session?.usuario ? {} : { activo: true };
    const testimonios = await Testimonio.findAll({ where, order: [['orden', 'ASC']] });
    res.json({ testimonios });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener testimonios' });
  }
};

const crear = async (req, res) => {
  try {
    const testimonio = await Testimonio.create(req.body);
    res.status(201).json({ testimonio });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear testimonio' });
  }
};

const actualizar = async (req, res) => {
  try {
    const testimonio = await Testimonio.findByPk(req.params.id);
    if (!testimonio) return res.status(404).json({ error: 'Testimonio no encontrado' });
    await testimonio.update(req.body);
    res.json({ testimonio });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar testimonio' });
  }
};

const eliminar = async (req, res) => {
  try {
    const testimonio = await Testimonio.findByPk(req.params.id);
    if (!testimonio) return res.status(404).json({ error: 'Testimonio no encontrado' });
    await testimonio.destroy();
    res.json({ mensaje: 'Testimonio eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar testimonio' });
  }
};

module.exports = { listar, crear, actualizar, eliminar };
```

Create `server/controllers/configuracionController.js`:

```javascript
const { Configuracion } = require('../models');

const obtener = async (req, res) => {
  try {
    const configs = await Configuracion.findAll();
    const resultado = {};
    configs.forEach(c => { resultado[c.clave] = c.valor; });
    res.json({ configuracion: resultado });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

const actualizar = async (req, res) => {
  try {
    const config = await Configuracion.findOne({ where: { clave: req.params.clave } });
    if (!config) return res.status(404).json({ error: 'Configuración no encontrada' });
    await config.update({ valor: req.body.valor });
    res.json({ configuracion: config });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
};

module.exports = { obtener, actualizar };
```

Update remaining route files:

`server/routes/usuarios.routes.js`:
```javascript
const router = require('express').Router();
const { listar, crear, actualizar, eliminar } = require('../controllers/usuarioController');
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');

router.get('/', requireAuth, requireMinRole('admin'), listar);
router.post('/', requireAuth, requireMinRole('admin'), crear);
router.put('/:id', requireAuth, requireMinRole('admin'), actualizar);
router.delete('/:id', requireAuth, requireMinRole('admin'), eliminar);

module.exports = router;
```

`server/routes/contacto.routes.js`:
```javascript
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { enviarConsulta } = require('../controllers/contactoController');
const { validar } = require('../middleware/validacion');

const contactoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Demasiadas consultas, intente de nuevo en 15 minutos' },
});

router.post('/', contactoLimiter, [
  body('nombre').notEmpty().trim().escape().withMessage('Nombre requerido'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('mensaje').notEmpty().trim().withMessage('Mensaje requerido'),
  validar,
], enviarConsulta);

module.exports = router;
```

`server/routes/testimonios.routes.js`:
```javascript
const router = require('express').Router();
const { listar, crear, actualizar, eliminar } = require('../controllers/testimonioController');
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');

router.get('/', listar);
router.post('/', requireAuth, requireMinRole('editor'), crear);
router.put('/:id', requireAuth, requireMinRole('editor'), actualizar);
router.delete('/:id', requireAuth, requireMinRole('admin'), eliminar);

module.exports = router;
```

`server/routes/configuracion.routes.js`:
```javascript
const router = require('express').Router();
const { obtener, actualizar } = require('../controllers/configuracionController');
const { requireAuth } = require('../middleware/auth');
const { requireMinRole } = require('../middleware/roles');

router.get('/', obtener);
router.put('/:clave', requireAuth, requireMinRole('admin'), actualizar);

module.exports = router;
```

- [ ] **Step 6: Test server boots with all routes**

```bash
cd C:/Users/dgrod/voya-travel && npm run dev:server
```

Test a few endpoints manually:
- `GET http://localhost:4000/api/paquetes` → should return `{ paquetes: [], total: 0, ... }`
- `GET http://localhost:4000/api/etiquetas` → should return categories with tags
- `GET http://localhost:4000/api/configuracion` → should return config values

- [ ] **Step 7: Commit**

```bash
git add server/
git commit -m "feat: add all CRUD controllers and routes (etiquetas, destinos, imagenes, usuarios, contacto, testimonios, configuracion)"
```

---

## Phase 3: Frontend Foundation

### Task 9: React app setup — styles, layout, routing

**Files:**
- Create: `client/src/styles/variables.css`
- Create: `client/src/styles/reset.css`
- Create: `client/src/styles/global.css`
- Create: `client/src/services/api.js`
- Create: `client/src/context/AuthContext.jsx`
- Create: `client/src/Router.jsx`
- Modify: `client/src/App.jsx`
- Modify: `client/src/main.jsx`

> **@frontend-design:** Use this skill when implementing all frontend components. Apply the Voyâ brand: green `#378966`, salmon `#fc7c5e`, dark `#1d1d1b`, cream `#f7efed`, yellow `#ffc757`. Fonts: Supertuba Light (headings), Geomanist Light (body).

- [ ] **Step 1: Create CSS variables and reset**

Create `client/src/styles/variables.css`:

```css
:root {
  /* Voyâ Brand Colors */
  --color-verde: #378966;
  --color-verde-oscuro: #2a6b4f;
  --color-verde-claro: #4a9e76;
  --color-salmon: #fc7c5e;
  --color-salmon-oscuro: #e66b4f;
  --color-negro: #1d1d1b;
  --color-crema: #f7efed;
  --color-amarillo: #ffc757;
  --color-blanco: #ffffff;
  --color-gris: #666666;
  --color-gris-claro: #999999;
  --color-borde: #e0e0e0;

  /* Typography */
  --font-titulares: 'Supertuba Light', 'Arial Black', sans-serif;
  --font-cuerpo: 'Geomanist Light', 'Helvetica Neue', Arial, sans-serif;

  /* Spacing */
  --espaciado-xs: 4px;
  --espaciado-sm: 8px;
  --espaciado-md: 16px;
  --espaciado-lg: 24px;
  --espaciado-xl: 32px;
  --espaciado-2xl: 48px;

  /* Border Radius */
  --radio-sm: 6px;
  --radio-md: 10px;
  --radio-lg: 14px;
  --radio-xl: 20px;
  --radio-completo: 9999px;

  /* Shadows */
  --sombra-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --sombra-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --sombra-lg: 0 8px 32px rgba(0, 0, 0, 0.12);

  /* Layout */
  --ancho-maximo: 1200px;
  --navbar-altura: 64px;
}
```

Create `client/src/styles/reset.css`:

```css
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html { font-size: 16px; scroll-behavior: smooth; }

body {
  font-family: var(--font-cuerpo);
  color: var(--color-negro);
  background-color: var(--color-crema);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a { text-decoration: none; color: inherit; }
ul, ol { list-style: none; }
img { max-width: 100%; display: block; }
button { cursor: pointer; border: none; background: none; font-family: inherit; }
input, textarea, select { font-family: inherit; font-size: inherit; }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-titulares); font-weight: 300; }
```

Create `client/src/styles/global.css`:

```css
@import './reset.css';
@import './variables.css';

.contenedor {
  max-width: var(--ancho-maximo);
  margin: 0 auto;
  padding: 0 var(--espaciado-lg);
}

/* Utility classes */
.texto-centro { text-align: center; }
.texto-verde { color: var(--color-verde); }
.texto-salmon { color: var(--color-salmon); }
.fondo-verde { background-color: var(--color-verde); }
.fondo-crema { background-color: var(--color-crema); }
```

- [ ] **Step 2: Create API service**

Create `client/src/services/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:4000/api' : '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
```

- [ ] **Step 3: Create AuthContext**

Create `client/src/context/AuthContext.jsx`:

```jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const verificarSesion = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUsuario(data.usuario);
    } catch {
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { verificarSesion(); }, [verificarSesion]);

  const login = async (email, contrasena) => {
    const { data } = await api.post('/auth/login', { email, contrasena });
    setUsuario(data.usuario);
    return data.usuario;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

- [ ] **Step 4: Create Router with placeholder pages**

Create `client/src/Router.jsx`:

```jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// Public pages (placeholders for now)
const HomePage = () => <div>Home</div>;
const PaquetesPage = () => <div>Paquetes</div>;
const PaqueteDetallePage = () => <div>Detalle</div>;
const NosotrosPage = () => <div>Nosotros</div>;
const ContactoPage = () => <div>Contacto</div>;

// Admin pages (placeholders)
const LoginPage = () => <div>Login</div>;
const DashboardPage = () => <div>Dashboard</div>;
const PaquetesListPage = () => <div>Admin Paquetes</div>;
const PaqueteEditPage = () => <div>Editar Paquete</div>;
const EtiquetasPage = () => <div>Etiquetas</div>;
const TestimoniosPage = () => <div>Testimonios</div>;
const ConfiguracionPage = () => <div>Configuración</div>;
const UsuariosPage = () => <div>Usuarios</div>;

function RutaProtegida({ rolMinimo }) {
  const { usuario, cargando } = useContext(AuthContext);
  if (cargando) return <div>Cargando...</div>;
  if (!usuario) return <Navigate to="/admin/login" replace />;

  const jerarquia = { admin: 3, editor: 2, visor: 1 };
  if (rolMinimo && jerarquia[usuario.rol] < jerarquia[rolMinimo]) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/paquetes" element={<PaquetesPage />} />
        <Route path="/paquetes/:slug" element={<PaqueteDetallePage />} />
        <Route path="/nosotros" element={<NosotrosPage />} />
        <Route path="/contacto" element={<ContactoPage />} />

        {/* Admin */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route element={<RutaProtegida />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/paquetes" element={<PaquetesListPage />} />
          <Route element={<RutaProtegida rolMinimo="editor" />}>
            <Route path="/admin/paquetes/nuevo" element={<PaqueteEditPage />} />
            <Route path="/admin/paquetes/:id" element={<PaqueteEditPage />} />
            <Route path="/admin/etiquetas" element={<EtiquetasPage />} />
            <Route path="/admin/testimonios" element={<TestimoniosPage />} />
          </Route>
          <Route element={<RutaProtegida rolMinimo="admin" />}>
            <Route path="/admin/configuracion" element={<ConfiguracionPage />} />
            <Route path="/admin/usuarios" element={<UsuariosPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 5: Update App.jsx and main.jsx**

Update `client/src/App.jsx`:

```jsx
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './Router';
import './styles/global.css';

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </HelmetProvider>
  );
}
```

Update `client/src/main.jsx`:

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 6: Verify React app boots**

```bash
cd C:/Users/dgrod/voya-travel && npm run dev:client
```

Expected: app loads at `http://localhost:5173` showing "Home".

- [ ] **Step 7: Commit**

```bash
git add client/
git commit -m "feat: add React app foundation with routing, auth context, styles, and API service"
```

---

## Phase 4: Frontend Public Pages

### Task 10: Layout components (Header, Footer, WhatsApp button)

> **@frontend-design:** Build these components with the Voyâ brand identity. Reference wireframes in the spec.

**Files:**
- Create: `client/src/components/layout/TopBar.jsx` + `TopBar.module.css`
- Create: `client/src/components/layout/Navbar.jsx` + `Navbar.module.css`
- Create: `client/src/components/layout/Footer.jsx` + `Footer.module.css`
- Create: `client/src/components/layout/WhatsAppButton.jsx` + `WhatsAppButton.module.css`
- Create: `client/src/components/layout/PublicLayout.jsx`
- Create: `client/src/hooks/useConfiguracion.js`

- [ ] **Step 1:** Create `useConfiguracion` hook that fetches `/api/configuracion` and caches the result.

- [ ] **Step 2:** Create `TopBar` — green bar with social media icons, phone, and email (data from configuracion).

- [ ] **Step 3:** Create `Navbar` — white bar with logo "voyâ", navigation links (Home, Paquetes, Nosotros, Contacto), WhatsApp button. Responsive with hamburger menu for mobile.

- [ ] **Step 4:** Create `Footer` — dark background with 4 columns: logo+description, navegación, explorar, contacto. Social media icons. Copyright.

- [ ] **Step 5:** Create `WhatsAppButton` — fixed floating button bottom-right that opens `wa.me/{number}`.

- [ ] **Step 6:** Create `PublicLayout` that wraps TopBar + Navbar + children + Footer + WhatsAppButton.

- [ ] **Step 7:** Update Router to wrap public routes with PublicLayout.

- [ ] **Step 8: Commit**

```bash
git add client/src/components/layout/ client/src/hooks/
git commit -m "feat: add public layout components (TopBar, Navbar, Footer, WhatsApp)"
```

---

### Task 11: HomePage

**Files:**
- Create: `client/src/pages/public/HomePage.jsx` + `HomePage.module.css`
- Create: `client/src/components/paquetes/PaqueteCard.jsx` + `PaqueteCard.module.css`
- Create: `client/src/services/paqueteService.js`

- [ ] **Step 1:** Create `paqueteService.js` with functions: `obtenerDestacados()`, `listar(params)`, `obtenerPorSlug(slug)`.

- [ ] **Step 2:** Create `PaqueteCard` component — shows image, badge (temporada), title, duration, service icons (plane, hotel, meals, bed), price. Used in carrusel and grid.

- [ ] **Step 3:** Build HomePage sections:
  1. Hero with gradient background + title
  2. Floating search bar (Destino, Temporada, Días, Presupuesto, Buscar button) — navigates to `/paquetes?...`
  3. Featured packages carousel (Swiper) with `PaqueteCard`
  4. "Tu tipo de viaje" grid (Relax, Aventura, Circuitos, Grupal, Eventos, Terrestre, Exótico) — each links to `/paquetes?experiencia=X`
  5. "¿Por qué Voyâ?" section — 4 columns with icons
  6. Statistics bar — dark background, counters from configuracion
  7. Testimonials carousel (Swiper) — fetches from `/api/testimonios`

- [ ] **Step 4:** Update Router to use actual HomePage.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/public/HomePage.jsx client/src/components/paquetes/ client/src/services/paqueteService.js
git commit -m "feat: add HomePage with hero, search, carousel, experience types, stats, testimonials"
```

---

### Task 12: PaquetesPage (catalog with filters)

**Files:**
- Create: `client/src/pages/public/PaquetesPage.jsx` + `PaquetesPage.module.css`
- Create: `client/src/components/paquetes/PaqueteFiltros.jsx` + `PaqueteFiltros.module.css`
- Create: `client/src/hooks/usePaquetes.js`
- Create: `client/src/hooks/useFiltros.js`

- [ ] **Step 1:** Create `useFiltros` hook — reads URL search params, provides `filtros` state and `setFiltro(key, value)` function. Syncs with URL.

- [ ] **Step 2:** Create `usePaquetes` hook — calls `paqueteService.listar(filtros)`, returns `{ paquetes, total, cargando, pagina, totalPaginas }`.

- [ ] **Step 3:** Create `PaqueteFiltros` sidebar — checkboxes for destinos, etiquetas by category; range sliders for precio and duración; fetches filter options from `/api/etiquetas` and `/api/destinos`.

- [ ] **Step 4:** Build PaquetesPage — header, sidebar filters, grid of `PaqueteCard`, sorting dropdown, grid/list toggle, pagination.

- [ ] **Step 5:** Update Router.

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/public/PaquetesPage.jsx client/src/components/paquetes/PaqueteFiltros.jsx client/src/hooks/
git commit -m "feat: add PaquetesPage with filters, sorting, pagination"
```

---

### Task 13: PaqueteDetallePage

**Files:**
- Create: `client/src/pages/public/PaqueteDetallePage.jsx` + `PaqueteDetallePage.module.css`
- Create: `client/src/components/paquetes/PaqueteGaleria.jsx`
- Create: `client/src/components/paquetes/PaqueteItinerario.jsx`
- Create: `client/src/components/paquetes/FormularioConsulta.jsx`
- Create: `client/src/services/contactoService.js`

- [ ] **Step 1:** Create `contactoService.js` with `enviarConsulta(data)`.

- [ ] **Step 2:** Create `PaqueteGaleria` — Swiper carousel with dots, shows all package images.

- [ ] **Step 3:** Create `PaqueteItinerario` — timeline layout, day by day, with green vertical line.

- [ ] **Step 4:** Create `FormularioConsulta` — React Hook Form with fields: nombre, email, celular, adultos, niños, infantes, mensaje. Submit sends to `/api/contacto`. WhatsApp button opens `wa.me/{number}?text={pre-built message with package name}`.

- [ ] **Step 5:** Build PaqueteDetallePage — breadcrumb, title, duration, gallery, tags, summary, incluye/no incluye (two columns with ✅/❌), itinerary, conditions. Sidebar: price block, price breakdown, consultation form.

- [ ] **Step 6:** Update Router.

- [ ] **Step 7: Commit**

```bash
git add client/src/pages/public/PaqueteDetallePage.jsx client/src/components/paquetes/ client/src/services/contactoService.js
git commit -m "feat: add PaqueteDetallePage with gallery, itinerary, consultation form"
```

---

### Task 14: NosotrosPage and ContactoPage

**Files:**
- Create: `client/src/pages/public/NosotrosPage.jsx` + `NosotrosPage.module.css`
- Create: `client/src/pages/public/ContactoPage.jsx` + `ContactoPage.module.css`

- [ ] **Step 1:** Build NosotrosPage — hero, mission/vision, about the agency. Static content, styled with Voyâ brand.

- [ ] **Step 2:** Build ContactoPage — contact form (nombre, email, teléfono, mensaje), contact info sidebar (email, phone, address from configuracion).

- [ ] **Step 3:** Update Router.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/public/
git commit -m "feat: add NosotrosPage and ContactoPage"
```

---

## Phase 5: Frontend Admin Panel

### Task 15: Admin layout and login page

**Files:**
- Create: `client/src/components/layout/AdminLayout.jsx` + `AdminLayout.module.css`
- Create: `client/src/pages/admin/LoginPage.jsx` + `LoginPage.module.css`
- Create: `client/src/hooks/useAuth.js`
- Create: `client/src/services/authService.js`

- [ ] **Step 1:** Create `authService.js` — `login(email, contrasena)`, `logout()`, `obtenerUsuarioActual()`.

- [ ] **Step 2:** Create `useAuth` hook — shortcut for `useContext(AuthContext)`.

- [ ] **Step 3:** Create `LoginPage` — centered card with Voyâ logo, email/password form, error messages.

- [ ] **Step 4:** Create `AdminLayout` — dark sidebar with logo, navigation links (Dashboard, Paquetes, Etiquetas, Destinos, Testimonios, Configuración, Usuarios), current user info, logout button. Main content area. Links visibility based on user role.

- [ ] **Step 5:** Update Router to wrap admin routes with AdminLayout.

- [ ] **Step 6: Commit**

```bash
git add client/src/components/layout/AdminLayout.jsx client/src/pages/admin/LoginPage.jsx client/src/hooks/useAuth.js client/src/services/authService.js
git commit -m "feat: add admin layout with sidebar navigation and login page"
```

---

### Task 16: Admin — DashboardPage

**Files:**
- Create: `client/src/pages/admin/DashboardPage.jsx` + `DashboardPage.module.css`

- [ ] **Step 1:** Build DashboardPage — summary cards: total paquetes, disponibles, ocultos, destacados. Quick links to create package, manage tags.

- [ ] **Step 2: Commit**

```bash
git add client/src/pages/admin/DashboardPage.jsx
git commit -m "feat: add admin dashboard with summary stats"
```

---

### Task 17: Admin — PaquetesListPage

**Files:**
- Create: `client/src/pages/admin/PaquetesListPage.jsx` + `PaquetesListPage.module.css`
- Create: `client/src/components/admin/PaqueteTabla.jsx`

- [ ] **Step 1:** Create `PaqueteTabla` — table with columns: título, destino, precio, días, estado (badge), acciones (edit, toggle visibility, delete with confirmation modal).

- [ ] **Step 2:** Build PaquetesListPage — header with "Nuevo Paquete" button, search bar, quick filter tabs (Todos/Disponibles/Ocultos/Destacados), PaqueteTabla, pagination.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/admin/PaquetesListPage.jsx client/src/components/admin/PaqueteTabla.jsx
git commit -m "feat: add admin packages list with filters, table, and actions"
```

---

### Task 18: Admin — PaqueteEditPage (create/edit)

**Files:**
- Create: `client/src/pages/admin/PaqueteEditPage.jsx` + `PaqueteEditPage.module.css`
- Create: `client/src/components/admin/PaqueteForm.jsx`
- Create: `client/src/components/admin/ImageUploader.jsx`
- Create: `client/src/components/admin/ItinerarioEditor.jsx`
- Create: `client/src/utils/slugify.js`
- Create: `client/src/utils/formatPrecio.js`

- [ ] **Step 1:** Create `slugify.js` and `formatPrecio.js` utility functions.

- [ ] **Step 2:** Create `ImageUploader` — drag-and-drop zone, preview thumbnails, reorder, set cover image, delete. Uploads via `/api/imagenes/:paqueteId`.

- [ ] **Step 3:** Create `ItinerarioEditor` — dynamic list of day entries (numero_dia, titulo, descripcion), add/remove/reorder days.

- [ ] **Step 4:** Create `PaqueteForm` — React Hook Form with sections: basic info (title, slug auto-generated, description, summary), pricing (adulto, niño, infante, moneda), duration, incluye/no incluye (dynamic lists), condiciones, etiquetas (multi-select grouped by category), destinos (multi-select), flags (disponible, destacado). Uses ImageUploader and ItinerarioEditor.

- [ ] **Step 5:** Build PaqueteEditPage — loads existing paquete data if editing (`:id` param), uses PaqueteForm, save button.

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/admin/PaqueteEditPage.jsx client/src/components/admin/ client/src/utils/
git commit -m "feat: add package create/edit page with image uploader and itinerary editor"
```

---

### Task 19: Admin — EtiquetasPage, TestimoniosPage, ConfiguracionPage, UsuariosPage

**Files:**
- Create: `client/src/pages/admin/EtiquetasPage.jsx`
- Create: `client/src/pages/admin/DestinosPage.jsx`
- Create: `client/src/pages/admin/TestimoniosPage.jsx`
- Create: `client/src/pages/admin/ConfiguracionPage.jsx`
- Create: `client/src/pages/admin/UsuariosPage.jsx`

- [ ] **Step 1:** Build EtiquetasPage — list categories with their tags, inline add/edit/delete for both categories and tags.

- [ ] **Step 2:** Build DestinosPage — table of destinos (nombre, slug, país, región), add/edit/delete. Create `client/src/pages/admin/DestinosPage.jsx`.

- [ ] **Step 3:** Build TestimoniosPage — list testimonials, add/edit form (nombre, texto, viaje, fecha_viaje, imagen_url, activo, orden).

- [ ] **Step 4:** Build ConfiguracionPage — form to edit all config values (estadísticas, WhatsApp, email, teléfono).

- [ ] **Step 5:** Build UsuariosPage — table of users, create/edit modal (nombre, email, contraseña, rol, activo), delete with confirmation.

- [ ] **Step 6:** Update Router with actual page components for all admin routes (add `/admin/destinos` route).

- [ ] **Step 7: Commit**

```bash
git add client/src/pages/admin/
git commit -m "feat: add admin pages for etiquetas, testimonios, configuracion, usuarios"
```

---

## Phase 6: Polish and Production

### Task 20: SEO, responsive, and final polish

**Files:**
- Modify: `client/vite.config.js`
- Modify: various page components (add Helmet)
- Create: `client/public/robots.txt`

- [ ] **Step 1:** Add `react-helmet-async` `<Helmet>` to every public page with appropriate title, description, and meta tags.

- [ ] **Step 2:** Ensure all public pages are fully responsive (mobile-first). Test at 375px, 768px, 1024px, 1440px breakpoints.

- [ ] **Step 3:** Configure `vite-plugin-prerender` in `vite.config.js` for routes: `/`, `/nosotros`, `/contacto`.

- [ ] **Step 4:** Create `robots.txt`:
```
User-agent: *
Allow: /
Disallow: /admin/
```

- [ ] **Step 5:** Final review — check all pages load, forms submit, images upload, filters work, admin CRUD operations.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add SEO meta tags, responsive styles, prerendering config"
```

---

### Task 21: Production build and cPanel deployment prep

**Files:**
- Modify: `server/app.js` (verify production static serving)
- Modify: `package.json` (add start script)

- [ ] **Step 1:** Build client:
```bash
cd C:/Users/dgrod/voya-travel && npm run build
```
Verify `client/dist/` contains the built files.

- [ ] **Step 2:** Test production mode locally:
```bash
NODE_ENV=production PORT=4000 node server/app.js
```
Navigate to `http://localhost:4000` — should serve the React app and API.

- [ ] **Step 3:** Verify all API endpoints work in production mode.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: verify production build and deployment readiness"
```

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|-----------------|
| 1 | 1-6 | Project setup, DB, models, auth, seed data |
| 2 | 7-8 | Complete REST API for all entities |
| 3 | 9 | React foundation with routing and auth |
| 4 | 10-14 | All public pages (Home, Paquetes, Detalle, Nosotros, Contacto) |
| 5 | 15-19 | Complete admin panel |
| 6 | 20-21 | SEO, responsive, production build |
