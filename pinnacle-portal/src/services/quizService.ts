import api from '../lib/api';

export const getQuiz = async (quizId: string) => {
  try {
    const response = await api.get(`/quiz/${quizId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const startQuiz = async (quizId: string) => {
    try {
      const response = await api.post('/quiz/start', { quizId });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  };

export const submitQuiz = async (quizId: string, answers: Record<string, string>) => {
  try {
    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
  }
};

export const getResult = async (attemptId: string) => {
    try {
        const response = await api.get(`/quiz/result/${attemptId}`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const getExistingResult = async (quizId: string) => {
    return api.get(`/quiz/${quizId}/result`);
};
