const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkBranches() {
  try {
    const result = await pool.query('SELECT * FROM branch ORDER BY branch_id');
    
    console.log('=== Branches in database ===');
    console.table(result.rows);
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

checkBranches();

