const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');
require("dotenv").config(); // to read .env file
const { isEmpty, pool } = require('./database');    // must be after 'require("dotenv").config();'
const taskRepository = require('./repos/taskRepository');
const fs = require("fs");
const path = require("path");
const { runModelCall } = require("./src/llm/client");
const { inputSchema, outputSchema } = require("./src/llm/schema");

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

app.post("/todos/parse", async (req, res) => {
  const parseResult = inputSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: parseResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    });
  }

  if (process.env.LLM_STUB === "1") {
    return res.status(200).json({
      title: parseResult.data.text.slice(0, 30),
      priority: "medium",
      category: "other",
      confidence: 0.9,
      reason: "Returned via stub mode",
    });
  }

  const promptPath = path.join(__dirname, "prompts/parse-todo-v1.md");
  const promptText = fs.readFileSync(promptPath, "utf-8");

  const result = await runModelCall(promptText, parseResult.data.text);

  if (result.status === "fallback") return res.status(200).json(result.data);
  if (result.status === "error") return res.status(result.code).json({ error: result.message });

  return res.status(200).json(result.data);
});

app.listen(port, () => {
    console.log(`Server Listening on http://127.0.0.1:${port}`)
})