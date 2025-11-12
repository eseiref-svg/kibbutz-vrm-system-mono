// Test the actual endpoint to see what's happening
const http = require('http');

async function testEndpoint() {
  return new Promise((resolve, reject) => {
    // First login
    const loginData = JSON.stringify({ email: 'manager@test.com', password: '111222333' });
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
    };

    const loginReq = http.request(loginOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const loginResult = JSON.parse(body);
        if (!loginResult.token) {
          return reject(new Error('Login failed'));
        }

        // Now test client request
        const clientData = JSON.stringify({
          branch_id: 15401,
          client_name: 'Test Client',
          poc_name: 'Test POC',
          poc_phone: '050-1234567'
        });

        const clientOptions = {
          hostname: 'localhost',
          port: 5000,
          path: '/api/client-requests',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': loginResult.token,
            'Content-Length': clientData.length
          }
        };

        const clientReq = http.request(clientOptions, (res2) => {
          let body2 = '';
          res2.on('data', (chunk) => { body2 += chunk; });
          res2.on('end', () => {
            console.log('Status:', res2.statusCode);
            console.log('Response:', body2);
            if (res2.statusCode === 201) {
              resolve(JSON.parse(body2));
            } else {
              reject(new Error(`HTTP ${res2.statusCode}: ${body2}`));
            }
          });
        });

        clientReq.on('error', reject);
        clientReq.write(clientData);
        clientReq.end();
      });
    });

    loginReq.on('error', reject);
    loginReq.write(loginData);
    loginReq.end();
  });
}

testEndpoint()
  .then(result => {
    console.log('\n✅ Success!');
    console.log('Result:', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });

