const { pool } = require('../db');

// Config
const TRANSACTIONS_PER_BRANCH_MIN = 3;
const TRANSACTIONS_PER_BRANCH_MAX = 5;

const saleDescriptions = [
    "מכירת תוצרת חקלאית", "שירותי ייעוץ", "השכרת ציוד", "מכירת יבול עונתי",
    "שירותי הובלה ללקוח", "אספקת חומרי גלם", "פרויקט משותף", "דמי שימוש במתקנים"
];

function getRandomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function seedClientSales() {
    const client = await pool.connect();
    try {
        console.log('💰 Seeding Client Sales (Income)...');
        await client.query('BEGIN');

        // 1. Fetch Branches & Clients
        const branchesRes = await client.query('SELECT branch_id, name FROM branch');
        const clientsRes = await client.query('SELECT client_id, name, payment_terms FROM client');

        const branches = branchesRes.rows;
        const clients = clientsRes.rows;

        if (branches.length === 0 || clients.length === 0) throw new Error("Missing branches or clients data.");

        let totalSales = 0;

        // 2. Iterate Branches
        for (const branch of branches) {
            const numTrans = getRandomInt(TRANSACTIONS_PER_BRANCH_MIN, TRANSACTIONS_PER_BRANCH_MAX);

            for (let i = 0; i < numTrans; i++) {
                const targetClient = getRandomElement(clients);

                // Logic: 
                // IF we only created 2 transactions so far (i < 2), make them PAID.
                // IF it's the 3rd one (i == 2) or more, make it OPEN (Unpaid).
                // User requirement: "at least 2-3... if only 2 create paid... if 3rd create unpaid"
                // My loop is 3-5. So:
                // i=0 -> Paid
                // i=1 -> Paid
                // i>=2 -> Open

                const isPaid = i < 2;
                const status = isPaid ? 'paid' : 'open';

                // Date
                const date = new Date();
                if (isPaid) {
                    date.setDate(date.getDate() - getRandomInt(10, 60)); // Past
                } else {
                    date.setDate(date.getDate() + getRandomInt(1, 30)); // Future/Recent
                }

                // Normal Distribution: Mean 5000, SD 1000
                // Box-Muller transform
                let u = 0, v = 0;
                while (u === 0) u = Math.random();
                while (v === 0) v = Math.random();
                let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
                let value = Math.round(5000 + num * 1000);
                if (value < 0) value = 0;

                // Insert Transaction
                const transRes = await client.query(`
                    INSERT INTO transaction (value, due_date, status, description)
                    VALUES ($1, $2, $3, $4)
                    RETURNING transaction_id
                `, [value, date, status, `${getRandomElement(saleDescriptions)} - ${targetClient.name}`]);
                const transId = transRes.rows[0].transaction_id;

                // Insert Sale
                // Note: sale table links transaction to client.
                await client.query(`
                    INSERT INTO sale (transaction_id, client_id, branch_id, invoice_number, payment_terms)
                    VALUES ($1, $2, $3, $4, $5)
                `, [
                    transId, targetClient.client_id, branch.branch_id,
                    'INV-' + getRandomInt(10000, 99999), targetClient.payment_terms
                ]);
                totalSales++;
            }
        }

        await client.query('COMMIT');
        console.log(`✅ Seeded ${totalSales} sales transactions across ${branches.length} branches.`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding sales:', err);
    } finally {
        client.release();
        pool.end();
    }
}

seedClientSales();
