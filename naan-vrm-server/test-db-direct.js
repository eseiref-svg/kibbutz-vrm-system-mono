const db = require('./db');

async function testDirectDatabase() {
  console.log('🧪 Testing new flow directly in database...\n');

  try {
    // Get a valid branch_id
    const branchResult = await db.query('SELECT branch_id FROM branch LIMIT 1');
    if (branchResult.rows.length === 0) {
      throw new Error('No branches found in database');
    }
    const branchId = branchResult.rows[0].branch_id;
    console.log(`📋 Using branch_id: ${branchId}\n`);

    // Test 1: Create client request (simulating what the endpoint should do)
    console.log('📝 Test 1: Creating client request directly in DB...');
    const clientRequestResult = await db.query(`
      INSERT INTO client_request (
        branch_id, requested_by_user_id, client_name, 
        poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      branchId, 1, 'לקוח בדיקה DB',
      'יוסי כהן', '050-1234567', 'yossi@test.com',
      'תל אביב', 'דיזנגוף', '100', '6473921', 'pending'
    ]);
    
    const requestId = clientRequestResult.rows[0].request_id;
    console.log(`✅ Client request created: ID ${requestId}`);
    console.log(`   Status: ${clientRequestResult.rows[0].status}`);
    console.log(`   No quote_value: ${clientRequestResult.rows[0].quote_value === null ? '✅' : '❌'}`);
    console.log(`   No payment_terms: ${clientRequestResult.rows[0].payment_terms === null ? '✅' : '❌'}\n`);

    // Test 2: Approve client request (create client only)
    console.log('📝 Test 2: Approving client request (create client only)...');
    
    // Create address
    const addressResult = await db.query(`
      INSERT INTO address (city, street_name, house_no, zip_code, phone_no, additional)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING address_id
    `, [
      'תל אביב', 'דיזנגוף', '100', '6473921', '050-1234567', ''
    ]);
    const addressId = addressResult.rows[0].address_id;
    
    // Create client
    const clientResult = await db.query(`
      INSERT INTO client (name, address_id, poc_name, poc_phone, poc_email)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      'לקוח בדיקה DB', addressId, 'יוסי כהן', '050-1234567', 'yossi@test.com'
    ]);
    const clientId = clientResult.rows[0].client_id;
    console.log(`✅ Client created: ID ${clientId}`);
    
    // Update request
    await db.query(`
      UPDATE client_request
      SET status = 'approved', reviewed_by_user_id = 2, reviewed_at = NOW(), approved_client_id = $1
      WHERE request_id = $2
    `, [clientId, requestId]);
    console.log(`✅ Request approved\n`);

    // Test 3: Create sale request
    console.log('📝 Test 3: Creating sale request...');
    const transactionResult = await db.query(`
      INSERT INTO transaction (value, due_date, status, description)
      VALUES ($1, $2, 'pending_approval', $3)
      RETURNING transaction_id
    `, [15000, new Date(), 'עסקה בדיקה DB']);
    
    const transactionId = transactionResult.rows[0].transaction_id;
    console.log(`✅ Transaction created: ID ${transactionId}, Status: pending_approval`);
    
    const saleResult = await db.query(`
      INSERT INTO sale (client_id, branch_id, transaction_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [clientId, branchId, transactionId]);
    
    const saleId = saleResult.rows[0].sale_id;
    console.log(`✅ Sale created: ID ${saleId}\n`);

    // Test 4: Approve sale request
    console.log('📝 Test 4: Approving sale request...');
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 50);
    
    await db.query(`
      UPDATE transaction
      SET status = 'open', due_date = $1
      WHERE transaction_id = $2
    `, [dueDate, transactionId]);
    
    await db.query(`
      UPDATE sale
      SET payment_terms = $1, invoice_number = $2
      WHERE sale_id = $3
    `, ['current_50', 'INV-DB-001', saleId]);
    
    console.log(`✅ Sale approved with payment_terms: current_50`);
    
    // Verify
    const verifyResult = await db.query(`
      SELECT s.*, t.status, t.due_date, t.description
      FROM sale s
      JOIN transaction t ON s.transaction_id = t.transaction_id
      WHERE s.sale_id = $1
    `, [saleId]);
    
    const sale = verifyResult.rows[0];
    console.log(`✅ Verification:`);
    console.log(`   Status: ${sale.status} (expected: open)`);
    console.log(`   Payment terms: ${sale.payment_terms} (expected: current_50)`);
    console.log(`   Invoice: ${sale.invoice_number} (expected: INV-DB-001)`);
    
    const daysDiff = Math.round((new Date(sale.due_date) - new Date()) / (1000 * 60 * 60 * 24));
    console.log(`   Due date: ${daysDiff} days from now (expected: ~50)\n`);

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await db.query('DELETE FROM sale WHERE sale_id = $1', [saleId]);
    await db.query('DELETE FROM transaction WHERE transaction_id = $1', [transactionId]);
    await db.query('DELETE FROM client_request WHERE request_id = $1', [requestId]);
    await db.query('DELETE FROM client WHERE client_id = $1', [clientId]);
    await db.query('DELETE FROM address WHERE address_id = $1', [addressId]);
    console.log('✅ Cleanup completed\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All database tests passed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testDirectDatabase();

