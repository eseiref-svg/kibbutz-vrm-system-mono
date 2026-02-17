const { pool } = require('../db');

async function verifySuppliers() {
    const client = await pool.connect();
    try {
        console.log('📊 Verifying Supplier Seeding:');

        // Count Suppliers
        const countRes = await client.query('SELECT COUNT(*) FROM supplier');
        console.log(` - Total Suppliers: ${countRes.rows[0].count}`);

        // Count Fields
        const fieldCountRes = await client.query('SELECT COUNT(*) FROM supplier_field');
        console.log(` - Total Categories: ${fieldCountRes.rows[0].count}`);

        // Sample Data
        console.log('\nSample Suppliers:');
        const sampleRes = await client.query(`
            SELECT s.name, s.payment_terms, s.status, sf.field, a.city 
            FROM supplier s
            JOIN supplier_field sf ON s.supplier_field_id = sf.supplier_field_id
            JOIN address a ON s.address_id = a.address_id
            LIMIT 5
        `);

        sampleRes.rows.forEach(r => {
            console.log(` - ${r.name} (${r.field}) from ${r.city}, Status: ${r.status}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

verifySuppliers();
