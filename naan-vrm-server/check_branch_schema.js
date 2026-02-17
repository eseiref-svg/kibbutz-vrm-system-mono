const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'naan_vrm', password: 'Zaq1Xsw2', port: 5432 });
client.connect()
    .then(() => client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'branch_balance'"))
    .then(res => {
        console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`));
        client.end();
    })
    .catch(e => {
        console.error(e);
        client.end();
    });
