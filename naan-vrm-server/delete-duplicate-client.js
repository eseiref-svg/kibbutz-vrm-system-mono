const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function deleteDuplicate() {
  try {
    console.log('🔍 בודק לקוח #25 לפני מחיקה...\n');

    // Check client #25
    const client = await pool.query(`
      SELECT c.*, a.city, a.street_name
      FROM client c
      LEFT JOIN address a ON c.address_id = a.address_id
      WHERE c.client_id = 25
    `);

    if (client.rows.length === 0) {
      console.log('❌ לקוח #25 לא נמצא!');
      await pool.end();
      return;
    }

    console.log('📋 פרטי לקוח #25:');
    console.log(`   שם: ${client.rows[0].name}`);
    console.log(`   איש קשר: ${client.rows[0].poc_name}`);
    console.log(`   טלפון: ${client.rows[0].poc_phone}`);
    console.log('');

    // Check if there are sales
    const sales = await pool.query(`
      SELECT sale_id, branch_id
      FROM sale
      WHERE client_id = 25
    `);

    console.log(`📦 Sales: ${sales.rows.length}`);
    sales.rows.forEach(s => {
      console.log(`   Sale #${s.sale_id} - Branch: ${s.branch_id}`);
    });
    console.log('');

    // Check if there are transactions
    const transactions = await pool.query(`
      SELECT t.transaction_id, t.transaction_type, t.value
      FROM transaction t
      JOIN sale s ON t.transaction_id = s.transaction_id
      WHERE s.client_id = 25
    `);

    console.log(`💰 Transactions: ${transactions.rows.length}`);
    transactions.rows.forEach(t => {
      console.log(`   Transaction #${t.transaction_id} - ${t.transaction_type}: ₪${t.value}`);
    });
    console.log('');

    // Delete
    console.log('🗑️  מוחק לקוח #25...');
    
    // First delete sales (which will cascade to transactions if needed)
    await pool.query('DELETE FROM sale WHERE client_id = 25');
    console.log('   ✅ Sales נמחקו');

    // Then delete client
    await pool.query('DELETE FROM client WHERE client_id = 25');
    console.log('   ✅ לקוח נמחק');

    console.log('');
    console.log('✅ המחיקה הושלמה בהצלחה!');

    await pool.end();
  } catch (err) {
    console.error('❌ שגיאה:', err.message);
    console.error(err.stack);
    await pool.end();
  }
}

deleteDuplicate();

