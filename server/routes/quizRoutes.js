
import express from "express";
import {
  createQuiz,
  getQuizByRoomCode,
  getAllQuizzesByUser,
  submitQuiz,
  getQuizResult,
  getLeaderboard,
  getAnalytics,
  generateAIQuiz,
  saveAIQuiz
} from "../controllers/quizController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Manual Quiz Create a new quiz & get quiz by roomcode
router.post("/", authMiddleware, createQuiz);



// AI Quiz generate and save
router.post("/ai/generate", authMiddleware, generateAIQuiz);
router.post("/ai/save", authMiddleware, saveAIQuiz);

// User Dashboard
router.get("/user/all", authMiddleware, getAllQuizzesByUser);

// Quiz Submission & Results
router.post("/:roomCode/submit", authMiddleware, submitQuiz);
router.get("/:roomCode/result", authMiddleware, getQuizResult);

// Leaderboard & Analytics
router.get("/:roomCode/leaderboard",authMiddleware, getLeaderboard);
router.get("/:roomCode/analytics", authMiddleware, getAnalytics);

router.get("/:roomCode",authMiddleware, getQuizByRoomCode);


export default router;