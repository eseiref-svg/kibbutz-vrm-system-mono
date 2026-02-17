const { pool } = require('../db');

async function checkBranchFinancials() {
    try {
        // Find האורווה branch
        console.log('=== Finding האורווה Branch ===');
        const branchResult = await pool.query(`
      SELECT branch_id, name, business, budget 
      FROM branch 
      WHERE name LIKE '%אורווה%'
    `);

        if (branchResult.rows.length === 0) {
            console.log('Branch not found!');
            return;
        }

        const branch = branchResult.rows[0];
        console.log('Branch found:', branch);
        console.log('');

        const branchId = branch.branch_id;

        // Get financial summary
        console.log('=== Financial Summary ===');
        const summaryResult = await pool.query(`
      SELECT 
        SUM(CASE WHEN t.value > 0 THEN t.value ELSE 0 END) as total_credit,
        SUM(CASE WHEN t.value < 0 THEN ABS(t.value) ELSE 0 END) as total_debit,
        COUNT(*) as total_transactions
      FROM transaction t
      LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
      LEFT JOIN sale s ON t.transaction_id = s.transaction_id
      WHERE t.status = 'paid'
        AND (pr.branch_id = $1 OR s.branch_id = $1)
    `, [branchId]);

        const summary = summaryResult.rows[0];
        const credit = parseFloat(summary.total_credit || 0);
        const debit = parseFloat(summary.total_debit || 0);
        const netPerformance = credit - debit;

        console.log(`Total Credit (Income): ₪${credit.toLocaleString('he-IL', { minimumFractionDigits: 2 })}`);
        console.log(`Total Debit (Expenses): ₪${debit.toLocaleString('he-IL', { minimumFractionDigits: 2 })}`);
        console.log(`Net Performance: ₪${netPerformance.toLocaleString('he-IL', { minimumFractionDigits: 2 })}`);
        console.log(`Total Paid Transactions: ${summary.total_transactions}`);
        console.log('');

        // Get detailed transactions
        console.log('=== Detailed Transactions (Last 20) ===');
        const detailsResult = await pool.query(`
      SELECT 
        t.transaction_id,
        t.value,
        t.status,
        t.actual_date,
        CASE 
          WHEN pr.payment_req_id IS NOT NULL THEN 'Payment to Supplier'
          WHEN s.sale_id IS NOT NULL THEN 'Income from Client'
        END as transaction_type,
        COALESCE(sup.name, cli.name) as entity_name
      FROM transaction t
      LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
      LEFT JOIN sale s ON t.transaction_id = s.transaction_id
      LEFT JOIN supplier sup ON pr.supplier_id = sup.supplier_id
      LEFT JOIN client cli ON s.client_id = cli.client_id
      WHERE t.status = 'paid'
        AND (pr.branch_id = $1 OR s.branch_id = $1)
      ORDER BY t.actual_date DESC
      LIMIT 20
    `, [branchId]);

        console.log(`Found ${detailsResult.rows.length} paid transactions:`);
        detailsResult.rows.forEach(row => {
            const amount = parseFloat(row.value);
            const formattedAmount = `₪${Math.abs(amount).toLocaleString('he-IL', { minimumFractionDigits: 2 })}`;
            console.log(`  ${row.transaction_type}: ${row.entity_name} - ${amount >= 0 ? '+' : '-'}${formattedAmount} (${row.actual_date ? row.actual_date.toISOString().split('T')[0] : 'N/A'})`);
        });

        console.log('');
        console.log('=== Calculation Explanation ===');
        console.log(`Opening Balance (Budget): ₪${parseFloat(branch.budget || 0).toLocaleString('he-IL', { minimumFractionDigits: 2 })}`);
        console.log(`Net Performance: ₪${netPerformance.toLocaleString('he-IL', { minimumFractionDigits: 2 })}`);
        console.log(`  = Credit (₪${credit.toLocaleString('he-IL', { minimumFractionDigits: 2 })}) - Debit (₪${debit.toLocaleString('he-IL', { minimumFractionDigits: 2 })})`);
        console.log(`Final Balance: ₪${(parseFloat(branch.budget || 0) + netPerformance).toLocaleString('he-IL', { minimumFractionDigits: 2 })}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkBranchFinancials();
