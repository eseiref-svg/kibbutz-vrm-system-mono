const { pool } = require('../db');
const bcrypt = require('bcrypt');

async function clearDatabase() {
    const client = await pool.connect();

    try {
        console.log('🔄 Starting database cleanup...');
        await client.query('BEGIN');

        // 1. Get all tables to clear
        const fetchTablesQuery = `
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT IN ('migrations', 'user', 'spatial_ref_sys')
    `;

        const { rows: tables } = await client.query(fetchTablesQuery);

        if (tables.length > 0) {
            const tableNames = tables.map(t => `public."${t.tablename}"`).join(', ');
            console.log(`🗑️  Truncating ${tables.length} tables...`);
            await client.query(`TRUNCATE TABLE ${tableNames} CASCADE`);
            console.log('✅ Tables truncated.');
        } else {
            console.log('⚠️  No tables found to truncate.');
        }

        // 2. Clear user table but keep admin
        console.log('👤 Cleaning user table (preserving admin)...');
        await client.query(`
      DELETE FROM "user" 
      WHERE email != 'admin@naan.com'
    `);

        // 3. Ensure Admin exists
        const adminEmail = 'admin@naan.com';
        const adminPassword = '123456';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Check if admin exists
        const checkAdmin = await client.query('SELECT user_id FROM "user" WHERE email = $1', [adminEmail]);

        if (checkAdmin.rows.length === 0) {
            console.log('🆕 Creating Admin user...');
            await client.query(`
        INSERT INTO "user" (first_name, surname, email, password, role, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['Admin', 'User', adminEmail, hashedPassword, 'admin', 'active']);
        } else {
            console.log('✅ Admin user already exists. Updating password...');
            await client.query(`
            UPDATE "user" SET password = $1 WHERE email = $2
        `, [hashedPassword, adminEmail]);
        }

        await client.query('COMMIT');
        console.log('✨ Database cleanup completed successfully!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error clearing database:', err);
        console.error('Error details:', err.detail || err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

clearDatabase();
