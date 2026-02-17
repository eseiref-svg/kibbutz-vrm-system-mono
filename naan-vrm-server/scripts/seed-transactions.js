const { pool } = require('../db');

// Config
const TOTAL_REQUESTS = 35;
const TARGET_BRANCHES_COUNT = 20;
const ORVA_BRANCH_ID = 15608;

// Review Templates
const reviews = {
    5: ["שירות מצוין, מאוד מרוצים!", "ספק אמין ומקצועי, תענוג לעבוד איתם.", "הגיעו בזמן וביצעו עבודה מעולה.", "מומלץ מאוד, שירות מעל ומעבר."],
    4: ["שירות טוב, עומדים בזמנים.", "סך הכל מרוצים, עבודה טובה.", "יחס אדיב ומקצועי.", "ספק טוב, נמשיך לעבוד איתם."],
    3: ["השירות סביר, יש מקום לשיפור.", "עבודה בינונית, מחירים סבירים.", "היו עיכובים קלים, אבל בסוף הסתדר.", "לא מדהים, אבל עושים את העבודה."],
    2: ["היו בעיות באספקה.", "תקשורת לא טובה, קשה להשיג אותם.", "לא עמדו בזמנים שהובטחו.", "מאכזב, ציפינו ליותר."],
    1: ["שירות גרוע, לא להתקרב.", "איחורים משמעותיים ויחס מזלזל.", "לא סיפקו את מה שהוזמן.", "חוויה מאוד לא נעימה."]
};

const serviceDescriptions = [
    "אספקת ציוד שוטף", "תיקון תקלה דחופה", "הזמנת חומרים", "שירותי ייעוץ", "תחזוקה שנתית", "רכישת מלאי", "שירותי הובלה", "עבודות תשתית"
];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) { // Inclusive
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedTransactions() {
    const client = await pool.connect();

    try {
        console.log('🌱 Starting Transaction & Review Seeding...');
        await client.query('BEGIN');

        // 1. Fetch Branches (must include Orva)
        // Get Orva
        const orvaRes = await client.query('SELECT branch_id, name, manager_id FROM branch WHERE branch_id = $1', [ORVA_BRANCH_ID]);
        let targetBranches = [];

        if (orvaRes.rows.length > 0) {
            targetBranches.push(orvaRes.rows[0]);
        } else { console.warn('⚠️ Orva branch not found, skipping specific inclusion.'); }

        // Get other random branches
        const othersCount = TARGET_BRANCHES_COUNT - targetBranches.length;
        const othersRes = await client.query(`
            SELECT branch_id, name, manager_id 
            FROM branch 
            WHERE branch_id != $1 
            ORDER BY RANDOM() 
            LIMIT $2
        `, [ORVA_BRANCH_ID, othersCount]);

        targetBranches = [...targetBranches, ...othersRes.rows];
        console.log(`Selected ${targetBranches.length} branches for seeding.`);

        // 2. Fetch Suppliers
        const suppliersRes = await client.query('SELECT supplier_id, name FROM supplier');
        const suppliers = suppliersRes.rows;

        if (suppliers.length === 0) throw new Error('No suppliers found!');

        // 3. Generate Transactions
        const usedPairs = new Set(); // Track (branchId, supplierId) for reviews

        console.log(`Generating ${TOTAL_REQUESTS} payment requests...`);
        for (let i = 0; i < TOTAL_REQUESTS; i++) {
            const branch = getRandomElement(targetBranches);
            const supplier = getRandomElement(suppliers);

            // Track pair
            usedPairs.add(`${branch.branch_id}|${branch.manager_id}|${supplier.supplier_id}`);

            // Determine Timing (Uniform: 0=Future, 1=Today, 2=Overdue)
            const timingObj = Math.random();
            let dueDate = new Date();
            let descPrefix = "";

            if (timingObj < 0.33) {
                // Future
                dueDate.setDate(dueDate.getDate() + getRandomInt(3, 14));
                descPrefix = "[עתידי]";
            } else if (timingObj < 0.66) {
                // Today
                // Keep as now
                descPrefix = "[היום]";
            } else {
                // Overdue
                dueDate.setDate(dueDate.getDate() - getRandomInt(3, 30));
                descPrefix = "[באיחור]";
            }

            // Amount
            const amount = getRandomInt(500, 15000);

            // Insert Transaction (Status = 'open' for payable)
            const transRes = await client.query(`
                INSERT INTO transaction (value, due_date, status, description)
                VALUES ($1, $2, 'open', $3)
                RETURNING transaction_id
            `, [amount, dueDate, `${getRandomElement(serviceDescriptions)} - ${supplier.name}`]);

            const transactionId = transRes.rows[0].transaction_id;

            // Insert Payment Req
            await client.query(`
                INSERT INTO payment_req (payment_req_no, supplier_id, branch_id, transaction_id)
                VALUES ($1, $2, $3, $4)
            `, [10000 + i, supplier.supplier_id, branch.branch_id, transactionId]);
        }

        // 4. Generate Reviews (60% chance per pair)
        console.log('Generating Reviews...');
        let reviewsCount = 0;

        for (const pair of usedPairs) {
            if (Math.random() > 0.60) continue; // 60% chance to REVIEW (Wait, user said 60% did leave review, so < 0.6)
            // Actually "60% of managers left feedback". I'll apply 60% probability.

            const [branchId, managerId, supplierId] = pair.split('|');

            if (!managerId || managerId === 'null') continue;

            const rate = getRandomInt(1, 5);
            const comment = getRandomElement(reviews[rate]);

            // Random date relative to recent
            const reviewDate = new Date();
            reviewDate.setDate(reviewDate.getDate() - getRandomInt(1, 60));

            await client.query(`
                INSERT INTO review (
                    supplier_id, user_id, rate, comment, date,
                    rate_service, rate_quality, rate_time, rate_price
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                supplierId, managerId, rate, comment, reviewDate,
                rate, rate, rate, rate // Simplification: all sub-ratings equal main rate
            ]);
            reviewsCount++;
        }
        console.log(`Created ${reviewsCount} reviews.`);

        await client.query('COMMIT');
        console.log('✅ Transactions & Reviews seeded successfully!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding transactions:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seedTransactions();
