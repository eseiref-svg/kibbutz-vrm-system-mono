const db = require('./db');

async function testEndpoints() {
  console.log('🧪 Testing new endpoints functionality...\n');

  try {
    // Test 1: Check if we can create a transaction with pending_approval status
    console.log('📝 Test 1: Creating transaction with pending_approval status...');
    try {
      const result = await db.query(`
        INSERT INTO transaction (value, due_date, status, description)
        VALUES ($1, $2, $3, $4)
        RETURNING transaction_id, status, description
      `, [1000.00, new Date(), 'pending_approval', 'Test transaction']);
      
      const transactionId = result.rows[0].transaction_id;
      console.log(`✅ Transaction created successfully:`);
      console.log(`   ID: ${transactionId}`);
      console.log(`   Status: ${result.rows[0].status}`);
      console.log(`   Description: ${result.rows[0].description}\n`);

      // Clean up
      await db.query('DELETE FROM transaction WHERE transaction_id = $1', [transactionId]);
      console.log('✅ Test transaction cleaned up\n');
    } catch (error) {
      console.error('❌ Failed to create transaction with pending_approval:');
      console.error(`   ${error.message}\n`);
      throw error;
    }

    // Test 2: Check if we can query transactions with pending_approval
    console.log('📝 Test 2: Querying transactions with pending_approval status...');
    try {
      const result = await db.query(`
        SELECT COUNT(*) as count
        FROM transaction
        WHERE status = 'pending_approval'
      `);
      console.log(`✅ Query successful. Found ${result.rows[0].count} transactions with pending_approval status\n`);
    } catch (error) {
      console.error('❌ Failed to query pending_approval transactions:');
      console.error(`   ${error.message}\n`);
      throw error;
    }

    // Test 3: Check if we can update status from pending_approval to open
    console.log('📝 Test 3: Updating status from pending_approval to open...');
    try {
      // Create a test transaction
      const createResult = await db.query(`
        INSERT INTO transaction (value, due_date, status, description)
        VALUES ($1, $2, $3, $4)
        RETURNING transaction_id
      `, [2000.00, new Date(), 'pending_approval', 'Test for update']);

      const testTransactionId = createResult.rows[0].transaction_id;
      
      // Update status
      await db.query(`
        UPDATE transaction
        SET status = 'open', due_date = $1
        WHERE transaction_id = $2
      `, [new Date(), testTransactionId]);

      // Verify
      const verifyResult = await db.query(`
        SELECT status FROM transaction WHERE transaction_id = $1
      `, [testTransactionId]);

      if (verifyResult.rows[0].status === 'open') {
        console.log('✅ Status updated successfully from pending_approval to open\n');
      } else {
        throw new Error(`Status is ${verifyResult.rows[0].status}, expected 'open'`);
      }

      // Clean up
      await db.query('DELETE FROM transaction WHERE transaction_id = $1', [testTransactionId]);
      console.log('✅ Test transaction cleaned up\n');
    } catch (error) {
      console.error('❌ Failed to update status:');
      console.error(`   ${error.message}\n`);
      throw error;
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All endpoint tests passed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Tests failed:');
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testEndpoints();

