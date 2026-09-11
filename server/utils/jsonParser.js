/**
 * Resiliently cleans and parses JSON from AI responses that may include:
 * - Markdown code blocks (```json ... ```)
 * - Preamble or postscript text outside the JSON structure
 * - Minor trailing commas
 */
export function cleanAndParseJson(text, fallback = null) {
  if (!text || typeof text !== "string") {
    if (fallback !== null) return fallback;
    throw new Error("Cannot parse empty or non-string AI response.");
  }

  // 1. Strip markdown code fence blocks if present
  let cleaned = text
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/\s*```$/im, "")
    .trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue to regex extraction
  }

  // 2. Extract outermost JSON object {...}
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch {
      try {
        const withoutTrailingCommas = objectMatch[0].replace(/,\s*([}\]])/g, "$1");
        return JSON.parse(withoutTrailingCommas);
      } catch {}
    }
  }

  // 3. Extract outermost JSON array [...]
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch {
      try {
        const withoutTrailingCommas = arrayMatch[0].replace(/,\s*([}\]])/g, "$1");
        return JSON.parse(withoutTrailingCommas);
      } catch {}
    }
  }

  if (fallback !== null) {
    return fallback;
  }

  throw new Error("No valid JSON structure found in AI response.");
}

export default cleanAndParseJson;

