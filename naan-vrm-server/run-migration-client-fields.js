const db = require('./db');

async function runMigration() {
  console.log('🚀 Starting migration: Add client_number and default_payment_terms fields...\n');

  try {
    // Step 1: Add client_number column
    console.log('📝 Step 1: Adding client_number column...');
    await db.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'client' AND column_name = 'client_number'
          ) THEN
              ALTER TABLE client ADD COLUMN client_number VARCHAR(50) UNIQUE;
          END IF;
      END $$;
    `);
    console.log('✅ client_number column check completed\n');

    // Step 2: Add default_payment_terms column
    console.log('📝 Step 2: Adding default_payment_terms column...');
    await db.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'client' AND column_name = 'default_payment_terms'
          ) THEN
              ALTER TABLE client ADD COLUMN default_payment_terms VARCHAR(50) DEFAULT 'current_50';
          END IF;
      END $$;
    `);
    console.log('✅ default_payment_terms column check completed\n');

    // Verify changes
    console.log('🔍 Verifying changes...\n');
    const result = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'client' AND column_name IN ('client_number', 'default_payment_terms')
      ORDER BY column_name
    `);

    if (result.rows.length > 0) {
      console.log('✅ Columns exist:');
      result.rows.forEach(row => {
        console.log(`   ${row.column_name}: ${row.data_type}, nullable: ${row.is_nullable}, default: ${row.column_default || 'none'}`);
      });
    } else {
      console.log('❌ Columns not found!\n');
    }

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

