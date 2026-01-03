const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  marks: { type: Number, required: true, default: 1 }, // Marks for this question
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
