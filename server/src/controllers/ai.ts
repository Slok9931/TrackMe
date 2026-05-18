import { Request, Response } from "express";
import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const generateSummary = async (req: Request, res: Response) => {
  try {
    const { implementationCode = "", notes = "" } = req.body;

    if (!implementationCode || implementationCode.trim().length === 0) {
      return res.status(400).json({ error: "implementationCode is required" });
    }

    // Build a clear prompt that instructs the model to produce the required headings
    const prompt = `You are an expert code reviewer. Given the following implementation, produce a concise review structured with the following headings (use Markdown headings):\n\n1) Approach\n2) Complexity\n3) Algorithm\n4) Mistakes(if any)\n5) Optimisation\n6) Key insights\n\nProvide short, actionable points under each heading. If there are no mistakes, state 'No obvious mistakes found.'\n\nImplementation:\n\n${implementationCode}\n\nExisting Notes:\n\n${notes}`;

    // Prefer Gemini if key available
    if (GEMINI_API_KEY) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
      const body = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 512,
        },
      };

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

      return res.json({ summary: generatedText });
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
      return res.json({ summary: text });
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
