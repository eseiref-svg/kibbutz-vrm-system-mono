/**
 * שכפול מדויק של DB מקומי ל-Railway
 * כולל schema ונתונים
 */

require('dotenv').config();
const { Pool } = require('pg');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

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

async function dropAllTables(pool) {
    log('מוחק את כל הטבלאות ב-Railway...', 'cyan');
    
    // קבלת רשימת כל הטבלאות
    const result = await pool.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    `);
    
    if (result.rows.length === 0) {
        log('אין טבלאות למחוק', 'gray');
        return;
    }
    
    // מחיקת כל הטבלאות עם CASCADE
    for (const row of result.rows) {
        try {
            await pool.query(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE`);
            log(`✅ טבלה ${row.tablename} נמחקה`, 'green');
        } catch (error) {
            log(`⚠️  שגיאה במחיקת ${row.tablename}: ${error.message}`, 'yellow');
        }
    }
}

async function getTableSchema(localPool, tableName) {
    // קבלת מבנה הטבלה
    const columnsResult = await localPool.query(`
        SELECT 
            column_name,
            data_type,
            character_maximum_length,
            is_nullable,
            column_default
        FROM information_schema.columns
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
    `, [tableName]);
    
    const columns = columnsResult.rows.map(col => {
        let def = `"${col.column_name}" ${col.data_type}`;
        
        if (col.character_maximum_length) {
            def += `(${col.character_maximum_length})`;
        }
        
        if (col.is_nullable === 'NO') {
            def += ' NOT NULL';
        }
        
        if (col.column_default) {
            def += ` DEFAULT ${col.column_default}`;
        }
        
        return def;
    }).join(',\n    ');
    
    return `CREATE TABLE IF NOT EXISTS "${tableName}" (\n    ${columns}\n)`;
}

async function getConstraints(localPool, tableName) {
    const result = await localPool.query(`
        SELECT
            tc.constraint_name,
            tc.constraint_type,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.table_name = $1 AND tc.table_schema = 'public'
        AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE')
    `, [tableName]);
    
    return result.rows;
}

async function syncDatabase() {
    log('============================================', 'cyan');
    log('  שכפול מדויק של DB מקומי ל-Railway', 'cyan');
    log('============================================', 'cyan');
    console.log('');

    // קבלת DATABASE_URL
    const railwayDbUrl = await getRailwayDatabaseUrl();
    console.log('');

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
        await localPool.end();
        process.exit(1);
    }

    console.log('');
    log('⚠️  זה ימחק את כל הטבלאות והנתונים הקיימים ב-Railway DB!', 'yellow');
    log('⚠️  ויצור אותם מחדש עם schema ונתונים מה-DB המקומי', 'yellow');
    console.log('');

    // קבלת אישור
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

    // שלב 1: מחיקת כל הטבלאות ב-Railway
    log('============================================', 'cyan');
    log('  שלב 1: מחיקת טבלאות קיימות ב-Railway', 'cyan');
    log('============================================', 'cyan');
    await dropAllTables(railwayPool);
    console.log('');

    // שלב 2: קבלת רשימת טבלאות
    log('============================================', 'cyan');
    log('  שלב 2: קבלת רשימת טבלאות מ-DB מקומי', 'cyan');
    log('============================================', 'cyan');

    const tablesResult = await localPool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    log(`נמצאו ${tables.length} טבלאות`, 'cyan');
    tables.forEach(t => log(`  - ${t}`, 'gray'));
    console.log('');

    // שלב 3: יצירת טבלאות ללא constraints
    log('============================================', 'cyan');
    log('  שלב 3: יצירת טבלאות ב-Railway', 'cyan');
    log('============================================', 'cyan');

    for (const table of tables) {
        try {
            log(`יוצר טבלה: ${table}...`, 'cyan');
            const schema = await getTableSchema(localPool, table);
            await railwayPool.query(schema);
            log(`✅ טבלה ${table} נוצרה`, 'green');
        } catch (error) {
            log(`❌ שגיאה ביצירת ${table}: ${error.message}`, 'red');
        }
    }
    console.log('');

    // שלב 4: העתקת נתונים (ללא constraints)
    log('============================================', 'cyan');
    log('  שלב 4: העתקת נתונים', 'cyan');
    log('============================================', 'cyan');

    // ביטול constraints זמנית
    await railwayPool.query('SET session_replication_role = replica;');

    for (const table of tables) {
        try {
            log(`מעתיק נתונים לטבלה: ${table}...`, 'cyan');
            
            const result = await localPool.query(`SELECT * FROM "${table}"`);
            
            if (result.rows.length === 0) {
                log(`  אין נתונים ב-${table}`, 'gray');
                continue;
            }

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

            log(`✅ ${result.rows.length} שורות הועתקו ל-${table}`, 'green');
        } catch (error) {
            log(`❌ שגיאה בהעתקת ${table}: ${error.message}`, 'red');
            console.error(error);
        }
    }

    // החזרת constraints
    await railwayPool.query('SET session_replication_role = DEFAULT;');
    console.log('');

    // שלב 5: הוספת constraints
    log('============================================', 'cyan');
    log('  שלב 5: הוספת constraints', 'cyan');
    log('============================================', 'cyan');

    for (const table of tables) {
        try {
            const constraints = await getConstraints(localPool, table);
            
            for (const constraint of constraints) {
                try {
                    let sql = '';
                    
                    if (constraint.constraint_type === 'PRIMARY KEY') {
                        sql = `ALTER TABLE "${table}" ADD CONSTRAINT "${constraint.constraint_name}" PRIMARY KEY ("${constraint.column_name}")`;
                    } else if (constraint.constraint_type === 'FOREIGN KEY') {
                        sql = `ALTER TABLE "${table}" ADD CONSTRAINT "${constraint.constraint_name}" FOREIGN KEY ("${constraint.column_name}") REFERENCES "${constraint.foreign_table_name}" ("${constraint.foreign_column_name}")`;
                    } else if (constraint.constraint_type === 'UNIQUE') {
                        sql = `ALTER TABLE "${table}" ADD CONSTRAINT "${constraint.constraint_name}" UNIQUE ("${constraint.column_name}")`;
                    }
                    
                    if (sql) {
                        await railwayPool.query(sql);
                        log(`✅ ${constraint.constraint_type} נוסף ל-${table}`, 'green');
                    }
                } catch (error) {
                    // Constraint כבר קיים או שגיאה אחרת
                    log(`⚠️  ${constraint.constraint_type} ב-${table}: ${error.message}`, 'gray');
                }
            }
        } catch (error) {
            log(`⚠️  שגיאה בהוספת constraints ל-${table}`, 'yellow');
        }
    }

    console.log('');
    log('============================================', 'cyan');
    log('  ✅ שכפול מדויק הושלם בהצלחה!', 'green');
    log('============================================', 'cyan');
    console.log('');

    await localPool.end();
    await railwayPool.end();
}

syncDatabase().catch(error => {
    log(`❌ שגיאה: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});

