const { pool } = require('../db');

async function inspect() {
    const client = await pool.connect();
    try {
        console.log('--- SALE Table ---');
        const saleRes = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'sale'
        `);
        saleRes.rows.forEach(r => console.log(`${r.column_name} (${r.data_type}, ${r.is_nullable})`));

        console.log('\n--- INVOICE Table ---');
        const invoiceRes = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'invoice'
        `);
        invoiceRes.rows.forEach(r => console.log(`${r.column_name} (${r.data_type}, ${r.is_nullable})`));

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

inspect();
