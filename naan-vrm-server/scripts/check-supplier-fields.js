const { pool } = require('../db');

async function checkFields() {
    try {
        const res = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('payment_req', 'supplier')
      ORDER BY table_name, ordinal_position;
    `);

        console.log('Columns found:');
        res.rows.forEach(row => {
            console.log(`${row.table_name}: ${row.column_name} (${row.data_type})`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkFields();
