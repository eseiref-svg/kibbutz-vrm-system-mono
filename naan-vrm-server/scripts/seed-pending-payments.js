const { pool } = require('../db');

// Config
const PENDING_REQUESTS = 10;
const ORVA_BRANCH_ID = 15608;

const serviceDescriptions = [
    // Description templates for seed data simulation
    "רכישת ציוד מיוחד - ממתין לאישור",
    "הזמנה חריגה - דורש אישור",
    "תשלום לספק חדש - לבדיקה",
    "תיקון גדול בחוות השרתים",
    "חריגה מתקציב - לאישור", // Sample "Budget Exception" description
    "הזמנת קייטרינג לאירוע גדול",
    "שיפוץ דחוף באגף ההנהלה",
    "רכישת רישיונות תוכנה"
];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedPendingPayments() {
    const client = await pool.connect();

    try {
        console.log('⏳ Seeding Pending Payment Requests...');
        await client.query('BEGIN');

        // 1. Fetch Branches (must include Orva)
        // Get Orva
        const orvaRes = await client.query('SELECT branch_id, name FROM branch WHERE branch_id = $1', [ORVA_BRANCH_ID]);
        let relevantBranches = [];

        if (orvaRes.rows.length > 0) {
            relevantBranches.push(orvaRes.rows[0]);
        }

        // Get random other branches to fill relevant branches list for selection
        const othersRes = await client.query('SELECT branch_id, name FROM branch WHERE branch_id != $1 ORDER BY RANDOM() LIMIT 10', [ORVA_BRANCH_ID]);
        relevantBranches = [...relevantBranches, ...othersRes.rows];

        // 2. Fetch Suppliers
        const suppliersRes = await client.query('SELECT supplier_id, name FROM supplier');
        const suppliers = suppliersRes.rows;

        // 3. Generate Pending Requests
        for (let i = 0; i < PENDING_REQUESTS; i++) {
            const branch = getRandomElement(relevantBranches);
            const supplier = getRandomElement(suppliers);

            // Amount
            const amount = getRandomInt(1000, 20000);

            // Due Date (Recently or near future)
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + getRandomInt(-2, 14));

            // Insert Transaction (Status = 'pending_approval')
            const transRes = await client.query(`
                INSERT INTO transaction (value, due_date, status, description)
                VALUES ($1, $2, 'pending_approval', $3)
                RETURNING transaction_id
            `, [amount, dueDate, `${getRandomElement(serviceDescriptions)} - ${supplier.name}`]);

            const transactionId = transRes.rows[0].transaction_id;

            // Insert Payment Req
            await client.query(`
                INSERT INTO payment_req (payment_req_no, supplier_id, branch_id, transaction_id)
                VALUES ($1, $2, $3, $4)
            `, [30000 + i, supplier.supplier_id, branch.branch_id, transactionId]);
        }

        await client.query('COMMIT');
        console.log(`✅ Seeded ${PENDING_REQUESTS} pending payment requests.`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding pending payments:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seedPendingPayments();
