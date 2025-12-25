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

// CORS Configuration - allow both 3000 and 3001 for development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
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

// Ensure system_settings table exists
const initDbResult = db.query(`
  CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by INTEGER REFERENCES "user"(user_id)
  );
`).catch(err => console.error('Error creating system_settings table:', err));

// --- System Settings API ---

// Get bank balance
app.get('/api/dashboard/bank-balance', auth, async (req, res) => {
  try {
    const result = await db.query('SELECT value, updated_at FROM system_settings WHERE key = $1', ['bank_balance']);

    if (result.rows.length === 0) {
      // Default value if not set
      return res.json({ value: 0, updated_at: null });
    }

    res.json({
      value: parseFloat(result.rows[0].value),
      updated_at: result.rows[0].updated_at
    });
  } catch (err) {
    console.error('Error fetching bank balance:', err.message);
    res.status(500).send('Server Error');
  }
});

// Update bank balance
app.put('/api/dashboard/bank-balance', auth, async (req, res) => {
  try {
    const { value } = req.body;
    const userId = req.user.id;

    // Check if permissions_id is 2 (Treasurer) or 1 (Admin)
    const userResult = await db.query('SELECT permissions_id FROM "user" WHERE user_id = $1', [userId]);
    const roleId = userResult.rows[0].permissions_id;

    if (roleId !== 1 && roleId !== 2) {
      return res.status(403).json({ message: 'Unauthorized. Only Treasurer can update bank balance.' });
    }

    const query = `
      INSERT INTO system_settings (key, value, updated_at, updated_by)
      VALUES ('bank_balance', $1, NOW(), $2)
      ON CONFLICT (key) 
      DO UPDATE SET value = EXCLUDED.value, updated_at = NOW(), updated_by = EXCLUDED.updated_by
      RETURNING value, updated_at
    `;

    const result = await db.query(query, [value, userId]);

    res.json({
      value: parseFloat(result.rows[0].value),
      updated_at: result.rows[0].updated_at
    });
  } catch (err) {
    console.error('Error updating bank balance:', err.message);
    res.status(500).send('Server Error');
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
    console.error('Error creating client request:', err);
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


// --- Protected Routes ---
// ALL routes below this line will use the 'auth' middleware to ensure the user is logged in
app.use(auth);

// Get all branches
app.get('/api/branches', async (req, res) => {
  try {
    const result = await db.query('SELECT branch_id, name FROM branch ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get branches that have transactions in the current table
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

    // Check if field already exists
    const existing = await db.query(
      'SELECT * FROM supplier_field WHERE field = $1',
      [field.trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'תחום זה כבר קיים במערכת' });
    }

    // Create new field
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

// Get suppliers associated with a branch (via payment requests or requests)
app.get('/api/branches/:id/suppliers', async (req, res) => {
  try {
    const { id } = req.params;

    // Logic: Suppliers that have at least one payment request from this branch
    // OR were requested by this branch (optional, but good for "My Suppliers")
    // We distinct by supplier_id
    const query = `
      SELECT DISTINCT s.*, 
             COALESCE(AVG(r.rate), 0) as average_rating,
             COUNT(r.review_id) as total_reviews
      FROM supplier s
      LEFT JOIN review r ON s.supplier_id = r.supplier_id
      WHERE s.status != 'deleted' 
      AND (
        s.supplier_id IN (SELECT supplier_id FROM payment_req WHERE branch_id = $1)
        OR
        s.supplier_id IN (SELECT requested_supplier_id FROM supplier_requests WHERE branch_id = $1 AND status = 'approved')
      )
      GROUP BY s.supplier_id
      ORDER BY s.name
    `;

    const result = await db.query(query, [id]);
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

    // Get current user name for the notification
    const userResult = await db.query('SELECT first_name, surname FROM "user" WHERE user_id = $1', [requested_by_user_id]);
    const userName = userResult.rows[0] ? `${userResult.rows[0].first_name} ${userResult.rows[0].surname}` : 'משתמש';

    // Notify Admins and Treasurers about the new request
    // Role 5 = Community Manager, Role 3 = Treasurer (Assumption - need to verify roles if unsure, but typically these roles approved requests)
    const adminsResult = await db.query('SELECT user_id FROM "user" WHERE permissions_id IN (3, 5)');

    for (const admin of adminsResult.rows) {
      await alertService.sendActionNotification(
        admin.user_id,
        'בקשה לספק חדש',
        `התקבלה בקשה חדשה מ-${userName} להוספת הספק: ${supplier_name}`,
        'action_required'
      );
    }

    res.status(201).json(newRequest.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
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

    // Notify the branch manager
    let message, type;
    if (status === 'approved') {
      message = `הבקשה להוספת ספק "${request.supplier_name}" אושרה`;
      type = 'supplier_approved';
    } else {
      message = `הבקשה להוספת ספק "${request.supplier_name}" נדחתה`;
      type = 'supplier_rejected';
    }

    await db.query(`
      INSERT INTO notifications (user_id, message, type, created_at)
      VALUES ($1, $2, $3, NOW())
    `, [request.requested_by_user_id, message, type]);

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
    const user_id = req.user.id;

    const newReview = await db.query(
      `INSERT INTO "review" (supplier_id, user_id, rate, comment) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [supplier_id, user_id, rate, comment]
    );

    // Check overall supplier rating
    const supplierStats = await db.query(`
      SELECT AVG(rate) as average_rating, name 
      FROM supplier s
      JOIN review r ON s.supplier_id = r.supplier_id
      WHERE s.supplier_id = $1
      GROUP BY s.supplier_id, s.name
    `, [supplier_id]);

    if (supplierStats.rows.length > 0) {
      const currentAvg = parseFloat(supplierStats.rows[0].average_rating);

      // If rating is low (below 3), notify Treasurer/Admin
      if (currentAvg < 3.0) {
        const supplierName = supplierStats.rows[0].name;
        // Find Treasurer (role 2 or 3) and Admins (role 1 or 5)
        const adminsResult = await db.query('SELECT user_id FROM "user" WHERE permissions_id IN (1, 2, 3, 5)');

        for (const admin of adminsResult.rows) {
          await alertService.sendActionNotification(
            admin.user_id,
            'התראת איכות ספק',
            `דירוג הספק "${supplierName}" ירד ל-${currentAvg.toFixed(1)}. נדרשת בחינה מחדש.`,
            'low_rating_alert'
          );
        }
      }
    }

    res.status(201).json(newReview.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// --- Notifications Route (Protected) ---
// Get notification history with pagination and filters
app.get('/api/notifications/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status, type } = req.query;
    const offset = (page - 1) * limit;

    // Build query
    let query = `
      SELECT * FROM notifications 
      WHERE user_id = $1
    `;
    let countQuery = `
      SELECT COUNT(*) FROM notifications 
      WHERE user_id = $1
    `;

    const params = [userId];
    const countParams = [userId];
    let paramCount = 1;

    // Add filters
    if (status) {
      paramCount++;
      const isRead = status === 'read';
      query += ` AND is_read = $${paramCount}`;
      countQuery += ` AND is_read = $${paramCount}`;
      params.push(isRead);
      countParams.push(isRead);
    }

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      countQuery += ` AND type = $${paramCount}`;
      params.push(type);
      countParams.push(type);
    }

    // Add sorting and pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    // Execute queries
    const [notificationsResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, countParams)
    ]);

    const total = parseInt(countResult.rows[0].count);
    const pages = Math.ceil(total / limit);

    res.json({
      notifications: notificationsResult.rows,
      pagination: {
        total,
        pages,
        current: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Error fetching notification history:', err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/api/notifications/pending-requests-count', async (req, res) => {
  try {
    // Count supplier requests, client requests, AND pending sales (payment requests)
    const supplierResult = await db.query("SELECT COUNT(*) FROM supplier_requests WHERE status = 'pending'");
    const clientResult = await db.query("SELECT COUNT(*) FROM client_request WHERE status = 'pending'");
    const salesResult = await db.query(`
        SELECT COUNT(*) 
        FROM sale s 
        JOIN transaction t ON s.transaction_id = t.transaction_id 
        WHERE t.status = 'pending_approval'
      `);

    const supplierCount = parseInt(supplierResult.rows[0].count, 10);
    const clientCount = parseInt(clientResult.rows[0].count, 10);
    const salesCount = parseInt(salesResult.rows[0].count, 10);
    const totalCount = supplierCount + clientCount + salesCount;

    console.log(`[Notifications] Pending count: ${supplierCount} suppliers + ${clientCount} clients + ${salesCount} sales = ${totalCount} total`);

    res.json({
      count: totalCount,
      breakdown: {
        suppliers: supplierCount,
        clients: clientCount,
        sales: salesCount
      }
    });
  } catch (err) {
    console.error('[Notifications] Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Get notifications for logged-in user
app.get('/api/notifications', async (req, res) => {
  try {
    const userId = req.user.id; // User ID from token
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

// Mark notification as read
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

// Mark all notifications as read
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

// Get payment dashboard stats + Next Masav
app.get('/api/payments/dashboard', async (req, res) => {
  try {
    const { branchId } = req.query;

    let branchFilter = '';
    let params = [];

    if (branchId && branchId !== 'all') {
      branchFilter = true; // Flag to use in CTE
      params = [branchId];
    }

    const statsQuery = `
        WITH all_transactions AS (
          -- Payment Requests (Payables to Suppliers)
          SELECT 
            t.transaction_id,
            t.value,
            t.due_date,
            'payment' as type,
            CASE 
              WHEN t.due_date < CURRENT_DATE THEN 'overdue'
              WHEN t.due_date = CURRENT_DATE THEN 'due_today'
              WHEN t.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'upcoming'
              ELSE 'future'
            END as payment_status
          FROM transaction t
          LEFT JOIN payment_req pr ON t.transaction_id = pr.transaction_id
          WHERE t.status = 'open' 
          AND pr.payment_req_id IS NOT NULL 
          ${branchId ? 'AND pr.branch_id = $1' : ''}
          
          UNION ALL
          
          -- Sales (Receivables from Clients)
          SELECT 
            t.transaction_id,
            t.value,
            t.due_date,
            'sale' as type,
            CASE 
              WHEN t.due_date < CURRENT_DATE THEN 'overdue'
              WHEN t.due_date = CURRENT_DATE THEN 'due_today'
              WHEN t.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'upcoming'
              ELSE 'future'
            END as payment_status
          FROM transaction t
          LEFT JOIN sale sa ON t.transaction_id = sa.transaction_id
          WHERE t.status = 'open'
          AND sa.sale_id IS NOT NULL 
          ${branchId ? 'AND sa.branch_id = $1' : ''}
        )
        SELECT 
          -- Overdue Payables (Suppliers)
          COUNT(*) FILTER (WHERE payment_status = 'overdue' AND type = 'payment') as overdue_payables_count,
          SUM(ABS(value)) FILTER (WHERE payment_status = 'overdue' AND type = 'payment') as overdue_payables_amount,
          
          -- Overdue Receivables (Clients)
          COUNT(*) FILTER (WHERE payment_status = 'overdue' AND type = 'sale') as overdue_receivables_count,
          SUM(ABS(value)) FILTER (WHERE payment_status = 'overdue' AND type = 'sale') as overdue_receivables_amount,

          -- Other stats (General)
          COUNT(*) FILTER (WHERE payment_status = 'due_today') as due_today_count,
          COUNT(*) FILTER (WHERE payment_status = 'upcoming') as upcoming_count,
          COUNT(*) as total_open,
          SUM(ABS(value)) as total_amount
        FROM all_transactions
      `;

    const stats = await db.query(statsQuery, params);

    // Fetch Next Masav (using system_settings)
    // We'll store it as 'next_masav_date' and 'next_masav_amount'
    const masavData = await db.query(`
      SELECT key, value FROM system_settings 
      WHERE key IN ('next_masav_date', 'next_masav_amount')
    `);

    const masavSettings = masavData.rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    res.json({
      ...stats.rows[0],
      next_masav_date: masavSettings.next_masav_date || null,
      next_masav_amount: masavSettings.next_masav_amount || 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update Next Masav details
app.put('/api/payments/masav', auth, async (req, res) => {
  try {
    const { date, amount } = req.body;
    const userId = req.user.id;

    // Check permissions (Treasurer only)
    if (req.user.role_id !== 1 && req.user.role_id !== 2) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await db.query('BEGIN');

    // Update Date
    if (date) {
      await db.query(`
        INSERT INTO system_settings (key, value, updated_at, updated_by)
        VALUES ('next_masav_date', $1, NOW(), $2)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW(), updated_by = EXCLUDED.updated_by
      `, [date, userId]);
    }

    // Update Amount
    if (amount !== undefined) {
      await db.query(`
        INSERT INTO system_settings (key, value, updated_at, updated_by)
        VALUES ('next_masav_amount', $1, NOW(), $2)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW(), updated_by = EXCLUDED.updated_by
      `, [amount, userId]);
    }

    await db.query('COMMIT');
    res.json({ message: 'Masav details updated', date, amount });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Error updating Masav:', err.message);
    res.status(500).send('Server Error');
  }
});

// Get list of overdue invoices
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
});

// Get all open transactions with filters
app.get('/api/payments/all', async (req, res) => {
  try {
    const { branchId, status, type, currentMonth } = req.query;

    let filters = [];
    let params = [];
    let paramIndex = 1;

    // Default - open transactions only, unless filtered by status
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
      // status = 'paid' already handled above
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

    // Update status to paid
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

    // Remove alert if exists
    await alertService.removeAlertForPaidTransaction(id);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/api/payments/run-check', async (req, res) => {
  try {
    // Check that user is treasurer (permissions_id = 2)
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

// Supplier payment patterns report
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
// CLIENTS MANAGEMENT API
// ============================================

// Get clients - filtered by branch if branchId provided (shows clients with sales OR requested by branch)
app.get('/api/clients/search', async (req, res) => {
  try {
    const { criteria, query, branchId } = req.query;

    // If branchId is provided, return clients that have sales with this branch OR were requested by this branch
    if (branchId) {
      let sqlQuery = `
        SELECT DISTINCT c.*, a.city, a.street_name, a.house_no, a.zip_code, a.phone_no
        FROM client c
        LEFT JOIN address a ON c.address_id = a.address_id
        WHERE c.client_id IN (
          -- Clients with sales for this branch
          SELECT DISTINCT client_id FROM sale WHERE branch_id = $1
          UNION
          -- Clients requested by users from this branch (approved requests only)
          SELECT DISTINCT client_id FROM client_request 
          WHERE branch_id = $1 AND client_id IS NOT NULL AND status = 'approved'
        )
      `;
      const params = [branchId];

      if (query && criteria) {
        if (criteria === 'name') {
          sqlQuery += ' AND c.name ILIKE $2';
          params.push(`%${query}%`);
        } else if (criteria === 'id') {
          // Search by client_number (business identifier entered by treasurer)
          sqlQuery += ' AND c.client_number ILIKE $2';
          params.push(`%${query}%`);
        }
      }

      sqlQuery += ' ORDER BY c.name';
      const result = await db.query(sqlQuery, params);
      return res.json(result.rows);
    }

    // For accounting/treasurer - return all clients with optional search
    if (!query || !criteria) {
      const allClients = await db.query(`
        SELECT c.*, a.city, a.street_name, a.house_no, a.zip_code, a.phone_no
        FROM client c
        LEFT JOIN address a ON c.address_id = a.address_id
        ORDER BY c.name
      `);
      return res.json(allClients.rows);
    }

    let result;
    if (criteria === 'name') {
      result = await db.query(`
        SELECT c.*, a.city, a.street_name, a.house_no, a.zip_code, a.phone_no
        FROM client c
        LEFT JOIN address a ON c.address_id = a.address_id
        WHERE c.name ILIKE $1
        ORDER BY c.name
      `, [`%${query}%`]);
    } else if (criteria === 'id') {
      // Search by client_number (business identifier entered by treasurer)
      result = await db.query(`
        SELECT c.*, a.city, a.street_name, a.house_no, a.zip_code, a.phone_no
        FROM client c
        LEFT JOIN address a ON c.address_id = a.address_id
        WHERE c.client_number ILIKE $1
        ORDER BY c.name
      `, [`%${query}%`]);
    } else {
      return res.status(400).json({ message: 'Invalid search criteria' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get single client details
app.get('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT c.*, a.city, a.street_name, a.house_no, a.zip_code, a.phone_no
      FROM client c
      LEFT JOIN address a ON c.address_id = a.address_id
      WHERE c.client_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get client's sales history
app.get('/api/clients/:id/sales', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT s.*, t.value, t.due_date, t.status, t.actual_date, b.name as branch_name
      FROM sale s
      JOIN transaction t ON s.transaction_id = t.transaction_id
      LEFT JOIN branch b ON s.branch_id = b.branch_id
      WHERE s.client_id = $1
      ORDER BY t.due_date DESC
    `, [id]);

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create new client
app.post('/api/clients', async (req, res) => {
  try {
    const { name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code } = req.body;

    // Validation - address_id is NOT NULL in DB, so we must create an address
    if (!name || !poc_name || !poc_phone) {
      return res.status(400).json({ message: 'שם הלקוח, שם איש הקשר וטלפון הם שדות חובה' });
    }

    // Insert address first (REQUIRED - address_id is NOT NULL)
    // All address fields are required (NOT NULL), so provide defaults
    const addressResult = await db.query(
      'INSERT INTO address (city, street_name, house_no, zip_code, phone_no, additional) VALUES ($1, $2, $3, $4, $5, $6) RETURNING address_id',
      [
        city || 'לא צוין',
        street_name || 'לא צוין',
        house_no || 'לא צוין',
        zip_code || '0000000',
        poc_phone, // Use client's phone as address phone
        ''
      ]
    );
    const addressId = addressResult.rows[0].address_id;

    // Insert client
    const result = await db.query(
      `INSERT INTO client (name, address_id, poc_name, poc_phone, poc_email) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, addressId, poc_name, poc_phone, poc_email || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update client
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code } = req.body;

    // Get current client to check address_id
    const currentClient = await db.query('SELECT address_id FROM client WHERE client_id = $1', [id]);
    if (currentClient.rows.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    let addressId = currentClient.rows[0].address_id;

    // Update address (address_id should always exist since it's NOT NULL)
    if (addressId && (city || street_name || house_no || zip_code)) {
      await db.query(
        'UPDATE address SET city = COALESCE($1, city), street_name = COALESCE($2, street_name), house_no = COALESCE($3, house_no), zip_code = COALESCE($4, zip_code), phone_no = COALESCE($5, phone_no) WHERE address_id = $6',
        [city, street_name, house_no, zip_code, poc_phone, addressId]
      );
    }

    // Update client (removed status field)
    const result = await db.query(
      `UPDATE client 
       SET name = $1, poc_name = $2, poc_phone = $3, poc_email = $4
       WHERE client_id = $5 RETURNING *`,
      [name, poc_name, poc_phone, poc_email, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Soft delete client
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Check if client has any sales
    const salesCheck = await db.query("SELECT COUNT(*) FROM sale WHERE client_id = $1", [id]);

    if (parseInt(salesCheck.rows[0].count) > 0) {
      return res.status(400).json({
        message: 'לא ניתן למחוק לקוח שיש לו דרישות תשלום קיימות'
      });
    }

    await db.query("DELETE FROM client WHERE client_id = $1", [id]);
    res.status(200).json({ message: `Client with ID ${id} was deleted.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ============================================
// CLIENT REQUESTS API
// ============================================

// Create new client request (Branch Manager submits request - CLIENT DETAILS ONLY)
app.post('/api/client-requests', auth, async (req, res) => {
  try {
    console.log('=== NEW CLIENT REQUEST ENDPOINT CALLED ===');
    console.log('Incoming client request payload:', JSON.stringify(req.body, null, 2));
    const {
      branch_id,
      client_name,
      poc_name,
      poc_phone,
      poc_email,
      city,
      street_name,
      house_no,
      zip_code,
      quote_value,
      payment_terms,
      quote_description
    } = req.body;

    const requested_by_user_id = req.user.id;

    // Validation - ONLY CLIENT DETAILS, NO TRANSACTION FIELDS
    console.log('Validating fields:', { branch_id, client_name, poc_name, poc_phone });
    if (!branch_id || !client_name || !poc_name || !poc_phone) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({
        message: 'שדות חובה: שם לקוח, שם איש קשר, טלפון'
      });
    }
    console.log('Validation passed - proceeding with insert');

    // Insert client request - INCLUDING OPTIONAL QUOTE FIELDS
    const result = await db.query(`
      INSERT INTO client_request (
        branch_id, requested_by_user_id, client_name, 
        poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code, 
        quote_value, payment_terms, quote_description,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      branch_id, requested_by_user_id, client_name,
      poc_name, poc_phone, poc_email || null, city || null, street_name || null,
      house_no || null, zip_code || null,
      quote_value || null, payment_terms || null, quote_description || null,
      'pending'
    ]);

    // Create in-app notification for accounting (permissions_id: 1=admin, 2=treasurer)
    await db.query(`
      INSERT INTO notifications (user_id, message, type, created_at)
      SELECT user_id, $1, 'info', NOW()
      FROM "user"
      WHERE permissions_id IN (1, 2)
    `, [`בקשה חדשה לרישום לקוח: ${client_name}`]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('=== Error in POST /api/client-requests ===');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      message: 'שגיאת שרת',
      error: err.message
    });
  }
});

// Get all client requests (with optional status filter)
app.get('/api/client-requests', auth, async (req, res) => {
  try {
    const { status, branch_id } = req.query;

    let sqlQuery = `
      SELECT cr.*, 
             b.name as branch_name,
             u1.first_name || ' ' || u1.surname as requested_by_name,
             u2.first_name || ' ' || u2.surname as reviewed_by_name,
             c.client_number
      FROM client_request cr
      LEFT JOIN branch b ON cr.branch_id = b.branch_id
      LEFT JOIN "user" u1 ON cr.requested_by_user_id = u1.user_id
      LEFT JOIN "user" u2 ON cr.reviewed_by_user_id = u2.user_id
      LEFT JOIN client c ON cr.client_id = c.client_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (status) {
      sqlQuery += ` AND cr.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (branch_id) {
      sqlQuery += ` AND cr.branch_id = $${paramCount}`;
      params.push(branch_id);
      paramCount++;
    }

    sqlQuery += ' ORDER BY cr.created_at DESC';

    const result = await db.query(sqlQuery, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get single client request
app.get('/api/client-requests/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT cr.*, 
             b.name as branch_name,
             u1.first_name || ' ' || u1.surname as requested_by_name,
             u2.first_name || ' ' || u2.surname as reviewed_by_name
      FROM client_request cr
      LEFT JOIN branch b ON cr.branch_id = b.branch_id
      LEFT JOIN "user" u1 ON cr.requested_by_user_id = u1.user_id
      LEFT JOIN "user" u2 ON cr.reviewed_by_user_id = u2.user_id
      WHERE cr.request_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Approve client request (Accounting/Treasurer)
app.put('/api/client-requests/:id/approve', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      review_notes,
      client_number,  // Required: business identifier entered by treasurer
      payment_terms,  // New: default payment terms
      // Allow editing of client details
      client_name,
      poc_name,
      poc_phone,
      poc_email,
      city,
      street_name,
      house_no,
      zip_code
    } = req.body;
    const reviewed_by_user_id = req.user.id;

    // Validate required fields
    if (!client_number || !client_number.toString().trim()) {
      return res.status(400).json({ message: 'מספר לקוח הוא שדה חובה' });
    }

    // Get request details
    const requestResult = await db.query(
      'SELECT * FROM client_request WHERE request_id = $1',
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = requestResult.rows[0];

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Check if client_number is unique (business identifier)
    const clientNumberValue = client_number.toString().trim();
    const existingClient = await db.query(
      'SELECT client_id FROM client WHERE client_number = $1',
      [clientNumberValue]
    );

    if (existingClient.rows.length > 0) {
      return res.status(400).json({ message: 'מספר לקוח זה כבר קיים במערכת' });
    }

    // Use provided values or fall back to request values
    const finalClientName = client_name || request.client_name;
    const finalPocName = poc_name || request.poc_name;
    const finalPocPhone = poc_phone || request.poc_phone;
    const finalPocEmail = poc_email || request.poc_email;
    const finalCity = city || request.city || 'לא צוין';
    const finalStreetName = street_name || request.street_name || 'לא צוין';
    const finalHouseNo = house_no || request.house_no || 'לא צוין';
    const finalZipCode = zip_code || request.zip_code || '0000000';
    const finalPaymentTerms = payment_terms || 'current_50';

    // Create new client ONLY (no transaction, no sale)
    // 1. Create address
    const addressResult = await db.query(`
      INSERT INTO address (city, street_name, house_no, zip_code, phone_no, additional)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING address_id
    `, [
      finalCity,
      finalStreetName,
      finalHouseNo,
      finalZipCode,
      finalPocPhone,
      ''
    ]);
    const addressId = addressResult.rows[0].address_id;

    // 2. Create client with client_number (business identifier) and default_payment_terms
    // Note: client_id is AUTO_INCREMENT (technical), client_number is business identifier (entered by treasurer, will come from ERP)
    const clientResult = await db.query(`
      INSERT INTO client (name, address_id, poc_name, poc_phone, poc_email, client_number, default_payment_terms)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      finalClientName,
      addressId,
      finalPocName,
      finalPocPhone,
      finalPocEmail,
      clientNumberValue,
      finalPaymentTerms
    ]);
    const newClient = clientResult.rows[0];
    console.log(`Created new client: client_id=${newClient.client_id}, client_number=${newClient.client_number}`);

    // 2.5 Check for quote/payment request and auto-create sale if needed
    let approvedSaleId = null;
    if (request.quote_value && parseFloat(request.quote_value) > 0) {
      try {
        console.log(`Auto-creating sale for request ${id} (Amount: ${request.quote_value})`);

        // Calculate Due Date
        const terms = request.payment_terms || 'immediate';
        const now = new Date();
        let dueDate = new Date(now);

        if (terms === 'plus_30') dueDate.setDate(now.getDate() + 30);
        else if (terms === 'plus_60') dueDate.setDate(now.getDate() + 60);
        else if (terms === 'plus_90') dueDate.setDate(now.getDate() + 90);

        // Create Transaction (Status 'open' as it is approved)
        const trxResult = await db.query(`
          INSERT INTO transaction (value, due_date, status, description)
          VALUES ($1, $2, 'open', $3)
          RETURNING transaction_id
        `, [
          request.quote_value,
          dueDate,
          request.quote_description || `תשלום עבור: ${finalClientName}`
        ]);
        const transactionId = trxResult.rows[0].transaction_id;

        // Create Sale
        const saleResult = await db.query(`
          INSERT INTO sale (client_id, branch_id, transaction_id, payment_terms, invoice_number)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING sale_id
        `, [
          newClient.client_id,
          request.branch_id,
          transactionId,
          terms,
          `REQ-${request.request_id}` // Temporary invoice number reference
        ]);
        approvedSaleId = saleResult.rows[0].sale_id;
        console.log(`Created Sale ID: ${approvedSaleId}`);
      } catch (saleErr) {
        console.error('Error auto-creating sale:', saleErr);
        // Continue - don't fail the whole request approval just because sale creation failed (though it's bad)
      }
    }

    // 3. Update request status and link to created client/sale
    await db.query(`
      UPDATE client_request
      SET status = 'approved', 
          reviewed_by_user_id = $1, 
          review_notes = $2, 
          reviewed_at = NOW(),
          client_id = $3,
          approved_client_id = $3,
          approved_sale_id = $4
      WHERE request_id = $5
    `, [reviewed_by_user_id, review_notes || null, newClient.client_id, approvedSaleId, id]);

    // 4. Notify the branch manager
    await db.query(`
      INSERT INTO notifications (user_id, message, type, created_at)
      VALUES ($1, $2, 'success', NOW())
    `, [
      request.requested_by_user_id,
      `הבקשה לרישום לקוח "${finalClientName}" אושרה - הלקוח זמין כעת ליצירת דרישות תשלום`
    ]);

    res.json({
      message: 'Client request approved successfully',
      client: newClient
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      message: 'Server Error',
      error: err.message
    });
  }
});

// Reject client request
app.put('/api/client-requests/:id/reject', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { review_notes } = req.body;
    const reviewed_by_user_id = req.user.id;

    // Get request details for notification
    const requestResult = await db.query(
      'SELECT * FROM client_request WHERE request_id = $1',
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = requestResult.rows[0];

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update request status
    await db.query(`
      UPDATE client_request
      SET status = 'rejected', 
          reviewed_by_user_id = $1, 
          review_notes = $2, 
          reviewed_at = NOW()
      WHERE request_id = $3
    `, [reviewed_by_user_id, review_notes || null, id]);

    // Notify the branch manager
    await db.query(`
      INSERT INTO notifications (user_id, message, type, created_at)
      VALUES ($1, $2, 'error', NOW())
    `, [
      request.requested_by_user_id,
      `הבקשה לרישום לקוח "${request.client_name}" נדחתה${review_notes ? ': ' + review_notes : ''}`
    ]);

    res.json({ message: 'Client request rejected' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ============================================
// SALES & PAYMENT REQUESTS API
// ============================================

// Create new sale with transaction
app.post('/api/sales', async (req, res) => {
  try {
    const { client_id, branch_id, value, due_date, description, payment_terms } = req.body;

    // Validation
    if (!client_id || !branch_id || !value || !due_date) {
      return res.status(400).json({ message: 'כל השדות חובה: לקוח, ענף, סכום, תאריך יעד' });
    }

    // Start transaction
    await db.query('BEGIN');

    try {
      // Create transaction record
      const transactionResult = await db.query(
        `INSERT INTO transaction (value, due_date, status, description) 
         VALUES ($1, $2, 'open', $3) RETURNING transaction_id`,
        [value, due_date, description || null]
      );

      const transactionId = transactionResult.rows[0].transaction_id;

      // Create sale record
      const saleResult = await db.query(
        `INSERT INTO sale (transaction_id, client_id, branch_id, payment_terms) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [transactionId, client_id, branch_id, payment_terms || null]
      );

      await db.query('COMMIT');

      // Send notification to accounting
      const notificationMessage = `דרישת תשלום חדשה נוצרה - סכום: ₪${value}`;
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type, is_read) 
         VALUES (1, 'דרישת תשלום חדשה', $1, 'info', FALSE)`,
        [notificationMessage]
      );

      res.status(201).json({
        ...saleResult.rows[0],
        transaction_id: transactionId
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all sales with filters
app.get('/api/sales', async (req, res) => {
  try {
    const { branchId, clientId, status } = req.query;

    let filters = [];
    let params = [];
    let paramCount = 1;

    if (branchId) {
      filters.push(`s.branch_id = $${paramCount}`);
      params.push(branchId);
      paramCount++;
    }

    if (clientId) {
      filters.push(`s.client_id = $${paramCount}`);
      params.push(clientId);
      paramCount++;
    }

    if (status && status !== 'all') {
      filters.push(`t.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    const query = `
      SELECT s.*, t.value, t.due_date, t.status, t.actual_date, t.description,
             c.name as client_name, b.name as branch_name
      FROM sale s
      JOIN transaction t ON s.transaction_id = t.transaction_id
      LEFT JOIN client c ON s.client_id = c.client_id
      LEFT JOIN branch b ON s.branch_id = b.branch_id
      ${whereClause}
      ORDER BY t.due_date DESC
    `;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get recent sales for branch (last 10) - MUST BE BEFORE /api/sales/:id
app.get('/api/sales/recent', auth, async (req, res) => {
  try {
    const { branchId } = req.query;
    const limit = req.query.limit || 10;

    console.log(`[API] GET /api/sales/recent - branchId: ${branchId}, limit: ${limit}`);

    if (!branchId) {
      return res.status(400).json({ message: 'Branch ID is required' });
    }

    const result = await db.query(`
      SELECT s.sale_id, s.client_id, s.branch_id, s.transaction_id,
             s.payment_terms, s.invoice_number,
             t.value, t.due_date, t.status, t.description,
             COALESCE(t.due_date, NOW()) as transaction_date,
             c.name as client_name,
             c.client_number
      FROM sale s
      INNER JOIN transaction t ON s.transaction_id = t.transaction_id
      LEFT JOIN client c ON s.client_id = c.client_id
      WHERE s.branch_id = $1
      ORDER BY s.sale_id DESC
      LIMIT $2
    `, [branchId, limit]);

    console.log(`[API] Found ${result.rows.length} sales for branch ${branchId}`);
    res.json(result.rows);
  } catch (err) {
    console.error('[API] Error fetching recent sales:', err);
    res.status(500).json({
      message: 'שגיאה בטעינת דרישות תשלום אחרונות',
      error: err.message
    });
  }
});

// Get pending sales for approval (Treasurer/Accounting) - MUST BE BEFORE /api/sales/:id
app.get('/api/sales/pending-approval', auth, async (req, res) => {
  console.log('[API] GET /api/sales/pending-approval - ENTERED');
  try {
    const result = await db.query(`
      SELECT s.sale_id, s.client_id, s.branch_id, s.transaction_id,
             t.value, t.due_date as transaction_date, t.description,
             c.name as client_name,
             c.client_number,
             c.poc_name, c.poc_phone, c.poc_email,
             b.name as branch_name
      FROM sale s
      JOIN transaction t ON s.transaction_id = t.transaction_id
      LEFT JOIN client c ON s.client_id = c.client_id
      LEFT JOIN branch b ON s.branch_id = b.branch_id
      WHERE t.status = 'pending_approval'
      ORDER BY t.due_date DESC
    `);

    console.log('[API] Pending sales found:', result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error('[API] Error fetching pending sales:', err.message);
    res.status(500).json({ message: 'שגיאה בטעינת דרישות תשלום ממתינות' });
  }
});

// Get single sale details
app.get('/api/sales/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT s.*, t.value, t.due_date, t.status, t.actual_date, t.description,
             c.name as client_name, c.poc_name, c.poc_email, c.poc_phone,
             b.name as branch_name
      FROM sale s
      JOIN transaction t ON s.transaction_id = t.transaction_id
      LEFT JOIN client c ON s.client_id = c.client_id
      LEFT JOIN branch b ON s.branch_id = b.branch_id
      WHERE s.sale_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Mark payment as received
app.put('/api/sales/:id/mark-paid', async (req, res) => {
  try {
    const { id } = req.params;
    const { actual_date } = req.body;

    // Get the transaction_id from sale
    const saleResult = await db.query('SELECT transaction_id FROM sale WHERE sale_id = $1', [id]);
    if (saleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    const transactionId = saleResult.rows[0].transaction_id;

    // Update transaction status
    await db.query(
      `UPDATE transaction SET status = 'paid', actual_date = $1 WHERE transaction_id = $2`,
      [actual_date || new Date(), transactionId]
    );

    // Remove any alerts for this transaction
    await alertService.removeAlertForPaidTransaction(transactionId);

    res.json({ message: 'התשלום סומן כשולם בהצלחה' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Generate payment request PDF data
app.get('/api/sales/:id/payment-request', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT s.*, t.value, t.due_date, t.description,
             c.name as client_name, c.poc_name, c.poc_email, c.poc_phone,
             a.city, a.street_name, a.house_no, a.zip_code,
             b.name as branch_name
      FROM sale s
      JOIN transaction t ON s.transaction_id = t.transaction_id
      LEFT JOIN client c ON s.client_id = c.client_id
      LEFT JOIN address a ON c.address_id = a.address_id
      LEFT JOIN branch b ON s.branch_id = b.branch_id
      WHERE s.sale_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ============================================
// NEW: Sales Request & Approval Flow
// ============================================

// Create sale request (Branch Manager creates payment request for existing client)
app.post('/api/sales/request', auth, async (req, res) => {
  try {
    const { client_id, branch_id, value, transaction_date, description } = req.body;

    // Validation
    if (!client_id || !branch_id || !value || !transaction_date) {
      return res.status(400).json({
        message: 'שדות חובה: לקוח, ענף, סכום, תאריך עסקה'
      });
    }

    // Start transaction
    await db.query('BEGIN');

    try {
      // Create transaction with pending_approval status
      const transactionResult = await db.query(`
        INSERT INTO transaction (value, due_date, status, description)
        VALUES ($1, $2, 'pending_approval', $3)
        RETURNING transaction_id
      `, [value, transaction_date, description || null]);

      const transactionId = transactionResult.rows[0].transaction_id;

      // Create sale record
      const saleResult = await db.query(`
        INSERT INTO sale (client_id, branch_id, transaction_id)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [client_id, branch_id, transactionId]);

      await db.query('COMMIT');

      // Notify accounting/treasurer
      await db.query(`
        INSERT INTO notifications (user_id, message, type, created_at)
        SELECT user_id, $1, 'info', NOW()
        FROM "user"
        WHERE permissions_id IN (1, 2)
      `, [`דרישת תשלום חדשה ממתינה לאישור - סכום: ₪${value}`]);

      res.status(201).json({
        message: 'דרישת תשלום נשלחה לאישור בהצלחה',
        sale: saleResult.rows[0]
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (err) {
    console.error('Error creating sale request:', err.message);
    res.status(500).json({ message: 'שגיאה בשליחת דרישת התשלום' });
  }
});

// Reject sale request (Treasurer rejects with reason)
app.put('/api/sales/:id/reject', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    // Validation
    if (!rejection_reason || rejection_reason.trim() === '') {
      return res.status(400).json({ message: 'יש לציין סיבת דחייה' });
    }

    // Get sale details
    const saleResult = await db.query(
      'SELECT * FROM sale WHERE sale_id = $1',
      [id]
    );

    if (saleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    const sale = saleResult.rows[0];

    // Start transaction
    await db.query('BEGIN');

    try {
      // Update transaction: status = 'rejected', add rejection_reason to description
      await db.query(`
        UPDATE transaction
        SET status = 'rejected', 
            description = COALESCE(description, '') || E'\n\nסיבת דחייה: ' || $1
        WHERE transaction_id = $2
      `, [rejection_reason, sale.transaction_id]);

      await db.query('COMMIT');

      // Notify branch manager
      const branchResult = await db.query(`
        SELECT manager_id FROM branch
        WHERE branch_id = $1
      `, [sale.branch_id]);

      if (branchResult.rows.length > 0 && branchResult.rows[0].manager_id) {
        await db.query(`
          INSERT INTO notifications (user_id, message, type, created_at)
          VALUES ($1, $2, 'error', NOW())
        `, [
          branchResult.rows[0].manager_id,
          `דרישת תשלום נדחתה על ידי הנהלת חשבונות. סיבה: ${rejection_reason}`
        ]);
      }

      res.json({ message: 'דרישת התשלום נדחתה' });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (err) {
    console.error('Error rejecting sale:', err.message);
    res.status(500).json({ message: 'שגיאה בדחיית דרישת התשלום' });
  }
});

// Approve sale request (Treasurer selects payment terms + invoice number)
app.put('/api/sales/:id/approve', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_terms, invoice_number } = req.body;

    // Validation
    if (!payment_terms) {
      return res.status(400).json({ message: 'תנאי תשלום הוא שדה חובה' });
    }

    // Validation for invoice_number
    if (!invoice_number || invoice_number.trim() === '') {
      return res.status(400).json({ message: 'מספר חשבונית הוא שדה חובה' });
    }

    // Get sale details
    const saleResult = await db.query(
      'SELECT * FROM sale WHERE sale_id = $1',
      [id]
    );

    if (saleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    const sale = saleResult.rows[0];

    // Calculate due_date based on payment_terms using the new utility
    const { calculateDueDate } = require('./utils/paymentCalculations');

    // We need the original transaction date to calculate the due date
    // The transaction date is currently stored in t.due_date for pending items (see POST /api/sales/request)
    const transactionResult = await db.query(
      'SELECT due_date FROM transaction WHERE transaction_id = $1',
      [sale.transaction_id]
    );

    const originalTransactionDate = transactionResult.rows[0].due_date;
    const dueDate = calculateDueDate(originalTransactionDate, payment_terms);

    console.log(`[Approval] Transaction Date: ${originalTransactionDate}, Terms: ${payment_terms}, Calculated Due Date: ${dueDate}`);

    // Start transaction
    await db.query('BEGIN');

    try {
      // Update transaction: status = 'open', set due_date
      await db.query(`
        UPDATE transaction
        SET status = 'open', due_date = $1
        WHERE transaction_id = $2
      `, [dueDate, sale.transaction_id]);

      // Update sale: set payment_terms and invoice_number
      await db.query(`
        UPDATE sale
        SET payment_terms = $1, invoice_number = $2
        WHERE sale_id = $3
      `, [payment_terms, invoice_number || null, id]);

      await db.query('COMMIT');

      // Notify branch manager
      const branchResult = await db.query(`
        SELECT manager_id FROM branch
        WHERE branch_id = $1
      `, [sale.branch_id]);

      if (branchResult.rows.length > 0 && branchResult.rows[0].manager_id) {
        await db.query(`
          INSERT INTO notifications (user_id, message, type, created_at)
          VALUES ($1, $2, 'success', NOW())
        `, [
          branchResult.rows[0].manager_id,
          'דרישת תשלום אושרה על ידי הנהלת חשבונות'
        ]);
      }

      res.json({ message: 'דרישת התשלום אושרה בהצלחה' });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (err) {
    console.error('Error approving sale:', err.message);
    res.status(500).json({ message: 'שגיאה באישור דרישת התשלום' });
  }
});

// ============================================
// NEW: Payment Request (Supplier) Flow
// ============================================

// Get ALL pending transactions (Sales + Payment Requests) for Treasurer
app.get('/api/transactions/pending-approval', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        s.sale_id as id,
        s.client_id as entity_id,
        s.branch_id,
        s.transaction_id,
        t.value, 
        t.due_date as transaction_date, 
        t.description,
        c.name as entity_name,
        c.client_number as entity_identifier,
        null as invoice_reference, -- Sales don't have invoice num yet (added on approval)
        b.name as branch_name,
        'sale' as type
      FROM sale s
      JOIN transaction t ON s.transaction_id = t.transaction_id
      LEFT JOIN client c ON s.client_id = c.client_id
      LEFT JOIN branch b ON s.branch_id = b.branch_id
      WHERE t.status = 'pending_approval'

      UNION ALL

      SELECT 
        pr.payment_req_id as id,
        pr.supplier_id as entity_id,
        pr.branch_id,
        pr.transaction_id,
        ABS(t.value) as value, -- Show positive value for display (it is stored negative)
        t.due_date as transaction_date,
        t.description,
        s.name as entity_name,
        s.supplier_id::text as entity_identifier, -- Supplier ID is often HP/BN
        t.description as invoice_reference, -- Assuming description holds invoice info
        b.name as branch_name,
        'payment' as type
      FROM payment_req pr
      JOIN transaction t ON pr.transaction_id = t.transaction_id
      LEFT JOIN supplier s ON pr.supplier_id = s.supplier_id
      LEFT JOIN branch b ON pr.branch_id = b.branch_id
      WHERE t.status = 'pending_approval'
      
      ORDER BY transaction_date DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching pending transactions:', err.message);
    res.status(500).json({ message: 'שגיאה בטעינת בקשות ממתינות' });
  }
});

// Create new payment request (Branch Manager for Supplier)
app.post('/api/payment-requests', auth, async (req, res) => {
  try {
    const { supplier_id, branch_id, amount, due_date, description, invoice_number } = req.body;

    if (!supplier_id || !branch_id || !amount) {
      return res.status(400).json({ message: 'שדות חובה: ספק, ענף, סכום' });
    }

    // Ensure amount is positive from UI, convert to negative for DB (Expense)
    const dbValue = -Math.abs(parseFloat(amount));

    // Description should include invoice number if provided
    let finalDescription = description || '';
    if (invoice_number) {
      finalDescription = `חשבונית: ${invoice_number} - ${finalDescription}`;
    }

    await db.query('BEGIN');

    try {
      // Create transaction
      // Note: due_date is "requested payment date"
      const transactionResult = await db.query(
        `INSERT INTO transaction (value, due_date, status, description) 
         VALUES ($1, $2, 'pending_approval', $3) RETURNING transaction_id`,
        [dbValue, due_date || null, finalDescription]
      );
      const transactionId = transactionResult.rows[0].transaction_id;

      // Create payment_req
      // Check if supplier exists
      const supplierExists = await db.query('SELECT 1 FROM supplier WHERE supplier_id = $1', [supplier_id]);
      if (supplierExists.rows.length === 0) {
        throw new Error(`Supplier ${supplier_id} not found`);
      }

      const payReqResult = await db.query(
        `INSERT INTO payment_req (transaction_id, supplier_id, branch_id) 
         VALUES ($1, $2, $3) RETURNING *`,
        [transactionId, supplier_id, branch_id]
      );

      await db.query('COMMIT');

      // Notify Treasurer
      await db.query(`
        INSERT INTO notifications (user_id, message, type, created_at)
        SELECT user_id, $1, 'info', NOW()
        FROM "user"
        WHERE permissions_id IN (1, 2)
      `, [`דרישת תשלום חדשה מספק ממתינה לאישור - סכום: ₪${Math.abs(dbValue)}`]);

      res.status(201).json({
        ...payReqResult.rows[0],
        transaction_id: transactionId
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (err) {
    console.error('Error creating payment request:', err.message);
    res.status(500).send('Server Error: ' + err.message);
  }
});

// Approve payment request (Treasurer)
app.put('/api/payment-requests/:id/approve', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get request details
    const reqResult = await db.query('SELECT * FROM payment_req WHERE payment_req_id = $1', [id]);
    if (reqResult.rows.length === 0) return res.status(404).json({ message: 'Payment request not found' });
    const payReq = reqResult.rows[0];

    await db.query('BEGIN');
    try {
      // Update transaction status to open (approved)
      await db.query(
        `UPDATE transaction SET status = 'open' WHERE transaction_id = $1`,
        [payReq.transaction_id]
      );

      await db.query('COMMIT');

      // Notify Branch Manager
      // (Finding manager logic same as sale ...)
      const branchQuery = await db.query('SELECT manager_id FROM branch WHERE branch_id = $1', [payReq.branch_id]);
      if (branchQuery.rows.length > 0 && branchQuery.rows[0].manager_id) {
        await db.query(`
          INSERT INTO notifications (user_id, message, type, created_at)
          VALUES ($1, $2, 'success', NOW())
        `, [
          branchQuery.rows[0].manager_id,
          'דרישת תשלום מספק אושרה על ידי הנהלת חשבונות'
        ]);
      }

      res.json({ message: 'דרישת התשלום אושרה בהצלחה' });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Reject payment request
app.put('/api/payment-requests/:id/reject', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason) return res.status(400).json({ message: 'נדרשת סיבת דחייה' });

    const reqResult = await db.query('SELECT * FROM payment_req WHERE payment_req_id = $1', [id]);
    if (reqResult.rows.length === 0) return res.status(404).json({ message: 'Payment request not found' });
    const payReq = reqResult.rows[0];

    await db.query('BEGIN');
    try {
      await db.query(
        `UPDATE transaction SET status = 'rejected', description = COALESCE(description, '') || E'\n\nסיבת דחייה: ' || $1 WHERE transaction_id = $2`,
        [rejection_reason, payReq.transaction_id]
      );
      await db.query('COMMIT');

      // Notify Branch Manager
      const branchQuery = await db.query('SELECT manager_id FROM branch WHERE branch_id = $1', [payReq.branch_id]);
      if (branchQuery.rows.length > 0 && branchQuery.rows[0].manager_id) {
        await db.query(`
          INSERT INTO notifications (user_id, message, type, created_at)
          VALUES ($1, $2, 'error', NOW())
        `, [
          branchQuery.rows[0].manager_id,
          `דרישת תשלום מספק נדחתה. סיבה: ${rejection_reason}`
        ]);
      }

      res.json({ message: 'דרישת התשלום נדחתה' });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ============================================
// Start Server & Services
// ============================================

app.listen(port, () => {
  console.log('===========================================');
  console.log('SERVER STARTED');
  console.log('===========================================');
  console.log(`Server running on: http://localhost:${port}`);
  console.log(`Working directory: ${process.cwd()}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'PRODUCTION (Railway)' : 'DEVELOPMENT (Local)'}`);
  console.log('===========================================');

  console.log('Starting payment monitoring service...');
  paymentMonitorService.start();
});

