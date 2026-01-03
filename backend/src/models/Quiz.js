const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  category: { type: String, required: true, default: 'General' },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  duration: { type: Number, required: true }, // in minutes
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  accessCode: { type: String, unique: true, required: true, minlength: 6, maxlength: 6, uppercase: true },
}, { timestamps: true });

quizSchema.index({ quizId: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
