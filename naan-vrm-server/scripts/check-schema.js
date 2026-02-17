const { pool } = require('../db');

async function checkSchema() {
    const client = await pool.connect();
    try {
        const tables = ['client', 'supplier', 'sale', 'payment_req', 'client_request', 'supplier_request'];
        for (const t of tables) {
            const res = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [t]);
            const cols = res.rows.map(r => r.column_name);
            console.log(`Table ${t}: ${cols.includes('payment_terms') ? 'Has payment_terms' : 'MISSING payment_terms'}`);
            if (!cols.includes('payment_terms')) console.log('Columns:', cols);
        }
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

checkSchema();
