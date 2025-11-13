const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();
const { Pool } = require('pg');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

const verbose = process.argv.includes('--verbose');

function log(message, color = 'reset') {
  console.log(`${colors[color] || colors.reset}${message}${colors.reset}`);
}

function loadRailwayUrl() {
  if (process.env.RAILWAY_DATABASE_URL) {
    return process.env.RAILWAY_DATABASE_URL.trim();
  }

  const configPath = path.join(__dirname, '.railway-db-url');
  if (fs.existsSync(configPath)) {
    return fs.readFileSync(configPath, 'utf8').trim();
  }

  throw new Error('לא נמצא DATABASE_URL של Railway. הגדר את RAILWAY_DATABASE_URL או צור את הקובץ naan-vrm-server/.railway-db-url');
}

async function createPools() {
  const localPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });

  const railwayPool = new Pool({
    connectionString: loadRailwayUrl(),
    ssl: { rejectUnauthorized: false }
  });

  await Promise.all([localPool.query('SELECT 1'), railwayPool.query('SELECT 1')]);
  return { localPool, railwayPool };
}

async function getTables(pool) {
  const { rows } = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  return rows.map(r => r.table_name);
}

function normalizeValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (typeof value === 'object') {
    return normalizeRow(value);
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  return value;
}

function normalizeRow(row) {
  const normalized = {};
  Object.keys(row)
    .sort()
    .forEach(key => {
      normalized[key] = normalizeValue(row[key]);
    });
  return normalized;
}

function hashRows(rows) {
  const json = JSON.stringify(rows);
  return crypto.createHash('md5').update(json).digest('hex');
}

async function fetchTableData(pool, table) {
  const query = `SELECT * FROM "${table}"`;
  const { rows } = await pool.query(query);
  const normalised = rows.map(normalizeRow);
  normalised.sort((a, b) => {
    const aStr = JSON.stringify(a);
    const bStr = JSON.stringify(b);
    if (aStr < bStr) return -1;
    if (aStr > bStr) return 1;
    return 0;
  });
  return normalised;
}

function extractSampleDiff(localRows, railwayRows, limit = 3) {
  const stringify = (row) => JSON.stringify(row);
  const localSet = new Set(localRows.map(stringify));
  const railwaySet = new Set(railwayRows.map(stringify));

  const localOnly = [];
  const railwayOnly = [];

  for (const row of localRows) {
    const text = stringify(row);
    if (!railwaySet.has(text)) {
      localOnly.push(row);
      if (localOnly.length >= limit) break;
    }
  }

  for (const row of railwayRows) {
    const text = stringify(row);
    if (!localSet.has(text)) {
      railwayOnly.push(row);
      if (railwayOnly.length >= limit) break;
    }
  }

  return { localOnly, railwayOnly };
}

async function compareTables(localPool, railwayPool, tables) {
  const differences = [];

  for (const table of tables) {
    process.stdout.write(`בודק טבלה ${table}... `);

    let localRows, railwayRows;
    try {
      [localRows, railwayRows] = await Promise.all([
        fetchTableData(localPool, table),
        fetchTableData(railwayPool, table)
      ]);
    } catch (error) {
      console.log(`${colors.red}שגיאה${colors.reset}`);
      differences.push({
        table,
        type: 'error',
        details: { message: error.message }
      });
      continue;
    }

    const localHash = hashRows(localRows);
    const railwayHash = hashRows(railwayRows);
    const sameCount = localRows.length === railwayRows.length;
    const sameHash = localHash === railwayHash;

    if (sameCount && sameHash) {
      console.log(`${colors.green}תואם (${localRows.length} שורות)${colors.reset}`);
    } else {
      console.log(`${colors.yellow}שונה${colors.reset}`);
      const diffDetails = {
        local: { row_count: localRows.length, data_hash: localHash },
        railway: { row_count: railwayRows.length, data_hash: railwayHash },
        sameCount,
        sameHash
      };

      if (verbose) {
        diffDetails.samples = extractSampleDiff(localRows, railwayRows);
      }

      differences.push({
        table,
        type: 'different',
        details: diffDetails
      });
    }
  }

  return differences;
}

(async function main() {
  log('============================================', 'magenta');
  log('  🔍 השוואת DB מקומי מול Railway', 'magenta');
  log('============================================', 'magenta');
  console.log('');

  try {
    const { localPool, railwayPool } = await createPools();
    log('✅ חיבור לשני מסדי הנתונים הצליח', 'green');
    console.log('');

    const [localTables, railwayTables] = await Promise.all([
      getTables(localPool),
      getTables(railwayPool)
    ]);

    const allTables = Array.from(new Set([...localTables, ...railwayTables])).sort();

    if (localTables.length !== railwayTables.length) {
      log(`⚠️  מספר הטבלאות שונה (מקומי: ${localTables.length}, Railway: ${railwayTables.length})`, 'yellow');
    } else {
      log(`✅ מספר הטבלאות זהה (${localTables.length})`, 'green');
    }
    console.log('');

    const differences = await compareTables(localPool, railwayPool, allTables);
    console.log('');

    if (differences.length === 0) {
      log('🎉 כל הטבלאות תואמות בין הסביבות!', 'green');
    } else {
      log(`⚠️ נמצאו ${differences.length} הבדלים:`, 'yellow');
      for (const diff of differences) {
        log(`- טבלה ${diff.table}: ${diff.type === 'error' ? 'שגיאה בקריאה' : 'נתונים שונים'}`, 'yellow');
        if (diff.type === 'different') {
          log(`  ↳ מקומי: ${diff.details.local.row_count} שורות, hash=${diff.details.local.data_hash}`, 'gray');
          log(`  ↳ Railway: ${diff.details.railway.row_count} שורות, hash=${diff.details.railway.data_hash}`, 'gray');
          log(`  ↳ במדדים: ספירת שורות ${diff.details.sameCount ? 'תואמת' : 'שונה'}, hash ${diff.details.sameHash ? 'תואם' : 'שונה'}`, 'gray');

          if (verbose && diff.details.samples) {
            const { localOnly, railwayOnly } = diff.details.samples;
            if (localOnly.length > 0) {
              log('  ↳ קיים רק במקומי (דוגמה):', 'cyan');
              localOnly.forEach((row, idx) => log(`     [${idx + 1}] ${JSON.stringify(row)}`, 'gray'));
            }
            if (railwayOnly.length > 0) {
              log('  ↳ קיים רק ב-Railway (דוגמה):', 'cyan');
              railwayOnly.forEach((row, idx) => log(`     [${idx + 1}] ${JSON.stringify(row)}`, 'gray'));
            }
          }
        } else {
          log(`  ↳ error: ${diff.details.message}`, 'gray');
        }
      }
    }

    await localPool.end();
    await railwayPool.end();
  } catch (error) {
    log(`❌ שגיאה: ${error.message}`, 'red');
    process.exit(1);
  }
})();
