const { pool } = require('../db');

async function verifyUsers() {
    const client = await pool.connect();
    try {
        console.log('📊 Verifying User Details:');

        const res = await client.query(`
            SELECT first_name, surname, email, phone_no 
            FROM "user" 
            WHERE role = 'branch_manager' 
            LIMIT 10
        `);

        console.log('Sample Managers:');
        res.rows.forEach(u => {
            console.log(` - ${u.first_name} ${u.surname}, Email: ${u.email}, Phone: ${u.phone_no}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

verifyUsers();
