const db = require('./db');

async function checkSaleSchema() {
  console.log('🔍 Checking sale table schema...\n');

  try {
    const result = await db.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'sale'
      ORDER BY ordinal_position
    `);

    console.log('📋 sale table columns:');
    console.log('');
    
    result.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
      console.log(`  ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}${defaultVal}`);
    });

    // Check for NOT NULL constraints on fields we want to set later
    const notNullFields = result.rows
      .filter(col => col.is_nullable === 'NO' && ['invoice', 'invoice_number', 'payment_terms'].includes(col.column_name))
      .map(col => col.column_name);

    if (notNullFields.length > 0) {
      console.log('\n⚠️  Found NOT NULL constraints on fields that should be nullable:');
      notNullFields.forEach(field => console.log(`   - ${field}`));
      console.log('\n💡 These need to be changed to allow NULL values.');
    } else {
      console.log('\n✅ All relevant fields allow NULL values');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkSaleSchema();

