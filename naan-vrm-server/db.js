require('dotenv').config();

const { Pool } = require('pg');

// Dynamic configuration: supports two environments
// 1. PRODUCTION (Railway): uses DATABASE_URL
// 2. DEVELOPMENT (local): uses separate environment variables
let poolConfig;

if (process.env.DATABASE_URL) {
  // PRODUCTION environment - Railway provides DATABASE_URL
  console.log('מתחבר ל-DB: PRODUCTION (Railway)');
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Railway
    },
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20,
  };
} else {
  // DEVELOPMENT environment - local variables
  console.log('מתחבר ל-DB: DEVELOPMENT (מקומי)');
  poolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20,
  };
  console.log('הגדרות DB מקומי:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER
  });
}

const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('❌ שגיאה בחיבור ל-DB:', err);
  process.exit(-1);
});

// Test connection on startup
pool.connect()
  .then(client => {
    console.log('Connected to DB successfully!');
    client.release();
  })
  .catch(err => {
    console.error('❌ חיבור ל-DB נכשל:', err.message);
  });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool
};
