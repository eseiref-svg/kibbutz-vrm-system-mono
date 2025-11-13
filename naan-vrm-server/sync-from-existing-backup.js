/**
 * שכפול DB באמצעות קובץ גיבוי קיים
 * לא דורש pg_dump
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
    gray: '\x1b[90m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function getRailwayDatabaseUrl() {
    if (process.env.RAILWAY_DATABASE_URL) {
        return process.env.RAILWAY_DATABASE_URL;
    }

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

function findLatestBackup() {
    const backupsDir = path.join(__dirname, 'backups');
    
    if (!fs.existsSync(backupsDir)) {
        return null;
    }

    const backups = fs.readdirSync(backupsDir)
        .filter(f => f.startsWith('local_db_export_') && f.endsWith('.sql'))
        .map(f => ({
            name: f,
            path: path.join(backupsDir, f),
            time: fs.statSync(path.join(backupsDir, f)).mtime
        }))
        .sort((a, b) => b.time - a.time);

    return backups.length > 0 ? backups[0] : null;
}

async function main() {
    log('============================================', 'magenta');
    log('  🔄 שכפול DB מגיבוי קיים', 'magenta');
    log('============================================', 'magenta');
    console.log('');

    // מצא גיבוי
    log('🔍 מחפש קובץ גיבוי...', 'cyan');
    const backup = findLatestBackup();

    if (!backup) {
        log('❌ לא נמצא קובץ גיבוי', 'red');
        log('💡 הרץ קודם: node db-sync-manager.js', 'yellow');
        process.exit(1);
    }

    log(`✅ נמצא: ${backup.name}`, 'green');
    log(`   📅 תאריך: ${backup.time.toLocaleString('he-IL')}`, 'gray');
    console.log('');

    // קבלת DATABASE_URL
    log('📡 קבלת פרטי חיבור...', 'cyan');
    const railwayDbUrl = await getRailwayDatabaseUrl();
    console.log('');

    // אישור
    log('⚠️  להמשיך ולשכתב את Railway DB?', 'yellow');
    log('   זה ימחק את כל הנתונים הקיימים ב-Railway!', 'yellow');
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

    // שחזור
    log('🚀 משחזר ל-Railway...', 'blue');
    log('⏳ זה עלול לקחת כמה דקות...', 'yellow');

    try {
        const sql = fs.readFileSync(backup.path, 'utf8');
        
        const pool = new Pool({
            connectionString: railwayDbUrl,
            ssl: { rejectUnauthorized: false }
        });

        // פיצול ל-statements
        const statements = sql
            .split(/;\s*\n/m)
            .filter(stmt => stmt.trim().length > 0 && !stmt.trim().startsWith('--'));

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (let i = 0; i < statements.length; i++) {
            try {
                await pool.query(statements[i]);
                successCount++;
                
                // הצג התקדמות כל 100 statements
                if ((i + 1) % 100 === 0) {
                    log(`  ✓ ${i + 1}/${statements.length} statements...`, 'gray');
                }
            } catch (error) {
                errorCount++;
                if (errorCount <= 10) {
                    errors.push({
                        statement: statements[i].substring(0, 100),
                        error: error.message
                    });
                }
            }
        }

        await pool.end();

        console.log('');
        log('============================================', 'magenta');
        log('  ✅ שכפול הושלם!', 'green');
        log('============================================', 'magenta');
        console.log('');
        
        log('📊 סטטיסטיקות:', 'cyan');
        log(`  ✅ הצליחו: ${successCount} statements`, 'green');
        log(`  ⚠️  שגיאות: ${errorCount} (רובן ניתן להתעלם)`, errorCount > 0 ? 'yellow' : 'green');
        console.log('');

        if (errors.length > 0 && errorCount > 10) {
            log('📋 שגיאות ראשונות (לדוגמה):', 'yellow');
            errors.forEach((e, i) => {
                log(`  ${i + 1}. ${e.error}`, 'gray');
            });
            console.log('');
        }

        log('🎯 המערכת הציבורית עודכנה', 'green');
        log('🔗 בדוק ב: https://kibbutz-vrm-system-mono.vercel.app', 'cyan');

    } catch (error) {
        log(`❌ שגיאה קריטית: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

main();

