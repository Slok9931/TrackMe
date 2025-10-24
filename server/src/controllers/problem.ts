import { Request, Response } from "express";
import Problem, { IProblem } from "../models/Problem";
import UserProblem, { IUserProblem } from "../models/UserProblem";
import LeetCodeService from "../services/leetcodeService";
import GFGService from "../services/gfgService";

// Extended Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    name: string;
    email: string;
    googleId: string;
  };
}

/**
 * Add or fetch a problem by titleSlug and platform
 * This will fetch from the respective API if not in database, otherwise return existing
 */
export const addProblem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { titleSlug, platform = "leetcode" } = req.body;

    if (!titleSlug) {
      res.status(400).json({ error: "titleSlug is required" });
      return;
    }

    if (!["leetcode", "gfg"].includes(platform)) {
      res
        .status(400)
        .json({ error: "platform must be either 'leetcode' or 'gfg'" });
      return;
    }

    // Check if problem already exists in database
    let problem = await Problem.findOne({ titleSlug, platform });

    if (!problem) {
      let problemData;

      if (platform === "leetcode") {
        // Fetch from LeetCode API
        problemData = await LeetCodeService.fetchProblemDetails(titleSlug);

        // Create new problem record
        problem = new Problem({
          questionId: problemData.questionId,
          title: problemData.title,
          titleSlug: problemData.titleSlug,
          platform: "leetcode",
          content: LeetCodeService.cleanContent(problemData.content),
          difficulty: problemData.difficulty,
          topicTags: problemData.topicTags,
          problemUrl: LeetCodeService.generateProblemUrl(problemData.titleSlug),
        });
      } else if (platform === "gfg") {
        // Fetch from GFG API
        problemData = await GFGService.fetchProblemDetails(titleSlug);

        // Create new problem record
        problem = new Problem({
          questionId: problemData.questionId,
          title: problemData.title,
          titleSlug: problemData.titleSlug,
          platform: "gfg",
          content: problemData.content,
          difficulty: problemData.difficulty,
          topicTags: problemData.topicTags,
          problemUrl: GFGService.generateProblemUrl(problemData.titleSlug),
        });
      }

      if (problem) {
        await problem.save();
      }
    }

    res.status(200).json({
      message: "Problem fetched successfully",
      problem,
    });
  } catch (error: any) {
    console.error("Error in addProblem:", error);
    res.status(500).json({
      error: "Failed to fetch problem",
      details: error.message,
    });
  }
};

/**
 * Add problem to user's tracking list
 */
export const addUserProblem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      titleSlug,
      platform = "leetcode",
      status = "Todo",
      notes = "",
      date_solved,
    } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (!titleSlug) {
      res.status(400).json({ error: "titleSlug is required" });
      return;
    }

    if (!["leetcode", "gfg"].includes(platform)) {
      res
        .status(400)
        .json({ error: "platform must be either 'leetcode' or 'gfg'" });
      return;
    }

    // Validate date_solved requirement for Completed status
    if (status === "Completed" && !date_solved) {
      res
        .status(400)
        .json({ error: "Date solved is required when status is Completed" });
      return;
    }

    // First ensure problem exists in database
    let problem = await Problem.findOne({ titleSlug, platform });
    if (!problem) {
      let problemData;

      if (platform === "leetcode") {
        // Fetch from LeetCode API
        problemData = await LeetCodeService.fetchProblemDetails(titleSlug);

        problem = new Problem({
          questionId: problemData.questionId,
          title: problemData.title,
          titleSlug: problemData.titleSlug,
          platform: "leetcode",
          content: LeetCodeService.cleanContent(problemData.content),
          difficulty: problemData.difficulty,
          topicTags: problemData.topicTags,
          problemUrl: LeetCodeService.generateProblemUrl(problemData.titleSlug),
        });
      } else if (platform === "gfg") {
        // Fetch from GFG API
        problemData = await GFGService.fetchProblemDetails(titleSlug);

        problem = new Problem({
          questionId: problemData.questionId,
          title: problemData.title,
          titleSlug: problemData.titleSlug,
          platform: "gfg",
          content: problemData.content,
          difficulty: problemData.difficulty,
          topicTags: problemData.topicTags,
          problemUrl: GFGService.generateProblemUrl(problemData.titleSlug),
        });
      }

      if (problem) {
        await problem.save();
      }
    }

    if (!problem) {
      res.status(500).json({ error: "Failed to fetch or create problem" });
      return;
    }

    // Check if user already has this problem
    const existingUserProblem = await UserProblem.findOne({
      userId,
      problemId: problem._id,
    });

    if (existingUserProblem) {
      res.status(400).json({
        error: "Problem already added to your tracking list",
        userProblem: existingUserProblem,
      });
      return;
    }

    // Create user problem tracking record
    const userProblemData: any = {
      userId,
      problemId: problem._id,
      problem_link: problem.problemUrl,
      status,
      notes,
      revision_history: [],
    };

    // Add date_solved if status is Completed
    if (status === "Completed" && date_solved) {
      userProblemData.date_solved = new Date(date_solved);
    }

    const userProblem = new UserProblem(userProblemData);

    await userProblem.save();

    // Populate problem details for response
    await userProblem.populate({
      path: "problemId",
      select:
        "questionId title titleSlug difficulty platform topicTags problemUrl content",
    });

    res.status(201).json({
      message: "Problem added to tracking list successfully",
      userProblem,
    });
  } catch (error: any) {
    console.error("Error in addUserProblem:", error);
    res.status(500).json({
      error: "Failed to add problem to tracking list",
      details: error.message,
    });
  }
};

/**
 * Get all user's tracked problems
 */
export const getUserProblems = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const {
      status,
      difficulty,
      platform,
      search,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = req.query;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    // Build filter for UserProblem collection
    const filter: any = { userId };
    if (status) filter.status = status;

    // Add date range filter for date_solved
    if (dateFrom || dateTo) {
      filter.date_solved = {};
      if (dateFrom) {
        // Parse date and set to start of day in UTC
        const fromDate = new Date(dateFrom as string);
        fromDate.setUTCHours(0, 0, 0, 0);
        filter.date_solved.$gte = fromDate;
      }
      if (dateTo) {
        // Parse date and set to end of day in UTC
        const toDate = new Date(dateTo as string);
        toDate.setUTCHours(23, 59, 59, 999);
        filter.date_solved.$lte = toDate;
      }
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Build population match criteria for Problem collection
    const populateMatch: any = {};
    if (difficulty) populateMatch.difficulty = difficulty;
    if (platform) populateMatch.platform = platform;
    if (search) {
      populateMatch.title = { $regex: search, $options: "i" };
    }

    // Query with population and filtering
    let query = UserProblem.find(filter)
      .populate({
        path: "problemId",
        match:
          Object.keys(populateMatch).length > 0 ? populateMatch : undefined,
        select:
          "questionId title titleSlug difficulty platform topicTags problemUrl content",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const userProblems = await query.exec();

    // Filter out null populated problems (in case of difficulty/search filter)
    const filteredProblems = userProblems.filter((up) => up.problemId !== null);

    // For accurate pagination count, we need to consider all filters
    let totalQuery = UserProblem.find(filter);

    // If we have problem-level filters (difficulty, search), we need to join and count differently
    if (difficulty || search) {
      const allProblems = await UserProblem.find(filter).populate({
        path: "problemId",
        match: populateMatch,
        select: "_id",
      });
      const filteredCount = allProblems.filter(
        (up) => up.problemId !== null
      ).length;

      res.status(200).json({
        userProblems: filteredProblems,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(filteredCount / Number(limit)),
          totalItems: filteredCount,
          itemsPerPage: Number(limit),
        },
      });
    } else {
      // Simple count for UserProblem filters only
      const total = await UserProblem.countDocuments(filter);

      res.status(200).json({
        userProblems: filteredProblems,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit),
        },
      });
    }
  } catch (error: any) {
    console.error("Error in getUserProblems:", error);
    res.status(500).json({
      error: "Failed to fetch user problems",
      details: error.message,
    });
  }
};

/**
 * Update user problem status, notes, etc.
 */
export const updateUserProblem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userProblemId } = req.params;
    const { status, notes, problem_link } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const userProblem = await UserProblem.findOne({
      _id: userProblemId,
      userId,
    }).populate({
      path: "problemId",
      select:
        "questionId title titleSlug difficulty platform topicTags problemUrl content",
    });

    if (!userProblem) {
      res.status(404).json({ error: "User problem not found" });
      return;
    }

    // Update fields if provided
    if (status !== undefined) userProblem.status = status;
    if (notes !== undefined) userProblem.notes = notes;
    if (problem_link !== undefined) {
      if (!LeetCodeService.isValidLeetCodeUrl(problem_link)) {
        res.status(400).json({ error: "Invalid LeetCode problem URL" });
        return;
      }
      userProblem.problem_link = problem_link;
    }

    await userProblem.save();

    res.status(200).json({
      message: "User problem updated successfully",
      userProblem,
    });
  } catch (error: any) {
    console.error("Error in updateUserProblem:", error);
    res.status(500).json({
      error: "Failed to update user problem",
      details: error.message,
    });
  }
};

/**
 * Delete user problem from tracking
 */
export const deleteUserProblem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userProblemId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const userProblem = await UserProblem.findOneAndDelete({
      _id: userProblemId,
      userId,
    });

    if (!userProblem) {
      res.status(404).json({ error: "User problem not found" });
      return;
    }

    res.status(200).json({
      message: "User problem deleted successfully",
    });
  } catch (error: any) {
    console.error("Error in deleteUserProblem:", error);
    res.status(500).json({
      error: "Failed to delete user problem",
      details: error.message,
    });
  }
};

/**
 * Add revision to user problem
 */
export const addRevision = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userProblemId } = req.params;
    const { revision_notes } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (!revision_notes) {
      res.status(400).json({ error: "revision_notes is required" });
      return;
    }

    const userProblem = await UserProblem.findOne({
      _id: userProblemId,
      userId,
    }).populate({
      path: "problemId",
      select:
        "questionId title titleSlug difficulty platform topicTags problemUrl content",
    });

    if (!userProblem) {
      res.status(404).json({ error: "User problem not found" });
      return;
    }

    await (userProblem as any).addRevision(revision_notes);

    res.status(200).json({
      message: "Revision added successfully",
      userProblem,
    });
  } catch (error: any) {
    console.error("Error in addRevision:", error);
    res.status(500).json({
      error: "Failed to add revision",
      details: error.message,
    });
  }
};

/**
 * Update revision
 */
export const updateRevision = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userProblemId, revisionNo } = req.params;
    const { revision_notes } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (!revision_notes) {
      res.status(400).json({ error: "revision_notes is required" });
      return;
    }

    const userProblem = await UserProblem.findOne({
      _id: userProblemId,
      userId,
    });

    if (!userProblem) {
      res.status(404).json({ error: "User problem not found" });
      return;
    }

    try {
      await (userProblem as any).updateRevision(
        Number(revisionNo),
        revision_notes
      );
      await userProblem.populate({
        path: "problemId",
        select:
          "questionId title titleSlug difficulty platform topicTags problemUrl content",
      });

      res.status(200).json({
        message: "Revision updated successfully",
        userProblem,
      });
    } catch (revisionError: any) {
      res.status(404).json({ error: revisionError.message });
    }
  } catch (error: any) {
    console.error("Error in updateRevision:", error);
    res.status(500).json({
      error: "Failed to update revision",
      details: error.message,
    });
  }
};

/**
 * Delete revision
 */
export const deleteRevision = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userProblemId, revisionNo } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const userProblem = await UserProblem.findOne({
      _id: userProblemId,
      userId,
    });

    if (!userProblem) {
      res.status(404).json({ error: "User problem not found" });
      return;
    }

    await (userProblem as any).deleteRevision(Number(revisionNo));
    await userProblem.populate({
      path: "problemId",
      select:
        "questionId title titleSlug difficulty platform topicTags problemUrl content",
    });

    res.status(200).json({
      message: "Revision deleted successfully",
      userProblem,
    });
  } catch (error: any) {
    console.error("Error in deleteRevision:", error);
    res.status(500).json({
      error: "Failed to delete revision",
      details: error.message,
    });
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    // Aggregate statistics
    const stats = await UserProblem.aggregate([
      { $match: { userId: userId } },
      {
        $lookup: {
          from: "problems",
          localField: "problemId",
          foreignField: "_id",
          as: "problem",
        },
      },
      { $unwind: "$problem" },
      {
        $group: {
          _id: null,
          totalProblems: { $sum: 1 },
          completedProblems: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
          },
          todoProblems: {
            $sum: { $cond: [{ $eq: ["$status", "Todo"] }, 1, 0] },
          },
          easyProblems: {
            $sum: { $cond: [{ $eq: ["$problem.difficulty", "Easy"] }, 1, 0] },
          },
          mediumProblems: {
            $sum: { $cond: [{ $eq: ["$problem.difficulty", "Medium"] }, 1, 0] },
          },
          hardProblems: {
            $sum: { $cond: [{ $eq: ["$problem.difficulty", "Hard"] }, 1, 0] },
          },
          totalRevisions: { $sum: { $size: "$revision_history" } },
        },
      },
    ]);

    const userStats = stats[0] || {
      totalProblems: 0,
      completedProblems: 0,
      todoProblems: 0,
      easyProblems: 0,
      mediumProblems: 0,
      hardProblems: 0,
      totalRevisions: 0,
    };

    res.status(200).json({
      stats: userStats,
    });
  } catch (error: any) {
    console.error("Error in getUserStats:", error);
    res.status(500).json({
      error: "Failed to fetch user statistics",
      details: error.message,
    });
  }
};
