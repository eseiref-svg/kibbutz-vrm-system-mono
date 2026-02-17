
const { pool } = require('../db');

async function checkOverdue() {
    const client = await pool.connect();
    try {
        console.log('🔍 Checking for Overdue Transactions (Open & Due < Today)...');
        // Assuming Today is 2026-01-17 based on context, but PG uses its own CURRENT_DATE
        // Let's print CURRENT_DATE from DB to be sure
        const dateRes = await client.query("SELECT CURRENT_DATE::text as now");
        console.log('📅 DB Date:', dateRes.rows[0].now);

        const overdueRes = await client.query(`
            SELECT t.transaction_id, t.due_date, t.status, t.value,
                   CASE WHEN pr.payment_req_id IS NOT NULL THEN 'supplier_payment' ELSE 'client_sale' END as type
            FROM transaction t
            LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
            LEFT JOIN sale sa ON t.transaction_id = sa.transaction_id
            WHERE t.status = 'open' AND t.due_date < CURRENT_DATE
        `);

        console.log(`📉 Found ${overdueRes.rows.length} overdue transactions.`);
        if (overdueRes.rows.length > 0) {
            console.log('Sample:', overdueRes.rows.slice(0, 3));
        } else {
            console.log('Possible cause: "fix-all-dates" pushed everything to upcoming 5th/20th (Jan 20).');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

checkOverdue();
