const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function simpleDelete() {
  try {
    console.log('🗑️  מוחק לקוח #25...\n');
    
    // Delete sales first
    const salesResult = await pool.query('DELETE FROM sale WHERE client_id = 25');
    console.log(`✅ נמחקו ${salesResult.rowCount} sales`);

    // Delete client
    const clientResult = await pool.query('DELETE FROM client WHERE client_id = 25');
    console.log(`✅ נמחק ${clientResult.rowCount} לקוח`);

    console.log('');
    console.log('✅ המחיקה הושלמה בהצלחה!');
    console.log('');
    console.log('🔍 בודק שנותרו רק 2 לקוחות...');

    const remaining = await pool.query(`
      SELECT DISTINCT ON (c.client_id) c.client_id, c.name
      FROM client c
      INNER JOIN sale s ON c.client_id = s.client_id
      WHERE s.branch_id = 99999
      ORDER BY c.client_id
    `);

    console.log(`📊 לקוחות שנותרו: ${remaining.rows.length}`);
    remaining.rows.forEach(r => {
      console.log(`   #${r.client_id}: ${r.name}`);
    });

    await pool.end();
  } catch (err) {
    console.error('❌ שגיאה:', err.message);
    await pool.end();
  }
}

simpleDelete();

