/**
 * Quick test script to verify payment request display fixes
 */

const { pool } = require('../db');

async function runTests() {
    console.log('🧪 Running Payment Request Display Tests...\n');

    try {
        // Test 1: Check if transaction_date column exists
        console.log('Test 1: Checking transaction_date column...');
        const columnCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'transaction' 
      AND column_name = 'transaction_date'
    `);

        if (columnCheck.rows.length > 0) {
            console.log('✅ transaction_date column exists');
            console.log(`   Type: ${columnCheck.rows[0].data_type}\n`);
        } else {
            console.log('❌ transaction_date column NOT found\n');
            return;
        }

        // Test 2: Check sample data
        console.log('Test 2: Checking sample payment requests...');
        const sampleData = await pool.query(`
      SELECT 
        pr.payment_req_id,
        t.transaction_date,
        t.due_date,
        t.value,
        s.name as supplier_name
      FROM payment_req pr
      JOIN transaction t ON pr.transaction_id = t.transaction_id
      LEFT JOIN supplier s ON pr.supplier_id = s.supplier_id
      WHERE t.status = 'pending_approval'
      LIMIT 3
    `);

        if (sampleData.rows.length > 0) {
            console.log(`✅ Found ${sampleData.rows.length} pending payment requests:`);
            sampleData.rows.forEach(row => {
                console.log(`   - Request #${row.payment_req_id}: ${row.supplier_name}`);
                console.log(`     Transaction Date: ${row.transaction_date}`);
                console.log(`     Expected Payment Date: ${row.due_date}`);
                console.log(`     Amount: ₪${Math.abs(row.value)}`);
            });
            console.log('');
        } else {
            console.log('ℹ️  No pending payment requests found (this is OK)\n');
        }

        // Test 3: Check sample sales
        console.log('Test 3: Checking sample sales...');
        const salesData = await pool.query(`
      SELECT 
        s.sale_id,
        t.transaction_date,
        t.due_date,
        t.value,
        c.name as client_name
      FROM sale s
      JOIN transaction t ON s.transaction_id = t.transaction_id
      LEFT JOIN client c ON s.client_id = c.client_id
      WHERE t.status = 'pending_approval'
      LIMIT 3
    `);

        if (salesData.rows.length > 0) {
            console.log(`✅ Found ${salesData.rows.length} pending sales:`);
            salesData.rows.forEach(row => {
                console.log(`   - Sale #${row.sale_id}: ${row.client_name}`);
                console.log(`     Transaction Date: ${row.transaction_date}`);
                console.log(`     Expected Payment Date: ${row.due_date}`);
                console.log(`     Amount: ₪${row.value}`);
            });
            console.log('');
        } else {
            console.log('ℹ️  No pending sales found (this is OK)\n');
        }

        console.log('✅ All database tests passed!\n');
        console.log('📝 Next steps:');
        console.log('   1. Restart the server if it\'s running');
        console.log('   2. Test creating a new payment request from the UI');
        console.log('   3. Verify the table shows both "תאריך עסקה" and "מועד תשלום צפוי"');
        console.log('   4. Check that the approval modal shows all details\n');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    } finally {
        await pool.end();
    }
}

runTests();
