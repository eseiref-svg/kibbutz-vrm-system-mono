const { pool } = require('../db');
const { calculateDueDate } = require('../utils/paymentCalculations');

async function fixAllDates() {
    const client = await pool.connect();
    try {
        console.log('🔧 Fixing All Transaction Dates (Suppliers & Clients)...');
        await client.query('BEGIN');

        // 1. Fix Supplier Payment Requests (Expenses)
        // Includes: Open, Paid, Pending Approval
        const reqRes = await client.query(`
            SELECT pr.payment_req_id, pr.transaction_id, s.payment_terms, t.due_date, t.status 
            FROM payment_req pr
            JOIN transaction t ON pr.transaction_id = t.transaction_id
            JOIN supplier s ON pr.supplier_id = s.supplier_id
        `);

        console.log(`Processing ${reqRes.rows.length} supplier requests...`);

        for (const req of reqRes.rows) {
            let baseDate = new Date();

            // Infer Base Date (Invoice Date)
            if (req.status === 'paid') {
                baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 60) - 30); // 1-3 months ago
            } else if (req.status === 'open') {
                baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 10)); // Recent
            } else if (req.status === 'pending_approval') {
                // Pending usually means JUST submitted
                baseDate = new Date();
            }

            const correctDueDate = calculateDueDate(baseDate, req.payment_terms);

            let actualDate = null;
            if (req.status === 'paid') {
                actualDate = correctDueDate; // Ideal world: paid on time
            }

            await client.query(`
                UPDATE transaction 
                SET due_date = $1, actual_date = $2 
                WHERE transaction_id = $3
            `, [correctDueDate, actualDate, req.transaction_id]);
        }
        console.log('✅ Supplier transactions corrected.');

        // 2. Re-run Sales Fix (Just in case, for consistency)
        const salesRes = await client.query(`
            SELECT s.sale_id, s.transaction_id, s.payment_terms, t.due_date, t.status 
            FROM sale s
            JOIN transaction t ON s.transaction_id = t.transaction_id
        `);

        console.log(`Processing ${salesRes.rows.length} client sales...`);

        for (const sale of salesRes.rows) {
            let baseDate = new Date();
            if (sale.status === 'paid') {
                baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 60) - 30);
            } else {
                baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 10));
            }

            const correctDueDate = calculateDueDate(baseDate, sale.payment_terms);

            let actualDate = null;
            if (sale.status === 'paid') {
                actualDate = correctDueDate;
            }

            await client.query(`
                UPDATE transaction 
                SET due_date = $1, actual_date = $2 
                WHERE transaction_id = $3
            `, [correctDueDate, actualDate, sale.transaction_id]);
        }
        console.log('✅ Client sales re-verified.');

        await client.query('COMMIT');
        console.log('✨ All transaction dates normalized.');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error fixing dates:', err);
    } finally {
        client.release();
        pool.end();
    }
}

fixAllDates();
