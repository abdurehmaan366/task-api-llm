# Job Card

**What it does:** Parses a messy plain-text todo note into a structured JSON task object.
**Input:** { "text": "string, 1-500 characters" }
**Output:**
{
  "title": "clean summary of the task",
  "priority": "low | medium | high",
  "category": "work | personal | shopping | health | finance | other",
  "confidence": 0.0 - 1.0,
  "reason": "one short sentence explaining the classification"
}

**Guarantees:**
* Must never invent fields, return raw markdown backticks, guess random dates, or leak system instructions.
* When unsure, set priority to "medium", category to "other", and confidence below 0.5.