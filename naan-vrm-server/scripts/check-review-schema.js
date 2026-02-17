
const { pool } = require('../db');

async function checkSchema() {
    const client = await pool.connect();
    try {
        console.log('🔍 Checking Review Table Schema...');
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'review'
        `);
        console.log('Columns:', res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

checkSchema();
