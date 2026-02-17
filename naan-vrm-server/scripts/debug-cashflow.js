
const { pool } = require('../db');

async function checkFuture() {
    const client = await pool.connect();
    try {
        console.log('🔍 Checking Future Open Transactions...');

        // Query logic from server.js for 'upcomingPayments'
        // WHERE t.status = 'open' AND t.due_date >= CURRENT_DATE AND t.due_date < CURRENT_DATE + INTERVAL '1 month'

        // 1. Check exact date range
        const res = await client.query(`
            SELECT t.transaction_id, t.due_date, t.value,
                   CASE 
                       WHEN (t.due_date >= CURRENT_DATE AND t.due_date < CURRENT_DATE + INTERVAL '1 month') THEN 'IN_RANGE'
                       ELSE 'OUT_OF_RANGE'
                   END as status_check
            FROM transaction t
            WHERE t.status = 'open' AND t.due_date >= CURRENT_DATE
            ORDER BY t.transaction_id DESC
            LIMIT 10
        `);

        console.log('Recent Future Transactions:', res.rows);

        // 2. Run the exact Sum Query
        const sumRes = await client.query(`
          SELECT 
            COALESCE(SUM(t.value), 0) as upcoming_payments
          FROM transaction t
          LEFT JOIN sale s ON t.transaction_id = s.transaction_id
          LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
          WHERE 
            (t.status = 'open' OR t.status = 'paid')
            AND t.due_date >= CURRENT_DATE
            AND t.due_date < CURRENT_DATE + INTERVAL '1 month'
            AND (s.sale_id IS NOT NULL OR pr.payment_req_id IS NOT NULL)
        `);
        console.log('Calculated Upcoming Sum:', sumRes.rows[0]);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

checkFuture();
