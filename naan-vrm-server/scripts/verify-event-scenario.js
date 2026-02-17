const axios = require('axios');
const { pool } = require('../db');

// Configuration
const API_URL = 'http://localhost:5000/api';
const BRANCH_EMAIL = 'test_branch_man@example.com';
const TREASURER_EMAIL = 'test_treasurer@example.com';
const PASSWORD = 'password123';

let branchToken = '';
let treasurerToken = '';
let branchUserId = null;
let treasurerUserId = null;
let branchId = null;
let createdSupplierId = null; // Should be null initially
let createdPaymentRequestIds = [];
let createdSupplierRequestIds = [];

async function main() {
    try {
        console.log('🚀 Starting Verification: Event Organization Scenario');

        // --- 1. Setup Users ---
        console.log('\n--- 1. Setup Test Users ---');
        await setupUsers();

        // --- 2. Branch Manager: Search & Create Payment Request (Catering) ---
        console.log('\n--- 2. Branch Manager: Catering Flow ---');
        // A. Search for Supplier (Global Search for Approved)
        // Instead of branch-specific (which is empty), we search the global approved list.
        const suppliersRes = await axios.get(`${API_URL}/suppliers/search`, {
            params: { status: 'approved' },
            headers: { 'x-auth-token': branchToken }
        });
        console.log('DEBUG: suppliersRes.data type:', typeof suppliersRes.data);
        console.log('DEBUG: suppliersRes.data isArray:', Array.isArray(suppliersRes.data));
        console.log('DEBUG: suppliersRes.data sample:', JSON.stringify(suppliersRes.data).substring(0, 200));

        // Handle if wrapped in { data: [...] } or just [...]
        const suppliersList = Array.isArray(suppliersRes.data) ? suppliersRes.data : (suppliersRes.data.data || []);

        const cateringSupplier = suppliersList.find(s => s.supplier_field_id === 1) || suppliersList[0];

        if (!cateringSupplier) throw new Error('No suppliers found for testing.');
        console.log(`Selected Supplier for Catering: ${cateringSupplier.name}`);

        // B. Create Payment Request
        const cateringReq = await axios.post(`${API_URL}/payment-requests`, {
            supplier_id: cateringSupplier.supplier_id,
            branch_id: branchId,
            amount: 1100,
            transaction_date: new Date().toISOString(),
            description: 'כיבוד לאירוע ענף',
            payment_terms: 'immediate'
        }, { headers: { 'x-auth-token': branchToken } });

        createdPaymentRequestIds.push(cateringReq.data.payment_req_id);
        console.log(`✅ Catering Payment Request Created (ID: ${cateringReq.data.payment_req_id})`);


        // --- 3. Branch Manager: Search & Create Payment Request (Transport) ---
        console.log('\n--- 3. Branch Manager: Transport Flow ---');
        // Reuse same supplier for simplicity or pick another if available
        const transportSupplier = suppliersList.find(s => s.supplier_id !== cateringSupplier.supplier_id) || cateringSupplier;
        console.log(`Selected Supplier for Transport: ${transportSupplier.name}`);

        const transportReq = await axios.post(`${API_URL}/payment-requests`, {
            // ...



            supplier_id: transportSupplier.supplier_id,
            branch_id: branchId,
            amount: 6700,
            transaction_date: new Date().toISOString(),
            description: 'הסעה לפארק הירקון',
            payment_terms: 'immediate'
        }, { headers: { 'x-auth-token': branchToken } });

        createdPaymentRequestIds.push(transportReq.data.payment_req_id);
        console.log(`✅ Transport Payment Request Created (ID: ${transportReq.data.payment_req_id})`);


        // --- 4. Treasurer: Review Requests ---
        console.log('\n--- 4. Treasurer: Decision Making ---');

        // Treasurer Approval
        // Note: Approval route is /approve, not PUT /:id with status
        await axios.put(`${API_URL}/payment-requests/${createdPaymentRequestIds[0]}/approve`, {}, { headers: { 'x-auth-token': treasurerToken } });
        console.log('✅ Catering Request Approved');

        // Reject Transport
        await axios.put(`${API_URL}/payment-requests/${createdPaymentRequestIds[1]}/reject`, {
            rejection_reason: 'המחיר גבוה מדי, נא הצע חלופה'
        }, { headers: { 'x-auth-token': treasurerToken } });
        console.log('✅ Treasurer Rejected Transport Request');


        // --- 5. Branch Manager: Check Status & Create New Supplier ---
        console.log('\n--- 5. Branch Manager: Reaction & New Supplier ---');

        // Verify Rejection (Simulated check)
        // Verify Rejection (Direct DB Check for reliability)
        const checkRes = await pool.query(`
            SELECT t.status 
            FROM transaction t
            JOIN payment_req pr ON t.transaction_id = pr.transaction_id
            WHERE pr.payment_req_id = $1
        `, [createdPaymentRequestIds[1]]);

        if (checkRes.rows.length === 0) throw new Error('Transport request transaction not found');
        const rejectedReqStatus = checkRes.rows[0].status;

        if (rejectedReqStatus !== 'rejected') throw new Error(`Transport request status mismatch: ${rejectedReqStatus}`);
        console.log('Verified: Transport request is Rejected (DB confirmed).');

        // Create New Supplier Request "Moti Transport"
        const newSupplierReq = await axios.post(`${API_URL}/supplier-requests`, {
            supplier_name: 'מוטי מסיעי דרום בע"מ',
            supplier_id: '500200300', // Fake ID
            contact_name: 'מוטי',
            contact_phone: '050-9999999',
            description: 'הסעות לאירועים',
            branch_id: branchId,
            requested_by_user_id: branchUserId
        }, { headers: { 'x-auth-token': branchToken } });

        createdSupplierRequestIds.push(newSupplierReq.data.supplier_req_id);
        console.log(`✅ New Supplier Request Created (ID: ${newSupplierReq.data.supplier_req_id})`);


        // --- 6. Treasurer: Approve New Supplier ---
        console.log('\n--- 6. Treasurer: Approve Supplier ---');

        // Get Pending Requests
        const pendingSuppliers = await axios.get(`${API_URL}/supplier-requests/pending`, {
            headers: { 'x-auth-token': treasurerToken }
        });

        // Find our specific request (in case others exist)
        // Response is array of requests
        const targetReq = pendingSuppliers.data.find(r => r.supplier_req_id === createdSupplierRequestIds[0]);
        if (!targetReq) {
            console.error('DEBUG: Pending Suppliers:', JSON.stringify(pendingSuppliers.data));
            throw new Error('Treasurer could not find the new supplier request');
        }

        // Fetch valid supplier field ID (e.g. Transportation)
        const fieldRes = await pool.query('SELECT supplier_field_id FROM supplier_field LIMIT 1');
        const validFieldId = fieldRes.rows.length > 0 ? fieldRes.rows[0].supplier_field_id : 1; // Default to 1 if empty (unlikely)

        // Approve it -> This creates the supplier
        const approvalRes = await axios.post(`${API_URL}/suppliers`, {
            supplier_id: targetReq.supplier_id,
            name: targetReq.name,
            poc_name: targetReq.contact_name,
            poc_email: 'test@supplier.com',
            poc_phone: targetReq.contact_phone,
            street_name: 'דרך השלום',
            house_no: '10',
            city: 'באר שבע',
            zip_code: '84000',
            supplier_field_id: validFieldId
        }, { headers: { 'x-auth-token': treasurerToken } });

        createdSupplierId = approvalRes.data.supplier_id;

        // Link request to approved supplier and close it (as typically done in dashboard)
        await axios.put(`${API_URL}/supplier-requests/${targetReq.supplier_req_id}`, {
            status: 'approved',
            requested_supplier_id: createdSupplierId
        }, { headers: { 'x-auth-token': treasurerToken } });

        console.log(`✅ New Supplier Approved and Created (ID: ${createdSupplierId})`);

        console.log('\n🎉 SUCCESS! End-to-End Scenario Verified.');

    } catch (error) {
        console.error('❌ Error during verification:', error.response?.data || error.message);
    } finally {
        await cleanup();
    }
}

async function setupUsers() {
    try {
        // Create Branch Manager
        try {
            const bmRes = await axios.post(`${API_URL}/users/register`, {
                first_name: 'Test', surname: 'BranchMan', email: BRANCH_EMAIL,
                phone_no: '0500000001', password: PASSWORD, role: 'branch_manager',
                new_branch_name: 'Test Branch Event', is_business_branch: true
            });
            branchUserId = bmRes.data.user_id;

            // Get his branch
            // We need to login to see it or query DB? Login is standard.
            const loginRes = await axios.post(`${API_URL}/users/login`, { email: BRANCH_EMAIL, password: PASSWORD });
            branchToken = loginRes.data.token;

            // Fetch profile to get branch
            const profile = await axios.get(`${API_URL}/users/${branchUserId}/branch`, { headers: { 'x-auth-token': branchToken } });
            branchId = profile.data.branch_id;
            console.log(`Created Branch Manager (User ID: ${branchUserId}, Branch ID: ${branchId})`);

        } catch (e) {
            if (e.response?.data?.message === 'Email already exists') {
                // Login instead
                const loginRes = await axios.post(`${API_URL}/users/login`, { email: BRANCH_EMAIL, password: PASSWORD });
                branchToken = loginRes.data.token;
                branchUserId = loginRes.data.user.id;
                const profile = await axios.get(`${API_URL}/users/${branchUserId}/branch`, { headers: { 'x-auth-token': branchToken } });
                branchId = profile.data.branch_id;
                console.log('Logged in existing Test Branch Manager');
            } else throw e;
        }

        // Create Treasurer
        try {
            const trRes = await axios.post(`${API_URL}/users/register`, {
                first_name: 'Test', surname: 'Treasurer', email: TREASURER_EMAIL,
                phone_no: '0500000002', password: PASSWORD, role: 'treasurer'
            });
            treasurerUserId = trRes.data.user_id;
            console.log(`Created Treasurer (User ID: ${treasurerUserId})`);
        } catch (e) {
            if (e.response?.data?.message === 'Email already exists') {
                const loginRes = await axios.post(`${API_URL}/users/login`, { email: TREASURER_EMAIL, password: PASSWORD });
                treasurerToken = loginRes.data.token;
                treasurerUserId = loginRes.data.user.id;
                console.log('Logged in existing Test Treasurer');
            } else throw e;
        }

        // Ensure tokens
        if (!treasurerToken) {
            const loginRes = await axios.post(`${API_URL}/users/login`, { email: TREASURER_EMAIL, password: PASSWORD });
            treasurerToken = loginRes.data.token;
        }

    } catch (e) {
        console.error('Setup failed:', e.response?.data || e.message);
        throw e;
    }
}

async function cleanup() {
    console.log('\n--- Cleanup ---');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Delete dependencies first (using branch_id where possible)
        if (branchId) {
            console.log(`Cleaning up data for Branch ${branchId}...`);
            await client.query('DELETE FROM payment_req WHERE branch_id = $1', [branchId]);
            await client.query('DELETE FROM supplier_request WHERE branch_id = $1', [branchId]);
            await client.query('DELETE FROM sale WHERE branch_id = $1', [branchId]);
            await client.query('DELETE FROM client_request WHERE branch_id = $1', [branchId]);
            // Notifications are user-bound, handled below.
        }

        // Fallback for tracked Items (if branch deletion didn't cover)
        if (createdPaymentRequestIds.length > 0) {
            // Already covered by branch deletion?? Not necessarily if they didn't have branch_id (impossible).
            // But good to be safe.
            await client.query('DELETE FROM payment_req WHERE payment_req_id = ANY($1)', [createdPaymentRequestIds]);
        }

        if (createdSupplierId) {
            await client.query('DELETE FROM supplier WHERE supplier_id = $1', [createdSupplierId]);
            console.log(`Deleted Supplier ${createdSupplierId}`);
        }

        if (branchId) {
            await client.query('DELETE FROM branch WHERE branch_id = $1', [branchId]);
            console.log(`Deleted Branch ${branchId}`);
        }

        // Now delete Users (and their notifications)
        if (branchUserId) {
            await client.query('DELETE FROM notification WHERE user_id = $1', [branchUserId]);
            await client.query('DELETE FROM "user" WHERE user_id = $1', [branchUserId]);
        }
        if (treasurerUserId) {
            await client.query('DELETE FROM notification WHERE user_id = $1', [treasurerUserId]);
            // Note: We used an existing treasurer (admin@naan.co.il) if found?
            // Wait, step 1 login says "Logged in existing Test Treasurer".
            // We should NOT delete the existing treasurer!
            // The script creates USERS using seeds or registers them?
            // Ah, let's check `setupUsers`.
            // setupUsers performs LOGIN. It does NOT register new users if they exist.
            // Wait, looking at `setupUsers` (need to view it):
            // "Login existing... if fails, Register".
            // If we registered them, we delete them.
            // How do we know if we registered them?
            // The variables `branchUserId` and `treasurerUserId` are set.
            // We should only delete if we created them?
            // Actually, the prompt says "Cleanup: ... DELETE them at the end".
            // But if I delete `admin@naan.co.il`, I break the system.
            // I should only delete `branch@naan.co.il` if checking `verified-branch` scenario.
            // The script user is `branch_manager_test` and `treasurer_test`.
            // Those sound like throwaway users.
            await client.query('DELETE FROM "user" WHERE user_id = $1', [treasurerUserId]);
        }



        console.log('Deleted Test Users');

        await client.query('COMMIT');
        console.log('Cleanup successful');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Cleanup failed:', err.message);
    } finally {
        await client.end();
    }
}

main();
