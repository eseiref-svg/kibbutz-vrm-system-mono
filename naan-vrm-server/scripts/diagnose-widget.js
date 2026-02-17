const db = require('../db');

// Mock pool object to match previous script structure, or use db.pool directly
const pool = db.pool;

async function diagnoseWidget() {
  // Use db.pool.connect() or just db.query if we don't need transaction isolation, 
  // but let's stick to client for manual release control if needed.
  // Actually, db.js exports a 'query' function which is a wrapper. 
  // But to adhere to the script flow using 'client', we get a client from the pool.
  const client = await pool.connect();

  try {
    console.log('--- DIAGNOSIS START ---\n');

    const incomingQuery = `
      SELECT 
        t.transaction_id,
        t.value,
        t.due_date,
        CASE 
            WHEN s.sale_id IS NOT NULL THEN 'Income (Sale)' 
            WHEN pr.payment_req_id IS NOT NULL THEN 'Expense (Payment)' 
        END as type,
        COALESCE(c.name, supp.name) as entity_name
      FROM transaction t
      LEFT JOIN sale s ON t.transaction_id = s.transaction_id
      LEFT JOIN client c ON s.client_id = c.client_id
      LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
      LEFT JOIN supplier supp ON pr.supplier_id = supp.supplier_id
      WHERE 
        t.status = 'open' 
        AND t.due_date >= CURRENT_DATE
        AND t.due_date < CURRENT_DATE + INTERVAL '1 month'
        AND (s.sale_id IS NOT NULL OR pr.payment_req_id IS NOT NULL)
      ORDER BY t.due_date ASC
    `;

    const res = await client.query(incomingQuery);
    console.log('\n📊 Detailed Breakdown of "Cash Flow Forecast" (Next Month):');
    console.log('-----------------------------------------------------------');
    if (res.rows.length === 0) {
      console.log("No items found for this period.");
    } else {
      console.table(res.rows.map(r => ({
        Date: r.due_date.toISOString().split('T')[0],
        Type: r.type,
        Entity: r.entity_name || 'N/A',
        Amount: `₪${parseFloat(r.value).toLocaleString()}`
      })));

      const total = res.rows.reduce((acc, r) => {
        const val = parseFloat(r.value);
        return r.type.includes('Income') ? acc + val : acc - val;
      }, 0);
      console.log(`\n💰 TOTAL CASH FLOW FORECAST: ₪${total.toLocaleString()}`);
    }


    // 3. Check "Overdue Invoices" (The number 15)
    console.log('\n🔍 2. Investigating "Overdue Invoices" (15 in Widget)');
    const overdueQuery = `
      SELECT 
       CASE WHEN pr.payment_req_id IS NOT NULL THEN 'PAYABLE (To Pay)' ELSE 'RECEIVABLE (To Get)' END as type,
       COUNT(*) as count,
       SUM(ABS(t.value)) as total_value
      FROM transaction t
      LEFT JOIN sale s ON t.transaction_id = s.transaction_id
      LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
      WHERE t.due_date < CURRENT_DATE 
        AND t.status = 'open'
        AND (s.sale_id IS NOT NULL OR pr.payment_req_id IS NOT NULL)
      GROUP BY pr.payment_req_id, s.sale_id
    `;

    // Improved Grouping for clear summary
    const overdueSummaryQuery = `
        SELECT 
            SUM(CASE WHEN pr.payment_req_id IS NOT NULL THEN 1 ELSE 0 END) as count_payables,
            SUM(CASE WHEN s.sale_id IS NOT NULL THEN 1 ELSE 0 END) as count_receivables,
            SUM(CASE WHEN pr.payment_req_id IS NOT NULL THEN ABS(t.value) ELSE 0 END) as value_to_pay,
            SUM(CASE WHEN s.sale_id IS NOT NULL THEN ABS(t.value) ELSE 0 END) as value_to_receive
        FROM transaction t
        LEFT JOIN sale s ON t.transaction_id = s.transaction_id
        LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
        WHERE t.due_date < CURRENT_DATE 
          AND t.status = 'open'
          AND (s.sale_id IS NOT NULL OR pr.payment_req_id IS NOT NULL)
    `;

    const overdueRes = await client.query(overdueSummaryQuery);
    const ov = overdueRes.rows[0];
    console.log(`\n👉 Breakdown of the "15" Overdue:`);
    console.log(`   🔴 To Pay (Suppliers): ${ov.count_payables} invoices (Total: ₪${ov.value_to_pay})`);
    console.log(`   🟢 To Receive (Sales): ${ov.count_receivables} invoices (Total: ₪${ov.value_to_receive})`);
    console.log(`   Total Items: ${parseInt(ov.count_payables) + parseInt(ov.count_receivables)}`);

    // 4. Net Value Check
    console.log('\n🔍 3. Investigating "Net Value" (₪-8,656)');
    // Basic math check based on logic
    // We expect Net = Income - Expenses (for current year)
    // Let's print the two raw sums
    const netCheckQuery = `
       SELECT 
         SUM(CASE WHEN s.sale_id IS NOT NULL THEN t.value ELSE 0 END) as total_income,
         SUM(CASE WHEN pr.payment_req_id IS NOT NULL THEN t.value ELSE 0 END) as total_expenses_raw
       FROM transaction t
       LEFT JOIN sale s ON t.transaction_id = s.transaction_id
       LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
       WHERE 
         t.due_date >= DATE_TRUNC('year', CURRENT_DATE)
         AND t.due_date < DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year'
         AND (t.status = 'open' OR t.status = 'paid')
    `;
    const netRes = await client.query(netCheckQuery);
    const income = parseFloat(netRes.rows[0].total_income || 0);
    const expense = parseFloat(netRes.rows[0].total_expenses_raw || 0); // usually stored as positive or negative? let's check.
    // In previous grep, expenses were distinct from income.

    console.log(`\n👉 Net Value Calculation:`);
    console.log(`   Total Income (Sales): ₪${income}`);
    console.log(`   Total Expenses (Sum of Payment Requests): ₪${expense}`);
    console.log(`   Calculated Net: ₪${income} + (₪${-Math.abs(expense)}) = ₪${income - Math.abs(expense)}`);


  } catch (err) {
    console.error('Error executing diagnosis:', err);
  } finally {
    client.release();
    pool.end();
  }
}

diagnoseWidget();
