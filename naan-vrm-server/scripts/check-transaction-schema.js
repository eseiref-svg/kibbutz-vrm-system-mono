const { pool } = require('../db');

async function checkSchema() {
    try {
        const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'transaction'
      ORDER BY ordinal_position
    `);

        console.log('Transaction table columns:');
        console.log('=========================');
        result.rows.forEach(col => {
            console.log(`${col.column_name.padEnd(20)} ${col.data_type.padEnd(20)} ${col.is_nullable}`);
        });
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkSchema();
