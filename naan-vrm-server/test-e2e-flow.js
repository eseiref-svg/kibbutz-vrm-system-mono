// Using Node.js built-in modules
const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    // Ensure path starts with /api
    const fullPath = path.startsWith('/api') ? path : `/api${path}`;
    const url = new URL(fullPath, 'http://localhost:5000');
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (token) {
      options.headers['x-auth-token'] = token;
    }
    
    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: parsed });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || body}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test data
const testData = {
  manager: {
    email: 'manager@test.com',
    password: '111222333'
  },
  treasurer: {
    email: 'treasury@test.com',
    password: '111222333'
  },
  newClient: {
    branch_id: 1,
    client_name: 'לקוח בדיקה E2E',
    poc_name: 'יוסי כהן',
    poc_phone: '050-1234567',
    poc_email: 'yossi@test.com',
    city: 'תל אביב',
    street_name: 'דיזנגוף',
    house_no: '100',
    zip_code: '6473921'
  },
  saleRequest: {
    client_id: null, // Will be set after client creation
    branch_id: 1,
    value: 15000,
    transaction_date: new Date().toISOString().split('T')[0],
    description: 'עסקה ראשונה - בדיקת E2E'
  }
};

let managerToken = null;
let treasurerToken = null;
let createdClientId = null;
let createdSaleId = null;
let createdRequestId = null;

async function login(email, password) {
  try {
    const response = await makeRequest('POST', '/users/login', { email, password });
    return response.data.token;
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
}

async function test1_CreateClientRequest() {
  console.log('\n📝 Test 1: Creating client request (Manager)...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Login as manager
    managerToken = await login(testData.manager.email, testData.manager.password);
    console.log('✅ Logged in as manager');
    
    // Create client request
    const response = await makeRequest(
      'POST',
      '/client-requests',
      testData.newClient,
      managerToken
    );
    
    createdRequestId = response.data.request_id;
    console.log(`✅ Client request created: ID ${createdRequestId}`);
    console.log(`   Client name: ${response.data.client_name}`);
    console.log(`   Status: ${response.data.status}`);
    
    // Verify no transaction fields
    if (response.data.quote_value || response.data.payment_terms) {
      throw new Error('❌ Client request should NOT contain transaction fields!');
    }
    console.log('✅ Verified: No transaction fields in client request');
    
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return false;
  }
}

async function test2_ApproveClientRequest() {
  console.log('\n📝 Test 2: Approving client request (Treasurer)...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Login as treasurer
    treasurerToken = await login(testData.treasurer.email, testData.treasurer.password);
    console.log('✅ Logged in as treasurer');
    
    // Approve client request
    const response = await makeRequest(
      'PUT',
      `/client-requests/${createdRequestId}/approve`,
      { review_notes: 'אושר לבדיקת E2E' },
      treasurerToken
    );
    
    createdClientId = response.data.client.client_id;
    console.log(`✅ Client request approved: Client ID ${createdClientId}`);
    console.log(`   Client name: ${response.data.client.name}`);
    
    // Verify no sale was created
    if (response.data.sale) {
      throw new Error('❌ Approval should NOT create a sale!');
    }
    console.log('✅ Verified: No sale created (only client)');
    
    // Update sale request with client ID
    testData.saleRequest.client_id = createdClientId;
    
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return false;
  }
}

async function test3_CreateSaleRequest() {
  console.log('\n📝 Test 3: Creating sale request (Manager)...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Create sale request
    const response = await makeRequest(
      'POST',
      '/sales/request',
      testData.saleRequest,
      managerToken
    );
    
    createdSaleId = response.data.sale.sale_id;
    console.log(`✅ Sale request created: Sale ID ${createdSaleId}`);
    console.log(`   Message: ${response.data.message}`);
    
    // Verify sale has pending_approval status
    const saleCheck = await makeRequest(
      'GET',
      '/sales/pending-approval',
      null,
      treasurerToken
    );
    
    const pendingSale = saleCheck.data.find(s => s.sale_id === createdSaleId);
    if (!pendingSale) {
      throw new Error('❌ Sale not found in pending approval list!');
    }
    
    console.log(`✅ Sale found in pending approval list`);
    console.log(`   Value: ₪${pendingSale.value}`);
    console.log(`   Client: ${pendingSale.client_name}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return false;
  }
}

async function test4_ApproveSaleRequest() {
  console.log('\n📝 Test 4: Approving sale request (Treasurer)...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Approve sale request with payment terms
    const approvalData = {
      payment_terms: 'current_50',
      invoice_number: 'INV-E2E-001'
    };
    
    const response = await makeRequest(
      'PUT',
      `/sales/${createdSaleId}/approve`,
      approvalData,
      treasurerToken
    );
    
    console.log(`✅ Sale request approved: ${response.data.message}`);
    
    // Verify sale status changed to 'open'
    const saleCheck = await makeRequest(
      'GET',
      `/sales/${createdSaleId}`,
      null,
      treasurerToken
    );
    
    const sale = saleCheck.data;
    console.log(`✅ Sale details retrieved:`);
    console.log(`   Status: ${sale.status}`);
    console.log(`   Payment terms: ${sale.payment_terms}`);
    console.log(`   Invoice number: ${sale.invoice_number || 'N/A'}`);
    console.log(`   Due date: ${sale.due_date}`);
    
    // Verify status is 'open'
    if (sale.status !== 'open') {
      throw new Error(`❌ Expected status 'open', got '${sale.status}'`);
    }
    
    // Verify payment terms
    if (sale.payment_terms !== 'current_50') {
      throw new Error(`❌ Expected payment_terms 'current_50', got '${sale.payment_terms}'`);
    }
    
    // Verify invoice number
    if (sale.invoice_number !== 'INV-E2E-001') {
      throw new Error(`❌ Expected invoice_number 'INV-E2E-001', got '${sale.invoice_number}'`);
    }
    
    // Verify due date is approximately 50 days from now
    const dueDate = new Date(sale.due_date);
    const today = new Date();
    const daysDiff = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 48 || daysDiff > 52) {
      throw new Error(`❌ Expected due date ~50 days from now, got ${daysDiff} days`);
    }
    
    console.log(`✅ Due date verified: ${daysDiff} days from today (expected ~50)`);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║  🧪 E2E Testing - New Client & Sales Flow                   ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  const results = {
    test1: false,
    test2: false,
    test3: false,
    test4: false
  };
  
  try {
    // Check if server is running
    try {
      await makeRequest('GET', '/health').catch(() => {});
    } catch (e) {
      console.log('\n⚠️  Warning: Could not verify server is running');
      console.log('   Make sure server is running on http://localhost:5000\n');
    }
    
    results.test1 = await test1_CreateClientRequest();
    if (!results.test1) {
      console.log('\n❌ Test 1 failed. Stopping tests.');
      return;
    }
    
    results.test2 = await test2_ApproveClientRequest();
    if (!results.test2) {
      console.log('\n❌ Test 2 failed. Stopping tests.');
      return;
    }
    
    results.test3 = await test3_CreateSaleRequest();
    if (!results.test3) {
      console.log('\n❌ Test 3 failed. Stopping tests.');
      return;
    }
    
    results.test4 = await test4_ApproveSaleRequest();
    
    // Summary
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 Test Results Summary                    ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    const allPassed = Object.values(results).every(r => r === true);
    
    console.log(`Test 1: Create Client Request     ${results.test1 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Test 2: Approve Client Request    ${results.test2 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Test 3: Create Sale Request        ${results.test3 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Test 4: Approve Sale Request       ${results.test4 ? '✅ PASS' : '❌ FAIL'}`);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (allPassed) {
      console.log('✅ All tests passed! The new flow is working correctly.');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      process.exit(0);
    } else {
      console.log('❌ Some tests failed. Please review the errors above.');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test suite failed:');
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

runAllTests();

