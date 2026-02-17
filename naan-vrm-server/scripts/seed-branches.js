const { pool } = require('../db');
const bcrypt = require('bcrypt');

const branchesData = [
    { id: 15608, name: 'אורווה', business: true },
    { id: 15401, name: 'השכרות עסק', business: true },
    { id: 21000, name: 'ענף המזון', business: true },
    { id: 36000, name: 'מים יצרני', business: true },
    { id: 15604, name: 'מוזה', business: true },
    { id: 15605, name: 'כנסים', business: true },
    { id: 38525, name: 'מבנה הנהלה', business: false },
    { id: 26080, name: 'מנהלת שיוך', business: false },
    { id: 26050, name: 'אחזקת חצר', business: false },
    { id: 26020, name: 'משק חום', business: false },
    { id: 32010, name: 'חשמליה', business: true },
    { id: 26290, name: 'נוי', business: true },
    { id: 26030, name: 'אחזקת דירות', business: false },
    { id: 26290, name: 'תקשורת', business: true },
    { id: 24201, name: 'בריאות וסיעוד - ניהול', business: false },
    { id: 24202, name: 'סיעוד בבית חבר', business: false },
    { id: 24710, name: 'בית הדרים', business: false },
    { id: 24100, name: 'בריאות ומרפאה', business: false },
    { id: 24400, name: 'מרפאת שיניים', business: false },
    { id: 27210, name: 'צרכים מיוחדים', business: false },
    { id: 28680, name: 'אולפן מוזיקה', business: true },
    { id: 28684, name: 'חוגים', business: true },
    { id: 28200, name: 'חינוך חברתי', business: false },
    { id: 28213, name: 'חטיפיצה', business: true },
    { id: 28685, name: 'בר מצווה', business: false },
    { id: 28694, name: 'חג בנים', business: false },
    { id: 28100, name: 'חינוך גיל רך', business: true },
    { id: 21020, name: 'כלבו', business: false },
    { id: 25260, name: 'ארכיון', business: false },
    { id: 25065, name: 'בית החמרה', business: false },
    { id: 25292, name: 'חדר כושר', business: true },
    { id: 27023, name: 'מעבדה הורים', business: false },
    { id: 25150, name: 'מועדון חברים', business: false },
    { id: 25280, name: 'ספורט', business: false },
    { id: 25250, name: 'ספרייה', business: false },
    { id: 15607, name: 'תקמ 11', business: true },
    { id: 25000, name: 'תרבות', business: false },
    { id: 25290, name: 'בריכה', business: false },
    { id: 25200, name: 'בית שקמה', business: false },
    { id: 22330, name: 'דואר', business: false },
    { id: 25210, name: 'דור צעיר', business: false },
    { id: 27570, name: 'ועדת אבלות', business: false },
    { id: 15629, name: 'משק חי', business: false },
    { id: 38504, name: 'שמירה', business: false },
    { id: 38514, name: 'בטיחות', business: false },
    { id: 38519, name: 'תכנון ובניה', business: false },
    { id: 0, name: 'עגש', business: true }
];

// Helper for generating values strictly distributed around a mean
function boxMullerTransform() {
    const u1 = Math.random();
    const u2 = Math.random();

    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    // z1 would be the second number, not needed here
    return z0;
}

function getNormallyDistributedRandom(mean, stdDev) {
    const z = boxMullerTransform();
    let val = Math.round(z * stdDev + mean);
    // Ensure non-negative financial values
    return Math.max(0, val);
}

// Hebrew Names Dataset
const firstNames = [
    'נועה', 'תמר', 'מאיה', 'אביגיל', 'טליה', 'שרה', 'יעל', 'אדל', 'שירה', 'אסתר',
    'דוד', 'אריאל', 'לביא', 'יוסף', 'אורי', 'איתן', 'דניאל', 'נועם', 'איתי', 'משה',
    'רועי', 'אברהם', 'יצחק', 'יעקב', 'גיא', 'עומר', 'עידו', 'רחל', 'לאה', 'רבקה',
    'מיכל', 'רות', 'יהונתן', 'אדם', 'בן', 'ליאור', 'טל', 'עידן', 'ניר', 'גל'
];

const surnames = [
    'כהן', 'לוי', 'מזרחי', 'פרץ', 'ביטון', 'דהן', 'אברהם', 'פרידמן', 'מלכה', 'אזולאי',
    'כץ', 'יוסף', 'דוד', 'עמר', 'אוחיון', 'חדד', 'קמחי', 'פלד', 'גבאי', 'סופר',
    'שפירא', 'ברקוביץ', 'ליפשיץ', 'שוורץ', 'לבין', 'הרשקוביץ', 'גולדשטיין', 'גרינברג'
];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomPhone() {
    // Generate 7 digits
    const suffix = Math.floor(Math.random() * 9000000) + 1000000;
    return `052${suffix}`;
}

async function seedBranches() {
    const client = await pool.connect();

    try {
        console.log('🌱 Starting Branch Seeding...');
        await client.query('BEGIN');

        // Prepare password hash once
        const passwordHash = await bcrypt.hash('123456', 10);

        for (const branch of branchesData) {
            console.log(`Processing branch: ${branch.name} (${branch.id})`);

            // 1. Create Balance
            const credit = getNormallyDistributedRandom(7000, 2500);
            const debit = getNormallyDistributedRandom(5000, 1000);

            const balanceRes = await client.query(`
                INSERT INTO balance (debit, credit)
                VALUES ($1, $2)
                RETURNING balance_id
            `, [debit, credit]);

            const balanceId = balanceRes.rows[0].balance_id;

            // 2. Create Manager User
            // Handle duplicate emails if ID is 0 or low numbers might conflict? 
            // We use timestamp to ensure uniqueness just in case, or rely on branch ID.
            const email = `manager_${branch.id}@naan.org.il`;
            const firstName = getRandomElement(firstNames);
            const surname = getRandomElement(surnames);
            const phone = generateRandomPhone();

            // Check if user exists just in case (though we cleared DB)
            // But we might re-run seed.
            let userId;
            const existingUser = await client.query('SELECT user_id FROM "user" WHERE email = $1', [email]);

            if (existingUser.rows.length > 0) {
                userId = existingUser.rows[0].user_id;
                // Update existing user with new details
                await client.query(`
                    UPDATE "user" 
                    SET first_name = $1, surname = $2, phone_no = $3 
                    WHERE user_id = $4
                `, [firstName, surname, phone, userId]);
            } else {
                const userRes = await client.query(`
                    INSERT INTO "user" (first_name, surname, email, phone_no, password, role, status)
                    VALUES ($1, $2, $3, $4, $5, 'branch_manager', 'active')
                    RETURNING user_id
                `, [firstName, surname, email, phone, passwordHash]);
                userId = userRes.rows[0].user_id;
            }

            // 3. Create Branch
            await client.query(`
                INSERT INTO branch (branch_id, name, business, balance_id, manager_id, description, is_active)
                VALUES ($1, $2, $3, $4, $5, 'Generated Branch', true)
                ON CONFLICT (branch_id) DO UPDATE 
                SET name = EXCLUDED.name, 
                    business = EXCLUDED.business,
                    manager_id = EXCLUDED.manager_id,
                    balance_id = EXCLUDED.balance_id
            `, [branch.id, branch.name, branch.business, balanceId, userId]);
        }

        await client.query('COMMIT');
        console.log('✅ All branches seeded successfully!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding branches:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seedBranches();
