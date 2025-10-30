require('dotenv').config();

const express = require('express');
const db = require('./db');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const crypto = require('crypto');

// Payment monitoring services
const paymentMonitorService = require('./services/paymentMonitorService');
const alertService = require('./services/alertService');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Health Check Endpoint (Must be BEFORE auth middleware) ---
app.get('/health', async (req, res) => {
  try {
    // Try to query database to ensure it's working
    await db.query('SELECT 1');
    res.status(200).json({ 
      status: 'ok', 
      message: 'Server is running and database connected', 
      timestamp: new Date().toISOString() 
    });
  } catch (err) {
    console.error('Health check DB error:', err.message);
    res.status(503).json({ 
      status: 'error', 
      message: 'Database connection failed', 
      error: err.message,
      timestamp: new Date().toISOString() 
    });
  }
});

// --- Public Routes ---
// These routes do not require authentication
app.post('/api/users/register', async (req, res) => {
  try {
    const { first_name, surname, email, phone_no, password, permissions_id } = req.body;
    const user = await db.query('SELECT * FROM "user" WHERE email = $1', [email]);
    if (user.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await db.query(
      'INSERT INTO "user" (first_name, surname, email, phone_no, password, permissions_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING user_id, email, first_name',
      [first_name, surname, email, phone_no, passwordHash, permissions_id, 'active']
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userResult = await db.query('SELECT * FROM "user" WHERE email = $1 AND status = \'active\'', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'פרטי ההתחברות שגויים או שהמשתמש אינו פעיל' });
    }
    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'פרטי ההתחברות שגויים' });
    }
    const payload = { user: { id: user.user_id, role_id: user.permissions_id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.user_id, role_id: user.permissions_id, name: user.first_name } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/api/users/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required.' });
        }
        const userResult = await db.query(
            'SELECT * FROM "user" WHERE reset_token = $1 AND reset_token_expires > NOW()',
            [token]
        );
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'הקישור אינו תקין או שתוקפו פג.' });
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);
        await db.query(
            'UPDATE "user" SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = $2',
            [passwordHash, token]
        );
        res.json({ message: 'הסיסמה אופסה בהצלחה.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- Public Routes (no auth required) ---
app.get('/api/branches', async (req, res) => {
  try {
    const result = await db.query('SELECT branch_id, name FROM branch ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// קבלת ענפים שיש להם עסקאות בטבלה הנוכחית
app.get('/api/branches/active', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT b.branch_id, b.name
      FROM (
        SELECT 
          t.transaction_id,
          t.value,
          t.due_date,
          t.status,
          pr.branch_id
        FROM transaction t
        LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
        LEFT JOIN supplier s ON pr.supplier_id = s.supplier_id AND s.status IN ('pending', 'approved')
        WHERE pr.payment_req_id IS NOT NULL
        
        UNION ALL
        
        SELECT 
          t.transaction_id,
          t.value,
          t.due_date,
          t.status,
          sa.branch_id
        FROM transaction t
        LEFT JOIN sale sa ON t.transaction_id = sa.transaction_id
        LEFT JOIN client c ON sa.client_id = c.client_id
        WHERE sa.sale_id IS NOT NULL
      ) combined
      LEFT JOIN branch b ON combined.branch_id = b.branch_id
      WHERE combined.status = 'open' 
        AND EXTRACT(MONTH FROM combined.due_date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM combined.due_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND b.branch_id IS NOT NULL
      ORDER BY b.name
    `;
    
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Protected Routes ---
// ALL routes below this line will use the 'auth' middleware to ensure the user is logged in
app.use(auth);

app.get('/api/supplier-fields', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM supplier_field ORDER BY field');
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

app.post('/api/supplier-fields', async (req, res) => {
  try {
    const { field, tags } = req.body;
    
    if (!field || !field.trim()) {
      return res.status(400).json({ message: 'שם התחום הוא שדה חובה' });
    }
    
    // בדיקה שהתחום לא קיים
    const existing = await db.query(
      'SELECT * FROM supplier_field WHERE field = $1', 
      [field.trim()]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'תחום זה כבר קיים במערכת' });
    }
    
    // יצירת תחום חדש
    const result = await db.query(
      'INSERT INTO supplier_field (field, tags) VALUES ($1, $2) RETURNING *',
      [field.trim(), tags || []]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- General & Branch Routes ---
app.get('/api/branches/:id/balance', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(
        'SELECT b.name, bal.debit, bal.credit FROM branch b JOIN balance bal ON b.balance_id = bal.balance_id WHERE b.branch_id = $1',
        [id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Branch not found" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

app.get('/api/branches/:id/transactions', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(
        `SELECT t.transaction_id, t.value, t.due_date, t.status, s.name as supplier_name
         FROM transaction t
         JOIN payment_req pr ON t.transaction_id = pr.transaction_id
         JOIN supplier s ON pr.supplier_id = s.supplier_id
         WHERE pr.branch_id = $1
         ORDER BY t.due_date DESC LIMIT 5`,
        [id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// --- Supplier & Supplier Field Routes ---
app.get('/api/suppliers/search', async (req, res) => {
  try {
    const { criteria } = req.query;
    const query = (req.query.query || '').trim();

    if (!query || !criteria) {
      const allSuppliers = await db.query(`
        SELECT s.*, 
               COALESCE(AVG(r.rate), 0) as average_rating,
               COUNT(r.review_id) as total_reviews
        FROM supplier s
        LEFT JOIN review r ON s.supplier_id = r.supplier_id
        WHERE s.status != 'deleted'
        GROUP BY s.supplier_id
        ORDER BY s.name
      `);
      return res.json(allSuppliers.rows);
    }
    
    let result;
    if (criteria === 'name') {
      result = await db.query(`
        SELECT s.*, 
               COALESCE(AVG(r.rate), 0) as average_rating,
               COUNT(r.review_id) as total_reviews
        FROM supplier s
        LEFT JOIN review r ON s.supplier_id = r.supplier_id
        WHERE s.name ILIKE $1 AND s.status != 'deleted'
        GROUP BY s.supplier_id
        ORDER BY s.name
      `, [`%${query}%`]);
    } else if (criteria === 'tag') {
      result = await db.query(`
        SELECT s.*, 
               COALESCE(AVG(r.rate), 0) as average_rating,
               COUNT(r.review_id) as total_reviews
        FROM supplier s
        JOIN supplier_field sf ON s.supplier_field_id = sf.supplier_field_id
        LEFT JOIN review r ON s.supplier_id = r.supplier_id
        WHERE (sf.field ILIKE $1 OR $2 = ANY(sf.tags)) AND s.status != 'deleted'
        GROUP BY s.supplier_id
        ORDER BY s.name
      `, [`%${query}%`, query.toLowerCase()]);
    } else {
      return res.status(400).json({ message: 'Invalid search criteria' });
    }
    
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/api/suppliers/all-details', async (req, res) => {
  try {
    const result = await db.query("SELECT s.*, sf.field FROM supplier s LEFT JOIN supplier_field sf ON s.supplier_field_id = sf.supplier_field_id WHERE s.status != 'deleted' ORDER BY s.name");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.put('/api/supplier-fields/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { tags } = req.body;
        if (!Array.isArray(tags)) {
          return res.status(400).json({ message: 'Tags must be an array' });
        }
        const result = await db.query(
          'UPDATE supplier_field SET tags = $1 WHERE supplier_field_id = $2 RETURNING *',
          [tags, id]
        );
        res.json(result.rows[0]);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
});

app.get('/api/suppliers/:id/transactions', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(
        `SELECT t.* FROM transaction t
         JOIN payment_req pr ON t.transaction_id = pr.transaction_id
         WHERE pr.supplier_id = $1
         ORDER BY t.due_date DESC`,
        [id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

app.get('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM supplier WHERE supplier_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Supplier not found');
    }
    res.json(result.rows[0]); 
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const { name, poc_name, poc_email, poc_phone, supplier_field_id, status } = req.body;
    const newSupplier = await db.query(
      'INSERT INTO supplier (name, poc_name, poc_email, poc_phone, supplier_field_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, poc_name, poc_email, poc_phone, supplier_field_id, status]
    );
    res.status(201).json(newSupplier.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, poc_name, poc_phone, poc_email, status, supplier_field_id } = req.body;
    const updateSupplier = await db.query(
      'UPDATE supplier SET name = $1, poc_name = $2, poc_phone = $3, poc_email = $4, status = $5, supplier_field_id = $6 WHERE supplier_id = $7 RETURNING *',
      [name, poc_name, poc_phone, poc_email, status, supplier_field_id, id]
    );
    if (updateSupplier.rowCount === 0) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json(updateSupplier.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("UPDATE supplier SET status = 'deleted' WHERE supplier_id = $1", [id]);
    res.status(200).json({ message: `Supplier with ID ${id} was soft-deleted.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Supplier Request Routes ---
app.get('/api/supplier-requests/pending', async (req, res) => {
    try {
      const result = await db.query(`
        SELECT sr.*, u.first_name || ' ' || u.surname as requested_by, b.name as branch_name
        FROM supplier_requests sr
        JOIN "user" u ON sr.requested_by_user_id = u.user_id
        JOIN branch b ON sr.branch_id = b.branch_id
        WHERE sr.status = 'pending' ORDER BY sr.created_at DESC
      `);
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

app.post('/api/supplier-requests', async (req, res) => {
    try {
      const { requested_by_user_id, branch_id, supplier_id, supplier_name, poc_name, poc_email, poc_phone, supplier_field_id, new_supplier_field } = req.body;
      const newRequest = await db.query(
        `INSERT INTO supplier_requests (requested_by_user_id, branch_id, requested_supplier_id, supplier_name, poc_name, poc_email, poc_phone, supplier_field_id, new_supplier_field) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [requested_by_user_id, branch_id, supplier_id, supplier_name, poc_name, poc_email, poc_phone, supplier_field_id, new_supplier_field]
      );
      res.status(201).json(newRequest.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

app.put('/api/supplier-requests/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
  
    try {
      const updatedRequestResult = await db.query(
        'UPDATE supplier_requests SET status = $1 WHERE request_id = $2 RETURNING *',
        [status, id]
      );
  
      if (updatedRequestResult.rowCount === 0) {
        return res.status(404).json({ message: 'Request not found' });
      }

      const request = updatedRequestResult.rows[0];
  
      // כרגע לא עושים כלום מלבד עדכון הסטטוס
      // הגזבר יפתח טופס הוספת ספק ידנית
  
      res.json(updatedRequestResult.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// --- User Management Routes (Protected) ---
app.get('/api/users', async (req, res) => {
    try {
      const result = await db.query('SELECT user_id, first_name, surname, email, phone_no, permissions_id, status FROM "user" ORDER BY surname, first_name');
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

app.post('/api/users/:id/request-password-reset', async (req, res) => {
    try {
        const { id } = req.params;
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); 

        const updateUser = await db.query(
            'UPDATE "user" SET reset_token = $1, reset_token_expires = $2 WHERE user_id = $3 RETURNING email',
            [resetToken, resetTokenExpires, id]
        );

        if (updateUser.rowCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Dynamic Frontend URL based on environment
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
        console.log(`Password reset link for ${updateUser.rows[0].email}: ${resetUrl}`);
        
        res.json({ message: 'Reset link generated successfully.', resetUrl });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, surname, email, phone_no, permissions_id, status } = req.body;
        const result = await db.query(
            'UPDATE "user" SET first_name = $1, surname = $2, email = $3, phone_no = $4, permissions_id = $5, status = $6 WHERE user_id = $7 RETURNING user_id, first_name, surname, email, phone_no, permissions_id, status',
            [first_name, surname, email, phone_no, permissions_id, status, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("UPDATE \"user\" SET status = 'inactive' WHERE user_id = $1", [id]);
        res.status(200).json({ message: 'User deactivated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.get('/api/users/:id/branch', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query('SELECT * FROM branch WHERE manager_id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "No branch found for this manager" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});


// --- Dashboard & Report Routes (Protected) ---
app.get('/api/dashboard/summary', async (req, res) => {
    try {
      const period = req.query.period || 'monthly';
      let dateFilter = `WHERE t.due_date >= date_trunc('month', NOW())`;
  
      if (period === 'quarterly') {
        dateFilter = `WHERE t.due_date >= date_trunc('quarter', NOW())`;
      } else if (period === 'annual') {
        dateFilter = `WHERE t.due_date >= date_trunc('year', NOW())`;
      }
  
      const validStatusFilter = `(t.status = 'open' OR t.status = 'paid')`;
  
      const balanceQuery = `SELECT SUM(value) as total_balance FROM transaction t ${dateFilter} AND ${validStatusFilter}`;
      const balanceResult = await db.query(balanceQuery);
      
      const expensesQuery = `
        SELECT b.name, SUM(t.value) as total_expenses
        FROM transaction t
        JOIN payment_req pr ON t.transaction_id = pr.transaction_id
        JOIN branch b ON pr.branch_id = b.branch_id
        ${dateFilter.replace("t.due_date", "t.due_date")} AND ${validStatusFilter}
        GROUP BY b.name
        ORDER BY total_expenses DESC;
      `;
      const expensesResult = await db.query(expensesQuery);
  
      const overdueQuery = `SELECT COUNT(*) FROM transaction WHERE due_date < NOW() AND status = 'open'`;
      const overdueResult = await db.query(overdueQuery);
  
      const summaryData = {
        totalSupplierBalance: balanceResult.rows[0].total_balance || 0,
        expensesByBranch: expensesResult.rows,
        overdueInvoices: overdueResult.rows[0].count || 0
      };
  
      res.json(summaryData);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

app.get('/api/reports/annual-cash-flow', async (req, res) => {
    const year = req.query.year || new Date().getFullYear();
  
    try {
      const query = `
        SELECT 
          TO_CHAR(DATE_TRUNC('month', t.due_date), 'YYYY-MM') AS month,
          SUM(CASE WHEN t.value >= 0 THEN t.value ELSE 0 END) AS income, 
          SUM(CASE WHEN t.value < 0 THEN t.value ELSE 0 END) AS expense 
        FROM transaction t
        WHERE EXTRACT(YEAR FROM t.due_date) = $1
          AND (t.status = 'paid' OR t.status = 'open')
        GROUP BY month
        ORDER BY month;
      `;
      const result = await db.query(query, [year]);
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// --- Review Routes (Protected) ---
app.get('/api/suppliers/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await db.query(
            `SELECT r.review_id, r.rate, r.comment, r.date, u.first_name, u.surname 
             FROM "review" r
             JOIN "user" u ON r.user_id = u.user_id
             WHERE r.supplier_id = $1 
             ORDER BY r.date DESC`,
            [id]
        );
        res.json(reviews.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const { supplier_id, rate, comment } = req.body;
        const user_id = req.user.id; // Get user ID from the authenticated token

        const newReview = await db.query(
            'INSERT INTO "review" (supplier_id, user_id, rate, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [supplier_id, user_id, rate, comment]
        );
        res.status(201).json(newReview.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- Notifications Route (Protected) ---
app.get('/api/notifications/pending-requests-count', async (req, res) => {
    try {
      const result = await db.query("SELECT COUNT(*) FROM supplier_requests WHERE status = 'pending'");
      res.json({ count: parseInt(result.rows[0].count, 10) });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// קבלת התראות של משתמש מחובר
app.get('/api/notifications', async (req, res) => {
    try {
      const userId = req.user.id; // מזהה המשתמש מה-token
      const result = await db.query(
        `SELECT * FROM notifications 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 50`,
        [userId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

app.get('/api/notifications/unread', async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await db.query(
        `SELECT * FROM notifications 
         WHERE user_id = $1 AND is_read = FALSE 
         ORDER BY created_at DESC`,
        [userId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// סימון התראה כנקראה
app.put('/api/notifications/:id/read', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const result = await db.query(
        `UPDATE notifications 
         SET is_read = TRUE 
         WHERE notification_id = $1 AND user_id = $2 
         RETURNING *`,
        [id, userId]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// סימון כל ההתראות כנקראו
app.put('/api/notifications/mark-all-read', async (req, res) => {
    try {
      const userId = req.user.id;
      await db.query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
        [userId]
      );
      res.json({ message: 'All notifications marked as read' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});


// ============================================
// Payment Monitoring & Alerts API Routes
// ============================================

// קבלת לוח בקרה תשלומים - סיכום כללי
app.get('/api/payments/dashboard', async (req, res) => {
    try {
      const { branchId } = req.query;
      
      let branchFilter = '';
      let params = [];
      
      if (branchId) {
        branchFilter = 'AND (pr.branch_id = $1 OR sa.branch_id = $1)';
        params = [branchId];
      }
      
      // שליפת נתונים סטטיסטיים
      const statsQuery = `
        WITH all_transactions AS (
          SELECT 
            t.transaction_id,
            t.value,
            t.due_date,
            t.status,
            pr.branch_id,
            CASE 
              WHEN t.due_date < CURRENT_DATE THEN 'overdue'
              WHEN t.due_date = CURRENT_DATE THEN 'due_today'
              WHEN t.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'upcoming'
              ELSE 'future'
            END as payment_status
          FROM transaction t
          LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
          WHERE t.status = 'open' ${branchFilter ? 'AND pr.branch_id = $1' : ''}
          
          UNION ALL
          
          SELECT 
            t.transaction_id,
            t.value,
            t.due_date,
            t.status,
            sa.branch_id,
            CASE 
              WHEN t.due_date < CURRENT_DATE THEN 'overdue'
              WHEN t.due_date = CURRENT_DATE THEN 'due_today'
              WHEN t.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'upcoming'
              ELSE 'future'
            END as payment_status
          FROM transaction t
          LEFT JOIN sale sa ON t.transaction_id = sa.transaction_id
          WHERE t.status = 'open' ${branchFilter ? 'AND sa.branch_id = $1' : ''}
        )
        SELECT 
          COUNT(*) FILTER (WHERE payment_status = 'overdue') as overdue_count,
          COUNT(*) FILTER (WHERE payment_status = 'due_today') as due_today_count,
          COUNT(*) FILTER (WHERE payment_status = 'upcoming') as upcoming_count,
          COUNT(*) as total_open,
          SUM(ABS(value)) FILTER (WHERE payment_status = 'overdue') as overdue_amount,
          SUM(ABS(value)) FILTER (WHERE payment_status = 'due_today') as due_today_amount,
          SUM(ABS(value)) as total_amount
        FROM all_transactions
      `;
      
      const stats = await db.query(statsQuery, params);
      
      res.json(stats.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// קבלת רשימת חשבוניות באיחור
app.get('/api/payments/overdue', async (req, res) => {
    try {
      const { branchId } = req.query;
      
      let branchFilter = '';
      let params = [];
      
      if (branchId) {
        branchFilter = 'AND (pr.branch_id = $1 OR sa.branch_id = $1)';
        params = [branchId];
      }
      
      const query = `
        SELECT 
          t.transaction_id,
          t.value,
          t.due_date,
          t.status,
          pr.payment_req_id,
          pr.supplier_id,
          s.name as entity_name,
          b.name as branch_name,
          'payment' as transaction_type,
          CURRENT_DATE - t.due_date as days_overdue
        FROM transaction t
        LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
        LEFT JOIN supplier s ON pr.supplier_id = s.supplier_id
        LEFT JOIN branch b ON pr.branch_id = b.branch_id
        WHERE t.status = 'open' 
          AND t.due_date < CURRENT_DATE
          AND pr.payment_req_id IS NOT NULL
          ${branchFilter}
        
        UNION ALL
        
        SELECT 
          t.transaction_id,
          t.value,
          t.due_date,
          t.status,
          sa.sale_id as payment_req_id,
          sa.client_id as supplier_id,
          c.name as entity_name,
          b.name as branch_name,
          'sale' as transaction_type,
          CURRENT_DATE - t.due_date as days_overdue
        FROM transaction t
        LEFT JOIN sale sa ON t.transaction_id = sa.transaction_id
        LEFT JOIN client c ON sa.client_id = c.client_id
        LEFT JOIN branch b ON sa.branch_id = b.branch_id
        WHERE t.status = 'open' 
          AND t.due_date < CURRENT_DATE
          AND sa.sale_id IS NOT NULL
          ${branchFilter}
        
        ORDER BY days_overdue DESC
      `;
      
      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

app.get('/api/payments/upcoming', async (req, res) => {
    try {
      const { branchId } = req.query;
      
      let branchFilter = '';
      let params = [];
      
      if (branchId) {
        branchFilter = 'AND (pr.branch_id = $1 OR sa.branch_id = $1)';
        params = [branchId];
      }
      
      const query = `
        SELECT 
          t.transaction_id,
          t.value,
          t.due_date,
          t.status,
          pr.payment_req_id,
          pr.supplier_id,
          s.name as entity_name,
          b.name as branch_name,
          'payment' as transaction_type,
          t.due_date - CURRENT_DATE as days_until_due
        FROM transaction t
        LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
        LEFT JOIN supplier s ON pr.supplier_id = s.supplier_id
        LEFT JOIN branch b ON pr.branch_id = b.branch_id
        WHERE t.status = 'open' 
          AND t.due_date >= CURRENT_DATE
          AND t.due_date <= CURRENT_DATE + INTERVAL '7 days'
          AND pr.payment_req_id IS NOT NULL
          ${branchFilter}
        
        UNION ALL
        
        SELECT 
          t.transaction_id,
          t.value,
          t.due_date,
          t.status,
          sa.sale_id as payment_req_id,
          sa.client_id as supplier_id,
          c.name as entity_name,
          b.name as branch_name,
          'sale' as transaction_type,
          t.due_date - CURRENT_DATE as days_until_due
        FROM transaction t
        LEFT JOIN sale sa ON t.transaction_id = sa.transaction_id
        LEFT JOIN client c ON sa.client_id = c.client_id
        LEFT JOIN branch b ON sa.branch_id = b.branch_id
        WHERE t.status = 'open' 
          AND t.due_date >= CURRENT_DATE
          AND t.due_date <= CURRENT_DATE + INTERVAL '7 days'
          AND sa.sale_id IS NOT NULL
          ${branchFilter}
        
        ORDER BY days_until_due ASC
      `;
      
      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});// קבלת כל העסקאות הפתוחות עם פילטרים
app.get('/api/payments/all', async (req, res) => {
    try {
      const { branchId, status, type, currentMonth } = req.query;
      
      let filters = [];
      let params = [];
      let paramIndex = 1;
      
      // ברירת מחדל - רק עסקאות פתוחות, אלא אם מסננים לפי סטטוס אחר
      if (!status || status === 'all') {
        filters.push(`status = 'open'`);
      } else if (status === 'paid') {
        filters.push(`status = 'paid'`);
      }
      
      if (branchId && branchId !== 'all') {
        filters.push(`(branch_id = $${paramIndex})`);
        params.push(branchId);
        paramIndex++;
      }
      
      if (status && status !== 'all') {
        if (status === 'overdue') {
          filters.push(`due_date < CURRENT_DATE`);
        } else if (status === 'due_today') {
          filters.push(`due_date = CURRENT_DATE`);
        } else if (status === 'upcoming') {
          filters.push(`due_date BETWEEN CURRENT_DATE + INTERVAL '1 day' AND CURRENT_DATE + INTERVAL '7 days'`);
        } else if (status === 'future') {
          filters.push(`due_date > CURRENT_DATE + INTERVAL '7 days'`);
        }
        // status = 'paid' כבר מטופל למעלה
      }
      
      if (type && type !== 'all') {
        if (type === 'payment') {
          filters.push(`transaction_type = 'payment'`);
        } else if (type === 'sale') {
          filters.push(`transaction_type = 'sale'`);
        }
      }
      
      const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
      
      const query = `
        SELECT * FROM (
          SELECT 
            t.transaction_id,
            t.value,
            t.due_date,
            t.status,
            t.alert_id,
            pr.payment_req_id,
            pr.supplier_id,
            s.name as entity_name,
            b.name as branch_name,
            b.branch_id,
            'payment' as transaction_type,
          CASE 
            WHEN t.status = 'paid' THEN 0
            WHEN t.due_date < CURRENT_DATE THEN CURRENT_DATE - t.due_date
            ELSE 0
          END as days_overdue,
            CASE 
              WHEN t.due_date >= CURRENT_DATE THEN t.due_date - CURRENT_DATE
              ELSE 0
            END as days_until_due,
            a.severity,
            a.alert_type
          FROM transaction t
          LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
          LEFT JOIN supplier s ON pr.supplier_id = s.supplier_id AND s.status IN ('pending', 'approved')
          LEFT JOIN branch b ON pr.branch_id = b.branch_id
          LEFT JOIN alert a ON t.alert_id = a.alert_id
          WHERE pr.payment_req_id IS NOT NULL
          
          UNION ALL
          
          SELECT 
            t.transaction_id,
            t.value,
            t.due_date,
            t.status,
            t.alert_id,
            sa.sale_id as payment_req_id,
            sa.client_id as supplier_id,
            c.name as entity_name,
            b.name as branch_name,
            b.branch_id,
            'sale' as transaction_type,
          CASE 
            WHEN t.status = 'paid' THEN 0
            WHEN t.due_date < CURRENT_DATE THEN CURRENT_DATE - t.due_date
            ELSE 0
          END as days_overdue,
            CASE 
              WHEN t.due_date >= CURRENT_DATE THEN t.due_date - CURRENT_DATE
              ELSE 0
            END as days_until_due,
            a.severity,
            a.alert_type
          FROM transaction t
          LEFT JOIN sale sa ON t.transaction_id = sa.transaction_id
          LEFT JOIN client c ON sa.client_id = c.client_id
          LEFT JOIN branch b ON sa.branch_id = b.branch_id
          LEFT JOIN alert a ON t.alert_id = a.alert_id
          WHERE sa.sale_id IS NOT NULL
        ) combined
        ${whereClause}
        ORDER BY days_overdue DESC, days_until_due ASC
        LIMIT 30
      `;
      
      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

app.put('/api/payments/:id/mark-paid', async (req, res) => {
    try {
      const { id } = req.params;
      const { actualDate } = req.body;
      
      // עדכון הסטטוס ל-paid
      const result = await db.query(
        `UPDATE transaction 
         SET status = 'paid', actual_date = $1 
         WHERE transaction_id = $2 
         RETURNING *`,
        [actualDate || new Date(), id]
      );
      
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      // הסרת ההתראה אם קיימת
      await alertService.removeAlertForPaidTransaction(id);
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

app.post('/api/payments/run-check', async (req, res) => {
    try {
      // בדיקה שהמשתמש הוא גזבר (permissions_id = 2)
      if (req.user.role_id !== 2) {
        return res.status(403).json({ message: 'Unauthorized - Treasurer only' });
      }
      
      const result = await paymentMonitorService.runManualCheck();
      res.json(result);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

app.get('/api/payments/reports/overdue-by-branch', async (req, res) => {
    try {
      const query = `
        WITH overdue_transactions AS (
          SELECT 
            b.branch_id,
            b.name as branch_name,
            COUNT(t.transaction_id) as overdue_count,
            SUM(ABS(t.value)) as total_overdue_amount,
            AVG(CURRENT_DATE - t.due_date) as avg_days_overdue
          FROM transaction t
          LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
          LEFT JOIN branch b ON pr.branch_id = b.branch_id
          WHERE t.status = 'open' AND t.due_date < CURRENT_DATE
          GROUP BY b.branch_id, b.name
          
          UNION ALL
          
          SELECT 
            b.branch_id,
            b.name as branch_name,
            COUNT(t.transaction_id) as overdue_count,
            SUM(ABS(t.value)) as total_overdue_amount,
            AVG(CURRENT_DATE - t.due_date) as avg_days_overdue
          FROM transaction t
          LEFT JOIN sale sa ON t.transaction_id = sa.transaction_id
          LEFT JOIN branch b ON sa.branch_id = b.branch_id
          WHERE t.status = 'open' AND t.due_date < CURRENT_DATE
          GROUP BY b.branch_id, b.name
        )
        SELECT 
          branch_id,
          branch_name,
          SUM(overdue_count) as overdue_count,
          SUM(total_overdue_amount) as total_overdue_amount,
          AVG(avg_days_overdue) as avg_days_overdue
        FROM overdue_transactions
        GROUP BY branch_id, branch_name
        ORDER BY total_overdue_amount DESC
      `;
      
      const result = await db.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// דוח דפוסי תשלום של ספקים
app.get('/api/payments/reports/supplier-patterns', async (req, res) => {
    try {
      const query = `
        SELECT 
          s.supplier_id,
          s.name as supplier_name,
          COUNT(t.transaction_id) as total_transactions,
          COUNT(*) FILTER (WHERE t.status = 'paid' AND t.actual_date <= t.due_date) as on_time_payments,
          COUNT(*) FILTER (WHERE t.status = 'paid' AND t.actual_date > t.due_date) as late_payments,
          COUNT(*) FILTER (WHERE t.status = 'open' AND t.due_date < CURRENT_DATE) as currently_overdue,
          AVG(CASE WHEN t.status = 'paid' AND t.actual_date > t.due_date 
              THEN t.actual_date - t.due_date ELSE 0 END) as avg_delay_days,
          SUM(ABS(t.value)) as total_amount
        FROM supplier s
        LEFT JOIN payment_req pr ON s.supplier_id = pr.supplier_id
        LEFT JOIN transaction t ON pr.transaction_id = t.transaction_id
        WHERE t.transaction_id IS NOT NULL
        GROUP BY s.supplier_id, s.name
        HAVING COUNT(t.transaction_id) > 0
        ORDER BY currently_overdue DESC, late_payments DESC
      `;
      
      const result = await db.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});


// ============================================
// Start Server & Services
// ============================================

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  
  console.log('Starting payment monitoring service...');
  paymentMonitorService.start();
});

