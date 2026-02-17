const { pool } = require('../db');

async function checkCommunityBranchTransactions() {
    try {
        // 1. Find a community branch (business = false)
        const branchRes = await pool.query("SELECT branch_id, name FROM branch WHERE business = false LIMIT 1");
        if (branchRes.rowCount === 0) {
            console.log('No community branches found.');
            return;
        }
        const branch = branchRes.rows[0];
        console.log(`Checking branch: ${branch.name} (ID: ${branch.branch_id})`);

        // 2. Get all transactions for this branch
        const transRes = await pool.query(`
      SELECT t.transaction_id, t.status, t.value, t.due_date
      FROM transaction t
      JOIN payment_req pr ON t.transaction_id = pr.transaction_id
      WHERE pr.branch_id = $1
    `, [branch.branch_id]);

        console.log(`Found ${transRes.rowCount} transactions:`);
        transRes.rows.forEach(t => {
            console.log(` - ID: ${t.transaction_id}, Status: ${t.status}, Value: ${t.value}`);
        });

        // 3. Run the balance query logic manually
        const balanceRes = await pool.query(`
      SELECT 
        SUM(CASE WHEN s.sale_id IS NOT NULL THEN ABS(t.value) ELSE 0 END) as credit,
        SUM(CASE WHEN pr.payment_req_id IS NOT NULL THEN ABS(t.value) ELSE 0 END) as debit
      FROM transaction t
      LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id AND pr.branch_id = $1
      LEFT JOIN sale s ON t.transaction_id = s.transaction_id AND s.branch_id = $1
      WHERE t.status = 'paid'
        AND (pr.branch_id = $1 OR s.branch_id = $1)
    `, [branch.branch_id]);

        console.log('Calculated Balance (PAID only):', balanceRes.rows[0]);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkCommunityBranchTransactions();
