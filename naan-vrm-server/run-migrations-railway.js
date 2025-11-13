/**
 * הרצת migrations על Railway DB
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    gray: '\x1b[90m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function getRailwayDatabaseUrl() {
    // משתנה סביבה
    if (process.env.RAILWAY_DATABASE_URL) {
        return process.env.RAILWAY_DATABASE_URL;
    }

    // בקשה מהמשתמש
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question('הדבק את DATABASE_URL של Railway: ', (answer) => {
            rl.close();
            if (answer.trim()) {
                resolve(answer.trim());
            } else {
                log('❌ DATABASE_URL לא סופק', 'red');
                process.exit(1);
            }
        });
    });
}

async function runMigrations() {
    log('============================================', 'cyan');
    log('  הרצת Migrations על Railway DB', 'cyan');
    log('============================================', 'cyan');
    console.log('');

    // קבלת DATABASE_URL
    const railwayDbUrl = await getRailwayDatabaseUrl();
    console.log('');

    // חיבור ל-Railway DB
    log('מתחבר ל-Railway DB...', 'cyan');
    const pool = new Pool({
        connectionString: railwayDbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await pool.query('SELECT 1');
        log('✅ חיבור ל-Railway DB הצליח', 'green');
    } catch (error) {
        log(`❌ שגיאה בחיבור ל-Railway DB: ${error.message}`, 'red');
        process.exit(1);
    }

    console.log('');

    // קבלת רשימת migrations
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

    log(`נמצאו ${migrationFiles.length} migration files:`, 'cyan');
    migrationFiles.forEach(file => {
        log(`  - ${file}`, 'gray');
    });
    console.log('');

    // אישור
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const answer = await new Promise(resolve => {
        rl.question('האם להריץ את כל ה-migrations? (yes/no): ', resolve);
    });
    rl.close();

    if (answer !== 'yes') {
        log('בוטל על ידי המשתמש', 'yellow');
        await pool.end();
        process.exit(0);
    }

    console.log('');
    log('מריץ migrations...', 'cyan');
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    // הרצת migrations
    for (const file of migrationFiles) {
        try {
            log(`מריץ: ${file}...`, 'cyan');
            
            const sqlPath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(sqlPath, 'utf8');
            
            await pool.query(sql);
            
            log(`✅ ${file} הושלם בהצלחה`, 'green');
            successCount++;
        } catch (error) {
            log(`❌ שגיאה ב-${file}: ${error.message}`, 'red');
            console.error(error);
            errorCount++;
        }
        console.log('');
    }

    log('============================================', 'cyan');
    log('סיכום:', 'cyan');
    log(`  ✅ הצליחו: ${successCount}`, 'green');
    if (errorCount > 0) {
        log(`  ❌ נכשלו: ${errorCount}`, 'red');
    }
    log('============================================', 'cyan');

    await pool.end();
}

runMigrations().catch(error => {
    log(`❌ שגיאה: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});

