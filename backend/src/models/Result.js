const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    answer: { type: String },
  }],
  score: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

resultSchema.index({ user: 1, quiz: 1 }, { unique: true });

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;
