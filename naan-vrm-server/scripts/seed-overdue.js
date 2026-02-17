
const { pool } = require('../db');

async function seedOverdue() {
    const client = await pool.connect();
    try {
        console.log('🕰️ Seeding Overdue Transactions (Backdating)...');
        await client.query('BEGIN');

        // 1. Get Open Transactions
        const res = await client.query(`
            SELECT transaction_id FROM transaction 
            WHERE status = 'open' 
            ORDER BY transaction_id DESC
            LIMIT 15
        `);

        if (res.rows.length === 0) {
            console.log('No open transactions found to backdate.');
            return;
        }

        const ids = res.rows.map(r => r.transaction_id);
        console.log(`Backdating ${ids.length} transactions...`);

        // 2. Set some to Jan 5th 2026 (Recent Overdue)
        // Today is Jan 17th, so Jan 5th is overdue.
        const jan5 = '2026-01-05';

        // 3. Set some to Dec 20th 2025 (Older Overdue)
        const dec20 = '2025-12-20';

        let count = 0;
        for (const id of ids) {
            const newDate = count % 2 === 0 ? jan5 : dec20;
            await client.query(`
                UPDATE transaction 
                SET due_date = $1 
                WHERE transaction_id = $2
            `, [newDate, id]);
            count++;
        }

        await client.query('COMMIT');
        console.log('✅ Specific transactions backdated to create overdue data.');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

seedOverdue();
