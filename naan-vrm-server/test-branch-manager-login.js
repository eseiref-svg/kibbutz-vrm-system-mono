const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function testLogin() {
  try {
    const result = await pool.query(`
      SELECT u.email, u.password, b.branch_id, b.name as branch_name
      FROM "user" u
      JOIN branch b ON b.manager_id = u.user_id
      LIMIT 5
    `);
    
    console.log('Testing password "111222333" for branch managers:\n');
    
    for (const row of result.rows) {
      const match = await bcrypt.compare('111222333', row.password);
      console.log(`Email: ${row.email}`);
      console.log(`Branch: ${row.branch_name} (ID: ${row.branch_id})`);
      console.log(`Password match: ${match ? '✅ YES' : '❌ NO'}\n`);
    }
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    await pool.end();
  }
}

testLogin();

