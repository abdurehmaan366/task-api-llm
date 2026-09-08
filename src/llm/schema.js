const { z } = require("zod");

const inputSchema = z.object({
  text: z.string().min(1, "Text cannot be empty").max(500, "Text exceeds 500 characters"),
});

const outputSchema = z.object({
  title: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]),
  category: z.enum(["work", "personal", "shopping", "health", "finance", "other"]),
  confidence: z.number().min(0).max(1),
  reason: z.string().min(1),
});

module.exports = { inputSchema, outputSchema };