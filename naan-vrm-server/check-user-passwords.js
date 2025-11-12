const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkPasswords() {
  try {
    const result = await pool.query(`
      SELECT u.user_id, u.email, u.first_name, u.surname, 
             CASE WHEN u.password IS NULL THEN 'NO' ELSE 'YES' END as has_password,
             b.branch_id, b.name as branch_name
      FROM "user" u
      LEFT JOIN branch b ON b.manager_id = u.user_id
      WHERE b.branch_id IS NOT NULL
      ORDER BY u.user_id
      LIMIT 10
    `);
    
    console.log('=== Users with branches (first 10) ===');
    console.table(result.rows);
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

checkPasswords();

