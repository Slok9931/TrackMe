import axios from "axios";

// LeetCode GraphQL response interfaces
interface LeetCodeTopicTag {
  name: string;
  slug: string;
}

interface LeetCodeQuestion {
  questionId: string;
  title: string;
  titleSlug: string;
  content: string;
  difficulty: string;
  topicTags: LeetCodeTopicTag[];
}

interface LeetCodeResponse {
  data: {
    question: LeetCodeQuestion;
  };
}

interface LeetCodeError {
  message: string;
  extensions?: {
    code?: string;
  };
}

class LeetCodeService {
  private static readonly LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";
  private static readonly LEETCODE_PROBLEM_BASE_URL =
    "https://leetcode.com/problems/";

  /**
   * Fetch problem details from LeetCode GraphQL API
   * @param titleSlug - The title slug of the problem (e.g., "set-matrix-zeroes")
   * @returns Promise with problem details
   */
  static async fetchProblemDetails(
    titleSlug: string
  ): Promise<LeetCodeQuestion> {
    try {
      const query = `
        query getQuestionDetail($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionId
            title
            titleSlug
            content
            difficulty
            topicTags {
              name
              slug
            }
          }
        }
      `;

      const variables = {
        titleSlug: titleSlug,
      };

      const response = await axios.post<LeetCodeResponse>(
        this.LEETCODE_GRAPHQL_URL,
        {
          query,
          variables,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            Accept: "application/json",
            Referer: "https://leetcode.com/",
            Origin: "https://leetcode.com",
          },
          timeout: 10000, // 10 second timeout
        }
      );

      if (response.data?.data?.question) {
        return response.data.data.question;
      } else {
        throw new Error(`Problem with titleSlug "${titleSlug}" not found`);
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const leetcodeErrors = error.response.data.errors as LeetCodeError[];
        throw new Error(
          `LeetCode API Error: ${leetcodeErrors
            .map((e) => e.message)
            .join(", ")}`
        );
      }

      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Request timeout: LeetCode API took too long to respond"
        );
      }

      if (error.response?.status === 429) {
        throw new Error("Rate limited: Too many requests to LeetCode API");
      }

      if (error.response?.status >= 500) {
        throw new Error("LeetCode API server error");
      }

      throw new Error(`Failed to fetch problem details: ${error.message}`);
    }
  }

  /**
   * Generate the full problem URL from titleSlug
   * @param titleSlug - The title slug of the problem
   * @returns Full LeetCode problem URL
   */
  static generateProblemUrl(titleSlug: string): string {
    return `${this.LEETCODE_PROBLEM_BASE_URL}${titleSlug}/`;
  }

  /**
   * Extract titleSlug from LeetCode problem URL
   * @param url - Full LeetCode problem URL
   * @returns Title slug or null if invalid URL
   */
  static extractTitleSlugFromUrl(url: string): string | null {
    try {
      const regex = /https:\/\/leetcode\.com\/problems\/([a-z0-9-]+)\/?/;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Validate if a string is a valid LeetCode problem URL
   * @param url - URL to validate
   * @returns boolean indicating if URL is valid
   */
  static isValidLeetCodeUrl(url: string): boolean {
    return this.extractTitleSlugFromUrl(url) !== null;
  }

  /**
   * Clean and normalize HTML content from LeetCode
   * @param content - Raw HTML content from LeetCode
   * @returns Cleaned content
   */
  static cleanContent(content: string): string {
    // Remove excessive whitespace and normalize line breaks
    return content.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
  }
}

export default LeetCodeService;
