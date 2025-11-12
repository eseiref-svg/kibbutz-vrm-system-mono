const db = require('./db');

async function fixSaleTable() {
  console.log('🚀 Fixing sale table schema...\n');

  try {
    // Check if invoice_number column exists
    const columnCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_name = 'sale' AND column_name = 'invoice_number'
    `);

    // Step 1: Make invoice nullable (we'll set it later or use invoice_number)
    console.log('📝 Step 1: Making invoice nullable...');
    try {
      await db.query('ALTER TABLE sale ALTER COLUMN invoice DROP NOT NULL;');
      console.log('✅ invoice is now nullable\n');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('⚠️  invoice column does not exist (this is OK if using invoice_number)\n');
      } else {
        throw error;
      }
    }

    // Step 2: Add invoice_number column if it doesn't exist
    if (columnCheck.rows.length === 0) {
      console.log('📝 Step 2: Adding invoice_number column...');
      try {
        await db.query('ALTER TABLE sale ADD COLUMN invoice_number VARCHAR(100);');
        console.log('✅ invoice_number column added\n');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('⚠️  invoice_number already exists\n');
        } else {
          throw error;
        }
      }
    } else {
      console.log('✅ invoice_number column already exists\n');
    }

    // Step 3: Add payment_terms column if it doesn't exist
    const paymentTermsCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_name = 'sale' AND column_name = 'payment_terms'
    `);

    if (paymentTermsCheck.rows.length === 0) {
      console.log('📝 Step 3: Adding payment_terms column...');
      await db.query('ALTER TABLE sale ADD COLUMN payment_terms VARCHAR(50);');
      console.log('✅ payment_terms column added\n');
    } else {
      console.log('✅ payment_terms column already exists\n');
    }

    // Verify
    console.log('🔍 Verifying changes...\n');
    const result = await db.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'sale'
        AND column_name IN ('invoice', 'invoice_number', 'payment_terms')
      ORDER BY column_name
    `);

    result.rows.forEach(row => {
      const status = row.is_nullable === 'YES' || row.is_nullable === null ? '✅' : '⚠️';
      console.log(`${status} ${row.column_name}: ${row.is_nullable === 'YES' ? 'NULLABLE' : row.is_nullable === 'NO' ? 'NOT NULL' : 'EXISTS'}`);
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

fixSaleTable();

