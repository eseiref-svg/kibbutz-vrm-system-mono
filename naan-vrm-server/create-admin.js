// Create Admin User Script
// Run this ONCE to create an admin user in Railway DB

require('dotenv').config();
const bcrypt = require('bcrypt');
const { Client } = require('pg');

// Configuration
const ADMIN_EMAIL = 'admin@naan.com';
const ADMIN_PASSWORD = '111222333';
const ADMIN_FIRST_NAME = 'Admin';
const ADMIN_SURNAME = 'System';
const ADMIN_PHONE = '050-0000000';

// Use DATABASE_URL from environment (Railway)
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found!');
  console.error('Make sure to set DATABASE_URL environment variable');
  process.exit(1);
}

async function createAdmin() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('railway') ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if admin already exists
    const checkResult = await client.query(
      'SELECT * FROM "user" WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (checkResult.rows.length > 0) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', ADMIN_EMAIL);
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Insert admin user
    console.log('👤 Creating admin user...');
    const result = await client.query(
      `INSERT INTO "user" (first_name, surname, email, phone_no, password, permissions_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING user_id, email, first_name, surname`,
      [ADMIN_FIRST_NAME, ADMIN_SURNAME, ADMIN_EMAIL, ADMIN_PHONE, passwordHash, 1, 'active']
    );

    console.log('');
    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', ADMIN_EMAIL);
    console.log('🔑 Password:', ADMIN_PASSWORD);
    console.log('👤 Name:', ADMIN_FIRST_NAME, ADMIN_SURNAME);
    console.log('🆔 User ID:', result.rows[0].user_id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎯 You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('🔌 Connection closed');
  }
}

createAdmin();

