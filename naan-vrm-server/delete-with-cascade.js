const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function deleteWithCascade() {
  try {
    console.log('🗑️  מוחק לקוח #25 עם כל הקשורים...\n');
    
    // Check what's linked
    const sales = await pool.query('SELECT sale_id FROM sale WHERE client_id = 25');
    console.log(`📦 Sales למחיקה: ${sales.rows.length}`);
    
    if (sales.rows.length > 0) {
      const saleIds = sales.rows.map(s => s.sale_id);
      console.log(`   Sale IDs: ${saleIds.join(', ')}`);
      
      // Check client_requests
      const requests = await pool.query(`
        SELECT request_id, status 
        FROM client_request 
        WHERE approved_sale_id = ANY($1)
      `, [saleIds]);
      
      console.log(`📋 Client requests למחיקה: ${requests.rows.length}`);
      
      // Delete client_requests first
      if (requests.rows.length > 0) {
        await pool.query('DELETE FROM client_request WHERE approved_sale_id = ANY($1)', [saleIds]);
        console.log('   ✅ Client requests נמחקו');
      }
    }

    // Delete sales
    await pool.query('DELETE FROM sale WHERE client_id = 25');
    console.log('✅ Sales נמחקו');

    // Delete client
    await pool.query('DELETE FROM client WHERE client_id = 25');
    console.log('✅ לקוח נמחק');

    console.log('');
    console.log('✅ המחיקה הושלמה בהצלחה!');
    console.log('');
    console.log('🔍 בודק לקוחות שנותרו...');

    const remaining = await pool.query(`
      SELECT DISTINCT ON (c.client_id) c.client_id, c.name
      FROM client c
      INNER JOIN sale s ON c.client_id = s.client_id
      WHERE s.branch_id = 99999
      ORDER BY c.client_id
    `);

    console.log(`📊 לקוחות: ${remaining.rows.length}`);
    remaining.rows.forEach(r => {
      console.log(`   #${r.client_id}: ${r.name}`);
    });

    await pool.end();
  } catch (err) {
    console.error('❌ שגיאה:', err.message);
    await pool.end();
  }
}

deleteWithCascade();

