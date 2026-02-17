const { pool } = require('../db');

// Config
const REQUESTS_COUNT = 10;
const ORVA_BRANCH_ID = 15608;

function getRandomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function seedClientRequests() {
    const client = await pool.connect();
    try {
        console.log('📬 Seeding Pending Client Payment Requests...');
        await client.query('BEGIN');

        // 1. Fetch Branches & Clients
        const orvaRes = await client.query('SELECT branch_id, manager_id FROM branch WHERE branch_id = $1', [ORVA_BRANCH_ID]);
        let relevantBranches = [];
        if (orvaRes.rows.length > 0) relevantBranches.push(orvaRes.rows[0]);

        const othersRes = await client.query('SELECT branch_id, manager_id FROM branch WHERE branch_id != $1 ORDER BY RANDOM() LIMIT 5', [ORVA_BRANCH_ID]);
        relevantBranches = [...relevantBranches, ...othersRes.rows];

        const clientsRes = await client.query('SELECT client_id, name, poc_name, poc_phone, poc_email, payment_terms FROM client');
        const clients = clientsRes.rows;

        // 2. Generate Requests
        for (let i = 0; i < REQUESTS_COUNT; i++) {
            const targetClient = getRandomElement(clients);
            const branch = getRandomElement(relevantBranches);

            await client.query(`
                INSERT INTO client_request (
                    branch_id, requested_by_user_id, client_id, status, created_at,
                    client_name, poc_name, poc_phone, poc_email,
                    quote_value, quote_description, payment_terms
                )
                VALUES ($1, $2, $3, 'pending', NOW(), $4, $5, $6, $7, $8, $9, $10)
            `, [
                branch.branch_id, branch.manager_id, targetClient.client_id,
                targetClient.name, targetClient.poc_name, targetClient.poc_phone, targetClient.poc_email,
                getRandomInt(5000, 25000), "Dunning / Invoice creation request", targetClient.payment_terms
            ]);
        }

        await client.query('COMMIT');
        console.log(`✅ Seeded ${REQUESTS_COUNT} pending client requests.`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding client requests:', err);
    } finally {
        client.release();
        pool.end();
    }
}

seedClientRequests();
