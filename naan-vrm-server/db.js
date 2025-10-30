require('dotenv').config();

const { Pool } = require('pg');

// תצורה דינמית: תומכת בשתי סביבות
// 1. PRODUCTION (Railway): משתמש ב-DATABASE_URL
// 2. DEVELOPMENT (מקומי): משתמש במשתנים נפרדים
let poolConfig;

if (process.env.DATABASE_URL) {
  // סביבת PRODUCTION - Railway מספק DATABASE_URL
  console.log('🟢 מתחבר ל-DB: PRODUCTION (Railway)');
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // נדרש עבור Railway
    },
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20,
  };
} else {
  // סביבת DEVELOPMENT - משתנים מקומיים
  console.log('🔵 מתחבר ל-DB: DEVELOPMENT (מקומי)');
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
  console.log('🔧 הגדרות DB מקומי:', {
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

// בדיקת חיבור בהפעלה
pool.connect()
  .then(client => {
    console.log('✅ חיבור ל-DB הצליח!');
    client.release();
  })
  .catch(err => {
    console.error('❌ חיבור ל-DB נכשל:', err.message);
  });

module.exports = {
  query: (text, params) => pool.query(text, params),
};
