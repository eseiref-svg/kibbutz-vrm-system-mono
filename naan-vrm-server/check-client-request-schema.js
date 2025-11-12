const db = require('./db');

async function checkClientRequestSchema() {
  console.log('🔍 Checking client_request table schema...\n');

  try {
    // Get column information
    const result = await db.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'client_request'
      ORDER BY ordinal_position
    `);

    console.log('📋 client_request table columns:');
    console.log('');
    
    result.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}`);
    });

    // Check for NOT NULL constraints on transaction fields
    const notNullFields = result.rows
      .filter(col => col.is_nullable === 'NO' && ['quote_value', 'payment_terms'].includes(col.column_name))
      .map(col => col.column_name);

    if (notNullFields.length > 0) {
      console.log('\n⚠️  Found NOT NULL constraints on transaction fields:');
      notNullFields.forEach(field => console.log(`   - ${field}`));
      console.log('\n💡 These need to be changed to allow NULL values.');
    } else {
      console.log('\n✅ No NOT NULL constraints on quote_value or payment_terms');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkClientRequestSchema();

