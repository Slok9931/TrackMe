import express from "express";
import aiController from "../controllers/ai";

const router = express.Router();

// POST /api/ai/summarize
router.post("/summarize", aiController.generateSummary);

export default router;
