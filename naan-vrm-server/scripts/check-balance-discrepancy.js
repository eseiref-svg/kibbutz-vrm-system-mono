const { pool } = require('../db');

async function checkBalanceTable() {
    try {
        // Find האורווה branch and its balance
        console.log('=== Checking Balance Table for האורווה ===');
        const result = await pool.query(`
      SELECT b.branch_id, b.name, b.budget, b.business, b.balance_id,
             bal.debit, bal.credit
      FROM branch b 
      JOIN balance bal ON b.balance_id = bal.balance_id
      WHERE b.name LIKE '%אורווה%'
    `);

        if (result.rows.length === 0) {
            console.log('Branch not found!');
            return;
        }

        const data = result.rows[0];
        console.log('Branch Data:', data);
        console.log('');

        const credit = parseFloat(data.credit || 0);
        const debit = parseFloat(data.debit || 0);
        const netPerformance = credit - debit;

        console.log('=== From Balance Table ===');
        console.log(`Credit (from balance table): ₪${credit.toLocaleString('he-IL', { minimumFractionDigits: 2 })}`);
        console.log(`Debit (from balance table): ₪${debit.toLocaleString('he-IL', { minimumFractionDigits: 2 })}`);
        console.log(`Net Performance: ₪${netPerformance.toLocaleString('he-IL', { minimumFractionDigits: 2 })}`);
        console.log('');

        // Now check actual paid transactions
        console.log('=== From Actual Paid Transactions ===');
        const transResult = await pool.query(`
      SELECT 
        SUM(CASE WHEN t.value > 0 THEN t.value ELSE 0 END) as total_credit,
        SUM(CASE WHEN t.value < 0 THEN ABS(t.value) ELSE 0 END) as total_debit
      FROM transaction t
      LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
      LEFT JOIN sale s ON t.transaction_id = s.transaction_id
      WHERE t.status = 'paid'
        AND (pr.branch_id = $1 OR s.branch_id = $1)
    `, [data.branch_id]);

        const actualCredit = parseFloat(transResult.rows[0].total_credit || 0);
        const actualDebit = parseFloat(transResult.rows[0].total_debit || 0);
        const actualNet = actualCredit - actualDebit;

        console.log(`Credit (from paid transactions): ₪${actualCredit.toLocaleString('he-IL', { minimumFractionDigits: 2 })}`);
        console.log(`Debit (from paid transactions): ₪${actualDebit.toLocaleString('he-IL', { minimumFractionDigits: 2 })}`);
        console.log(`Net Performance: ₪${actualNet.toLocaleString('he-IL', { minimumFractionDigits: 2 })}`);
        console.log('');

        console.log('=== DISCREPANCY ===');
        console.log(`Balance table shows: ₪${netPerformance.toLocaleString('he-IL', { minimumFractionDigits: 2 })}`);
        console.log(`Actual transactions show: ₪${actualNet.toLocaleString('he-IL', { minimumFractionDigits: 2 })}`);
        console.log(`Difference: ₪${(netPerformance - actualNet).toLocaleString('he-IL', { minimumFractionDigits: 2 })}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkBalanceTable();
