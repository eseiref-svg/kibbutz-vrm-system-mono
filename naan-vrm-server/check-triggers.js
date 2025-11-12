const db = require('./db');

async function checkTriggers() {
  console.log('🔍 Checking for triggers on client_request table...\n');

  try {
    const triggers = await db.query(`
      SELECT trigger_name, event_manipulation, event_object_table, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'client_request'
    `);

    console.log('Triggers on client_request:');
    if (triggers.rows.length === 0) {
      console.log('  (none)');
    } else {
      triggers.rows.forEach(t => {
        console.log(`  - ${t.trigger_name} (${t.event_manipulation})`);
        console.log(`    Statement: ${t.action_statement?.substring(0, 100)}...`);
      });
    }

    // Check for check constraints
    const constraints = await db.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'client_request'::regclass
        AND contype = 'c'
    `);

    console.log('\nCheck constraints on client_request:');
    if (constraints.rows.length === 0) {
      console.log('  (none)');
    } else {
      constraints.rows.forEach(c => {
        console.log(`  - ${c.conname}`);
        console.log(`    Definition: ${c.definition}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTriggers();

