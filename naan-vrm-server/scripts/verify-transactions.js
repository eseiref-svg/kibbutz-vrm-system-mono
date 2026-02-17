const { pool } = require('../db');

async function verifyTransactions() {
    const client = await pool.connect();
    try {
        console.log('📊 Verifying Transactions & Reviews:');

        // Count Transactions
        const countTrans = await client.query('SELECT COUNT(*) FROM transaction');
        const countReqs = await client.query('SELECT COUNT(*) FROM payment_req');
        const countRevs = await client.query('SELECT COUNT(*) FROM review');

        console.log(` - Transactions: ${countTrans.rows[0].count}`);
        console.log(` - Payment Requests: ${countReqs.rows[0].count}`);
        console.log(` - Reviews: ${countRevs.rows[0].count}`);

        // Check Status Distributions
        console.log('\nStatus Check (Due Date Analysis):');
        const overdue = await client.query("SELECT COUNT(*) FROM transaction WHERE due_date < CURRENT_DATE");
        const today = await client.query("SELECT COUNT(*) FROM transaction WHERE due_date = CURRENT_DATE");
        const future = await client.query("SELECT COUNT(*) FROM transaction WHERE due_date > CURRENT_DATE");

        console.log(` - Overdue (> 7 days ago): ${overdue.rows[0].count}`);
        console.log(` - Today: ${today.rows[0].count}`);
        console.log(` - Future (> 7 days later): ${future.rows[0].count}`);

        // Sample Review
        console.log('\nSample Review:');
        const sampleRev = await client.query(`
            SELECT s.name as supplier, u.first_name, u.surname, r.rate, r.comment
            FROM review r
            JOIN supplier s ON r.supplier_id = s.supplier_id
            JOIN "user" u ON r.user_id = u.user_id
            LIMIT 3
        `);
        sampleRev.rows.forEach(r => {
            console.log(` - ${r.first_name} ${r.surname} rated ${r.supplier} ${r.rate}/5: "${r.comment}"`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

verifyTransactions();
