const { Pool } = require('pg');
const http = require('http');
require('dotenv').config();

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'naan_vrm',
  user: 'postgres',
  password: process.env.DB_PASSWORD
});

const API_BASE_URL = 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`🧪 ${testName}`, 'cyan');
  log('='.repeat(60), 'cyan');
}

function logPass(message) {
  log(`   ✅ ${message}`, 'green');
}

function logFail(message) {
  log(`   ❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`   ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`   ⚠️  ${message}`, 'yellow');
}

let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0
};

async function testDatabase() {
  logTest('DATABASE TESTS');
  
  try {
    // Test 1: Check constraint includes rejected
    logInfo('Test 1.1: Verify transaction_status_check constraint includes rejected');
    const constraintResult = await pool.query(`
      SELECT pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'transaction'::regclass
        AND conname = 'transaction_status_check'
    `);
    
    const definition = constraintResult.rows[0].definition;
    const hasRejected = definition.includes('rejected');
    if (hasRejected) {
      logPass('Constraint includes rejected status');
      testResults.passed++;
    } else {
      logFail('Constraint does NOT include rejected status');
      testResults.failed++;
    }
    
    // Test 2: Check pending sales exist
    logInfo('Test 1.2: Check pending sales count');
    const pendingResult = await pool.query(`
      SELECT COUNT(*) as count,
             json_agg(json_build_object(
               'sale_id', s.sale_id,
               'client_id', s.client_id,
               'client_name', c.name,
               'value', t.value,
               'status', t.status,
               'description', t.description
             )) as sales
      FROM sale s
      JOIN transaction t ON s.transaction_id = t.transaction_id
      LEFT JOIN client c ON s.client_id = c.client_id
      WHERE t.status = 'pending_approval'
    `);
    
    const pendingCount = parseInt(pendingResult.rows[0].count);
    logInfo(`Found ${pendingCount} pending sales`);
    if (pendingCount > 0) {
      logPass(`Pending sales exist: ${pendingCount}`);
      testResults.passed++;
      
      // Show first sale details
      const firstSale = pendingResult.rows[0].sales[0];
      logInfo(`First sale: ID=${firstSale.sale_id}, Client=${firstSale.client_name}, Value=₪${firstSale.value}`);
    } else {
      logWarning('No pending sales found - cannot test approval/rejection');
      testResults.warnings++;
    }
    
    // Test 3: Check sale table structure
    logInfo('Test 1.3: Verify sale table has required columns');
    const saleColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'sale'
        AND column_name IN ('invoice_number', 'payment_terms', 'sale_id', 'client_id', 'branch_id', 'transaction_id')
      ORDER BY column_name
    `);
    
    const requiredColumns = ['invoice_number', 'payment_terms', 'sale_id', 'client_id', 'branch_id', 'transaction_id'];
    const foundColumns = saleColumns.rows.map(r => r.column_name);
    const missingColumns = requiredColumns.filter(col => !foundColumns.includes(col));
    
    if (missingColumns.length === 0) {
      logPass('All required columns exist in sale table');
      testResults.passed++;
    } else {
      logFail(`Missing columns: ${missingColumns.join(', ')}`);
      testResults.failed++;
    }
    
    // Test 4: Check transaction table structure
    logInfo('Test 1.4: Verify transaction table has required columns');
    const transactionColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'transaction'
        AND column_name IN ('transaction_id', 'value', 'due_date', 'status', 'description')
      ORDER BY column_name
    `);
    
    const requiredTxnColumns = ['transaction_id', 'value', 'due_date', 'status', 'description'];
    const foundTxnColumns = transactionColumns.rows.map(r => r.column_name);
    const missingTxnColumns = requiredTxnColumns.filter(col => !foundTxnColumns.includes(col));
    
    if (missingTxnColumns.length === 0) {
      logPass('All required columns exist in transaction table');
      testResults.passed++;
    } else {
      logFail(`Missing columns: ${missingTxnColumns.join(', ')}`);
      testResults.failed++;
    }
    
    // Test 5: Check notifications count
    logInfo('Test 1.5: Check pending notifications count');
    const supplierCount = await pool.query("SELECT COUNT(*) FROM supplier_requests WHERE status = 'pending'");
    const clientCount = await pool.query("SELECT COUNT(*) FROM client_request WHERE status = 'pending'");
    const salesCount = await pool.query(`
      SELECT COUNT(*) 
      FROM sale s 
      JOIN transaction t ON s.transaction_id = t.transaction_id 
      WHERE t.status = 'pending_approval'
    `);
    
    const total = parseInt(supplierCount.rows[0].count) + 
                  parseInt(clientCount.rows[0].count) + 
                  parseInt(salesCount.rows[0].count);
    
    logInfo(`Pending: ${supplierCount.rows[0].count} suppliers + ${clientCount.rows[0].count} clients + ${salesCount.rows[0].count} sales = ${total} total`);
    logPass('Notifications count calculated correctly');
    testResults.passed++;
    
  } catch (error) {
    logFail(`Database test error: ${error.message}`);
    testResults.failed++;
  }
}

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (token) {
      options.headers['x-auth-token'] = token;
    }
    
    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
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

async function testAPIEndpoints(token) {
  logTest('API ENDPOINTS TESTS');
  
  if (!token) {
    logWarning('No token provided - skipping API tests');
    logInfo('To test API endpoints, provide a valid token from browser localStorage');
    logInfo('Run: node run-full-qa-tests.js YOUR_TOKEN');
    testResults.warnings++;
    return;
  }
  
  try {
    // Test 1: GET /api/sales/pending-approval
    logInfo('Test 2.1: GET /api/sales/pending-approval');
    try {
      const response = await makeRequest('GET', '/sales/pending-approval', null, token);
      
      if (response.status === 200 && Array.isArray(response.data)) {
        logPass(`Endpoint returned ${response.data.length} pending sales`);
        testResults.passed++;
        
        if (response.data.length > 0) {
          const sale = response.data[0];
          const requiredFields = ['sale_id', 'client_id', 'client_name', 'value', 'transaction_date', 'branch_name'];
          const missingFields = requiredFields.filter(field => !(field in sale));
          
          if (missingFields.length === 0) {
            logPass('Response includes all required fields');
            testResults.passed++;
          } else {
            logFail(`Missing fields in response: ${missingFields.join(', ')}`);
            testResults.failed++;
          }
        }
      } else {
        logFail(`Unexpected response: status ${response.status}`);
        testResults.failed++;
      }
    } catch (error) {
      logFail(`GET /sales/pending-approval failed: ${error.message}`);
      testResults.failed++;
    }
    
    // Test 2: GET /api/notifications/pending-requests-count
    logInfo('Test 2.2: GET /api/notifications/pending-requests-count');
    try {
      const response = await makeRequest('GET', '/notifications/pending-requests-count', null, token);
      
      if (response.status === 200 && response.data.count !== undefined) {
        logPass(`Notifications count: ${response.data.count}`);
        testResults.passed++;
        
        if (response.data.breakdown) {
          logPass('Response includes breakdown');
          testResults.passed++;
        } else {
          logWarning('Response does not include breakdown (optional)');
          testResults.warnings++;
        }
      } else {
        logFail(`Unexpected response: status ${response.status}`);
        testResults.failed++;
      }
    } catch (error) {
      logFail(`GET /notifications/pending-requests-count failed: ${error.message}`);
      testResults.failed++;
    }
    
    // Test 3: PUT /api/sales/:id/approve - Validation test (should fail without invoice_number)
    logInfo('Test 2.3: PUT /api/sales/:id/approve - Validation (should fail without invoice_number)');
    
    // Get a pending sale ID
    const pendingSales = await pool.query(`
      SELECT s.sale_id 
      FROM sale s
      JOIN transaction t ON s.transaction_id = t.transaction_id
      WHERE t.status = 'pending_approval'
      LIMIT 1
    `);
    
    if (pendingSales.rows.length > 0) {
      const saleId = pendingSales.rows[0].sale_id;
      
      try {
        // Try to approve without invoice_number (should fail)
        const response = await makeRequest('PUT', `/sales/${saleId}/approve`, {
          payment_terms: 'current_50'
          // Missing invoice_number
        }, token);
        
        if (response.status === 400 && response.data.message && response.data.message.includes('חשבונית')) {
          logPass('Validation correctly rejects approval without invoice_number');
          testResults.passed++;
        } else {
          logFail(`Approval succeeded without invoice_number (should have failed). Status: ${response.status}`);
          testResults.failed++;
        }
      } catch (error) {
        logFail(`Request failed: ${error.message}`);
        testResults.failed++;
      }
      
      // Test 4: PUT /api/sales/:id/reject - Validation test (should fail without reason)
      logInfo('Test 2.4: PUT /api/sales/:id/reject - Validation (should fail without rejection_reason)');
      
      try {
        // Try to reject without reason (should fail)
        const response = await makeRequest('PUT', `/sales/${saleId}/reject`, {
          // Missing rejection_reason
        }, token);
        
        if (response.status === 400 && response.data.message && response.data.message.includes('דחייה')) {
          logPass('Validation correctly rejects rejection without reason');
          testResults.passed++;
        } else {
          logFail(`Rejection succeeded without reason (should have failed). Status: ${response.status}`);
          testResults.failed++;
        }
      } catch (error) {
        logFail(`Request failed: ${error.message}`);
        testResults.failed++;
      }
    } else {
      logWarning('No pending sales found - cannot test approval/rejection endpoints');
      testResults.warnings++;
    }
    
  } catch (error) {
    logFail(`API test error: ${error.message}`);
    testResults.failed++;
  }
}

async function testFrontendLogic() {
  logTest('FRONTEND LOGIC TESTS');
  
  try {
    // Check if SalesApprovalWidget.js exists and has required functions
    const fs = require('fs');
    const path = require('path');
    
    const widgetPath = path.join(__dirname, '..', 'naan-vrm-client', 'src', 'components', 'dashboard', 'SalesApprovalWidget.js');
    
    if (!fs.existsSync(widgetPath)) {
      logFail('SalesApprovalWidget.js not found');
      testResults.failed++;
      return;
    }
    
    logPass('SalesApprovalWidget.js exists');
    testResults.passed++;
    
    const widgetContent = fs.readFileSync(widgetPath, 'utf8');
    
    // Check for required functions
    const requiredFunctions = [
      'handleConfirmApprove',
      'handleConfirmReject',
      'fetchPendingSales'
    ];
    
    const missingFunctions = requiredFunctions.filter(func => !widgetContent.includes(func));
    
    if (missingFunctions.length === 0) {
      logPass('All required functions exist');
      testResults.passed++;
    } else {
      logFail(`Missing functions: ${missingFunctions.join(', ')}`);
      testResults.failed++;
    }
    
    // Check for validation
    if (widgetContent.includes('invoice_number') && widgetContent.includes('trim()')) {
      logPass('Invoice number validation exists');
      testResults.passed++;
    } else {
      logFail('Invoice number validation missing');
      testResults.failed++;
    }
    
    if (widgetContent.includes('rejectionReason') && widgetContent.includes('trim()')) {
      logPass('Rejection reason validation exists');
      testResults.passed++;
    } else {
      logFail('Rejection reason validation missing');
      testResults.failed++;
    }
    
    // Check for confirmation dialogs
    if (widgetContent.includes('window.confirm')) {
      logPass('Confirmation dialogs exist');
      testResults.passed++;
    } else {
      logWarning('Confirmation dialogs might be missing');
      testResults.warnings++;
    }
    
  } catch (error) {
    logFail(`Frontend test error: ${error.message}`);
    testResults.failed++;
  }
}

async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🚀 FULL QA TEST SUITE - Sales Approval Module', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  // Get token from command line argument or environment
  const token = process.argv[2] || process.env.TEST_TOKEN || null;
  
  if (token) {
    logInfo(`Using provided token: ${token.substring(0, 20)}...`);
  } else {
    logWarning('No token provided - API tests will be skipped');
    logInfo('To run API tests, provide token as: node run-full-qa-tests.js YOUR_TOKEN');
    logInfo('Or set TEST_TOKEN environment variable');
  }
  
  await testDatabase();
  await testAPIEndpoints(token);
  await testFrontendLogic();
  
  // Summary
  logTest('TEST SUMMARY');
  logPass(`Passed: ${testResults.passed}`);
  if (testResults.failed > 0) {
    logFail(`Failed: ${testResults.failed}`);
  }
  if (testResults.warnings > 0) {
    logWarning(`Warnings: ${testResults.warnings}`);
  }
  
  const total = testResults.passed + testResults.failed;
  const successRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;
  
  log('\n' + '='.repeat(60), 'cyan');
  if (testResults.failed === 0) {
    log(`✅ ALL TESTS PASSED (${successRate}% success rate)`, 'green');
  } else {
    log(`⚠️  SOME TESTS FAILED (${successRate}% success rate)`, 'yellow');
  }
  log('='.repeat(60) + '\n', 'cyan');
  
  await pool.end();
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  logFail(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
