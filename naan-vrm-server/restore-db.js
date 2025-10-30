// Restore database from backup
// This script should be run with Railway's internal DATABASE_URL

const fs = require('fs');
const { Client } = require('pg');

// Use Railway's internal DATABASE_URL (from environment)
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables!');
  console.error('Make sure to run this script in Railway environment or set DATABASE_URL');
  process.exit(1);
}

const BACKUP_FILE = 'naan_vrm_initial_data.txt';

console.log('🚀 Starting database restore...');

// Check if backup file exists
if (!fs.existsSync(BACKUP_FILE)) {
  console.error('❌ Backup file not found:', BACKUP_FILE);
  console.error('Please make sure naan_vrm_backup.sql is in the same directory');
  process.exit(1);
}

console.log('📁 Reading backup file:', BACKUP_FILE);

// Read the SQL file
const sql = fs.readFileSync(BACKUP_FILE, 'utf8');

console.log('📊 Backup file size:', sql.length, 'characters');
console.log('🔌 Connecting to database...');

// Create client
const client = new Client({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('railway') ? {
    rejectUnauthorized: false
  } : false
});

// Restore
async function restoreDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to database!');
    
    console.log('📤 Restoring database... (this may take a few minutes)');
    await client.query(sql);
    
    console.log('✅ Database restored successfully!');
    console.log('🎉 All tables and data have been restored!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await client.end();
    console.log('🔌 Connection closed');
  }
}

restoreDatabase();

