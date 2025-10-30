// Upload backup to Railway PostgreSQL
const fs = require('fs');
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:mwJrDDZGzrbFkz3LXYVqzJsctogqMZUU@trolley.proxy.rlwy.net:38716/railway';
const BACKUP_FILE = 'naan_vrm_backup.sql';

console.log('🚀 Starting backup upload to Railway...');
console.log('📁 Reading backup file:', BACKUP_FILE);

// Read the SQL file
const sql = fs.readFileSync(BACKUP_FILE, 'utf8');

console.log('📊 Backup file size:', sql.length, 'characters');
console.log('🔌 Connecting to Railway PostgreSQL...');

// Create client
const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Upload
async function uploadBackup() {
  try {
    await client.connect();
    console.log('✅ Connected to Railway database!');
    
    console.log('📤 Uploading backup... (this may take a few minutes)');
    await client.query(sql);
    
    console.log('✅ Backup uploaded successfully!');
    console.log('🎉 All tables and data have been restored!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('🔌 Connection closed');
  }
}

uploadBackup();


