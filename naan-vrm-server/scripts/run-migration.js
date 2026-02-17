const { pool } = require('../db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Running Migration 020...');
        const sql = fs.readFileSync(path.join(__dirname, '../migrations/020_add_branch_to_client.sql'), 'utf8');
        await client.query(sql);
        console.log('✅ Migration applied successfully.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

runMigration();
