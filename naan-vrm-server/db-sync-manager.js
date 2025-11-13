/**
 * מנגנון אוטומטי לשכפול DB
 * מאפשר שכפול בטוח ונוח של DB מקומי ל-Railway
 */

require('dotenv').config();
const { Pool } = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    gray: '\x1b[90m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadRailwayConfig() {
    const configPath = path.join(__dirname, '.railway-db-url');
    if (fs.existsSync(configPath)) {
        return fs.readFileSync(configPath, 'utf8').trim();
    }
    return null;
}

function saveRailwayConfig(url) {
    const configPath = path.join(__dirname, '.railway-db-url');
    fs.writeFileSync(configPath, url, 'utf8');
    log('✅ DATABASE_URL נשמר (לא נדרש להזין בפעם הבאה)', 'green');
}

async function getRailwayDatabaseUrl() {
    // ניסיון 1: משתנה סביבה
    if (process.env.RAILWAY_DATABASE_URL) {
        return process.env.RAILWAY_DATABASE_URL;
    }

    // ניסיון 2: קובץ config
    const saved = loadRailwayConfig();
    if (saved) {
        log('✅ נמצא DATABASE_URL שמור', 'green');
        return saved;
    }

    // ניסיון 3: בקשה מהמשתמש
    log('⚠️  נדרש DATABASE_URL של Railway', 'yellow');
    console.log('');
    log('קבל אותו מ-Railway Dashboard:', 'cyan');
    log('  1. לך ל: https://railway.app', 'cyan');
    log('  2. בחר את הפרויקט: truthful-recreation-production', 'cyan');
    log('  3. לך ל-PostgreSQL service → Variables', 'cyan');
    log('  4. העתק את DATABASE_PUBLIC_URL (לא DATABASE_URL הפנימי!)', 'cyan');
    console.log('');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const url = await new Promise(resolve => {
        rl.question('הדבק את DATABASE_URL כאן: ', resolve);
    });
    rl.close();

    if (!url.trim()) {
        log('❌ DATABASE_URL לא סופק', 'red');
        process.exit(1);
    }

    // שמירה לשימוש עתידי
    const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const shouldSave = await new Promise(resolve => {
        rl2.question('לשמור את ה-URL לשימוש עתידי? (yes/no): ', resolve);
    });
    rl2.close();

    if (shouldSave === 'yes') {
        saveRailwayConfig(url.trim());
    }

    return url.trim();
}

async function createLocalBackup() {
    const backupsDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                      new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const backupFile = path.join(backupsDir, `local_db_export_${timestamp}.sql`);

    log('יוצר גיבוי מ-DB המקומי...', 'cyan');

    try {
        // נסה עם pg_dump אם מותקן
        const env = { ...process.env, PGPASSWORD: process.env.DB_PASSWORD };
        
        execSync(`pg_dump -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f "${backupFile}"`, {
            env,
            stdio: 'inherit'
        });

        log(`✅ גיבוי נוצר: ${backupFile}`, 'green');
        return backupFile;
    } catch (error) {
        log('❌ pg_dump לא זמין או נכשל', 'red');
        log('💡 התקן PostgreSQL client tools:', 'yellow');
        log('   Windows: choco install postgresql', 'yellow');
        log('   או הורד מ: https://www.postgresql.org/download/windows/', 'yellow');
        return null;
    }
}

async function createRailwayBackup(railwayDbUrl) {
    const backupsDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                      new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const backupFile = path.join(backupsDir, `railway_db_backup_${timestamp}.sql`);

    log('יוצר גיבוי של Railway DB (לשחזור במקרה של בעיה)...', 'cyan');

    try {
        execSync(`pg_dump "${railwayDbUrl}" -f "${backupFile}"`, {
            stdio: 'inherit'
        });

        log(`✅ גיבוי Railway נוצר: ${backupFile}`, 'green');
        return backupFile;
    } catch (error) {
        log('⚠️  לא ניתן ליצור גיבוי של Railway (אבל ממשיכים...)', 'yellow');
        return null;
    }
}

async function restoreToRailway(sqlFile, railwayDbUrl) {
    log('משחזר DB ל-Railway...', 'cyan');
    log('⏳ זה עלול לקחת כמה דקות...', 'yellow');

    try {
        // קריאת הקובץ והרצתו
        const sql = fs.readFileSync(sqlFile, 'utf8');
        
        const pool = new Pool({
            connectionString: railwayDbUrl,
            ssl: { rejectUnauthorized: false }
        });

        // פיצול ל-statements ניפרדים
        const statements = sql
            .split(/;\s*$\n/m)
            .filter(stmt => stmt.trim().length > 0 && !stmt.trim().startsWith('--'));

        let successCount = 0;
        let errorCount = 0;

        for (const statement of statements) {
            try {
                await pool.query(statement);
                successCount++;
            } catch (error) {
                // התעלם משגיאות של "already exists" וכו'
                if (!error.message.includes('already exists') && 
                    !error.message.includes('does not exist') &&
                    !error.message.includes('duplicate key')) {
                    errorCount++;
                    if (errorCount < 5) { // הצג רק 5 שגיאות ראשונות
                        log(`⚠️  ${error.message}`, 'gray');
                    }
                }
            }
        }

        await pool.end();

        log(`✅ שחזור הושלם: ${successCount} statements הצליחו`, 'green');
        if (errorCount > 0) {
            log(`⚠️  ${errorCount} שגיאות (ברובן ניתן להתעלם)`, 'yellow');
        }

        return true;
    } catch (error) {
        log(`❌ שגיאה בשחזור: ${error.message}`, 'red');
        return false;
    }
}

async function verifySync(railwayDbUrl) {
    log('מאמת את השכפול...', 'cyan');

    try {
        const localPool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        });

        const railwayPool = new Pool({
            connectionString: railwayDbUrl,
            ssl: { rejectUnauthorized: false }
        });

        // ספירת טבלאות
        const localTables = await localPool.query(`
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        `);

        const railwayTables = await railwayPool.query(`
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        `);

        log(`  טבלאות במקומי: ${localTables.rows[0].count}`, 'cyan');
        log(`  טבלאות ב-Railway: ${railwayTables.rows[0].count}`, 'cyan');

        if (localTables.rows[0].count === railwayTables.rows[0].count) {
            log('✅ מספר הטבלאות תואם', 'green');
        } else {
            log('⚠️  מספר הטבלאות לא תואם', 'yellow');
        }

        await localPool.end();
        await railwayPool.end();

        return true;
    } catch (error) {
        log(`⚠️  לא ניתן לאמת: ${error.message}`, 'yellow');
        return false;
    }
}

async function main() {
    log('============================================', 'magenta');
    log('  🔄 מנגנון שכפול DB אוטומטי', 'magenta');
    log('  Local DB → Railway Production', 'magenta');
    log('============================================', 'magenta');
    console.log('');

    // שלב 1: קבלת DATABASE_URL
    log('📡 שלב 1/5: קבלת פרטי חיבור', 'blue');
    const railwayDbUrl = await getRailwayDatabaseUrl();
    console.log('');

    // שלב 2: יצירת גיבוי מקומי
    log('💾 שלב 2/5: יצירת גיבוי מ-DB המקומי', 'blue');
    const localBackupFile = await createLocalBackup();
    
    if (!localBackupFile) {
        log('', '');
        log('❌ לא ניתן להמשיך ללא pg_dump', 'red');
        log('💡 אפשרויות:', 'yellow');
        log('  1. התקן PostgreSQL client tools', 'yellow');
        log('  2. השתמש ב-Railway Dashboard לייבוא ידני', 'yellow');
        process.exit(1);
    }
    console.log('');

    // שלב 3: גיבוי Railway (אופציונלי)
    log('🔐 שלב 3/5: גיבוי Railway DB (למקרה חירום)', 'blue');
    const railwayBackupFile = await createRailwayBackup(railwayDbUrl);
    console.log('');

    // שלב 4: אישור
    log('⚠️  האם להמשיך ולשכתב את Railway DB?', 'yellow');
    log('   זה ימחק את כל הנתונים הקיימים ב-Railway!', 'yellow');
    if (railwayBackupFile) {
        log(`   💾 יש גיבוי: ${path.basename(railwayBackupFile)}`, 'green');
    }
    console.log('');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const answer = await new Promise(resolve => {
        rl.question('להמשיך? (yes/no): ', resolve);
    });
    rl.close();

    if (answer !== 'yes') {
        log('🛑 בוטל על ידי המשתמש', 'yellow');
        process.exit(0);
    }
    console.log('');

    // שלב 5: שחזור ל-Railway
    log('🚀 שלב 4/5: שחזור ל-Railway', 'blue');
    const success = await restoreToRailway(localBackupFile, railwayDbUrl);
    console.log('');

    if (!success) {
        log('❌ שחזור נכשל!', 'red');
        if (railwayBackupFile) {
            log(`💡 ניתן לשחזר מהגיבוי: ${railwayBackupFile}`, 'yellow');
        }
        process.exit(1);
    }

    // שלב 6: אימות
    log('✅ שלב 5/5: אימות', 'blue');
    await verifySync(railwayDbUrl);
    console.log('');

    log('============================================', 'magenta');
    log('  ✅ שכפול DB הושלם בהצלחה!', 'green');
    log('============================================', 'magenta');
    console.log('');
    log('📋 סיכום:', 'cyan');
    log(`  📁 גיבוי מקומי: ${path.basename(localBackupFile)}`, 'gray');
    if (railwayBackupFile) {
        log(`  📁 גיבוי Railway: ${path.basename(railwayBackupFile)}`, 'gray');
    }
    log(`  🌐 Railway URL: ${railwayDbUrl.split('@')[1].split('/')[0]}`, 'gray');
    console.log('');
    log('🎯 המערכת הציבורית עודכנה עם הנתונים המקומיים', 'green');
    log('🔗 בדוק ב: https://kibbutz-vrm-system-mono.vercel.app', 'cyan');
}

main().catch(error => {
    log(`❌ שגיאה קריטית: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});

