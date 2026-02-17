const { pool } = require('../db');

// Client List from User
const clientNames = [
    "ניר ממן- ניר הפקות", "מוטי ה.מ בע\"מ", "אורי משגב", "מעיינות הזוהר- זוהר בקאל",
    "מיכה הובלות בע\"מ", "מ.מ עבודות חשמל ואבטחה", "נדב מנדיל", "אלי מכלוף",
    "מ.ע.י הנדסת חשמל בע\"מ", "מ.מ.דילוקס שירותים בע\"מ", "מקס ברנר ריטייל בע\"מ", "משרקי שירן",
    "מחוברים לחיים בע\"מ", "מאיה ייצור ושיווק בצק ומוצרי מאפה איכותיים", "משולם פתרונות תשלום בע\"מ",
    "מודן הוצאה לאור בע\"מ", "משאבים פתרונות מבריקים בע\"מ", "תמיר מזרחי", "איתן מרגוליס יבוא ושיווק בע\"מ",
    "נ. מעוז אקולוגיה וסביבה", "מולטי גרדן בע\"מ", "מרכז סליקה בנקאי בע\"מ", "ד\"ר אמנון מוצפי",
    "משתלות אייל אחים לוי בע\"מ", "מי-טל ייעוץ ודיגום", "עידית מינצר", "מרפאת קו\"\" ד\"ר ולטר, ד\"ר קלס",
    "מושיקו שרות תיקונים", "מתפרת אחים סוסו", "מ. ס. מצג סחר 1990 בע\"מ", "ליאת מצליח",
    "מריו- שרותי אינסטלציה מתקדמים", "מקומי- נט פתרונות תשלום ומידע אגש\"ח בע\"מ", "הכנעני- אחי מילר",
    "מ.נ.מ הכל לתעשיה בע\"מ", "מורן הנדסת דרכים בע\"מ", "מ.ד.ע. חשמל גואטה בע\"מ", "אלון מיכה",
    "עופר מזרחי", "מאפיית ג`ילברט בע\"מ", "מבשלים חוויה- יניב פרטוש תמיר בע\"מ", "מנופי עמית בע\"מ",
    "משקי טנא סוכנות לביטוח פנסיוני בע\"מ", "מרינדו בע\"מ- לא לשימוש", "מ.א.ש מהנדסים (1995) בע\"מ",
    "מתן שירותים והפצה", "מה שבטוח- להב עתי", "משתלת בן צבי בע\"מ", "מטרה הדברת מזיקים",
    "מרצ`נקו ארטיום", "מודוס אסטרטגיה יישובית בע\"מ", "מעבדת שדה מחוז מרכז בע\"מ",
    "מנה בהזמנה- נדב בן דוד", "שמוליק מאסיל", "מרכז הסידקית", "שקד מאור קוסמטיקה",
    "רן מנדלסון", "מוסדות חינוך ותרבות של ברית התנועה הקיבוצית (ע\"ר)", "מ.ע. פרוייקטים",
    "מרכז הדרכה להתחדשות", "מלצר ניקולאי"
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
function generatePhone() { return '05' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'); }
function generateBN() { return (510000000 + Math.floor(Math.random() * 90000000)).toString(); }

const hebrewToEnglish = {
    'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ל': 'l', 'מ': 'm', 'נ': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p', 'צ': 'tz', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't',
    'ן': 'n', 'ם': 'm', 'ך': 'ch', 'ף': 'f', 'ץ': 'tz', '`': ''
};

function transliterate(str) {
    if (!str) return 'user';
    return str.toLowerCase().split('').map(char => hebrewToEnglish[char] || '').join('').replace(/[^a-z]/g, '') || 'user';
}

async function seedClients() {
    const client = await pool.connect();
    try {
        console.log('🌱 Starting Client Seeding (With Branch Ownership & Emails)...');
        await client.query('BEGIN');

        // 1. Cleanup Clients (Reset)
        // This clears all downstream data (sales, requests) too.
        console.log('Cleaning existing client data...');
        await client.query('DELETE FROM client_request');
        await client.query('DELETE FROM sale');
        await client.query('DELETE FROM client');

        // 2. Fetch Branches for assignment
        const branchesRes = await client.query('SELECT branch_id FROM branch');
        const branches = branchesRes.rows;
        if (branches.length === 0) throw new Error("No branches found.");

        const usedBNs = new Set();

        for (const clientName of clientNames) {
            // Unique BN
            let bn;
            do { bn = generateBN(); } while (usedBNs.has(bn));
            usedBNs.add(bn);

            // Assign Random Branch ("Owning Branch")
            const branchId = getRandomElement(branches).branch_id;

            // Contact
            const firstName = getRandomElement(firstNames);
            const surname = getRandomElement(surnames);
            const pocName = `${firstName} ${surname}`;
            const pocPhone = generatePhone();
            const pocEmail = `${transliterate(firstName)}.${transliterate(surname)}@example.com`;

            const paymentTerms = getRandomElement(paymentTermsOptions);

            // Address
            const addressRes = await client.query(`
                INSERT INTO address (city, street_name, house_no, zip_code, phone_no)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING address_id
            `, [getRandomElement(cities), getRandomElement(streets), Math.floor(Math.random() * 100).toString(), '12345', pocPhone]);
            const addressId = addressRes.rows[0].address_id;

            // Insert Client with Branch & Email
            await client.query(`
                INSERT INTO client (
                    name, client_number, poc_name, poc_phone, poc_email,
                    address_id, payment_terms, is_active, branch_id
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8)
            `, [clientName, bn, pocName, pocPhone, pocEmail, addressId, paymentTerms, branchId]);
        }

        await client.query('COMMIT');
        console.log(`✅ Successfully seeded ${clientNames.length} clients with branch ownership and emails.`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding clients:', err);
    } finally {
        client.release();
        pool.end();
    }
}

seedClients();
