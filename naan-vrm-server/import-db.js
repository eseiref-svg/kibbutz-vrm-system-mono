// ============================================
// Import Database Script (for Railway)
// ============================================
// This script imports the local database export to Railway's database
// Run this script directly in Railway environment
// ============================================

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function importDatabase() {
  console.log('============================================');
  console.log('Import Database to Railway');
  console.log('============================================\n');

  // Find the most recent SQL export file
  const backupsDir = path.join(__dirname, 'backups');
  
  if (!fs.existsSync(backupsDir)) {
    console.error('❌ ERROR: No backups directory found');
    process.exit(1);
  }

  const files = fs.readdirSync(backupsDir)
    .filter(f => f.startsWith('local_db_export_') && f.endsWith('.sql'))
    .map(f => ({
      name: f,
      path: path.join(backupsDir, f),
      time: fs.statSync(path.join(backupsDir, f)).mtime
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length === 0) {
    console.error('❌ ERROR: No SQL export files found in backups directory');
    process.exit(1);
  }

  const sqlFile = files[0];
  console.log(`📁 Using most recent export: ${sqlFile.name}`);
  console.log(`📊 Size: ${(fs.statSync(sqlFile.path).size / 1024).toFixed(2)} KB\n`);

  // Read SQL file
  console.log('📖 Reading SQL file...');
  const sqlContent = fs.readFileSync(sqlFile.path, 'utf8');

  // Connect to database
  console.log('🔌 Connecting to Railway database...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    console.log('🚀 Importing data...');
    console.log('⚠️  This will replace all existing data!\n');

    // Execute the SQL
    await client.query(sqlContent);

    console.log('\n✅ Import completed successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Database has been updated!');
    console.log(`🕒 Time: ${new Date().toLocaleString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error during import:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }

  console.log('\n============================================');
  console.log('🎉 Import process completed!');
  console.log('============================================');
}

// Run the import
importDatabase().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

