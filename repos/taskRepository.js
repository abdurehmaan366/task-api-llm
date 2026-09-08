const pool = require('../database');

async function getAllTasks() {
    const result = await pool.query(
        `SELECT * FROM tasks`
    );

    return result.rows;
}

async function getTaskById(id) {
    const result = await pool.query(
        `SELECT * FROM tasks WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

async function createTask(title) {
    if (!title) {
        throw new Error("Title is required.");
    }

    const result = await pool.query(
        `INSERT INTO tasks(title, done) VALUES($1, $2) RETURNING *`,
        [title, false]
    );

    return result.rows[0];
}

async function updateTask(id, title, done) {
    const result = await pool.query(
        `SELECT * FROM tasks WHERE id = $1`,
        [id]
    );

    const task = result.rows[0];

    if (!task) {
        return null;
    }

    if (!title && done === undefined) {
        throw new Error("Request Body cannot be empty.");
    }

    if (title) {
        await pool.query(
            `UPDATE tasks SET title = $1 WHERE id = $2`,
            [title, id]
        );
    }

    if (done !== undefined) {
        await pool.query(
            `UPDATE tasks SET done = $1 WHERE id = $2`,
            [done, id]
        );
    }

    const updateResult = await pool.query(
        `SELECT * FROM tasks WHERE id = $1`,
        [id]
    );

    return updateResult.rows[0];
}

async function deleteTask(id) {
    const result = await pool.query(
        `SELECT * FROM tasks WHERE id = $1`,
        [id]
    );

    const task = result.rows[0];

    if (!task) {
        return null;
    }

    await pool.query(
        `DELETE FROM tasks WHERE id = $1`,
        [id]
    );

    return true;
}

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};