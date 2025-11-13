/**
 * סקריפט Node.js לשכפול DB מקומי ל-Railway
 * משתמש ב-pg library במקום pg_dump/psql
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// צבעים להודעות
const colors = {
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
    log('============================================', 'cyan');
    log('  שכפול DB מקומי ל-Railway Production', 'cyan');
    log('============================================', 'cyan');
    console.log('');

    // בדיקת DATABASE_URL
    const railwayDbUrl = process.env.RAILWAY_DATABASE_URL || process.argv[2];
    if (!railwayDbUrl) {
        log('❌ נדרש DATABASE_URL של Railway', 'red');
        log('שימוש: node sync-db-with-node.js <DATABASE_URL>', 'yellow');
        log('או הגדר RAILWAY_DATABASE_URL במשתנה סביבה', 'yellow');
        process.exit(1);
    }

    // חיבור ל-DB מקומי
    log('מתחבר ל-DB מקומי...', 'cyan');
    const localPool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        await localPool.query('SELECT 1');
        log('✅ חיבור ל-DB מקומי הצליח', 'green');
    } catch (error) {
        log(`❌ שגיאה בחיבור ל-DB מקומי: ${error.message}`, 'red');
        process.exit(1);
    }

    // חיבור ל-Railway DB
    log('מתחבר ל-Railway DB...', 'cyan');
    const railwayPool = new Pool({
        connectionString: railwayDbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await railwayPool.query('SELECT 1');
        log('✅ חיבור ל-Railway DB הצליח', 'green');
    } catch (error) {
        log(`❌ שגיאה בחיבור ל-Railway DB: ${error.message}`, 'red');
        process.exit(1);
    }

    console.log('');
    log('⚠️  זה ימחק את כל הנתונים הקיימים ב-Railway DB!', 'yellow');
    console.log('');

    // קבלת אישור
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const answer = await new Promise(resolve => {
        rl.question('האם אתה בטוח שברצונך להמשיך? (yes/no): ', resolve);
    });
    rl.close();

    if (answer !== 'yes') {
        log('בוטל על ידי המשתמש', 'yellow');
        await localPool.end();
        await railwayPool.end();
        process.exit(0);
    }

    console.log('');
    log('============================================', 'cyan');
    log('  שלב 1: קבלת רשימת טבלאות', 'cyan');
    log('============================================', 'cyan');

    // קבלת רשימת טבלאות
    const tablesResult = await localPool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    log(`נמצאו ${tables.length} טבלאות`, 'cyan');
    console.log('');

    // שמירת נתונים מכל טבלה
    log('============================================', 'cyan');
    log('  שלב 2: שמירת נתונים', 'cyan');
    log('============================================', 'cyan');

    const dataBackup = {};

    for (const table of tables) {
        try {
            log(`שומר נתונים מטבלה: ${table}...`, 'cyan');
            const result = await localPool.query(`SELECT * FROM "${table}"`);
            dataBackup[table] = result.rows;
            log(`✅ ${result.rows.length} שורות נשמרו`, 'green');
        } catch (error) {
            log(`⚠️  שגיאה בטבלה ${table}: ${error.message}`, 'yellow');
        }
    }

    console.log('');
    log('============================================', 'cyan');
    log('  שלב 3: ניקוי Railway DB', 'cyan');
    log('============================================', 'cyan');

    // ניקוי Railway DB (מחיקת כל הנתונים)
    for (const table of tables.reverse()) { // הפוך כדי למנוע בעיות foreign key
        try {
            await railwayPool.query(`TRUNCATE TABLE "${table}" CASCADE`);
            log(`✅ טבלה ${table} נוקתה`, 'green');
        } catch (error) {
            log(`⚠️  שגיאה בניקוי ${table}: ${error.message}`, 'yellow');
        }
    }

    console.log('');
    log('============================================', 'cyan');
    log('  שלב 4: העתקת נתונים ל-Railway', 'cyan');
    log('============================================', 'cyan');

    // העתקת נתונים ל-Railway
    for (const table of tables.reverse()) {
        const rows = dataBackup[table];
        if (!rows || rows.length === 0) continue;

        try {
            log(`מעתיק ${rows.length} שורות לטבלה: ${table}...`, 'cyan');
            
            // קבלת שמות העמודות
            const columns = Object.keys(rows[0]);
            const columnNames = columns.map(col => `"${col}"`).join(', ');
            const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

            // הכנסת כל השורות
            for (const row of rows) {
                const values = columns.map(col => row[col]);
                await railwayPool.query(
                    `INSERT INTO "${table}" (${columnNames}) VALUES (${placeholders})`,
                    values
                );
            }

            log(`✅ ${rows.length} שורות הועתקו`, 'green');
        } catch (error) {
            log(`❌ שגיאה בהעתקת ${table}: ${error.message}`, 'red');
        }
    }

    console.log('');
    log('============================================', 'cyan');
    log('  ✅ שכפול DB הושלם בהצלחה!', 'green');
    log('============================================', 'cyan');
    console.log('');

    await localPool.end();
    await railwayPool.end();
}

main().catch(error => {
    log(`❌ שגיאה: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});


