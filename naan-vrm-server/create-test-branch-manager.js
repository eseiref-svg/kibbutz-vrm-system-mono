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

async function createTestManager() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('111222333', 10);
    
    // Create a test user (permissions_id=3 is typically for branch managers)
    const userResult = await pool.query(`
      INSERT INTO "user" (email, password, first_name, surname, permissions_id, phone_no, status)
      VALUES ($1, $2, $3, $4, 3, '0500000000', 'active')
      ON CONFLICT (email) DO UPDATE
      SET password = $2
      RETURNING user_id, email, first_name, surname
    `, ['manager@test.com', hashedPassword, 'מנהל', 'בדיקות']);
    
    const userId = userResult.rows[0].user_id;
    console.log('✅ Created/Updated test user:');
    console.table(userResult.rows);
    
    // Create a test branch and assign this user as manager
    const branchResult = await pool.query(`
      INSERT INTO branch (branch_id, business, name, description, manager_id, balance_id)
      VALUES (99999, true, 'ענף בדיקות', 'ענף לבדיקות QA', $1, 1)
      ON CONFLICT (branch_id) DO UPDATE
      SET manager_id = $1
      RETURNING *
    `, [userId]);
    
    console.log('\n✅ Created/Updated test branch:');
    console.table(branchResult.rows);
    
    console.log('\n📋 Login credentials for testing:');
    console.log('Email: manager@test.com');
    console.log('Password: 111222333');
    console.log('Branch: ענף בדיקות (ID: 99999)');
    
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    await pool.end();
    process.exit(1);
  }
}

createTestManager();

