const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function assignAdminToBranch() {
  try {
    // Find a branch without a manager or create a test branch
    // Let's use branch 15401 (השכרות עסק) - we'll temporarily change its manager
    
    // First, let's see who is the current manager of branch 15401
    const currentManager = await pool.query(`
      SELECT manager_id FROM branch WHERE branch_id = 15401
    `);
    
    console.log('Current manager of branch 15401:', currentManager.rows[0]);
    
    // Let's create a new test branch for admin
    const newBranch = await pool.query(`
      INSERT INTO branch (branch_id, business, name, description, manager_id, balance_id)
      VALUES (99999, true, 'ענף בדיקות', 'ענף לבדיקות QA', 37, 1)
      ON CONFLICT (branch_id) DO UPDATE
      SET manager_id = 37
      RETURNING *
    `);
    
    console.log('\n✅ Created/Updated test branch for admin:');
    console.table(newBranch.rows);
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    await pool.end();
    process.exit(1);
  }
}

assignAdminToBranch();

