const { pool } = require('../db');

async function debugNotifications() {
    try {
        const client = await pool.connect();

        console.log('--- USERS ---');
        const users = await client.query("SELECT user_id, email, role FROM \"user\" WHERE email LIKE 'manager_%'");
        users.rows.forEach(u => console.log(JSON.stringify(u)));

        console.log('--- ALL NOTIFICATIONS (Limit 20) ---');
        const notifRes = await client.query("SELECT notification_id, user_id, type, message FROM notification ORDER BY created_at DESC LIMIT 20");
        notifRes.rows.forEach(n => console.log(JSON.stringify(n)));

        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

debugNotifications();
