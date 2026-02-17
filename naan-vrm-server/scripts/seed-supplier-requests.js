const { pool } = require('../db');

// Config
const REQUESTS_COUNT = 7;
const ORVA_BRANCH_ID = 15608;

const supplierNames = [
    "גבריאל פיש לא לשימוש",
    "גלידות שטראוס",
    "גלוברנדס בעמ",
    "בי.יו אופנה ופנאי בע\"מ",
    "ביכורי השדה דרום",
    "אבאל יזמות בע\"מ",
    "אחים בוקובזה בע\"מ"
];

// Reusing Name Generation Logic
const firstNames = [
    'נועה', 'תמר', 'מאיה', 'אביגיל', 'טליה', 'שרה', 'יעל', 'אדל', 'שירה', 'אסתר',
    'דוד', 'אריאל', 'לביא', 'יוסף', 'אורי', 'איתן', 'דניאל', 'נועם', 'איתי', 'משה'
];
const surnames = [
    'כהן', 'לוי', 'מזרחי', 'פרץ', 'ביטון', 'דהן', 'אברהם', 'פרידמן', 'מלכה', 'אזולאי'
];
const cities = ['תל אביב', 'רחובות', 'ראשון לציון', 'ירושלים', 'חיפה', 'באר שבע'];

// Heuristic Categories
const categories = [
    { name: 'מזון וקולינריה', keywords: ['גלידות', 'ביכורי', 'דרום', 'שטראוס'] },
    { name: 'רכב ותחבורה', keywords: ['דלק', 'מוסך'] },
    { name: 'תשתיות ואחזקה', keywords: ['יזמות', 'אחים', 'בוקובזה'] },
    { name: 'תרבות ופנאי', keywords: ['אופנה', 'פנאי', 'בי.יו'] },
    { name: 'טכנולוגיה ומחשוב', keywords: [] }
];

function getCategory(name) {
    for (const cat of categories) {
        if (cat.keywords.some(k => name.includes(k))) return cat.name;
    }
    return 'שירותים מקצועיים'; // Default
}

// Transliteration
const hebrewToEnglish = {
    'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ל': 'l', 'מ': 'm', 'נ': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p', 'צ': 'tz', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't',
    'ן': 'n', 'ם': 'm', 'ך': 'ch', 'ף': 'f', 'ץ': 'tz'
};
function transliterate(str) {
    return str.split('').map(char => hebrewToEnglish[char] || char).join('').toLowerCase();
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone() {
    return '0' + (500000000 + Math.floor(Math.random() * 99999999)).toString();
}

async function seedSupplierRequests() {
    const client = await pool.connect();

    try {
        console.log('⏳ Seeding Supplier Requests...');
        await client.query('BEGIN');

        // 1. Fetch Branches (Orva + others)
        const orvaRes = await client.query('SELECT branch_id, manager_id FROM branch WHERE branch_id = $1', [ORVA_BRANCH_ID]);
        let relevantBranches = [];
        if (orvaRes.rows.length > 0) relevantBranches.push(orvaRes.rows[0]);

        const othersRes = await client.query('SELECT branch_id, manager_id FROM branch WHERE branch_id != $1 ORDER BY RANDOM() LIMIT 5', [ORVA_BRANCH_ID]);
        relevantBranches = [...relevantBranches, ...othersRes.rows];

        // 2. Fetch Supplier Categories (supplier_field)
        const fieldsRes = await client.query('SELECT supplier_field_id, field FROM supplier_field');
        const fieldsMap = new Map(fieldsRes.rows.map(f => [f.field, f.supplier_field_id]));

        // 3. Process Requests
        for (let i = 0; i < supplierNames.length; i++) {
            const supplierName = supplierNames[i];
            const branch = getRandomElement(relevantBranches);

            // Generate BN
            const bn = (510000000 + Math.floor(Math.random() * 90000000)).toString().substring(0, 9);

            // Name with BN (since column likely missing)
            const displayName = `${supplierName} (ח.פ: ${bn})`;

            // Contact
            const firstName = getRandomElement(firstNames);
            const surname = getRandomElement(surnames);
            const pocName = `${firstName} ${surname}`;
            const email = `${transliterate(firstName)}.${transliterate(surname)}@request.com`;

            // Category
            const catName = getCategory(supplierName);
            let fieldId = fieldsMap.get(catName);
            if (!fieldId) fieldId = fieldsMap.values().next().value; // Fallback

            // Address
            const city = getRandomElement(cities);
            const street = 'המרכזי'; // Generic
            const zip = '12345'; // Generic

            await client.query(`
                INSERT INTO supplier_request (
                    branch_id, requested_by_user_id, status, created_at,
                    supplier_name, poc_name, poc_email, poc_phone,
                    supplier_field_id, city, street_name, house_no, zip_code
                )
                VALUES ($1, $2, 'pending', NOW(), $3, $4, $5, $6, $7, $8, $9, '1', $10)
            `, [
                branch.branch_id, branch.manager_id,
                displayName, pocName, email, generatePhone(),
                fieldId, city, street, zip
            ]);
        }

        await client.query('COMMIT');
        console.log(`✅ Seeded ${supplierNames.length} supplier requests.`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding supplier requests:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seedSupplierRequests();
