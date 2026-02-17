
const { pool } = require('../db');
const { calculateDueDate } = require('../utils/paymentCalculations');

async function seedAdditionalPayments() {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Additional Payments Seeding (20 Items)...');
        await client.query('BEGIN');

        // 1. Fetch Resources
        const branchesRes = await client.query("SELECT branch_id, manager_id FROM branch WHERE is_active = true AND manager_id IS NOT NULL");
        const suppliersRes = await client.query("SELECT supplier_id, name, payment_terms FROM supplier WHERE status = 'approved' AND is_active = true");

        if (branchesRes.rows.length === 0 || suppliersRes.rows.length === 0) {
            throw new Error('Not enough branches or suppliers to generate data.');
        }

        const branches = branchesRes.rows;
        const suppliers = suppliersRes.rows;

        // 2. Define Mix (20 Total)
        // 6 Overdue, 8 Paid (w/ Review), 6 Future
        const mix = [
            ...Array(6).fill('overdue'),
            ...Array(8).fill('paid'),
            ...Array(6).fill('future')
        ];

        let createdCount = 0;

        for (const type of mix) {
            // Randomly select Branch & Supplier
            const branch = branches[Math.floor(Math.random() * branches.length)];
            const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];

            // Determine Transaction Date based on Type
            let baseDate = new Date(); // To be manipulated

            if (type === 'overdue') {
                // Should be due in the past. 
                // Move base date back 2-3 months so due date is definitely passed.
                baseDate.setMonth(baseDate.getMonth() - 3);
                baseDate.setDate(Math.floor(Math.random() * 28) + 1);
            } else if (type === 'paid') {
                // Paid recently or a while ago
                baseDate.setMonth(baseDate.getMonth() - 2);
                baseDate.setDate(Math.floor(Math.random() * 28) + 1);
            } else if (type === 'future') {
                // Transaction created recently, due in future
                baseDate = new Date(); // Today
            }

            // Calculate Due Date
            // Ensure 5th/20th logic
            const dueDate = calculateDueDate(baseDate, supplier.payment_terms || 'current_30');

            // Financials
            const amount = Math.floor(Math.random() * 5000) + 500;
            const dbValue = -amount; // Expense is negative in DB

            // Status & Actual Date
            let status = 'open';
            let actualDate = null;

            if (type === 'paid') {
                status = 'paid';
                actualDate = dueDate; // Paid on time
            }

            // Insert Transaction
            const txRes = await client.query(`
                INSERT INTO transaction (value, due_date, status, description, actual_date) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING transaction_id
            `, [
                dbValue,
                dueDate,
                status,
                `Automated ${type} payment to ${supplier.name} (${supplier.payment_terms})`,
                actualDate
            ]);
            const transactionId = txRes.rows[0].transaction_id;

            // Insert Payment Request (Expense)
            const reqNo = Math.floor(100000000 + Math.random() * 900000000);
            await client.query(`
                INSERT INTO payment_req (transaction_id, supplier_id, branch_id, payment_req_no)
                VALUES ($1, $2, $3, $4)
            `, [transactionId, supplier.supplier_id, branch.branch_id, reqNo]);

            // If Paid, Insert Review
            if (type === 'paid') {
                const rating = Math.floor(Math.random() * 2) + 4; // High ratings (4-5) mostly, or random 1-5?
                // Use truly random 1-5 for realism
                const realRating = Math.floor(Math.random() * 5) + 1;

                let comment = '';
                if (realRating >= 5) comment = 'שירות מצוין, עמידה בזמנים.';
                else if (realRating >= 4) comment = 'שירות טוב, סך הכל מרוצים.';
                else if (realRating === 3) comment = 'בסדר, לא מעבר לזה.';
                else comment = 'לא מרוצים מהזמנים והמחיר.';

                await client.query(`
                    INSERT INTO review (supplier_id, user_id, rate, rate_quality, rate_time, rate_price, rate_service, comment, date)
                    VALUES ($1, $2, $3, $4, $4, $4, $4, $5, NOW())
                `, [supplier.supplier_id, branch.manager_id, realRating, realRating, comment]);
            }

            createdCount++;
        }

        await client.query('COMMIT');
        console.log(`✅ Successfully created ${createdCount} payment records.`);
        console.log('--- Breakdown ---');
        console.log(`Overdue: 6`);
        console.log(`Paid + Reviewed: 8`);
        console.log(`Future: 6`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error Seeding Service:', err);
    } finally {
        client.release();
        pool.end();
    }
}

seedAdditionalPayments();
