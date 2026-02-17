const { pool } = require('../db');

// Config
const HISTORY_ITEMS = 50;

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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedHistory() {
    const client = await pool.connect();

    try {
        console.log('📜 Seeding Historical Data (Paid Transactions & Reviews)...');
        await client.query('BEGIN');

        // 1. Fetch Branches & Suppliers
        const branchesRes = await client.query('SELECT branch_id, manager_id FROM branch');
        const suppliersRes = await client.query('SELECT supplier_id, name FROM supplier');

        const branches = branchesRes.rows;
        const suppliers = suppliersRes.rows;

        // 2. Generate History
        let reviewsCount = 0;

        for (let i = 0; i < HISTORY_ITEMS; i++) {
            const branch = getRandomElement(branches);
            const supplier = getRandomElement(suppliers);

            // Date in the past (1-6 months ago)
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - getRandomInt(30, 180));

            // Amount
            const amount = getRandomInt(500, 15000);

            // Insert PAId Transaction
            const transRes = await client.query(`
                INSERT INTO transaction (value, due_date, status, description)
                VALUES ($1, $2, 'paid', $3)
                RETURNING transaction_id
            `, [amount, pastDate, `${getRandomElement(serviceDescriptions)} - ${supplier.name}`]);

            const transactionId = transRes.rows[0].transaction_id;

            // Insert Payment Req
            await client.query(`
                INSERT INTO payment_req (payment_req_no, supplier_id, branch_id, transaction_id)
                VALUES ($1, $2, $3, $4)
            `, [20000 + i, supplier.supplier_id, branch.branch_id, transactionId]);

            // 3. Generate Review (60% chance)
            if (Math.random() < 0.60 && branch.manager_id) {
                const rate = getRandomInt(1, 5);
                const comment = getRandomElement(reviews[rate]);

                await client.query(`
                    INSERT INTO review (
                        supplier_id, user_id, rate, comment, date,
                        rate_service, rate_quality, rate_time, rate_price
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [
                    supplier.supplier_id, branch.manager_id, rate, comment, pastDate,
                    rate, rate, rate, rate
                ]);
                reviewsCount++;
            }
        }

        await client.query('COMMIT');
        console.log(`✅ History seeded: ${HISTORY_ITEMS} paid transactions, ${reviewsCount} new reviews.`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding history:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seedHistory();
