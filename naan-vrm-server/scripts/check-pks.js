const { pool } = require('../db');

async function checkPKs() {
    const client = await pool.connect();
    try {
        const tables = ['client', 'supplier', 'sale', 'client_request'];
        for (const t of tables) {
            const res = await client.query(`
                SELECT a.attname
                FROM   pg_index i
                JOIN   pg_attribute a ON a.attrelid = i.indrelid
                                     AND a.attnum = ANY(i.indkey)
                WHERE  i.indrelid = $1::regclass
                AND    i.indisprimary;
            `, [t]);
            console.log(`Table ${t} PK: ${res.rows.map(r => r.attname).join(', ')}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

checkPKs();
