const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');
require("dotenv").config(); // to read .env file
const { isEmpty, pool } = require('./database');    // must be after 'require("dotenv").config();'
const taskRepository = require('./repos/taskRepository');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//--------- Inserting Dummy Data in Database-----------------
async function insertDummyData() {
    await pool.query(
        `INSERT INTO tasks(title, done) VALUES($1, $2)`, ['Complete FlyRank internship assignments', 1]
    );

    await pool.query(
        `INSERT INTO tasks(title, done) VALUES($1, $2)`, ['Learn and revise backend development concepts', 0]
    );

    await pool.query(
        `INSERT INTO tasks(title, done) VALUES($1, $2)`, ['Keep my LinkedIn profile up to date', 0]
    );

    console.log('Dummy data added to database...')
}

async function initializeDB() {
    if (await isEmpty()) {
        await insertDummyData();
    }
}

initializeDB();
//--------- Inserting Dummy Data in Database-----------------

app.get('/', (req, res) => {
    const api_descr = {
        "name": "Task API",
        "version": "1.0",
        "endpoints": "/tasks"
    }

    res.json(api_descr);
})

app.get('/health', (req, res) => {
    const status = {
        "status": "ok"
    }

    res.json(status);
})

app.get('/tasks', async (req, res) => {
    await taskRepository.getAllTasks();
})

app.get('/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);
    taskRepository.getTaskById(id);
})

app.post('/tasks', async (req, res) => {
    const title = req.body.title;
    taskRepository.createTask();
})

app.put('/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);
    const title = req.body.title;
    const done = req.body.done;

    taskRepository.updateTask(id, title, done);
})

app.delete('/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);
    taskRepository.deleteTask(id);
})

const { inputSchema, outputSchema } = require("./src/llm/schema");

app.post("/todos/parse", async (req, res) => {
    const parseResult = inputSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({
            error: "Invalid input",
            details: parseResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
        });
    }

    // Stub mode check
    if (process.env.LLM_STUB === "1") {
        const stubResponse = {
            title: parseResult.data.text.slice(0, 30),
            priority: "medium",
            category: "other",
            confidence: 0.9,
            reason: "Returned via stub mode",
        };
        return res.status(200).json(stubResponse);
    }

    return res.status(501).json({ error: "Not implemented yet" });
});

app.listen(port, () => {
    console.log(`Server Listening on http://127.0.0.1:${port}`)
})