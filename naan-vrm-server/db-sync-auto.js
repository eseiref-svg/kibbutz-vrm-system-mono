/**
 * מנגנון שכפול DB אוטומטי - ללא תלות ב-pg_dump
 * עובד עם Node.js בלבד
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
}

async function getRailwayDatabaseUrl() {
    if (process.env.RAILWAY_DATABASE_URL) {
        return process.env.RAILWAY_DATABASE_URL;
    }

    const saved = loadRailwayConfig();
    if (saved) {
        log('✅ נמצא DATABASE_URL שמור', 'green');
        return saved;
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('');
    log('📡 נדרש DATABASE_URL של Railway:', 'cyan');
    log('  1. לך ל: https://railway.app', 'gray');
    log('  2. בחר: truthful-recreation-production', 'gray');
    log('  3. PostgreSQL service → Variables', 'gray');
    log('  4. העתק: DATABASE_PUBLIC_URL (עם @trolley.proxy...)', 'gray');
    console.log('');

    const url = await new Promise(resolve => {
        rl.question('הדבק DATABASE_URL: ', resolve);
    });

    if (!url.trim()) {
        rl.close();
        log('❌ DATABASE_URL לא סופק', 'red');
        process.exit(1);
    }

    const shouldSave = await new Promise(resolve => {
        rl.question('לשמור לשימוש עתידי? (yes/no): ', resolve);
    });
    rl.close();

    if (shouldSave === 'yes') {
        saveRailwayConfig(url.trim());
        log('✅ DATABASE_URL נשמר', 'green');
    }

    return url.trim();
}

async function dropAllConstraints(pool) {
    log('מסיר constraints זמנית...', 'cyan');
    
    const result = await pool.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    `);
    
    for (const row of result.rows) {
        try {
            await pool.query(`ALTER TABLE "${row.tablename}" DISABLE TRIGGER ALL`);
        } catch (error) {
            // OK
        }
    }
}

async function enableAllConstraints(pool) {
    log('משחזר constraints...', 'cyan');
    
    const result = await pool.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    `);
    
    for (const row of result.rows) {
        try {
            await pool.query(`ALTER TABLE "${row.tablename}" ENABLE TRIGGER ALL`);
        } catch (error) {
            // OK
        }
    }
}

async function truncateAllTables(pool) {
    log('מנקה טבלאות קיימות...', 'cyan');
    
    const result = await pool.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
    `);
    
    if (result.rows.length === 0) {
        log('  אין טבלאות לנקות', 'gray');
        return;
    }
    
    for (const row of result.rows) {
        try {
            await pool.query(`TRUNCATE TABLE "${row.tablename}" CASCADE`);
        } catch (error) {
            // OK - טבלה אולי לא קיימת
        }
    }
    
    log(`✅ ${result.rows.length} טבלאות נוקו`, 'green');
}

async function copyTable(localPool, railwayPool, tableName) {
    try {
        // קבלת כל הנתונים
        const result = await localPool.query(`SELECT * FROM "${tableName}"`);
        
        if (result.rows.length === 0) {
            return { success: true, count: 0 };
        }

        // העתקה שורה אחר שורה
        const columns = Object.keys(result.rows[0]);
        const columnNames = columns.map(col => `"${col}"`).join(', ');

        for (const row of result.rows) {
            const values = columns.map(col => row[col]);
            const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
            
            await railwayPool.query(
                `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders})`,
                values
            );
        }

        return { success: true, count: result.rows.length };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function syncDatabase() {
    log('============================================', 'magenta');
    log('  🔄 שכפול DB אוטומטי', 'magenta');
    log('  Local → Railway Production', 'magenta');
    log('============================================', 'magenta');
    console.log('');

    // שלב 1: חיבורים
    log('📡 שלב 1/4: יצירת חיבורים', 'blue');
    
    const railwayDbUrl = await getRailwayDatabaseUrl();
    console.log('');

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
        log('✅ חיבור מקומי הצליח', 'green');
    } catch (error) {
        log(`❌ שגיאה בחיבור מקומי: ${error.message}`, 'red');
        process.exit(1);
    }

    log('מתחבר ל-Railway DB...', 'cyan');
    const railwayPool = new Pool({
        connectionString: railwayDbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await railwayPool.query('SELECT 1');
        log('✅ חיבור Railway הצליח', 'green');
    } catch (error) {
        log(`❌ שגיאה בחיבור Railway: ${error.message}`, 'red');
        await localPool.end();
        process.exit(1);
    }
    console.log('');

    // שלב 2: קבלת רשימת טבלאות
    log('📋 שלב 2/4: קבלת רשימת טבלאות', 'blue');
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

    // אישור
    log('⚠️  זה ימחק את כל הנתונים ב-Railway!', 'yellow');
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
        log('🛑 בוטל', 'yellow');
        await localPool.end();
        await railwayPool.end();
        process.exit(0);
    }
    console.log('');

    // שלב 3: ניקוי
    log('🧹 שלב 3/4: ניקוי Railway DB', 'blue');
    await dropAllConstraints(railwayPool);
    await truncateAllTables(railwayPool);
    console.log('');

    // שלב 4: העתקה
    log('📦 שלב 4/4: העתקת נתונים', 'blue');
    log('⏳ זה עלול לקחת כמה דקות...', 'yellow');
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    for (const table of tables) {
        process.stdout.write(`  ${table}... `);
        const result = await copyTable(localPool, railwayPool, table);
        
        if (result.success) {
            console.log(`${colors.green}✅ ${result.count} שורות${colors.reset}`);
            successCount++;
        } else {
            console.log(`${colors.red}❌ ${result.error}${colors.reset}`);
            errorCount++;
        }
    }

    console.log('');
    await enableAllConstraints(railwayPool);
    console.log('');

    await localPool.end();
    await railwayPool.end();

    log('============================================', 'magenta');
    log('  ✅ שכפול הושלם בהצלחה!', 'green');
    log('============================================', 'magenta');
    console.log('');
    log('📊 סיכום:', 'cyan');
    log(`  ✅ הצליחו: ${successCount}/${tables.length} טבלאות`, 'green');
    if (errorCount > 0) {
        log(`  ⚠️  נכשלו: ${errorCount} טבלאות`, 'yellow');
    }
    console.log('');
    log('🎯 המערכת הציבורית עודכנה', 'green');
    log('🔗 בדוק ב: https://kibbutz-vrm-system-mono.vercel.app', 'cyan');
}

syncDatabase().catch(error => {
    log(`❌ שגיאה קריטית: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});

