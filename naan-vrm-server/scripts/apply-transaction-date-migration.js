const { pool } = require('../db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Running migration: add-transaction-date.sql...');
        const sql = fs.readFileSync(path.join(__dirname, '../migrations/add-transaction-date.sql'), 'utf8');
        await client.query(sql);
        console.log('✅ Migration applied successfully.');

        // Verify
        const check = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'transaction' AND column_name = 'transaction_date'
    `);

        if (check.rows.length > 0) {
            console.log('✅ Verified: transaction_date column exists');
        } else {
            console.log('❌ Warning: transaction_date column not found after migration');
        }
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        console.error(err.stack);
    } finally {
        client.release();
        pool.end();
    }
}

runMigration();
