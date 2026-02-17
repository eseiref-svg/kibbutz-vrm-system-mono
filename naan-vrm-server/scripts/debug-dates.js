const { pool } = require('../db');

async function debugDates() {
    const client = await pool.connect();
    try {
        console.log('🔍 Debugging Transaction Dates...');

        // Sample 5 transactions
        const res = await client.query(`
            SELECT t.transaction_id, t.due_date, t.status, s.payment_terms as sale_terms, pr_s.payment_terms as supp_terms
            FROM transaction t
            LEFT JOIN sale s ON t.transaction_id = s.transaction_id
            LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
            LEFT JOIN supplier pr_s ON pr.supplier_id = pr_s.supplier_id
            LIMIT 10
        `);

        for (const row of res.rows) {
            const terms = row.sale_terms || row.supp_terms;
            const date = new Date(row.due_date);
            const day = date.getDate();
            console.log(`ID: ${row.transaction_id} | Status: ${row.status} | Terms: ${terms} | Due Date: ${date.toISOString().split('T')[0]} (Day: ${day})`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

debugDates();
