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

const createEmptySummarySections = (): SummarySections => ({
  Approach: "",
  Complexity: "",
  Algorithm: "",
  "Mistakes(if any)": "",
  Optimisation: "",
  "Key insights": "",
});

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
    const cleanedText = rawText.replace(/```json|```/g, "").trim();

    // Try direct JSON parse first (common when model returns pure JSON)
    try {
      const direct = JSON.parse(cleanedText);
      if (direct && typeof direct === "object") {
        const sections = createEmptySummarySections();
        let found = false;
        for (const k of SUMMARY_SECTION_KEYS) {
          const v = direct[k];
          if (typeof v === "string" && v.trim().length) {
            sections[k] = v.trim().replace(/\\r?\\n/g, "\n");
            found = true;
          }
        }
        if (found) return sections;
      }
    } catch (e) {
      // fallthrough to brace-based extraction
    }

    const start = cleanedText.indexOf("{");
    if (start === -1) {
      console.log("parseSummaryJson: no opening brace found");
      return null;
    }

    // Find matching closing brace by tracking depth to handle nested objects
    let depth = 0;
    let end = -1;
    for (let i = start; i < cleanedText.length; i++) {
      const ch = cleanedText[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }

    if (end === -1) {
      console.log("parseSummaryJson: no matching closing brace found");
      return null;
    }

    const jsonString = cleanedText.slice(start, end + 1);
    let parsed: any;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      console.log("parseSummaryJson: JSON.parse failed on extracted substring", (err as any)?.message || String(err));
      return null;
    }

    if (!parsed || typeof parsed !== "object") return null;

    const sections = createEmptySummarySections();
    let foundAny = false;
    for (const k of SUMMARY_SECTION_KEYS) {
      const v = parsed[k];
      if (typeof v === "string" && v.trim().length) {
        sections[k] = v.trim().replace(/\\r?\\n/g, "\n");
        foundAny = true;
      }
    }

    return foundAny ? sections : null;
  } catch (error: any) {
    console.log("parseSummaryJson final error:", error?.message);
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
    const headingMatch = cleanedLine.match(/^(?:\d+\)\s*)?(Approach|Complexity|Algorithm|Mistakes(?:\s*\(if any\))?|Optimisation|Key insights)\s*:?$/i);

    if (!headingMatch) {
      return null;
    }

    const normalized = headingMatch[1].toLowerCase();
    if (normalized.startsWith("approach")) return "Approach";
    if (normalized.startsWith("complexity")) return "Complexity";
    if (normalized.startsWith("algorithm")) return "Algorithm";
    if (normalized.startsWith("mistakes")) return "Mistakes(if any)";
    if (normalized.startsWith("optimisation")) return "Optimisation";
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
  console.log("=== Normalizing Summary ===");
  console.log("Raw text length:", rawText.length);
  console.log("Raw text (first 300 chars):", rawText.substring(0, 300));
  
  const jsonSections = parseSummaryJson(rawText);
  if (jsonSections) {
    console.log("✓ Successfully parsed as JSON");
    return buildSummaryMarkdown(jsonSections);
  }

  console.log("JSON parsing failed, trying Markdown parsing...");
  const markdownSections = parseMarkdownSummary(rawText);
  if (markdownSections) {
    console.log("✓ Successfully parsed as Markdown");
    return buildSummaryMarkdown(markdownSections);
  }

  console.log("Both parsers failed, using fallback...");
  const fallbackSections = createEmptySummarySections();
  fallbackSections.Approach = rawText.trim();
  return buildSummaryMarkdown(fallbackSections);

};

export const generateSummary = async (req: Request, res: Response) => {
  try {
    const { implementationCode = "", notes = "" } = req.body;

    console.log("=== AI Summarize Request ===");
    console.log("Code length:", implementationCode.length);
    console.log("GEMINI_API_KEY set:", !!GEMINI_API_KEY);
    console.log("GEMINI_MODEL:", GEMINI_MODEL);

    if (!implementationCode || implementationCode.trim().length === 0) {
      return res.status(400).json({ error: "implementationCode is required" });
    }

    // Build a strict prompt so the model returns JSON that we can render into markdown
    const prompt = `You are an expert code reviewer. Your task is to provide a detailed code analysis in JSON format.

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON object.
2. Do NOT include markdown code fences (no backticks or triple backticks).
3. Do NOT add any extra prose, explanations, or text before or after the JSON.
4. Ensure the JSON is complete and valid.
5. ALL key-value pairs must be present. Do not omit any keys.

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
- Keep content concise and specific to the implementation
- For "Mistakes(if any)", write "- No obvious mistakes found." if there are no issues
- Do NOT repeat the full code

Example JSON format:
{
  "Approach": "- First **approach** used\\n- Second **method** applied",
  "Complexity": "- Time: **O(n)**\\n- Space: **O(1)**",
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

    // Prefer Gemini if key available
    if (GEMINI_API_KEY) {
      // List available models first to debug
      try {
        const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(GEMINI_API_KEY)}`;
        console.log("Attempting to list available models...");
        const listResponse = await axios.get(listUrl, { timeout: 10000 });
        const models = listResponse.data?.models || [];
        console.log("Available models:", models.map((m: any) => m.name).slice(0, 5));
      } catch (listError: any) {
        console.log("Could not list models:", listError?.response?.data?.error?.message || listError.message);
      }

      // Try v1 endpoint with gemini-1.5-flash (latest stable model)
      const modelName = GEMINI_MODEL || "gemini-2.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
      console.log("Making Gemini API call to:", url.split("?")[0]);
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
            maxOutputTokens: 2048,
        },
      };

      try {
        const response = await axios.post(url, body, {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        });

        const generatedText =
          response.data?.candidates?.[0]?.content?.parts
            ?.map((part: { text?: string }) => part.text || "")
            .join("")
            .trim() || "";

        if (!generatedText) {
          throw new Error("Gemini response did not contain any generated text");
        }

        console.log("=== Gemini Response ===");
        console.log("Response length:", generatedText.length);
        console.log("Response (first 500 chars):", generatedText.substring(0, 500));
        console.log("Response includes JSON object:", generatedText.includes("{"));
        console.log("Response includes JSON array:", generatedText.includes("["));

        const normalizedSummary = normalizeSummaryText(generatedText);
        const summaryWithImplementation = `${normalizedSummary}\n\n### Implementation\n\`\`\`\n${implementationCode}\n\`\`\``;
        console.log("Gemini response received, final summary length:", normalizedSummary.length);
        return res.json({ summary: summaryWithImplementation, rawSummary: generatedText });
      } catch (geminiError: any) {
        console.error("Gemini API error details:", {
          status: geminiError?.response?.status,
          data: geminiError?.response?.data,
          message: geminiError?.message,
        });
        
        // If Gemini fails and OpenAI is configured, try OpenAI as fallback
        if (OPENAI_API_KEY) {
          console.log("Gemini failed, trying OpenAI fallback...");
          // Fall through to OpenAI section below
        } else {
          throw geminiError;
        }
      }
    }

    // Fallback to OpenAI if provided (OpenAI-compatible API)
    if (OPENAI_API_KEY) {
      const openaiRes = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 512,
          temperature: 0.2,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const text = openaiRes.data?.choices?.[0]?.message?.content || JSON.stringify(openaiRes.data);
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

    console.error("AI generate error:", error?.response?.data || error.message || error);
    return res.status(500).json({
      error: "Failed to generate summary",
      details: providerMessage,
    });
  }
};

export default { generateSummary };
