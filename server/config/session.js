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
    columnNames: { session_id: 'session_id', expires: 'expira', data: 'datos' },
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
    maxAge: 1000 * 60 * 60 * 24,
  },
};

module.exports = { sessionConfig, sessionStore };
