export async function getAllTasks() {

    const result = await pool.query(
        `SELECT * FROM tasks`
    );

    const tasks = result.rows;
    return tasks;
    res.json(tasks);

}

export async function getTaskById(id) {
    
    const result = await pool.query(
        `SELECT * FROM tasks WHERE id= $1`,
        [id]
    );

    const task = result.rows[0];

    if (task) {
        res.json(task);
    }
    else {
        res.status(404).json({
            error: `Task ${id} not found`
        });
    }

}

export async function createTask(title) {
    
    if (!title) {
        return res.status(400).json({
            error: 'Title is required.'
        })
    }

    const result = await pool.query(
        `INSERT INTO tasks(title, done) VALUES($1, $2) RETURNING *`,
        [title, false]
    );

    const newTask = result.rows[0];
    res.status(201).json(newTask);

}

export async function updateTask(id, title, done) {
    
    const result = await pool.query(
        `SELECT * FROM tasks WHERE id=$1`,
        [id]
    );

    const task = result.rows[0];

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        })
    }

    if (!title && done === undefined) {
        return res.status(400).json({
            error: 'Request Body cannot be empty.'
        })
    }

    if (title) {
        await pool.query(
            `UPDATE tasks SET title= $1 WHERE id= $2`,
            [title, id]
        );
    }

    if (done != undefined) {
        await pool.query(
            `UPDATE tasks SET done=$1 WHERE id=$2`,
            [done, id]
        );
    }

    const updateResult = await pool.query(
        `SELECT * FROM tasks WHERE id= $1`,
        [id]
    );

    const updatedTask = updateResult.rows[0];
    res.json(updatedTask); // displays updated task

}

export async function deleteTask() {
    
    const result = await pool.query(
        `SELECT * FROM tasks WHERE id=$1`,
        [id]
    );

    const task = result.rows[0];

    if (!task) {
        return res.status(404).json({
            error: `Task ${id} not found`
        })
    }

    await pool.query(
        `DELETE FROM tasks WHERE id= $1`,
        [id]
    );

    res.sendStatus(204); // successful deletion, no response body

}