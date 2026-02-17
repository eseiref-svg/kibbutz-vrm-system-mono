const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const REMOTE_DB_URL = 'postgresql://postgres:mwJrDDZGzrbFkzJLXYVqZJsctoqrMZUU@trolley.proxy.rlwy.net:38716/railway';

const pool = new Pool({
    connectionString: REMOTE_DB_URL,
    ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
    try {
        const email = 'admin@kibbutz.co.il'; // Distinct email to avoid confusion
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(`Connecting to remote DB...`);

        // Upsert admin user
        const res = await pool.query(`
      INSERT INTO "user" (first_name, surname, email, password, role, status, phone_no)
      VALUES ('System', 'Admin', $1, $2, 'admin', 'active', '0500000000')
      ON CONFLICT (email) 
      DO UPDATE SET password = $2, role = 'admin', status = 'active'
      RETURNING user_id;
    `, [email, hashedPassword]);

        console.log(`✅ Admin user configured on REMOTE server.`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);

    } catch (err) {
        console.error('❌ Error creating admin:', err);
    } finally {
        await pool.end();
    }
}

createAdmin();
