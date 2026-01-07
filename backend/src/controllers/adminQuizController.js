const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Result = require('../models/Result');
const redisClient = require('../config/redis');

// Helper function to generate a unique 6-character alphanumeric access code
const generateUniqueAccessCode = async () => {
  let accessCode;
  let isUnique = false;
  while (!isUnique) {
    accessCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // Generate 6-char alphanumeric
    const existingQuiz = await Quiz.findOne({ accessCode });
    if (!existingQuiz) {
      isUnique = true;
    }
  }
  return accessCode;
};

// @desc    Create a new quiz
// @route   POST /api/admin/quizzes
// @access  Private/Admin
exports.createQuiz = async (req, res) => {
  try {
    const { title, duration, status, category } = req.body;

    const accessCode = await generateUniqueAccessCode();
    
    const quiz = new Quiz({
      title,
      // description is no longer required
      category, // Add the category field
      duration,
      status,
      createdBy: req.user._id,
      accessCode, // Add the generated access code
    });
    const createdQuiz = await quiz.save();
    res.status(201).json(createdQuiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Update a quiz
// @route   PUT /api/admin/quizzes/:quizId
// @access  Private/Admin
exports.updateQuiz = async (req, res) => {
  try {
    const { title, duration, status, category } = req.body;
    const quiz = await Quiz.findById(req.params.quizId);

    if (quiz) {
      if (title !== undefined) quiz.title = title;
      if (duration !== undefined) quiz.duration = duration;
      if (status !== undefined) quiz.status = status;
      if (category !== undefined) quiz.category = category;

      const updatedQuiz = await quiz.save();

      // Invalidate the cache for this quiz
      try {
        await redisClient.del(`quiz:${quiz.accessCode}`);
        console.log(`Cache invalidated for quiz accessCode: ${quiz.accessCode}`);
      } catch (error) {
        console.error("Redis cache invalidation failed:", error);
      }

      res.json(updatedQuiz);
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/admin/quizzes/:quizId
// @access  Private/Admin
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (quiz) {
      // Optional: Prevent deleting quizzes that are already submitted
      const results = await Result.find({ quiz: req.params.quizId });
      if (results.length > 0) {
        return res.status(400).json({ message: 'Cannot delete quiz with submissions' });
      }
      
      await Question.deleteMany({ quiz: req.params.quizId });
      await quiz.deleteOne();
      res.json({ message: 'Quiz removed' });
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Get all quizzes
// @route   GET /api/admin/quizzes
// @access  Private/Admin
exports.getAllQuizzes = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const count = await Quiz.countDocuments({});
    const quizzes = await Quiz.find({})
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ quizzes, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Get quiz by ID
// @route   GET /api/admin/quizzes/:quizId
// @access  Private/Admin
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate('questions');
    if (quiz) {
      res.json(quiz);
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Get a single question from a quiz
// @route   GET /api/admin/quizzes/:quizId/questions/:questionId
// @access  Private/Admin
exports.getQuestionFromQuiz = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const question = await Question.findOne({ _id: questionId, quiz: quizId });
    if (!question) {
      return res.status(404).json({ message: 'Question not found in this quiz' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Helper function to recalculate quiz total marks
const recalculateQuizTotalMarks = async (quizId) => {
  const quiz = await Quiz.findById(quizId).populate('questions');
  if (quiz) {
    const totalMarks = quiz.questions.reduce((sum, question) => sum + (question.marks || 0), 0);
    quiz.totalMarks = totalMarks;
    await quiz.save();
  }
};



// @desc    Add a question to a quiz
// @route   POST /api/admin/quizzes/:quizId/questions
// @access  Private/Admin
exports.addQuestionToQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questionText, options, correctAnswer, marks } = req.body; // Extract marks

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const question = new Question({
      questionText,
      options,
      correctAnswer,
      marks, // Add marks to the question
      quiz: quizId,
    });

    const createdQuestion = await question.save();

    quiz.questions.push(createdQuestion._id);
    await quiz.save(); // Save quiz to link question
    
    await recalculateQuizTotalMarks(quizId); // Recalculate total marks for the quiz

    res.status(201).json(createdQuestion);
  } catch (error) {
    console.error("Error adding question to quiz:", error); // Log full error to console
    res.status(500).json({ message: 'Server error', error: error.message }); // Send specific error message
  }
};

// @desc    Update a question in a quiz
// @route   PUT /api/admin/quizzes/:quizId/questions/:questionId
// @access  Private/Admin
exports.updateQuestionInQuiz = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;
    const { questionText, options, correctAnswer, marks } = req.body; // Extract marks

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const question = await Question.findOne({ _id: questionId, quiz: quizId });
    if (!question) {
      return res.status(404).json({ message: 'Question not found in this quiz' });
    }

    question.questionText = questionText || question.questionText;
    question.options = options || question.options;
    question.correctAnswer = correctAnswer || question.correctAnswer;
    question.marks = marks || question.marks; // Update marks

    const updatedQuestion = await question.save();
    await recalculateQuizTotalMarks(quizId); // Recalculate total marks for the quiz
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Delete a question from a quiz
// @route   DELETE /api/admin/quizzes/:quizId/questions/:questionId
// @access  Private/Admin
exports.deleteQuestionFromQuiz = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const question = await Question.findOne({ _id: questionId, quiz: quizId });
    if (!question) {
      return res.status(404).json({ message: 'Question not found in this quiz' });
    }

    await question.deleteOne(); // Use deleteOne() on the document

    // Remove the question ID from the quiz's questions array
    quiz.questions = quiz.questions.filter(
      (q) => q.toString() !== questionId
    );
    await quiz.save();
    
    await recalculateQuizTotalMarks(quizId); // Recalculate total marks for the quiz

    res.json({ message: 'Question removed from quiz' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Get all results for a specific quiz
// @route   GET /api/admin/quizzes/:quizId/results
// @access  Private/Admin
exports.getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId).populate('questions'); // Populate questions
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const totalMarks = quiz.questions.reduce((sum, question) => sum + (question.marks || 0), 0);

    const results = await Result.find({ quiz: quizId })
      .populate('user', 'name email') // Populate user details
      .populate('quiz', 'title accessCode'); // Populate quiz details (without totalMarks directly)

    // Append calculated totalMarks to each quiz result object for frontend consumption
    const resultsWithTotalMarks = results.map(result => ({
      ...result.toObject(),
      quiz: {
        ...result.quiz.toObject(),
        totalMarks: totalMarks,
      },
    }));

    res.json({ quizTitle: quiz.title, totalMarks: totalMarks, results: resultsWithTotalMarks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Delete a student's quiz result
// @route   DELETE /api/admin/results/:resultId
// @access  Private/Admin
exports.deleteResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.resultId);

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    await result.deleteOne();
    res.json({ message: 'Result removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

