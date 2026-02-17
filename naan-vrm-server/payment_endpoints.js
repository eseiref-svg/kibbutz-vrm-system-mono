// ============================================
// PAYMENT DASHBOARD & TRACKING API
// ============================================

// Get payment dashboard statistics
app.get('/api/payments/dashboard', auth, async (req, res) => {
    try {
        const { branchId } = req.query;

        let branchFilter = '';
        const params = [];
        let paramIndex = 1;

        if (branchId && branchId !== 'all') {
            branchFilter = ` AND (pr.branch_id = $${paramIndex} OR sa.branch_id = $${paramIndex})`;
            params.push(branchId);
            paramIndex++;
        }

        // Get overdue payables (to suppliers)
        const overduePayablesQuery = `
      SELECT COUNT(*) as count, SUM(ABS(t.value)) as total
      FROM transaction t
      JOIN payment_req pr ON t.transaction_id = pr.transaction_id
      WHERE t.status = 'open' AND t.due_date < CURRENT_DATE ${branchFilter}
    `;

        // Get overdue receivables (from clients)
        const overdueReceivablesQuery = `
      SELECT COUNT(*) as count, SUM(ABS(t.value)) as total
      FROM transaction t
      JOIN sale sa ON t.transaction_id = sa.transaction_id
      WHERE t.status = 'open' AND t.due_date < CURRENT_DATE ${branchFilter}
    `;

        // Get upcoming payments (next 7 days)
        const upcomingQuery = `
      SELECT COUNT(*) as count
      FROM transaction t
      LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
      LEFT JOIN sale sa ON t.transaction_id = sa.transaction_id
      WHERE t.status = 'open' 
        AND t.due_date >= CURRENT_DATE 
        AND t.due_date <= CURRENT_DATE + INTERVAL '7 days'
        ${branchFilter}
    `;

        const [overduePayables, overdueReceivables, upcoming] = await Promise.all([
            db.query(overduePayablesQuery, params),
            db.query(overdueReceivablesQuery, params),
            db.query(upcomingQuery, params)
        ]);

        res.json({
            overdue_payables_count: overduePayables.rows[0].count || 0,
            overdue_payables_total: overduePayables.rows[0].total || 0,
            overdue_receivables_count: overdueReceivables.rows[0].count || 0,
            overdue_receivables_total: overdueReceivables.rows[0].total || 0,
            upcoming_count: upcoming.rows[0].count || 0
        });
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get all payments with pagination
app.get('/api/payments/all', auth, async (req, res) => {
    try {
        const { branchId, type, status, currentMonth, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let filters = ['t.status = \'open\''];
        const params = [];
        let paramIndex = 1;

        // Branch filter
        if (branchId && branchId !== 'all') {
            filters.push(`(pr.branch_id = $${paramIndex} OR sa.branch_id = $${paramIndex})`);
            params.push(bran chId);
            paramIndex++;
        }

        // Type filter (payment/sale)
        if (type && type !== 'all') {
            if (type === 'payment') {
                filters.push('pr.payment_req_id IS NOT NULL');
            } else if (type === 'sale') {
                filters.push('sa.sale_id IS NOT NULL');
            }
        }

        // Current month filter
        if (currentMonth === 'true') {
            filters.push('EXTRACT(MONTH FROM t.due_date) = EXTRACT(MONTH FROM CURRENT_DATE)');
            filters.push('EXTRACT(YEAR FROM t.due_date) = EXTRACT(YEAR FROM CURRENT_DATE)');
        }

        const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

        // Count query
        const countQuery = `
      SELECT COUNT(*) FROM (
        SELECT t.transaction_id
        FROM transaction t
        LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
        LEFT JOIN sale sa ON t.transaction_id = sa.transaction_id
        ${whereClause}
      ) as total_query
    `;

        // Main query
        const mainQuery = `
      SELECT 
        t.transaction_id,
        t.value,
        t.due_date,
        t.status,
        CASE 
          WHEN pr.payment_req_id IS NOT NULL THEN 'payment'
          WHEN sa.sale_id IS NOT NULL THEN 'sale'
        END as transaction_type,
        COALESCE(s.name, c.name) as entity_name,
        COALESCE(b1.name, b2.name) as branch_name,
        CURRENT_DATE - t.due_date as days_overdue,
        t.due_date - CURRENT_DATE as days_until_due
      FROM transaction t
      LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
      LEFT JOIN supplier s ON pr.supplier_id = s.supplier_id
      LEFT JOIN branch b1 ON pr.branch_id = b1.branch_id
      LEFT JOIN sale sa ON t.transaction_id = sa.transaction_id
      LEFT JOIN client c ON sa.client_id = c.client_id
      LEFT JOIN branch b2 ON sa.branch_id = b2.branch_id
      ${whereClause}
      ORDER BY t.due_date ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

        const [countResult, dataResult] = await Promise.all([
            db.query(countQuery, params),
            db.query(mainQuery, [...params, limit, offset])
        ]);

        const total = parseInt(countResult.rows[0].count);

        res.json({
            data: dataResult.rows,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (err) {
        console.error('Error fetching all payments:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get overdue payments
app.get('/api/payments/overdue', auth, async (req, res) => {
    try {
        const { branchId, type, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let filters = ['t.status = \'open\'', 't.due_date < CURRENT_DATE'];
        const params = [];
        let paramIndex = 1;

        if (branchId && branchId !== 'all') {
            filters.push(`(pr.branch_id = $${paramIndex} OR sa.branch_id = $${paramIndex})`);
            params.push(branchId);
            paramIndex++;
        }

        if (type && type !== 'all') {
            if (type === 'payment') {
                filters.push('pr.payment_req_id IS NOT NULL');
            } else if (type === 'sale') {
                filters.push('sa.sale_id IS NOT NULL');
            }
        }

        const whereClause = `WHERE ${filters.join(' AND ')}`;

        const countQuery = `
      SELECT COUNT(*) FROM (
        SELECT t.transaction_id
        FROM transaction t
        LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
        LEFT JOIN sale sa ON t.transaction_id = sa.transaction_id
        ${whereClause}
      ) as total_query
    `;

        const mainQuery = `
      SELECT 
        t.transaction_id,
        t.value,
        t.due_date,
        t.status,
        CASE 
          WHEN pr.payment_req_id IS NOT NULL THEN 'payment'
          WHEN sa.sale_id IS NOT NULL THEN 'sale'
        END as transaction_type,
        COALESCE(s.name, c.name) as entity_name,
        COALESCE(b1.name, b2.name) as branch_name,
        CURRENT_DATE - t.due_date as days_overdue,
        t.due_date - CURRENT_DATE as days_until_due
      FROM transaction t
      LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
      LEFT JOIN supplier s ON pr.supplier_id = s.supplier_id
      LEFT JOIN branch b1 ON pr.branch_id = b1.branch_id
      LEFT JOIN sale sa ON t.transaction_id = sa.transaction_id
      LEFT JOIN client c ON sa.client_id = c.client_id
      LEFT JOIN branch b2 ON sa.branch_id = b2.branch_id
      ${whereClause}
      ORDER BY t.due_date ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

        const [countResult, dataResult] = await Promise.all([
            db.query(countQuery, params),
            db.query(mainQuery, [...params, limit, offset])
        ]);

        const total = parseInt(countResult.rows[0].count);

        res.json({
            data: dataResult.rows,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (err) {
        console.error('Error fetching overdue payments:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get upcoming payments
app.get('/api/payments/upcoming', auth, async (req, res) => {
    try {
        const { branchId, type, interval = '7 days', page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let filters = [
            't.status = \'open\'',
            't.due_date >= CURRENT_DATE',
            `t.due_date <= CURRENT_DATE + INTERVAL '${interval}'`
        ];
        const params = [];
        let paramIndex = 1;

        if (branchId && branchId !== 'all') {
            filters.push(`(pr.branch_id = $${paramIndex} OR sa.branch_id = $${paramIndex})`);
            params.push(branchId);
            paramIndex++;
        }

        if (type && type !== 'all') {
            if (type === 'payment') {
                filters.push('pr.payment_req_id IS NOT NULL');
            } else if (type === 'sale') {
                filters.push('sa.sale_id IS NOT NULL');
            }
        }

        const whereClause = `WHERE ${filters.join(' AND ')}`;

        const countQuery = `
      SELECT COUNT(*) FROM (
        SELECT t.transaction_id
        FROM transaction t
        LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
        LEFT JOIN sale sa ON t.transaction_id = sa.transaction_id
        ${whereClause}
      ) as total_query
    `;

        const mainQuery = `
      SELECT 
        t.transaction_id,
        t.value,
        t.due_date,
        t.status,
        CASE 
          WHEN pr.payment_req_id IS NOT NULL THEN 'payment'
          WHEN sa.sale_id IS NOT NULL THEN 'sale'
        END as transaction_type,
        COALESCE(s.name, c.name) as entity_name,
        COALESCE(b1.name, b2.name) as branch_name,
        CURRENT_DATE - t.due_date as days_overdue,
        t.due_date - CURRENT_DATE as days_until_due
      FROM transaction t
      LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
      LEFT JOIN supplier s ON pr.supplier_id = s.supplier_id
      LEFT JOIN branch b1 ON pr.branch_id = b1.branch_id
      LEFT JOIN sale sa ON t.transaction_id = sa.transaction_id
      LEFT JOIN client c ON sa.client_id = c.client_id
      LEFT JOIN branch b2 ON sa.branch_id = b2.branch_id
      ${whereClause}
      ORDER BY t.due_date ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

        const [countResult, dataResult] = await Promise.all([
            db.query(countQuery, params),
            db.query(mainQuery, [...params, limit, offset])
        ]);

        const total = parseInt(countResult.rows[0].count);

        res.json({
            data: dataResult.rows,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (err) {
        console.error('Error fetching upcoming payments:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Run manual payment check (Admin/Treasurer only)
app.post('/api/payments/run-check', auth, async (req, res) => {
    try {
        // Check if user is admin or treasurer
        if (!['admin', 'treasurer'].includes(req.user.role)) {
            return res.status(403).json({ message: 'אין הרשאה' });
        }

        const result = await paymentMonitorService.runManualCheck();
        res.json(result);
    } catch (err) {
        console.error('Error running manual check:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Mark payment as paid
app.put('/api/payments/:id/mark-paid', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { actualDate } = req.body;

        await db.query(
            `UPDATE transaction SET status = 'paid', actual_date = $1 WHERE transaction_id = $2`,
            [actualDate || new Date(), id]
        );

        // Remove any alerts for this transaction
        await alertService.removeAlertForPaidTransaction(id);

        res.json({ message: 'התשלום סומן כשולם בהצלחה' });
    } catch (err) {
        console.error('Error marking payment as paid:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});
