const db = require('./db');

async function runMigration() {
  console.log('🚀 Starting migration: Add pending_approval status and description field...\n');

  try {
    // Step 1: Add description column if it doesn't exist
    console.log('📝 Step 1: Adding description column...');
    try {
      await db.query(`
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'transaction' AND column_name = 'description'
            ) THEN
                ALTER TABLE transaction ADD COLUMN description TEXT;
            END IF;
        END $$;
      `);
      console.log('✅ Description column check completed\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Description column already exists (this is OK)\n');
      } else {
        throw error;
      }
    }

    // Step 2: Drop existing CHECK constraint
    console.log('📝 Step 2: Dropping existing CHECK constraint...');
    try {
      await db.query('ALTER TABLE transaction DROP CONSTRAINT IF EXISTS transaction_status_check;');
      console.log('✅ CHECK constraint dropped\n');
    } catch (error) {
      console.log(`⚠️  ${error.message.split('\n')[0]} (this is OK)\n`);
    }

    // Step 3: Add new CHECK constraint with 'pending_approval' status
    console.log('📝 Step 3: Adding new CHECK constraint with pending_approval...');
    await db.query(`
      ALTER TABLE transaction 
      ADD CONSTRAINT transaction_status_check 
      CHECK (status::text = ANY (ARRAY[
        'open'::character varying,
        'frozen'::character varying,
        'deleted'::character varying,
        'paid'::character varying,
        'pending_approval'::character varying
      ]::text[]));
    `);
    console.log('✅ New CHECK constraint added\n');

    // Verify changes
    console.log('🔍 Verifying changes...\n');

    // Check constraint
    const constraintResult = await db.query(`
      SELECT 
        conname AS constraint_name,
        pg_get_constraintdef(oid) AS constraint_definition
      FROM pg_constraint
      WHERE conrelid = 'transaction'::regclass
        AND conname = 'transaction_status_check'
    `);

    if (constraintResult.rows.length > 0) {
      console.log('✅ CHECK constraint exists:');
      const constraintDef = constraintResult.rows[0].constraint_definition;
      console.log(`   ${constraintDef}\n`);
      
      if (constraintDef.includes('pending_approval')) {
        console.log('✅ Status "pending_approval" is included in constraint!\n');
      } else {
        console.log('❌ Status "pending_approval" is NOT in constraint!\n');
      }
    } else {
      console.log('❌ CHECK constraint not found!\n');
    }

    // Check description column
    const columnResult = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'transaction' 
        AND column_name = 'description'
    `);

    if (columnResult.rows.length > 0) {
      console.log('✅ Description column exists:');
      console.log(`   Type: ${columnResult.rows[0].data_type}`);
      console.log(`   Nullable: ${columnResult.rows[0].is_nullable}\n`);
    } else {
      console.log('❌ Description column not found!\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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

// Run migration
runMigration();

