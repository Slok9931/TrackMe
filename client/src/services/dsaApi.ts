import { apiClient } from "../config/api";

// Types
export interface Problem {
  _id: string;
  questionId: string;
  title: string;
  titleSlug: string;
  content: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topicTags: Array<{
    name: string;
    slug: string;
  }>;
  problemUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProblem {
  _id: string;
  userId: string;
  problemId: Problem | string;
  problem_link: string;
  status: "Todo" | "Completed";
  notes: string;
  date_solved?: string;
  revision_history: Array<{
    revision_no: number;
    revision_date: string;
    revision_notes: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalProblems: number;
  completedProblems: number;
  todoProblems: number;
  easyProblems: number;
  mediumProblems: number;
  hardProblems: number;
  totalRevisions: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

class DSAApiService {
  /**
   * Add/fetch problem from LeetCode API
   */
  static async addProblem(titleSlug: string): Promise<{ problem: Problem }> {
    const response = await apiClient.post('/problems/add-problem', {
      titleSlug,
    });
    return response.data;
  }

  /**
   * Add problem to user's tracking list
   */
  static async addUserProblem(data: {
    titleSlug: string;
    status?: "Todo" | "Completed";
    notes?: string;
    date_solved?: string;
  }): Promise<{ userProblem: UserProblem }> {
    const response = await apiClient.post(
      '/problems/user-problems',
      data
    );
    return response.data;
  }

  /**
   * Get user's tracked problems with optional filtering and pagination
   */
  static async getUserProblems(
    params: {
      status?: "Todo" | "Completed";
      difficulty?: "Easy" | "Medium" | "Hard";
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    userProblems: UserProblem[];
    pagination: PaginationInfo;
  }> {
    const response = await apiClient.get('/problems/user-problems', {
      params,
    });
    return response.data;
  }

  /**
   * Update user problem
   */
  static async updateUserProblem(
    userProblemId: string,
    data: {
      status?: "Todo" | "Completed";
      notes?: string;
      problem_link?: string;
    }
  ): Promise<{ userProblem: UserProblem }> {
    const response = await apiClient.put(
      `/problems/user-problems/${userProblemId}`,
      data
    );
    return response.data;
  }

  /**
   * Delete user problem
   */
  static async deleteUserProblem(userProblemId: string): Promise<void> {
    await apiClient.delete(
      `/problems/user-problems/${userProblemId}`
    );
  }

  /**
   * Add revision to user problem
   */
  static async addRevision(
    userProblemId: string,
    revisionNotes: string
  ): Promise<{ userProblem: UserProblem }> {
    const response = await apiClient.post(
      `/problems/user-problems/${userProblemId}/revisions`,
      { revision_notes: revisionNotes }
    );
    return response.data;
  }

  /**
   * Update revision
   */
  static async updateRevision(
    userProblemId: string,
    revisionNo: number,
    revisionNotes: string
  ): Promise<{ userProblem: UserProblem }> {
    const response = await apiClient.put(
      `/problems/user-problems/${userProblemId}/revisions/${revisionNo}`,
      { revision_notes: revisionNotes }
    );
    return response.data;
  }

  /**
   * Delete revision
   */
  static async deleteRevision(
    userProblemId: string,
    revisionNo: number
  ): Promise<{ userProblem: UserProblem }> {
    const response = await apiClient.delete(
      `/problems/user-problems/${userProblemId}/revisions/${revisionNo}`
    );
    return response.data;
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<{ stats: UserStats }> {
    const response = await apiClient.get('/problems/stats');
    return response.data;
  }
}

export default DSAApiService;
