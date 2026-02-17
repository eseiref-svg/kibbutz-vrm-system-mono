const { pool } = require('../db');

const MAPPING = {
    'plus_30': 'current_35',
    'plus_60': 'current_50',
    'plus_90': 'current_50' // fallback
};

async function cleanupPaymentTerms() {
    const client = await pool.connect();
    try {
        console.log('🧹 Cleaning up legacy payment terms (plus_30/60/90)...');
        await client.query('BEGIN');

        for (const [oldTerm, newTerm] of Object.entries(MAPPING)) {
            // Update Client
            const cRes = await client.query(`UPDATE client SET payment_terms = $1 WHERE payment_terms = $2`, [newTerm, oldTerm]);
            if (cRes.rowCount > 0) console.log(`Updated ${cRes.rowCount} clients from ${oldTerm} to ${newTerm}`);

            // Update Supplier
            const sRes = await client.query(`UPDATE supplier SET payment_terms = $1 WHERE payment_terms = $2`, [newTerm, oldTerm]);
            if (sRes.rowCount > 0) console.log(`Updated ${sRes.rowCount} suppliers from ${oldTerm} to ${newTerm}`);

            // Update Client Request
            const crRes = await client.query(`UPDATE client_request SET payment_terms = $1 WHERE payment_terms = $2`, [newTerm, oldTerm]);
            if (crRes.rowCount > 0) console.log(`Updated ${crRes.rowCount} client_requests from ${oldTerm} to ${newTerm}`);

            // Update Sale
            const saleRes = await client.query(`UPDATE sale SET payment_terms = $1 WHERE payment_terms = $2`, [newTerm, oldTerm]);
            if (saleRes.rowCount > 0) console.log(`Updated ${saleRes.rowCount} sales from ${oldTerm} to ${newTerm}`);
        }

        // Drop Constraint if exists (Optional safe effort)
        // Note: altering table constraints via script might be risky if we don't know the exact name.
        // We will skip dropping constraint for now as long as data is clean.

        await client.query('COMMIT');
        console.log('✅ Legacy payment terms cleanup complete.');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error cleaning payment terms:', err);
    } finally {
        client.release();
        pool.end();
    }
}

cleanupPaymentTerms();
