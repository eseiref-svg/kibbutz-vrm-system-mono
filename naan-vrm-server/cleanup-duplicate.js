const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function cleanup() {
  try {
    console.log('🔍 מחפש לקוחות כפולים...\n');

    // Find all clients with name "חברת בדיקה א"
    const clients = await pool.query(`
      SELECT c.client_id, c.name, c.poc_name, COUNT(s.sale_id) as sale_count
      FROM client c
      LEFT JOIN sale s ON c.client_id = s.client_id
      WHERE c.name = 'חברת בדיקה א'
      GROUP BY c.client_id, c.name, c.poc_name
      ORDER BY c.client_id
    `);

    console.log(`📊 נמצאו ${clients.rows.length} לקוחות עם השם "חברת בדיקה א":\n`);
    clients.rows.forEach(c => {
      console.log(`   #${c.client_id}: ${c.name} - ${c.sale_count} sales`);
    });
    console.log('');

    if (clients.rows.length <= 1) {
      console.log('✅ אין כפילויות למחיקה!');
      await pool.end();
      return;
    }

    // Keep the first one (#17), delete the rest
    const toKeep = clients.rows[0].client_id;
    const toDelete = clients.rows.slice(1).map(c => c.client_id);

    console.log(`✅ שומר: לקוח #${toKeep}`);
    console.log(`🗑️  מוחק: לקוחות ${toDelete.join(', ')}\n`);

    for (const clientId of toDelete) {
      console.log(`🗑️  מוחק לקוח #${clientId}...`);
      
      // Get sales
      const sales = await pool.query('SELECT sale_id FROM sale WHERE client_id = $1', [clientId]);
      
      if (sales.rows.length > 0) {
        const saleIds = sales.rows.map(s => s.sale_id);
        
        // Delete client_requests
        await pool.query('DELETE FROM client_request WHERE approved_sale_id = ANY($1)', [saleIds]);
        console.log(`   ✅ Deleted client_requests`);
      }
      
      // Delete sales
      await pool.query('DELETE FROM sale WHERE client_id = $1', [clientId]);
      console.log(`   ✅ Deleted sales`);
      
      // Delete client
      await pool.query('DELETE FROM client WHERE client_id = $1', [clientId]);
      console.log(`   ✅ Deleted client #${clientId}\n`);
    }

    console.log('✅ ניקוי הושלם!\n');
    
    // Verify
    const remaining = await pool.query(`
      SELECT DISTINCT ON (c.client_id) c.client_id, c.name
      FROM client c
      INNER JOIN sale s ON c.client_id = s.client_id
      WHERE s.branch_id = 99999
      ORDER BY c.client_id
    `);

    console.log(`📊 לקוחות שנותרו בענף: ${remaining.rows.length}`);
    remaining.rows.forEach(r => {
      console.log(`   #${r.client_id}: ${r.name}`);
    });

    await pool.end();
  } catch (err) {
    console.error('❌ שגיאה:', err.message);
    await pool.end();
  }
}

cleanup();

