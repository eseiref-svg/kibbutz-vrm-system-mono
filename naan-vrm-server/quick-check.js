const db = require('./db');

async function quickSystemCheck() {
  console.log('🔍 Quick System Check - Verifying everything is ready...\n');

  const checks = {
    migration: false,
    endpoints: false,
    database: false
  };

  try {
    // Check 1: Verify migration was applied
    console.log('📝 Check 1: Verifying migration...');
    const constraintResult = await db.query(`
      SELECT pg_get_constraintdef(oid) AS constraint_def
      FROM pg_constraint
      WHERE conrelid = 'transaction'::regclass
        AND conname = 'transaction_status_check'
    `);

    if (constraintResult.rows.length > 0 && constraintResult.rows[0].constraint_def.includes('pending_approval')) {
      console.log('✅ Migration applied: pending_approval status exists\n');
      checks.migration = true;
    } else {
      console.log('❌ Migration not applied: pending_approval status missing\n');
    }

    // Check 2: Verify description column exists
    const columnResult = await db.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'transaction' AND column_name = 'description'
    `);

    if (columnResult.rows.length > 0) {
      console.log('✅ Description column exists\n');
      checks.database = true;
    } else {
      console.log('❌ Description column missing\n');
    }

    // Check 3: Test creating a transaction with pending_approval
    console.log('📝 Check 2: Testing transaction creation...');
    try {
      const testResult = await db.query(`
        INSERT INTO transaction (value, due_date, status, description)
        VALUES ($1, $2, $3, $4)
        RETURNING transaction_id
      `, [1.00, new Date(), 'pending_approval', 'System check']);

      const testId = testResult.rows[0].transaction_id;
      await db.query('DELETE FROM transaction WHERE transaction_id = $1', [testId]);
      console.log('✅ Can create transactions with pending_approval status\n');
      checks.endpoints = true;
    } catch (error) {
      console.log(`❌ Cannot create transactions: ${error.message}\n`);
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const allPassed = Object.values(checks).every(v => v === true);
    
    if (allPassed) {
      console.log('✅ All checks passed! System is ready to run.');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('🚀 Next steps:');
      console.log('   1. Start server: cd naan-vrm-server && npm start');
      console.log('   2. Start client: cd naan-vrm-client && npm start');
      console.log('   3. Test the new flow according to QA_PLAN_NEW_CLIENT_SALES_FLOW.md\n');
      process.exit(0);
    } else {
      console.log('❌ Some checks failed. Please review the errors above.');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ System check failed:');
    console.error(error.message);
    process.exit(1);
  }
}

quickSystemCheck();

