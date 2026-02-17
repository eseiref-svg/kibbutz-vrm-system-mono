const { pool } = require('../db');
const { calculateDueDate } = require('../utils/paymentCalculations');

async function fixClientData() {
    const client = await pool.connect();
    try {
        console.log('🔧 Fixing Client Data (Dates & Branch Association)...');
        await client.query('BEGIN');

        // 1. Fix Sales Dates (Due Date & Actual Date)
        // Fetch all sales with their payment terms and current transaction details
        const salesRes = await client.query(`
            SELECT s.sale_id, s.transaction_id, s.payment_terms, t.due_date, t.status 
            FROM sale s
            JOIN transaction t ON s.transaction_id = t.transaction_id
        `);

        console.log(`Processing ${salesRes.rows.length} sales...`);

        for (const sale of salesRes.rows) {
            // We assume the original 'due_date' in DB was random. 
            // To recalculate accurately, we need a 'base date' (transaction date).
            // Since we don't store separate 'transaction_date' in 'transaction' table (it only has due_date),
            // we have to infer/reverse-engineer a base date or just pick a new one based on status.

            // Logic:
            // If Paid -> Base date was in the past.
            // If Open -> Base date is recent/future.

            let baseDate = new Date();
            if (sale.status === 'paid') {
                baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 60) - 30); // 1-3 months ago
            } else {
                baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 10)); // Recent purchase
            }

            // Calculate Strictly Correct Due Date
            const correctDueDate = calculateDueDate(baseDate, sale.payment_terms);

            // Determine Actual Date
            let actualDate = null;
            if (sale.status === 'paid') {
                // Paid on due date (ideal)
                actualDate = correctDueDate;
            }

            // Update Transaction
            await client.query(`
                UPDATE transaction 
                SET due_date = $1, actual_date = $2 
                WHERE transaction_id = $3
            `, [correctDueDate, actualDate, sale.transaction_id]);
        }
        console.log('✅ Sales dates corrected.');

        // 2. Fix Client Branch Association
        // "Assign client to the branch with the earliest transaction"
        const clientsRes = await client.query('SELECT client_id FROM client');

        for (const c of clientsRes.rows) {
            const earliestSaleRes = await client.query(`
                SELECT s.branch_id, t.due_date
                FROM sale s
                JOIN transaction t ON s.transaction_id = t.transaction_id
                WHERE s.client_id = $1
                ORDER BY t.due_date ASC
                LIMIT 1
            `, [c.client_id]);

            if (earliestSaleRes.rows.length > 0) {
                const targetBranchId = earliestSaleRes.rows[0].branch_id;
                await client.query(`
                    UPDATE client 
                    SET branch_id = $1 
                    WHERE client_id = $2
                `, [targetBranchId, c.client_id]);
            }
        }
        console.log('✅ Client branch ownership aligned with transactions.');

        await client.query('COMMIT');
        console.log('✨ All fixes applied successfully.');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error fixing client data:', err);
    } finally {
        client.release();
        pool.end();
    }
}

fixClientData();
