import express from "express";
import {
  addProblem,
  addUserProblem,
  getUserProblems,
  updateUserProblem,
  deleteUserProblem,
  addRevision,
  updateRevision,
  deleteRevision,
  getUserStats,
} from "../controllers/problem";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Problem routes
router.post("/add-problem", addProblem); // Add/fetch problem from LeetCode API
router.post("/user-problems", addUserProblem); // Add problem to user's tracking list
router.get("/user-problems", getUserProblems); // Get all user's tracked problems
router.put("/user-problems/:userProblemId", updateUserProblem); // Update user problem
router.delete("/user-problems/:userProblemId", deleteUserProblem); // Delete user problem

// Revision routes
router.post("/user-problems/:userProblemId/revisions", addRevision); // Add revision
router.put(
  "/user-problems/:userProblemId/revisions/:revisionNo",
  updateRevision
); // Update revision
router.delete(
  "/user-problems/:userProblemId/revisions/:revisionNo",
  deleteRevision
); // Delete revision

// Statistics route
router.get("/stats", getUserStats); // Get user statistics

export default router;
