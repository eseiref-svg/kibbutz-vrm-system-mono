/**
 * שכפול DB מלא - Schema + Data
 * ללא תלות חיצונית
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
    log('  העתק מ-Railway Dashboard → PostgreSQL → Variables', 'gray');
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
        rl.question('לשמור? (yes/no): ', resolve);
    });
    rl.close();

    if (shouldSave === 'yes') {
        saveRailwayConfig(url.trim());
    }

    return url.trim();
}

async function exportSchema(localPool) {
    log('מייצא schema מ-DB מקומי...', 'cyan');
    
    // יצוא כל ה-DDL
    const result = await localPool.query(`
        SELECT 
            'CREATE TABLE ' || quote_ident(tablename) || ' (' ||
            string_agg(
                quote_ident(attname) || ' ' || 
                pg_catalog.format_type(atttypid, atttypmod) ||
                CASE WHEN attnotnull THEN ' NOT NULL' ELSE '' END,
                ', '
            ) || ');' as ddl
        FROM pg_catalog.pg_attribute a
        JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
        JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
        JOIN pg_catalog.pg_tables t ON c.relname = t.tablename AND n.nspname = t.schemaname
        WHERE n.nspname = 'public'
        AND t.schemaname = 'public'
        AND a.attnum > 0
        AND NOT a.attisdropped
        GROUP BY tablename
        ORDER BY tablename
    `);
    
    return result.rows.map(r => r.ddl);
}

async function copyAllData(localPool, railwayPool) {
    // קבלת כל הטבלאות
    const tablesResult = await localPool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    
    log(`מעתיק נתונים מ-${tables.length} טבלאות...`, 'cyan');
    console.log('');

    let successCount = 0;
    const errors = [];

    // ביטול constraints זמנית
    await railwayPool.query('SET session_replication_role = replica;');

    for (const table of tables) {
        try {
            process.stdout.write(`  ${table}... `);
            
            // קבלת נתונים
            const result = await localPool.query(`SELECT * FROM "${table}"`);
            
            if (result.rows.length === 0) {
                console.log(`${colors.gray}ריק${colors.reset}`);
                successCount++;
                continue;
            }

            // העתקה
            const columns = Object.keys(result.rows[0]);
            const columnNames = columns.map(col => `"${col}"`).join(', ');

            for (const row of result.rows) {
                const values = columns.map(col => row[col]);
                const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
                
                await railwayPool.query(
                    `INSERT INTO "${table}" (${columnNames}) VALUES (${placeholders})`,
                    values
                );
            }

            console.log(`${colors.green}✅ ${result.rows.length} שורות${colors.reset}`);
            successCount++;
        } catch (error) {
            console.log(`${colors.red}❌ ${error.message.substring(0, 50)}${colors.reset}`);
            errors.push({ table, error: error.message });
        }
    }

    // החזרת constraints
    await railwayPool.query('SET session_replication_role = DEFAULT;');

    return { successCount, tables: tables.length, errors };
}

async function main() {
    log('============================================', 'magenta');
    log('  🔄 שכפול DB מלא ואוטומטי', 'magenta');
    log('  Schema + Data → Railway', 'magenta');
    log('============================================', 'magenta');
    console.log('');

    // חיבורים
    log('📡 שלב 1: יצירת חיבורים', 'blue');
    const railwayDbUrl = await getRailwayDatabaseUrl();
    console.log('');

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

    try {
        await localPool.query('SELECT 1');
        await railwayPool.query('SELECT 1');
        log('✅ החיבורים הצליחו', 'green');
    } catch (error) {
        log(`❌ שגיאה בחיבור: ${error.message}`, 'red');
        process.exit(1);
    }
    console.log('');

    // אישור
    log('⚠️  זה ימחק ויצור מחדש את Railway DB!', 'yellow');
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

    // מחיקת טבלאות קיימות
    log('🗑️  שלב 2: מחיקת טבלאות קיימות ב-Railway', 'blue');
    const dropResult = await railwayPool.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    `);

    for (const row of dropResult.rows) {
        try {
            await railwayPool.query(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE`);
            log(`  ✓ ${row.tablename}`, 'gray');
        } catch (error) {
            // OK
        }
    }
    log('✅ טבלאות נמחקו', 'green');
    console.log('');

    // יצירת schema
    log('🏗️  שלב 3: יצירת schema ב-Railway', 'blue');
    const ddlStatements = await exportSchema(localPool);
    
    for (const ddl of ddlStatements) {
        try {
            await railwayPool.query(ddl);
        } catch (error) {
            log(`  ⚠️  ${error.message}`, 'yellow');
        }
    }
    log('✅ Schema נוצר', 'green');
    console.log('');

    // העתקת נתונים
    log('📦 שלב 4: העתקת נתונים', 'blue');
    const result = await copyAllData(localPool, railwayPool);
    console.log('');

    await localPool.end();
    await railwayPool.end();

    log('============================================', 'magenta');
    log('  ✅ שכפול הושלם!', 'green');
    log('============================================', 'magenta');
    console.log('');
    log('📊 סיכום:', 'cyan');
    log(`  ✅ הצליחו: ${result.successCount}/${result.tables} טבלאות`, 'green');
    if (result.errors.length > 0) {
        log(`  ⚠️  שגיאות: ${result.errors.length}`, 'yellow');
    }
    console.log('');
    log('🎯 המערכת הציבורית עודכנה', 'green');
    log('🔗 בדוק: https://kibbutz-vrm-system-mono.vercel.app', 'cyan');
}

main().catch(error => {
    log(`❌ שגיאה: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});

