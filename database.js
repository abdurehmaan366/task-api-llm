const {Pool} = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// No need to create table, already done in init.sql

async function isEmpty() {
    const result = await pool.query(
        `SELECT COUNT(*) AS count FROM tasks`
    );

    const count = Number (result.rows[0].count);

    console.log(count);
    console.log(typeof(count));

    return count === 0;
}

exports.pool = pool;
exports.isEmpty = isEmpty;