# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Voyâ is a travel agency web app with a React frontend (Vite) and Express/Sequelize backend (MySQL via XAMPP). There is no monorepo tooling — the two sides are separate npm projects that are run concurrently in development.

## Development Commands

**Start backend** (from `server/`):
```bash
npm run dev        # nodemon app.js — restarts on file changes
```

**Start frontend** (from `client/`):
```bash
npm run dev        # Vite dev server at http://localhost:5173
```

**Build frontend** (from `client/`):
```bash
npm run build
npm run lint       # ESLint
```

**Seed destinations** (from `server/`):
```bash
npm run seed:destinos
```

There are no automated tests.

## Architecture

### Backend (`server/`)

- **Entry point**: `app.js` — registers middleware, routes, starts the server, and calls `sequelize.sync({ alter: true })` on boot. Every server restart auto-migrates the DB schema. Adding a new model field and restarting is sufficient; no migration files are needed.
- **Database**: MySQL via XAMPP. Config in `config/database.js`. Connection string from `.env` (see `.env.example`). Sessions are stored in a MySQL table (`sesiones`) via `express-mysql-session`.
- **Global Sequelize config**: `createdAt: 'creado_en'`, `updatedAt: 'actualizado_en'`, `underscored: true`. Always use `creado_en` / `actualizado_en` in `ORDER BY` clauses and when accessing timestamps in JS.
- **Auth**: Session-based. The logged-in user is at `req.session.usuario` in every controller. Never use `req.usuario`.
- **Roles**: `visor < editor < admin` (hierarchy 1/2/3). Middleware: `requireAuth` + `requireMinRole('editor')` from `middleware/roles.js`.
- **File uploads**: `multer` with `diskStorage` for images (destinations, airlines, cotización itinerary). `multer.memoryStorage()` for Excel imports. The axios interceptor in `client/src/services/api.js` deletes `Content-Type` when sending `FormData`, which is required for multer to parse multipart uploads correctly.
- **Static files**: Uploaded images served at `/uploads/*`. Path: `server/uploads/`.

### Frontend (`client/`)

- **Framework**: React 19 + Vite + React Router v7.
- **API client**: `client/src/services/api.js` — Axios instance pointing to `http://localhost:4000/api` in dev, `/api` in prod. Includes the FormData interceptor.
- **Auth**: `AuthContext` + `useAuth()` hook. `AuthContext` stores the session user and exposes `login`, `logout`. The `RutaProtegida` component in `Router.jsx` handles role-gated routes.
- **Admin layout**: `AdminLayout.jsx` with collapsible sidebar. Nav groups: main items (Dashboard, Paquetes, Testimonios, Cotizaciones), a collapsible "Recursos" group (Destinos, Etiquetas, Hoteles, Operadores, Aeropuertos, Aerolíneas), and admin-only items (Configuración, Usuarios).
- **CSS**: CSS Modules per page/component. Shared admin table/form styles live in `DestinosPage.module.css` and are imported by other admin pages. Page-specific overrides are in their own `.module.css`.
- **No global state library** — all state is local `useState` + context for auth.

### Key Domain Models

| Model | Table | Notes |
|---|---|---|
| `Paquete` | `paquetes` | Travel packages with images, itinerary, costs, tags, destinations (all 1:N or N:M) |
| `Cotizacion` | `cotizaciones` | Client quote with JSON fields for `incluye`/`no_incluye` (array of `{tipo, detalle}` objects), `destinos_ids` (JSON array of IDs), itinerary (tipo/pnr/imagen), and a `token` for the public shareable link |
| `CotizacionAlojamiento` | `cotizacion_alojamientos` | Hotels per quote with per-room-type prices |
| `Hotel` | `hoteles` | Linked to `Destino`. Searched by `destino_id` when adding accommodations |
| `Destino` | `destinos` | Destinations with image. Paquetes use N:M join; cotizaciones store primary `destino_id` + `destinos_ids` JSON array for multi-destination support |
| `Aeropuerto` / `Aerolinea` | `aeropuertos` / `aerolineas` | Reference data, no timestamps, support bulk Excel import |

### Cotizaciones (Quotes) — Important Details

- `incluye` and `no_incluye` are stored as JSON TEXT in MySQL with Sequelize getter/setter. Format: `[{tipo: string, detalle: string}]`. Old data may be plain strings — use `normalizeItems()` in the form to handle both.
- Multi-destination: `destinos_ids` stores a JSON array of IDs. `destino_id` (single FK) is always set to `destinos_ids[0]` for backward compat.
- The public share URL is `/cotizacion/:token`. Token is generated with `crypto.randomUUID()` on creation.
- Itinerary can be `pnr` (text stored in `itinerario_pnr`) or `imagen` (URL in `itinerario_imagen`). Images upload to `server/uploads/cotizaciones/`.
- The `/cotizaciones/upload-imagen` route must be declared **before** `/:id` routes in the router to avoid Express matching the literal string "upload-imagen" as an ID.

### Known Recurring Issue: MySQL 64-key Limit

`sequelize.sync({ alter: true })` adds a new index every restart for columns with `unique: true`. After ~63 restarts the table hits MySQL's 64-key limit and the server crashes with `ER_TOO_MANY_KEYS`. Fix by running a cleanup script that drops all indexes matching `/_[0-9]+$/` (e.g. `slug_2`, `slug_3`...) from affected tables.

## Environment

Copy `.env.example` to `.env` in the repo root. The server loads it from `../env` relative to `server/`. XAMPP must be running with MySQL on port 3306 and the `voya_travel` database created.

In development, the Vite app runs at `:5173` and proxies nothing — all API calls go directly to `:4000` via the Axios base URL. CORS is configured to allow `CLIENT_URL` (default `http://localhost:5173`) with credentials.
