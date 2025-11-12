const db = require('./db');

async function checkTestData() {
  console.log('🔍 Checking test data in database...\n');

  try {
    // Check users
    const users = await db.query(`
      SELECT user_id, email, permissions_id, status 
      FROM "user" 
      WHERE email IN ('manager@test.com', 'treasury@test.com')
    `);
    
    console.log('📋 Users:');
    if (users.rows.length === 0) {
      console.log('  ❌ No test users found!');
      console.log('  💡 Run: psql -U postgres -d naan_vrm -f ../test-data-qa-new-flow.sql\n');
    } else {
      users.rows.forEach(u => {
        console.log(`  ✅ ${u.email} (permissions_id: ${u.permissions_id}, status: ${u.status})`);
      });
    }

    // Check branches
    const branches = await db.query('SELECT branch_id, name FROM branch LIMIT 5');
    console.log('\n📋 Branches:');
    if (branches.rows.length === 0) {
      console.log('  ❌ No branches found!\n');
    } else {
      branches.rows.forEach(b => {
        console.log(`  ✅ ${b.name} (ID: ${b.branch_id})`);
      });
    }

    // Check clients
    const clients = await db.query('SELECT COUNT(*) as count FROM client');
    console.log(`\n📋 Clients: ${clients.rows[0].count}`);

    console.log('\n✅ Database check completed!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTestData();

