const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'naan_vrm', password: 'Zaq1Xsw2', port: 5432 });

async function run() {
    try {
        await client.connect();
        console.log('Connected to DB');

        // Add budget column if not exists
        await client.query(`
      ALTER TABLE branch 
      ADD COLUMN IF NOT EXISTS budget NUMERIC(12, 2) DEFAULT 0;
    `);
        console.log('Added budget column to branch table');

        await client.end();
    } catch (err) {
        console.error('Error:', err);
        await client.end();
    }
}

run();
