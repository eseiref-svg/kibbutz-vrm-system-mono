const { pool } = require('../db');

async function verifySuppliers() {
    const client = await pool.connect();
    try {
        console.log('📊 Verifying Refined Supplier Data:');

        // Sample Data
        const sampleRes = await client.query(`
            SELECT s.name, s.poc_name, s.poc_email
            FROM supplier s
            LIMIT 10
        `);

        sampleRes.rows.forEach(r => {
            console.log(` - Supplier: ${r.name}`);
            console.log(`   POC: ${r.poc_name}`);
            console.log(`   Email: ${r.poc_email}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

verifySuppliers();
