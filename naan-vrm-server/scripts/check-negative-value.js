const { pool } = require('../db');

async function findBranchWithDebit() {
    try {
        console.log('=== Finding All Branches with Their Financials ===\n');

        const branches = await pool.query(`SELECT branch_id, name, budget, business FROM branch ORDER BY name`);

        for (const branch of branches.rows) {
            const transResult = await pool.query(`
        SELECT 
          SUM(CASE WHEN t.value > 0 THEN t.value ELSE 0 END) as credit,
          SUM(CASE WHEN t.value < 0 THEN ABS(t.value) ELSE 0 END) as debit
        FROM transaction t
        LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
        LEFT JOIN sale s ON t.transaction_id = s.transaction_id
        WHERE t.status = 'paid'
          AND (pr.branch_id = $1 OR s.branch_id = $1)
      `, [branch.branch_id]);

            const data = transResult.rows[0];
            const credit = parseFloat(data.credit || 0);
            const debit = parseFloat(data.debit || 0);

            // Only show branches with transactions
            if (credit > 0 || debit > 0) {
                console.log(`${branch.name}:`);
                console.log(`  Credit: ₪${credit.toFixed(2)}, Debit: ₪${debit.toFixed(2)}, Net: ₪${(credit - debit).toFixed(2)}`);

                if (Math.abs(debit - 3234) < 100) {
                    console.log('  >>> POSSIBLE MATCH! <<<');
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

findBranchWithDebit();
