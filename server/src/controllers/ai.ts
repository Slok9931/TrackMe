import { Request, Response } from "express";
import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SUMMARY_SECTION_KEYS = [
  "Approach",
  "Complexity",
  "Algorithm",
  "Mistakes(if any)",
  "Optimisation",
  "Key insights",
] as const;

type SummarySectionKey = (typeof SUMMARY_SECTION_KEYS)[number];
type SummarySections = Record<SummarySectionKey, string>;

const SUMMARY_KEY_ALIASES: Record<string, SummarySectionKey> = {
  approach: "Approach",
  complexity: "Complexity",
  algorithm: "Algorithm",
  mistakes: "Mistakes(if any)",
  mistakesifany: "Mistakes(if any)",
  optimisation: "Optimisation",
  optimization: "Optimisation",
  keyinsights: "Key insights",
  insights: "Key insights",
};

const createEmptySummarySections = (): SummarySections => ({
  Approach: "",
  Complexity: "",
  Algorithm: "",
  "Mistakes(if any)": "",
  Optimisation: "",
  "Key insights": "",
});

const countBullets = (text: string): number => (text.match(/^[\t ]*[-*]\s+/gm) || []).length;

const countNonEmptyLines = (text: string): number =>
  text
    .replace(/```json|```/gi, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;

const isSummaryTooSparse = (rawText: string, normalizedMarkdown: string): boolean => {
  const rawLineCount = countNonEmptyLines(rawText);
  const bulletCount = countBullets(normalizedMarkdown);

  if (rawLineCount < 8) {
    return true;
  }

  if (bulletCount < 7) {
    return true;
  }

  return false;
};

const normalizeSectionKey = (key: string): SummarySectionKey | null => {
  const normalized = key.toLowerCase().replace(/[^a-z]/g, "");
  return SUMMARY_KEY_ALIASES[normalized] || null;
};

const coerceSectionValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim().replace(/\\r?\\n/g, "\n");
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : String(item)))
      .filter(Boolean)
      .join("\n");
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value && typeof value === "object") {
    const candidate = value as { text?: unknown; content?: unknown };
    if (typeof candidate.text === "string") {
      return candidate.text.trim().replace(/\\r?\\n/g, "\n");
    }
    if (typeof candidate.content === "string") {
      return candidate.content.trim().replace(/\\r?\\n/g, "\n");
    }
  }

  return "";
};

const extractFirstBalancedJsonObject = (text: string): string | null => {
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (start === -1) {
      if (ch === "{") {
        start = i;
        depth = 1;
      }
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") {
      depth++;
      continue;
    }

    if (ch === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
};

const pickSummarySections = (candidate: unknown): SummarySections | null => {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const sections = createEmptySummarySections();
  let found = false;

  for (const [rawKey, rawValue] of Object.entries(candidate as Record<string, unknown>)) {
    const mappedKey = normalizeSectionKey(rawKey);
    if (!mappedKey) continue;

    const textValue = coerceSectionValue(rawValue);
    if (!textValue) continue;

    sections[mappedKey] = textValue;
    found = true;
  }

  return found ? sections : null;
};

const decodeJsonLikeString = (value: string): string => {
  let normalized = value.trim();
  normalized = normalized.replace(/\\r\\n/g, "\n");
  normalized = normalized.replace(/\\n/g, "\n");
  normalized = normalized.replace(/\\t/g, "\t");
  normalized = normalized.replace(/\\"/g, '"');
  normalized = normalized.replace(/\\\\/g, "\\");
  return normalized.trim();
};

const parsePartialSummaryJson = (rawText: string): SummarySections | null => {
  const text = rawText.replace(/```json|```/gi, "").trim();

  const keyPattern = /"(Approach|Complexity|Algorithm|Mistakes\(if any\)|Mistakes|Optimisation|Optimization|Key insights)"\s*:\s*"/gi;
  const keyMatches: Array<{ key: SummarySectionKey; keyStart: number; valueStart: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = keyPattern.exec(text)) !== null) {
    const mapped = normalizeSectionKey(match[1]);
    if (!mapped) continue;
    keyMatches.push({
      key: mapped,
      keyStart: match.index,
      valueStart: keyPattern.lastIndex,
    });
  }

  if (keyMatches.length === 0) {
    return null;
  }

  const sections = createEmptySummarySections();
  let found = false;

  for (let i = 0; i < keyMatches.length; i++) {
    const current = keyMatches[i];
    const next = keyMatches[i + 1];
    const end = next ? next.keyStart : text.length;

    let valueRaw = text.slice(current.valueStart, end);
    if (next) {
      valueRaw = valueRaw.replace(/",?\s*$/, "");
    } else {
      valueRaw = valueRaw.replace(/"\s*\}?\s*$/, "");
    }

    const value = decodeJsonLikeString(valueRaw);
    if (!value) continue;

    sections[current.key] = value;
    found = true;
  }

  return found ? sections : null;
};

const buildSummaryMarkdown = (sections: SummarySections): string => {
  return SUMMARY_SECTION_KEYS.map((sectionKey) => {
    // Get section body and handle escaped newlines
    let sectionBody = sections[sectionKey].trim() || "Not provided by the model.";
    // Replace multiple escaped newline patterns
    sectionBody = sectionBody.replace(/\\n/g, "\n");
    sectionBody = sectionBody.replace(/\\r\\n/g, "\n");
    sectionBody = sectionBody.replace(/\\t/g, "\t");
    return `### ${sectionKey}\n${sectionBody}`;
  }).join("\n\n");
};

const parseSummaryJson = (rawText: string): SummarySections | null => {
  try {
    const cleanedText = rawText.replace(/```json|```/gi, "").trim();

    // Try direct JSON parse first (common when model returns pure JSON)
    try {
      const direct = JSON.parse(cleanedText);
      const directSections = pickSummarySections(direct) || pickSummarySections((direct as any)?.summary);
      if (directSections) {
        return directSections;
      }
    } catch (e) {
      // fallthrough to brace-based extraction
    }

    const jsonString = extractFirstBalancedJsonObject(cleanedText);
    if (!jsonString) {
      return parsePartialSummaryJson(cleanedText);
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      return parsePartialSummaryJson(cleanedText);
    }

    return pickSummarySections(parsed) || pickSummarySections(parsed?.summary) || parsePartialSummaryJson(cleanedText);
  } catch (error: any) {
    return null;
  }
};

const parseMarkdownSummary = (rawText: string): SummarySections | null => {
  const sections = createEmptySummarySections();
  const lines = rawText.replace(/\r\n/g, "\n").split("\n");
  let currentSection: SummarySectionKey | null = null;
  let foundAnySection = false;

  const normalizeHeading = (line: string): SummarySectionKey | null => {
    const cleanedLine = line.trim().replace(/^#{1,6}\s*/, "");
    const headingMatch = cleanedLine.match(/^(?:\d+\)\s*)?(Approach|Complexity|Algorithm|Mistakes(?:\s*\(if any\))?|Optimisation|Optimization|Key insights)\s*:?$/i);

    if (!headingMatch) {
      return null;
    }

    const normalized = headingMatch[1].toLowerCase();
    if (normalized.startsWith("approach")) return "Approach";
    if (normalized.startsWith("complexity")) return "Complexity";
    if (normalized.startsWith("algorithm")) return "Algorithm";
    if (normalized.startsWith("mistakes")) return "Mistakes(if any)";
    if (normalized.startsWith("optimisation") || normalized.startsWith("optimization")) return "Optimisation";
    return "Key insights";
  };

  for (const line of lines) {
    const heading = normalizeHeading(line);
    if (heading) {
      currentSection = heading;
      foundAnySection = true;
      continue;
    }

    if (currentSection) {
      sections[currentSection] = `${sections[currentSection]}${sections[currentSection] ? "\n" : ""}${line}`.trimEnd();
    }
  }

  return foundAnySection ? sections : null;
};

const normalizeSummaryText = (rawText: string): string => {
  
  const jsonSections = parseSummaryJson(rawText);
  if (jsonSections) {
    return buildSummaryMarkdown(jsonSections);
  }

  const markdownSections = parseMarkdownSummary(rawText);
  if (markdownSections) {
    return buildSummaryMarkdown(markdownSections);
  }

  const cleanedText = rawText.replace(/```json|```/gi, "").trim();
  const looksLikeJson =
    cleanedText.startsWith("{") ||
    cleanedText.startsWith("[") ||
    /"(approach|complexity|algorithm|mistakes|optimisation|optimization|key insights|key_insights)"/i.test(cleanedText);

  const fallbackSections = createEmptySummarySections();
  fallbackSections.Approach = looksLikeJson
    ? "- AI returned incomplete structured output. Please generate the summary again."
    : cleanedText;
  return buildSummaryMarkdown(fallbackSections);

};

const buildSummaryPrompt = (implementationCode: string, notes: string, strict: boolean = false): string => {
  const tone = strict
    ? "You failed to provide a complete, detailed JSON summary. Regenerate it with full detail."
    : "You are an expert code reviewer. Your task is to provide a detailed code analysis in JSON format.";

  return `${tone}

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON object.
2. Do NOT include markdown code fences (no backticks or triple backticks).
3. Do NOT add any extra prose, explanations, or text before or after the JSON.
4. Ensure the JSON is complete and valid.
5. ALL key-value pairs must be present. Do not omit any keys.
6. Each value must contain at least 2 bullet points unless the section is genuinely not applicable.
7. Use concrete observations from the code. Do not write generic filler like "Initialize".
8. Do NOT include the implementation code in the summary.

The JSON must have exactly these 6 keys with string values:
- "Approach"
- "Complexity"
- "Algorithm"
- "Mistakes(if any)"
- "Optimisation"
- "Key insights"

FORMATTING RULES for values:
- Use bullet points: Start each point with "- "
- Use actual line breaks between bullet points (not \\n, but real newlines)
- Highlight important terms in bold: **term** (markdown bold format)
- Keep content specific to the implementation
- For "Mistakes(if any)", write "- No obvious mistakes found." if there are no issues

Example JSON format:
{
  "Approach": "- First **approach** used\\n- Second **method** applied",
  "Complexity": "- Time: **O(n)**\\n- Space: **O(1)",
  "Algorithm": "- Step 1: **Initialize**\\n- Step 2: **Execute**",
  "Mistakes(if any)": "- No obvious mistakes found.",
  "Optimisation": "- Could optimize using **technique**\\n- Alternative: **approach**",
  "Key insights": "- Key takeaway\\n- **Important** learning"
}

Now analyze this code implementation:

Implementation:
${implementationCode}

Existing Notes (if any):
${notes}

Return ONLY the JSON object, nothing else.`;
};

const requestGeminiSummary = async (prompt: string, apiKey: string, modelName: string): Promise<string> => {
  const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0,
      topP: 0.9,
      maxOutputTokens: 8192,
    },
  };

  const response = await axios.post(url, body, {
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  return (
    response.data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim() || ""
  );
};

const requestOpenAiSummary = async (prompt: string, apiKey: string): Promise<string> => {
  const openaiRes = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
      temperature: 0.2,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return openaiRes.data?.choices?.[0]?.message?.content || JSON.stringify(openaiRes.data);
};

const isSummaryIncomplete = (rawText: string, normalizedSummary: string): boolean => {
  if (normalizedSummary.includes("AI returned incomplete structured output")) {
    return true;
  }

  if (normalizedSummary.includes("Not provided by the model.")) {
    return true;
  }

  return isSummaryTooSparse(rawText, normalizedSummary);
};

export const generateSummary = async (req: Request, res: Response) => {
  try {
    const { implementationCode = "", notes = "" } = req.body;

    if (!implementationCode || implementationCode.trim().length === 0) {
      return res.status(400).json({ error: "implementationCode is required" });
    }

    const prompt = buildSummaryPrompt(implementationCode, notes);

    // Prefer Gemini if key available
    if (GEMINI_API_KEY) {
      // Try v1 endpoint with gemini-1.5-flash (latest stable model)
      const modelName = GEMINI_MODEL || "gemini-2.5-flash";

      try {
        const generatedText = await requestGeminiSummary(prompt, GEMINI_API_KEY, modelName);

        if (!generatedText) {
          throw new Error("Gemini response did not contain any generated text");
        }

        const normalizedSummary = normalizeSummaryText(generatedText);
        if (isSummaryIncomplete(generatedText, normalizedSummary)) {
          const retryText = await requestGeminiSummary(
            buildSummaryPrompt(implementationCode, notes, true),
            GEMINI_API_KEY,
            modelName
          );
          if (retryText) {
            const retryNormalizedSummary = normalizeSummaryText(retryText);
            if (!isSummaryIncomplete(retryText, retryNormalizedSummary)) {
              const retrySummaryWithImplementation = `${retryNormalizedSummary}\n\n### Implementation\n\`\`\`\n${implementationCode}\n\`\`\``;
              return res.json({ summary: retrySummaryWithImplementation, rawSummary: retryText });
            }
          }

          if (OPENAI_API_KEY) {
            const openaiText = await requestOpenAiSummary(prompt, OPENAI_API_KEY);
            const openaiNormalizedSummary = normalizeSummaryText(openaiText);
            const openaiSummaryWithImplementation = `${openaiNormalizedSummary}\n\n### Implementation\n\`\`\`\n${implementationCode}\n\`\`\``;
            return res.json({ summary: openaiSummaryWithImplementation, rawSummary: openaiText });
          }

          return res.status(500).json({
            error: "Failed to generate complete summary",
            details: "Gemini returned incomplete structured output and no fallback provider is configured",
          });
        }
        const summaryWithImplementation = `${normalizedSummary}\n\n### Implementation\n\`\`\`\n${implementationCode}\n\`\`\``;
        return res.json({ summary: summaryWithImplementation, rawSummary: generatedText });
      } catch (geminiError: any) {
        
        // If Gemini fails and OpenAI is configured, try OpenAI as fallback
        if (OPENAI_API_KEY) {
          // Fall through to OpenAI section below
        } else {
          throw geminiError;
        }
      }
    }

    // Fallback to OpenAI if provided (OpenAI-compatible API)
    if (OPENAI_API_KEY) {
      const text = await requestOpenAiSummary(prompt, OPENAI_API_KEY);
      const normalizedSummary = normalizeSummaryText(text);
      const summaryWithImplementation = `${normalizedSummary}\n\n### Implementation\n\`\`\`\n${implementationCode}\n\`\`\``;
      return res.json({ summary: summaryWithImplementation, rawSummary: text });
    }

    return res.status(500).json({ error: "No AI provider configured on the server" });
  } catch (error: any) {
    const providerMessage =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Unknown AI error";

    return res.status(500).json({
      error: "Failed to generate summary",
      details: providerMessage,
    });
  }
};

export default { generateSummary };
