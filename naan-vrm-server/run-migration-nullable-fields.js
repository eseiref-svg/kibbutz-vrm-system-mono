const db = require('./db');

async function runMigration() {
  console.log('🚀 Running migration: Make quote_value and payment_terms nullable...\n');

  try {
    // Step 1: Make quote_value nullable
    console.log('📝 Step 1: Making quote_value nullable...');
    await db.query('ALTER TABLE client_request ALTER COLUMN quote_value DROP NOT NULL;');
    console.log('✅ quote_value is now nullable\n');

    // Step 2: Make payment_terms nullable
    console.log('📝 Step 2: Making payment_terms nullable...');
    await db.query('ALTER TABLE client_request ALTER COLUMN payment_terms DROP NOT NULL;');
    console.log('✅ payment_terms is now nullable\n');

    // Verify
    console.log('🔍 Verifying changes...\n');
    const result = await db.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'client_request'
        AND column_name IN ('quote_value', 'payment_terms')
      ORDER BY column_name
    `);

    result.rows.forEach(row => {
      const status = row.is_nullable === 'YES' ? '✅' : '❌';
      console.log(`${status} ${row.column_name}: ${row.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Migration completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

runMigration();

