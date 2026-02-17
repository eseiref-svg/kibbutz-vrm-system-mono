const { pool } = require('../db');

async function inspectTransaction() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT s.sale_id, s.client_id, c.name, s.payment_terms, t.due_date, t.value 
            FROM sale s
            JOIN transaction t ON s.transaction_id = t.transaction_id
            JOIN client c ON s.client_id = c.client_id
            WHERE t.value BETWEEN 36606 AND 36608
        `);

        console.log('Found Transactions:', res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

inspectTransaction();
