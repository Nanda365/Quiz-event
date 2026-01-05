const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const redisClient = require('../config/redis');

exports.getQuiz = async (req, res) => {
  try {
    const quizAccessCode = req.params.id;
    const cachedQuiz = await redisClient.get(`quiz:${quizAccessCode}`);

    if (cachedQuiz) {
      console.log(`Cache hit for quiz accessCode: ${quizAccessCode}`);
      return res.json(cachedQuiz);
    }

    console.log(`Cache miss for quiz accessCode: ${quizAccessCode}. Fetching from DB.`);
    const quiz = await Quiz.findOne({ accessCode: quizAccessCode, status: 'published' }).populate('questions').lean();

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found or not published' });
    }

    // Cache the quiz for 1 hour
    const quizToCache = JSON.stringify(quiz);
    await redisClient.set(`quiz:${quizAccessCode}`, quizToCache, {
      EX: 3600, // 1 hour
    });
    console.log(`Quiz with accessCode: ${quizAccessCode} cached.`);

    res.json(quiz);
  } catch (error) {
    console.error("Error in getQuiz:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    // The incoming ID is the user-friendly access code.
    const { quizId: quizAccessCode, answers } = req.body;
    const userId = req.user._id;

    // 1. Find the quiz by its access code to get the actual _id
    const quiz = await Quiz.findOne({ accessCode: quizAccessCode }).populate('questions');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    const actualQuizId = quiz._id; // Use this ID for all DB operations

    // 2. Check for existing results using the correct quiz _id
    const existingResult = await Result.findOne({ user: userId, quiz: actualQuizId });
    if (existingResult) {
      return res.status(400).json({ message: 'You have already submitted this quiz' });
    }

    let score = 0;
    const processedAnswers = [];

    quiz.questions.forEach(question => {
      // Add a defensive check in case a question was deleted but still referenced
      if (!question) {
        return; // Skip this iteration if the question is null
      }
      const userAnswer = answers.find(ans => ans.questionId === question._id.toString());
      processedAnswers.push({ questionId: question._id, answer: userAnswer ? userAnswer.answer : null });
      if (userAnswer && userAnswer.answer === question.correctAnswer) {
        score += question.marks; // Add question.marks instead of 1
      }
    });

    // 3. Save the new result using the correct quiz _id
    const result = new Result({
      user: userId,
      quiz: actualQuizId,
      answers: processedAnswers,
      score,
    });

    await result.save();

    res.status(201).json({ message: 'Quiz submitted successfully', result });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Check for an existing result for a user on a specific quiz
// @route   GET /api/quiz/:quizId/result
// @access  Private
exports.getExistingResult = async (req, res) => {
  try {
    const quizAccessCode = req.params.quizId;
    const userId = req.user._id;

    const quiz = await Quiz.findOne({ accessCode: quizAccessCode });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const result = await Result.findOne({ user: userId, quiz: quiz._id });
    if (!result) {
      return res.status(404).json({ message: 'Result not found for this user and quiz' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


