import api from '../lib/api';

const API_BASE_PATH = '/admin/quizzes';

const adminQuizService = {
  createQuiz: (quizData: any) => {
    return api.post(API_BASE_PATH, quizData);
  },

  updateQuiz: (quizId: string, quizData: any) => {
    return api.put(`${API_BASE_PATH}/${quizId}`, quizData);
  },

  deleteQuiz: (quizId: string) => {
    return api.delete(`${API_BASE_PATH}/${quizId}`);
  },

  getAllQuizzes: (pageNumber = 1) => {
    return api.get(`${API_BASE_PATH}?pageNumber=${pageNumber}`);
  },

  getQuizById: (quizId: string) => {
    return api.get(`${API_BASE_PATH}/${quizId}`);
  },

  addQuestionToQuiz: (quizId: string, questionData: any) => {
    return api.post(`${API_BASE_PATH}/${quizId}/questions`, questionData);
  },

  getQuestionById: (quizId: string, questionId: string) => {
    return api.get(`${API_BASE_PATH}/${quizId}/questions/${questionId}`);
  },

  updateQuestionInQuiz: (quizId: string, questionId: string, questionData: any) => {
    return api.put(`${API_BASE_PATH}/${quizId}/questions/${questionId}`, questionData);
  },

  deleteQuestionFromQuiz: (quizId: string, questionId: string) => {
    return api.delete(`${API_BASE_PATH}/${quizId}/questions/${questionId}`);
  },

  getQuizResults: (quizId: string) => { // New method to fetch quiz results
    return api.get(`${API_BASE_PATH}/${quizId}/results`);
  },

  deleteResult: (resultId: string) => {
    return api.delete(`/admin/quizzes/results/${resultId}`);
  },

  // New function to fetch a specific user's result for a quiz
  getQuizResultForUser: (quizId: string, userId: string) => {
    return api.get(`${API_BASE_PATH}/${quizId}/users/${userId}/result`);
  },
};

export default adminQuizService;
