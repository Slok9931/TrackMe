import axios from "axios";

// GFG API response interfaces
interface GFGTopicTag {
  name: string;
  slug: string;
}

interface GFGProblemResponse {
  results: {
    id: number;
    problem_name: string;
    slug: string;
    problem_level: number;
    problem_level_text: string;
    difficulty: string;
    problem_question: string;
    tags: {
      topic_tags: string[];
    };
  };
  status: boolean;
}

interface GFGQuestion {
  questionId: string;
  title: string;
  titleSlug: string;
  content: string;
  difficulty: string;
  topicTags: GFGTopicTag[];
}

class GFGService {
  private static readonly GFG_API_BASE_URL =
    "https://practiceapi.geeksforgeeks.org/api/latest/problems";
  private static readonly GFG_PROBLEM_BASE_URL =
    "https://www.geeksforgeeks.org/problems";

  /**
   * Fetch problem details from GFG API
   * @param titleSlug - The title slug of the problem (e.g., "count-subarray-with-given-xor")
   * @returns Promise with problem details
   */
  static async fetchProblemDetails(titleSlug: string): Promise<GFGQuestion> {
    try {
      const url = `${this.GFG_API_BASE_URL}/${titleSlug}`;
      console.log(`Fetching GFG problem from: ${url}`);

      const response = await axios.get<GFGProblemResponse>(url, {
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept: "application/json",
        },
      });

      if (!response.data || !response.data.status || !response.data.results) {
        throw new Error("Invalid response from GFG API");
      }

      const problem = response.data.results;

      // Debug: Log the raw content to see what we're getting
      console.log(
        "Raw GFG problem_question:",
        problem.problem_question.substring(0, 500) + "..."
      );

      // Transform GFG response to our format
      const transformedProblem: GFGQuestion = {
        questionId: problem.id.toString(),
        title: problem.problem_name,
        titleSlug: problem.slug,
        content: problem.problem_question,
        difficulty: this.mapDifficulty(problem.difficulty),
        topicTags: this.transformTopicTags(problem.tags.topic_tags),
      };

      console.log(
        "Cleaned content:",
        transformedProblem.content.substring(0, 500) + "..."
      );

      return transformedProblem;
    } catch (error: any) {
      console.error("Error fetching GFG problem:", error);

      if (error.response?.status === 404) {
        throw new Error(
          `Problem with slug "${titleSlug}" not found on GeeksforGeeks`
        );
      } else if (error.response?.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later");
      } else if (error.code === "ECONNABORTED") {
        throw new Error("Request timeout. Please try again");
      } else {
        throw new Error(
          `Failed to fetch problem from GeeksforGeeks: ${error.message}`
        );
      }
    }
  }

  /**
   * Clean and format HTML content from GFG problem description
   * @param content - Raw HTML content
   * @returns Cleaned HTML content with proper formatting
   */
  static cleanContent(content: string): string {
    if (!content) return "";

    // Minimal cleaning - preserve HTML structure for proper rendering
    let cleaned = content
      // Only decode essential HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Remove only problematic inline styles that might break layout
      .replace(/\s+style="[^"]*font-family:[^"]*"/gi, "")
      .replace(/\s+style="[^"]*background-color:[^"]*"/gi, "")
      // Keep everything else as is to preserve HTML structure
      .trim();

    return cleaned;
  }

  /**
   * Map GFG difficulty to our standard format
   * @param difficulty - GFG difficulty string
   * @returns Mapped difficulty
   */
  static mapDifficulty(difficulty: string): "Easy" | "Medium" | "Hard" {
    const normalized = difficulty.toLowerCase().trim();

    switch (normalized) {
      case "easy":
        return "Easy";
      case "medium":
        return "Medium";
      case "hard":
        return "Hard";
      default:
        console.warn(`Unknown difficulty: ${difficulty}, defaulting to Medium`);
        return "Medium";
    }
  }

  /**
   * Transform GFG topic tags to our format
   * @param topicTags - Array of topic tag strings
   * @returns Transformed topic tags
   */
  static transformTopicTags(topicTags: string[]): GFGTopicTag[] {
    if (!Array.isArray(topicTags)) return [];

    return topicTags.map((tag) => ({
      name: tag,
      slug: tag
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    }));
  }

  /**
   * Generate problem URL for GFG
   * @param titleSlug - Problem title slug
   * @returns Full problem URL
   */
  static generateProblemUrl(titleSlug: string): string {
    return `${this.GFG_PROBLEM_BASE_URL}/${titleSlug}/1`;
  }

  /**
   * Extract title slug from GFG URL
   * @param url - Full GFG problem URL
   * @returns Extracted title slug or null
   */
  static extractTitleSlugFromUrl(url: string): string | null {
    try {
      const regex =
        /https:\/\/www\.geeksforgeeks\.org\/problems\/([a-z0-9-]+)(?:\/\d+)?/;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Validate if a string is a valid GFG URL
   * @param url - URL to validate
   * @returns boolean indicating if URL is valid GFG URL
   */
  static isValidGFGUrl(url: string): boolean {
    try {
      const regex =
        /^https:\/\/www\.geeksforgeeks\.org\/problems\/[a-z0-9-]+(?:\/\d+)?$/;
      return regex.test(url);
    } catch {
      return false;
    }
  }
}

export default GFGService;
