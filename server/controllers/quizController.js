
import Quiz from "../models/Quiz.js";
import { nanoid } from "nanoid";
import Attempt from "../models/Attempt.js";
import User from "../models/User.js";
import generateQuizWithGemini from "../utils/geminiHelper.js";
import generateUniqueRoomCode from "../utils/generateRoomCode.js";

// POST /api/quizzes
export const createQuiz = async (req, res) => {
        try {
                const { title, questions, duration, isAIgenerated, topic } = req.body;

                if (!questions || !Array.isArray(questions) || questions.length === 0) {
                        return res.status(400).json({ message: "At least one question is required." });
                }

                const roomCode = await generateUniqueRoomCode(); // generate unique 6-char code

                const quiz = await Quiz.create({
                        title,
                        topic,
                        questions,
                        duration,
                        createdBy: req.user._id,
                        isAIgenerated: isAIgenerated || false,
                        roomCode,
                });

                res.status(201).json(quiz);
        } catch (error) {
                res.status(500).json({ message: "Failed to create quiz", error: error.message });
        }
};

// GET /api/quizzes/:roomCode
export const getQuizByRoomCode = async (req, res) => {
        try {
                const quiz = await Quiz.findOne({ roomCode: req.params.roomCode });

                if (!quiz) {
                        return res.status(404).json({ message: "Quiz not found" });
                }

                // Block creator from joining/attempting their own quiz
                if (quiz.createdBy.toString() === req.user._id.toString()) {
                        return res.status(403).json({ message: "You cannot join or attempt your own quiz." });
                }

                // Block user if already attempted
                const existingAttempt = await Attempt.findOne({ user: req.user._id, quiz: quiz._id });
                if (existingAttempt) {
                        return res.status(403).json({ message: "You have already attempted this quiz." });
                }

                // Remove correctAnswerIndex before sending to client
                const questionsWithoutAnswers = quiz.questions.map(q => ({
                        _id: q._id,
                        questionText: q.questionText,
                        options: q.options
                }));

                res.status(200).json({
                        _id: quiz._id,
                        title: quiz.title,
                        topic: quiz.topic,
                        roomCode: quiz.roomCode,
                        duration: quiz.duration,
                        questions: questionsWithoutAnswers,
                        isAIgenerated: quiz.isAIgenerated,
                        createdAt: quiz.createdAt,
                });
        } catch (error) {
                res.status(500).json({ message: "Error fetching quiz", error: error.message });
        }
};


// GET /api/quizzes/user/all
export const getAllQuizzesByUser = async (req, res) => {
        try {
                const quizzes = await Quiz.find({ createdBy: req.user._id });
                res.status(200).json(quizzes);
        } catch (error) {
                res.status(500).json({ message: "Error fetching quizzes", error: error.message });
        }
};


// POST /api/quizzes/:roomcode/submit 
export const submitQuiz = async (req, res) => {
        try {
                const { answers, timeTaken } = req.body;
                const { roomCode } = req.params;
                const userId = req.user._id;

                // Get the quiz
                const quiz = await Quiz.findOne({ roomCode });

                if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

                // Prevent creator from attempting
                if (quiz.createdBy.toString() === userId.toString()) {
                        return res.status(403).json({ message: 'Creators cannot attempt their own quizzes' });
                }

                // Check if user already attempted
                const existingAttempt = await Attempt.findOne({ user: userId, quiz: quiz._id });
                if (existingAttempt) {
                        return res.status(403).json({ message: 'You have already attempted this quiz' });
                }

                // Calculate score (compare answer text)
                let score = 0;
                const submittedAnswers = answers.map(a => (typeof a === 'string' ? a : ''));
                quiz.questions.forEach((q, index) => {
                        const correctText = q.options[q.correctAnswerIndex];
                        if (submittedAnswers[index]?.trim() === correctText?.trim()) score++;
                });

                // Save attempt (store answer texts)
                const newAttempt = new Attempt({
                        user: userId,
                        quiz: quiz._id,
                        answers: submittedAnswers,
                        score,
                        timeTaken,
                });

                await newAttempt.save();
                const io = req.app.get("io");

                io.to(roomCode).emit("leaderboardUpdate", {
                        user: req.user.name,
                        score: newAttempt.score,
                        timeTaken: newAttempt.timeTaken,
                });


                res.status(200).json({
                        message: 'Quiz submitted successfully',
                        score,
                        total: quiz.questions.length,
                        timeTaken
                });
        } catch (error) {
                res.status(500).json({ message: 'Error submitting quiz', error: error.message });
        }
};


// GET /api/quizzes/:roomCode/result
export const getQuizResult = async (req, res) => {
        try {
                const { roomCode } = req.params;
                const userId = req.user._id;

                const quiz = await Quiz.findOne({ roomCode });
                if (!quiz) return res.status(404).json({ message: "Quiz not found" });

                // Prevent creator from viewing result
                if (quiz.createdBy.toString() === userId.toString()) {
                        return res.status(403).json({ message: "Creators cannot view results like this" });
                }

                const attempt = await Attempt.findOne({ user: userId, quiz: quiz._id });
                if (!attempt) return res.status(403).json({ message: "You haven't attempted this quiz" });

                res.status(200).json({
                        score: attempt.score,
                        total: quiz.questions.length,
                        answers: attempt.answers, // user's submitted answers (text)
                        correctAnswers: quiz.questions.map(q => q.options[q.correctAnswerIndex]), // correct answers as text
                        timeTaken: attempt.timeTaken,
                });

        } catch (error) {
                res.status(500).json({ message: "Error getting result", error: error.message });
        }
};

// GET /api/quizzes/:roomCode/leaderboard
export const getLeaderboard = async (req, res) => {
        try {
                const { roomCode } = req.params;

                const quiz = await Quiz.findOne({ roomCode });
                if (!quiz) {
                        return res.status(404).json({ message: "Quiz not found" });
                }

                const attempts = await Attempt.find({ quiz: quiz._id })
                        .populate("user", "name") // Show user details
                        .sort([["score", -1], ["timeTaken", 1]]); // Score desc, time asc

                // Only return name, score, and timeTaken
                const formattedLeaderboard = attempts.map(attempt => ({
                        name: attempt.user.name,
                        score: attempt.score,
                        timeTaken: attempt.timeTaken,
                }));

                res.status(200).json({ leaderboard: formattedLeaderboard });
        } catch (error) {
                res.status(500).json({ message: "Error fetching leaderboard", error: error.message });
        }
};


//GET /api/quizzes/:roomCode/analytics
export const getAnalytics = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const userId = req.user._id;

    const quiz = await Quiz.findOne({ roomCode });

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (quiz.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only creator can view analytics" });
    }

    const attempts = await Attempt.find({ quiz: quiz._id }).populate("user", "name");

    const totalAttempts = attempts.length;
    const totalScore = attempts.reduce((acc, cur) => acc + cur.score, 0);
    const avgScore = totalAttempts > 0 ? (totalScore / totalAttempts).toFixed(2) : 0;

    // Best/Worst performer (first one only)
    const maxScore = Math.max(...attempts.map(a => a.score));
    const minScore = Math.min(...attempts.map(a => a.score));

    const best = attempts.find(a => a.score === maxScore);
    const worst = attempts.find(a => a.score === minScore);

    // Question-wise stats: correct/incorrect counts and percentages
    let maxCorrect = -1, minCorrect = Infinity, bestIdx = -1, worstIdx = -1;
    const questionStats = quiz.questions.map((question, index) => {
      let correctCount = 0;
      let incorrectCount = 0;
      attempts.forEach(attempt => {
        // If answer is index, compare directly; if answer is text, compare with correct option
        const answer = attempt.answers[index];
        let isCorrect = false;
        if (typeof answer === 'number') {
          isCorrect = answer === question.correctAnswerIndex;
        } else if (typeof answer === 'string') {
          isCorrect = answer.trim() === question.options[question.correctAnswerIndex]?.trim();
        }
        if (isCorrect) correctCount++;
        else incorrectCount++;
      });
      if (correctCount > maxCorrect) { maxCorrect = correctCount; bestIdx = index; }
      if (correctCount < minCorrect) { minCorrect = correctCount; worstIdx = index; }
      const total = correctCount + incorrectCount;
      return {
        question: question.questionText,
        correctCount,
        incorrectCount,
        correctPercent: total > 0 ? ((correctCount / total) * 100).toFixed(1) : '0.0',
        incorrectPercent: total > 0 ? ((incorrectCount / total) * 100).toFixed(1) : '0.0',
        isBest: false, // will set below
        isWorst: false
      };
    });
    // Mark best/worst
    if (bestIdx !== -1) questionStats[bestIdx].isBest = true;
    if (worstIdx !== -1) questionStats[worstIdx].isWorst = true;

    res.status(200).json({
      totalAttempts,
      averageScore: avgScore,
      bestPerformer: best ? { name: best.user.name, score: best.score, timeTaken: best.timeTaken } : null,
      worstPerformer: worst ? { name: worst.user.name, score: worst.score, timeTaken: worst.timeTaken } : null,
      questionWiseStats: questionStats
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching analytics", error: error.message });
  }
};


//POST /api/quizzes/ai/generate
export const generateAIQuiz = async (req, res) => {
        try {
                const { topic, numberOfQuestions } = req.body;

                if (!topic || !numberOfQuestions) {
                        return res.status(400).json({ message: "Topic and numberOfQuestions are required." });
                }

                const questions = await generateQuizWithGemini(topic, numberOfQuestions);
                const validQuestions = questions.filter(q =>
                        q.questionText && Array.isArray(q.options) && typeof q.correctAnswerIndex === 'number'
                );
                return res.status(200).json({ topic, questions });
        } catch (error) {
                res.status(500).json({ message: "Error generating quiz", error: error.message });
        }
};
// Route: POST /api/quizzes/ai/save
export const saveAIQuiz = async (req, res) => {
        try {
                const { topic, questions, duration } = req.body;

                if (!topic || !questions || !Array.isArray(questions) || questions.length === 0 || !duration) {
                        return res.status(400).json({ message: "Invalid quiz data" });
                }

                const roomCode = await generateUniqueRoomCode();

                const newQuiz = new Quiz({
                        title: topic,
                        roomCode,
                        questions,
                        duration,
                        createdBy: req.user._id,
                        isAIgenerated: true,
                });

                await newQuiz.save();

                res.status(201).json({
                        message: "Quiz saved successfully",
                        quiz: newQuiz,
                });
        } catch (error) {
                res.status(500).json({ message: "Error saving AI quiz", error: error.message });
        }
};


