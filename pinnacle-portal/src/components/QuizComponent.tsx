import React, { useState, useEffect } from 'react';
import { getQuiz, submitQuiz } from '../services/quizService';

const QuizComponent = ({ quizId }) => {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const quizData = await getQuiz(quizId);
        setQuiz(quizData);
      } catch (err) {
        setError(err.message || 'Failed to fetch quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const result = await submitQuiz(quizId, answers);
      console.log('Quiz submitted successfully', result);
      // Redirect to result page or show a success message
    } catch (err) {
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading quiz...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>{quiz.title}</h1>
      <form onSubmit={handleSubmit}>
        {quiz.questions.map((question) => (
          <div key={question._id}>
            <h3>{question.questionText}</h3>
            {question.options.map((option) => (
              <div key={option}>
                <label>
                  <input
                    type="radio"
                    name={question._id}
                    value={option}
                    onChange={() => handleAnswerChange(question._id, option)}
                  />
                  {option}
                </label>
              </div>
            ))}
          </div>
        ))}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </form>
    </div>
  );
};

export default QuizComponent;
