const express = require('express');
const router = express.Router();
const {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAllQuizzes,
  getQuizById,
  addQuestionToQuiz,
  getQuestionFromQuiz,
  updateQuestionInQuiz,
  deleteQuestionFromQuiz,
  getQuizResults, // Import getQuizResults
  deleteResult, // Import deleteResult
} = require('../controllers/adminQuizController');
const { protect, authorize } = require('../middlewares/authMiddleware'); // Updated import
// All routes in this file are protected and admin-only
router.use(protect, authorize('admin')); // Corrected middleware usage

router.route('/')
  .post(createQuiz)
  .get(getAllQuizzes);

router.route('/:quizId')
  .get(getQuizById)
  .put(updateQuiz)
  .delete(deleteQuiz);

router.route('/:quizId/questions')
  .post(addQuestionToQuiz);

router.route('/:quizId/questions/:questionId')
  .get(getQuestionFromQuiz)
  .put(updateQuestionInQuiz)
  .delete(deleteQuestionFromQuiz);

router.route('/:quizId/results') // New route for quiz results
  .get(getQuizResults);

// New route to delete a specific result
router.route('/results/:resultId')
  .delete(deleteResult);


module.exports = router;
