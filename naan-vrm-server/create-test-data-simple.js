require('dotenv').config();
const db = require('./db');

async function createTestData() {
  try {
    console.log('🔄 יוצר נתוני בדיקה...\n');
    
    // Get first branch
    const branchResult = await db.query('SELECT branch_id FROM branch LIMIT 1');
    if (branchResult.rows.length === 0) {
      console.error('❌ לא נמצא ענף במערכת!');
      process.exit(1);
    }
    const branchId = branchResult.rows[0].branch_id;
    console.log(`✅ נמצא ענף: ${branchId}\n`);
    
    // Create addresses
    console.log('📝 יוצר כתובות...');
    const addresses = [
      { city: 'תל אביב', street: 'רוטשילד', house: '10', zip: '6578100', phone: '03-1234567' },
      { city: 'ירושלים', street: 'בן יהודה', house: '25', zip: '9100001', phone: '02-7654321' },
      { city: 'חיפה', street: 'הרצל', house: '50', zip: '3100001', phone: '04-9876543' }
    ];
    
    const addressIds = [];
    for (const addr of addresses) {
      // Check if exists
      const existing = await db.query(
        'SELECT address_id FROM address WHERE city = $1 AND street_name = $2 LIMIT 1',
        [addr.city, addr.street]
      );
      
      let addrId;
      if (existing.rows.length > 0) {
        addrId = existing.rows[0].address_id;
        console.log(`   כתובת קיימת: ${addr.city} - ${addr.street} (ID: ${addrId})`);
      } else {
        const result = await db.query(
          `INSERT INTO address (city, street_name, house_no, zip_code, phone_no, additional)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING address_id`,
          [addr.city, addr.street, addr.house, addr.zip, addr.phone, '']
        );
        addrId = result.rows[0].address_id;
        console.log(`   ✅ נוצרה כתובת: ${addr.city} - ${addr.street} (ID: ${addrId})`);
      }
      addressIds.push(addrId);
    }
    
    // Create clients
    console.log('\n📝 יוצר לקוחות...');
    const clients = [
      { name: 'חברת בדיקה א', addrId: addressIds[0], poc: 'דני כהן', phone: '050-1234567', email: 'danny@test.com' },
      { name: 'חברת בדיקה ב - שם ארוך מאוד', addrId: addressIds[1], poc: 'שרה לוי', phone: '052-7654321', email: 'sara@test.com' },
      { name: 'לקוח-עם-מקפים_ותווים', addrId: addressIds[2], poc: 'משה דוד', phone: '054-9876543', email: null }
    ];
    
    const clientIds = [];
    for (const client of clients) {
      // Check if exists
      const existing = await db.query(
        'SELECT client_id FROM client WHERE name = $1 LIMIT 1',
        [client.name]
      );
      
      let clientId;
      if (existing.rows.length > 0) {
        clientId = existing.rows[0].client_id;
        console.log(`   לקוח קיים: ${client.name} (ID: ${clientId})`);
      } else {
        const result = await db.query(
          `INSERT INTO client (name, address_id, poc_name, poc_phone, poc_email)
           VALUES ($1, $2, $3, $4, $5) RETURNING client_id`,
          [client.name, client.addrId, client.poc, client.phone, client.email]
        );
        clientId = result.rows[0].client_id;
        console.log(`   ✅ נוצר לקוח: ${client.name} (ID: ${clientId})`);
      }
      clientIds.push(clientId);
    }
    
    // Create sale for first client
    console.log('\n📝 יוצר sale ללקוח ראשון...');
    const saleCheck = await db.query(
      'SELECT sale_id FROM sale WHERE client_id = $1 AND branch_id = $2 LIMIT 1',
      [clientIds[0], branchId]
    );
    
    if (saleCheck.rows.length === 0) {
      // Create transaction (simple structure - no branch_id, transaction_type, description)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // +30 days
      
      const transResult = await db.query(
        `INSERT INTO transaction (value, due_date, status)
         VALUES ($1, $2, $3) RETURNING transaction_id`,
        [10000.50, dueDate.toISOString().split('T')[0], 'open']
      );
      const transactionId = transResult.rows[0].transaction_id;
      console.log(`   ✅ נוצר transaction (ID: ${transactionId})`);
      
      // Get user for created_by_user_id (if sale table has this field)
      const userResult = await db.query('SELECT user_id FROM "user" WHERE status = \'active\' LIMIT 1');
      const userId = userResult.rows[0]?.user_id;
      
      // Check sale table structure - might not have created_by_user_id or payment_terms
      const saleCheck2 = await db.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'sale' 
        ORDER BY ordinal_position
      `);
      const saleColumns = saleCheck2.rows.map(r => r.column_name);
      
      // Create sale - use only fields that exist
      let saleQuery, saleParams;
      if (saleColumns.includes('created_by_user_id') && saleColumns.includes('payment_terms')) {
        saleQuery = `INSERT INTO sale (client_id, branch_id, transaction_id, created_by_user_id, payment_terms)
                     VALUES ($1, $2, $3, $4, $5) RETURNING sale_id`;
        saleParams = [clientIds[0], branchId, transactionId, userId, 'plus_30'];
      } else if (saleColumns.includes('created_by_user_id')) {
        saleQuery = `INSERT INTO sale (client_id, branch_id, transaction_id, created_by_user_id)
                     VALUES ($1, $2, $3, $4) RETURNING sale_id`;
        saleParams = [clientIds[0], branchId, transactionId, userId];
      } else {
        // Basic structure: invoice, client_id, transaction_id, branch_id
        const invoiceNum = Math.floor(Math.random() * 1000000);
        saleQuery = `INSERT INTO sale (invoice, client_id, transaction_id, branch_id)
                     VALUES ($1, $2, $3, $4) RETURNING sale_id`;
        saleParams = [invoiceNum, clientIds[0], transactionId, branchId];
      }
      
      const saleResult = await db.query(saleQuery, saleParams);
      
      console.log(`   ✅ נוצר sale (ID: ${saleResult.rows[0].sale_id}) ללקוח ${clientIds[0]} בענף ${branchId}`);
    } else {
      console.log(`   ⚠️  Sale כבר קיים ללקוח ${clientIds[0]}`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ נתוני בדיקה הוטענו בהצלחה!');
    console.log('='.repeat(60));
    console.log('\n📋 סיכום:');
    console.log(`   - 3 לקוחות: ${clientIds.join(', ')}`);
    console.log(`   - לקוח ${clientIds[0]} ("חברת בדיקה א") קשור לענף ${branchId} עם sale`);
    console.log(`   - לקוחות ${clientIds[1]}, ${clientIds[2]} לא קשורים לענף (לבדיקת סינון)`);
    
  } catch (error) {
    console.error('\n❌ שגיאה:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

createTestData();

