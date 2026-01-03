const express = require('express');
const router = express.Router();
const { getQuiz, submitQuiz, getExistingResult } = require('../controllers/quizController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/:id', protect, getQuiz);
router.get('/:quizId/result', protect, getExistingResult);
router.post('/submit', protect, submitQuiz);

module.exports = router;
