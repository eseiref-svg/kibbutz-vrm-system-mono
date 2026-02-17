const { pool } = require('../db');

const validTerms = ['immediate', 'current_15', 'current_35', 'current_50'];

function getReplacementTerm(term) {
    if (!term) return 'current_35'; // Default
    const t = term.toString().toLowerCase();

    // Check if already valid
    if (validTerms.includes(t)) return t;

    // Handle Legacy English
    if (t.includes('plus_30')) return 'current_35';
    if (t.includes('plus_60')) return 'current_50';
    if (t.includes('plus_90')) return 'current_50';

    // Handle Hebrew
    if (t.includes('שוטף')) {
        if (t.includes('30')) return 'current_35';
        if (t.includes('60')) return 'current_50';
        if (t.includes('90')) return 'current_50';
    }

    // Handle "Meyadi"
    if (t.includes('מיידי')) return 'immediate';

    // Random fallback for unknown junk
    return validTerms[Math.floor(Math.random() * validTerms.length)];
}

async function forceCleanup() {
    const client = await pool.connect();
    try {
        console.log('🧹 Force Cleaning Payment Terms...');
        await client.query('BEGIN');

        const tables = ['client', 'supplier', 'sale', 'client_request'];

        for (const table of tables) {
            console.log(`Processing table: ${table}...`);
            // Fetch all rows
            // Note: Some tables might not have 'id', need specific PK.
            // client -> client_id
            // supplier -> supplier_id
            // sale -> sale_id
            // payment_req -> payment_req_id
            // client_request -> request_id
            // supplier_request -> request_id

            let pk = `${table}_id`;
            if (table === 'client_request') pk = 'client_req_id';

            const res = await client.query(`SELECT ${pk}, payment_terms FROM ${table}`);

            let updates = 0;
            for (const row of res.rows) {
                const current = row.payment_terms;
                const replacement = getReplacementTerm(current);

                if (current !== replacement) {
                    await client.query(`UPDATE ${table} SET payment_terms = $1 WHERE ${pk} = $2`, [replacement, row[pk]]);
                    updates++;
                }
            }
            console.log(`  -> Updated ${updates} rows in ${table}.`);
        }

        await client.query('COMMIT');
        console.log('✅ Terms cleanup complete.');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error cleaning terms:', err);
    } finally {
        client.release();
        pool.end();
    }
}

forceCleanup();
