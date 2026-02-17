const { pool } = require('../db');

async function verify() {
    const client = await pool.connect();
    try {
        const { rows: tables } = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT IN ('migrations', 'spatial_ref_sys')
    `);

        console.log('📊 Verifying row counts:');
        for (const t of tables) {
            const { rows } = await client.query(`SELECT COUNT(*) as count FROM public."${t.tablename}"`);
            console.log(` - ${t.tablename}: ${rows[0].count}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

verify();
