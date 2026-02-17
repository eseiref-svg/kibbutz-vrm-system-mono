const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function seedBudgets() {
    try {
        const res = await pool.query('SELECT branch_id FROM branch');
        const branches = res.rows;
        console.log(`Found ${branches.length} branches.`);

        for (const branch of branches) {
            // Mean 7000, StdDev 1500
            // Random normal distribution approx:
            const u = 1 - Math.random();
            const v = Math.random();
            const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            const amount = Math.round(7000 + z * 1500);

            // Ensure positive
            const finalAmount = Math.max(1000, amount);

            await pool.query('UPDATE branch SET budget = $1 WHERE branch_id = $2', [finalAmount, branch.branch_id]);
            console.log(`Updated branch ${branch.branch_id} with budget: ${finalAmount}`);
        }

        console.log('Done seeding budgets.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding budgets:', err);
        process.exit(1);
    }
}

seedBudgets();
