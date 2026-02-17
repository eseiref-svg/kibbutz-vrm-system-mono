const { pool } = require('../db');

async function verifySupplierRequests() {
    const client = await pool.connect();
    try {
        console.log('📊 Verifying Supplier Requests:');

        // Count
        const countRes = await client.query('SELECT COUNT(*) FROM supplier_request');
        console.log(` - Total Requests: ${countRes.rows[0].count}`);

        // Sample
        console.log('\nSample Requests:');
        const sampleRes = await client.query(`
            SELECT supplier_name, status, poc_name, poc_email, created_at 
            FROM supplier_request
            LIMIT 5
        `);

        sampleRes.rows.forEach(r => {
            console.log(` - Request for: ${r.supplier_name}`);
            console.log(`   Status: ${r.status}`);
            console.log(`   POC: ${r.poc_name} (${r.poc_email})`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

verifySupplierRequests();
