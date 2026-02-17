const { pool } = require('../db');

async function verifySeeding() {
    const client = await pool.connect();
    try {
        console.log('📊 Verifying Seeding Results:');

        // Count Branches
        const branchCount = await client.query('SELECT COUNT(*) FROM branch');
        console.log(` - Branches: ${branchCount.rows[0].count}`);

        // Count Managers
        const managerCount = await client.query(`SELECT COUNT(*) FROM "user" WHERE role = 'branch_manager'`);
        console.log(` - Managers: ${managerCount.rows[0].count}`);

        // Count Balances (excluding any orphaned if any, though there shouldn't be)
        const balanceCount = await client.query('SELECT COUNT(*) FROM balance');
        console.log(` - Balances: ${balanceCount.rows[0].count}`);

        // Sample Check
        const sample = await client.query(`
            SELECT b.branch_id, b.name, u.email, bal.debit, bal.credit 
            FROM branch b
            JOIN "user" u ON b.manager_id = u.user_id
            JOIN balance bal ON b.balance_id = bal.balance_id
            LIMIT 5
        `);
        console.log('Sample Data:');
        sample.rows.forEach(r => {
            console.log(` - ID: ${r.branch_id}, Name: ${r.name}, Mgr: ${r.email}, Debit: ${r.debit}, Credit: ${r.credit}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

verifySeeding();
