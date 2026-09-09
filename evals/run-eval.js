require("dotenv").config();
const fs = require("fs");
const path = require("path");
const cases = require("./cases.json");
const { runModelCall } = require("../src/llm/client");

async function run() {
  const promptPath = path.join(__dirname, "../prompts/parse-todo-v1.md");
  const promptText = fs.readFileSync(promptPath, "utf-8");
  let passed = 0;

  for (const c of cases) {
    const res = await runModelCall(promptText, c.input);
    if (res.status === "success" && res.data.category === c.expected_category) {
      passed++;
      console.log(`[PASS] Case ${c.id}: ${c.input}`);
    } else {
      console.log(`[FAIL] Case ${c.id}: ${c.input} | Got: ${res.data?.category}`);
    }
  }

  console.log(`\nFinal Score: ${passed}/${cases.length} (${(passed / cases.length) * 100}%)`);
}

run();