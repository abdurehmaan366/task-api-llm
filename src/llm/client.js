const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const { outputSchema } = require("./schema");

const client = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
  timeout: 30000,
  maxRetries: 0, // Explicitly controlled
});

function logQuarantine(data) {
  const logDir = path.join(__dirname, "../../logs");
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  fs.appendFileSync(
    path.join(logDir, "quarantine.jsonl"),
    JSON.stringify({ timestamp: new Date().toISOString(), ...data }) + "\n"
  );
}

function cleanJsonResponse(rawText) {
  return rawText.replace(/```json/g, "").replace(/```/g, "").trim();
}

async function runModelCall(promptText, userText) {
  if (process.env.LLM_ENABLED === "false") {
    return {
      status: "fallback",
      data: {
        title: userText,
        priority: "medium",
        category: "other",
        confidence: 0.0,
        reason: "LLM disabled via kill switch",
      },
    };
  }

  const startTime = Date.now();
  let repairs = 0;

  try {
    const response = await client.chat.completions.create({
      model: process.env.LLM_MODEL,
      temperature: 0.1,
      messages: [
        { role: "system", content: promptText },
        { role: "user", content: JSON.stringify({ text: userText }) },
      ],
    });

    let rawContent = response.choices[0]?.message?.content || "";
    let parsed;

    try {
      parsed = JSON.parse(cleanJsonResponse(rawContent));
    } catch (e) {
      parsed = null;
    }

    let validated = outputSchema.safeParse(parsed);

    // Single repair attempt if validation failed
    if (!validated.success) {
      repairs++;
      const repairResponse = await client.chat.completions.create({
        model: process.env.LLM_MODEL,
        temperature: 0.1,
        messages: [
          { role: "system", content: promptText },
          { role: "user", content: JSON.stringify({ text: userText }) },
          { role: "assistant", content: rawContent },
          {
            role: "user",
            content: `Your previous response failed validation with error: ${JSON.stringify(
              validated.error || "Invalid JSON"
            )}. Return ONLY valid corrected JSON matching the schema.`,
          },
        ],
      });

      rawContent = repairResponse.choices[0]?.message?.content || "";
      try {
        parsed = JSON.parse(cleanJsonResponse(rawContent));
      } catch (e) {
        parsed = null;
      }
      validated = outputSchema.safeParse(parsed);
    }

    const duration = Date.now() - startTime;
    console.log(
      JSON.stringify({
        level: "info",
        event: "llm_call",
        model: process.env.LLM_MODEL,
        tokens_in: response.usage?.prompt_tokens || 0,
        tokens_out: response.usage?.completion_tokens || 0,
        duration_ms: duration,
        repairs,
      })
    );

    if (!validated.success) {
      logQuarantine({ input: userText, rawOutput: rawContent, error: validated.error });
      return { status: "error", code: 422, message: "Model output failed schema validation" };
    }

    return { status: "success", data: validated.data };
  } catch (err) {
    if (err.status === 401 || err.status === 400 || err.status === 403) {
      return { status: "error", code: err.status, message: err.message };
    }
    return { status: "error", code: 504, message: "LLM call timed out or failed" };
  }
}

module.exports = { runModelCall };