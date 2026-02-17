
const { pool } = require('../db');

async function debugTransactions() {
    const client = await pool.connect();
    try {
        console.log('🔍 Inspecting Client 525354944 and Transactions 1526, 1611, 1545...');

        // Check Client
        const clientRes = await client.query(`
            SELECT client_id, name, client_number, payment_terms 
            FROM client 
            WHERE client_number = '525354944'
        `);
        console.log('Client:', clientRes.rows[0]);

        // Check Transactions by SALE ID
        const saleIds = [1526, 1611, 1545];
        const txRes = await client.query(`
            SELECT s.sale_id, t.transaction_id, t.status, t.due_date, t.value,
                   s.payment_terms as sale_terms, c.payment_terms as client_terms
            FROM sale s
            JOIN transaction t ON s.transaction_id = t.transaction_id
            JOIN client c ON s.client_id = c.client_id
            WHERE s.sale_id = ANY($1::int[])
        `, [saleIds]);

        console.log('Transactions:', txRes.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

debugTransactions();
