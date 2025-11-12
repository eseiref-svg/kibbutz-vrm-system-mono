const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function testInsert() {
  try {
    // Simulate the exact data that would come from the frontend
    const testData = {
      branch_id: 1,
      requested_by_user_id: 1,
      client_id: null,
      client_name: 'חברת בדיקה',
      poc_name: 'איש קשר',
      poc_phone: '0501234567',
      poc_email: 'test@example.com',
      city: 'תל אביב',
      street_name: 'רחוב הבדיקה',
      house_no: '10',
      zip_code: '1234567',
      quote_value: 5000,
      payment_terms: 'immediate',
      quote_description: 'תיאור הצעת מחיר',
      status: 'pending'
    };

    console.log('Testing INSERT with data:', testData);

    const result = await pool.query(`
      INSERT INTO client_request (
        branch_id, requested_by_user_id, client_id, client_name, 
        poc_name, poc_phone, poc_email, city, street_name, house_no, zip_code,
        quote_value, payment_terms, quote_description, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      testData.branch_id,
      testData.requested_by_user_id,
      testData.client_id,
      testData.client_name,
      testData.poc_name,
      testData.poc_phone,
      testData.poc_email,
      testData.city,
      testData.street_name,
      testData.house_no,
      testData.zip_code,
      testData.quote_value,
      testData.payment_terms,
      testData.quote_description,
      testData.status
    ]);

    console.log('✅ INSERT successful!');
    console.log('Result:', result.rows[0]);

    // Clean up - delete the test record
    await pool.query('DELETE FROM client_request WHERE request_id = $1', [result.rows[0].request_id]);
    console.log('✅ Test record cleaned up');

    await pool.end();
  } catch (err) {
    console.error('❌ Error during INSERT:');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    await pool.end();
    process.exit(1);
  }
}

testInsert();

