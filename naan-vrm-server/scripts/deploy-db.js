require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');

// Configuration
const PG_PATH = 'C:\\Program Files\\PostgreSQL\\13\\bin';
const LOCAL_DB_NAME = process.env.DB_NAME || 'naan_vrm';
const LOCAL_DB_USER = process.env.DB_USER || 'postgres';
const LOCAL_DB_PASS = process.env.DB_PASSWORD; // Will be set in env for pg_dump

// Remote URL provided by user
const REMOTE_DB_URL = 'postgresql://postgres:mwJrDDZGzrbFkzJLXYVqZJsctoqrMZUU@trolley.proxy.rlwy.net:38716/railway';

if (!LOCAL_DB_PASS) {
    console.error('Error: DB_PASSWORD not found in .env file');
    process.exit(1);
}

const pgDumpPath = path.join(PG_PATH, 'pg_dump.exe');
const psqlPath = path.join(PG_PATH, 'psql.exe');

// Command construction
// 1. Set PGPASSWORD for local pg_dump (it needs authentication)
// 2. Run pg_dump on local
// 3. Pipe to psql connected to remote
const dumpCmd = `"${pgDumpPath}" -h localhost -U ${LOCAL_DB_USER} --clean --if-exists --no-owner --no-privileges --dbname=${LOCAL_DB_NAME}`;
const restoreCmd = `"${psqlPath}" "${REMOTE_DB_URL}"`;

const fullCmd = `set PGPASSWORD=${LOCAL_DB_PASS}&& ${dumpCmd} | ${restoreCmd}`;

console.log('================================================');
console.log('🚀 STARTING DATABASE MIGRATION');
console.log(`📍 Local DB: ${LOCAL_DB_NAME}`);
console.log(`🌐 Remote Target: ${REMOTE_DB_URL.split('@')[1]}`); // Mask credentials
console.log('================================================');
console.log('⏳ Dumping local data and restoring to remote...');
console.log('   (This ensures remote DB is an exact copy of local)');

const child = exec(fullCmd, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
    if (error) {
        console.error(`\n❌ Migration Failed: ${error.message}`);
        return;
    }
    console.log('\n✅ Migration Completed Successfully!');
    console.log('The remote database now matches the local database.');
});

// Stream standard error to see progress/errors (pg_dump writes verbose info to stderr sometimes)
child.stderr.pipe(process.stderr);
