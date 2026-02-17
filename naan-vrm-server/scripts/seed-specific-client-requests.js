const { pool } = require('../db');

// New Client List provided by User
const newClientNames = [
    "מרכז הספר והספריות בישראל ע.ר.",
    "מוזה ארועים עם השראה",
    "מצוק מוקדי עזרה ואבטחה בע\"מ",
    "מצבור אנרגיה המרכז הישראלי לאנרגיה סולרית בע\"",
    "מוריץ את לנר",
    "מימון מערכות טיהור מים",
    "מכון התקנים הישראלי",
    "חברת מאזני שקל 2008 בע\"מ",
    "מרכז הפורמייקה אברבוך (שיווק) בע\"מ",
    "קהילה נט פתרונות תוכנה בע\"מ"
];

const paymentTermsOptions = ['immediate', 'current_15', 'current_35', 'current_50'];

// Reusing Generators
const firstNames = [
    'דני', 'יוסי', 'משה', 'דוד', 'אברהם', 'יצחק', 'יעקב', 'שלמה', 'חיים', 'ראובן',
    'שרה', 'רבקה', 'רחל', 'לאה', 'מרים', 'רות', 'אסתר', 'נעמי', 'מיכל', 'תמר'
];
const surnames = ['כהן', 'לוי', 'מזרחי', 'פרץ', 'ביטון', 'דנינו', 'אברגיל', 'אוחיון', 'אסולין', 'אמסלם'];
const cities = ['חולון', 'בת ים', 'רמת גן', 'גבעתיים', 'קריית אונו', 'פתח תקווה', 'ראש העין', 'אריאל'];
const streets = ['העצמאות', 'הרצל', 'ז`בוטינסקי', 'בן גוריון', 'ויצמן', 'הנשיאים', 'הבנים', 'הזית'];

function getRandomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function generatePhone() { return '05' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'); }

const hebrewToEnglish = {
    'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ל': 'l', 'מ': 'm', 'נ': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p', 'צ': 'tz', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't',
    'ן': 'n', 'ם': 'm', 'ך': 'ch', 'ף': 'f', 'ץ': 'tz', '`': ''
};

function transliterate(str) {
    if (!str) return 'user';
    return str.toLowerCase().split('').map(char => hebrewToEnglish[char] || '').join('').replace(/[^a-z]/g, '') || 'user';
}

async function seedNewClientRequests() {
    const client = await pool.connect();
    try {
        console.log('📬 Seeding Specific New Client Requests...');
        await client.query('BEGIN');

        // 1. Fetch Branches for assignment
        const branchesRes = await client.query('SELECT branch_id, manager_id FROM branch');
        const branches = branchesRes.rows;
        if (branches.length === 0) throw new Error("No branches found.");

        // 2. Generate Requests
        for (const clientName of newClientNames) {
            // Assign Random Branch ("Owning Branch" for this request)
            const branch = getRandomElement(branches);

            // Generate Details
            const firstName = getRandomElement(firstNames);
            const surname = getRandomElement(surnames);
            const pocName = `${firstName} ${surname}`;
            const pocPhone = generatePhone();
            const pocEmail = `${transliterate(firstName)}.${transliterate(surname)}@example.com`;
            const paymentTerms = getRandomElement(paymentTermsOptions);
            const quoteValue = getRandomInt(4000, 20000);

            // Address details (embedded in client_request usually)
            const city = getRandomElement(cities);
            const street = getRandomElement(streets);
            const houseNo = getRandomInt(1, 100).toString();
            const zip = '12345';

            // Insert Request for NEW client (client_id is NULL)
            await client.query(`
                INSERT INTO client_request (
                    branch_id, requested_by_user_id, status, created_at,
                    client_name, poc_name, poc_phone, poc_email,
                    city, street_name, house_no, zip_code,
                    quote_value, quote_description, payment_terms, client_id
                )
                VALUES ($1, $2, 'pending', NOW(), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NULL)
            `, [
                branch.branch_id, branch.manager_id,
                clientName, pocName, pocPhone, pocEmail,
                city, street, houseNo, zip,
                quoteValue, "Initial engagement / Onboarding request", paymentTerms
            ]);
        }

        await client.query('COMMIT');
        console.log(`✅ Seeded ${newClientNames.length} new client requests.`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding new client requests:', err);
    } finally {
        client.release();
        pool.end();
    }
}

seedNewClientRequests();
