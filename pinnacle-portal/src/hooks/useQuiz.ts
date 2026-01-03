import { useState, useCallback, useEffect, useRef } from "react";
import { QuizState, Question } from "@/types";
import api from "@/lib/api"; // Import api for fetching
import { submitQuiz as submitQuizService, getExistingResult } from "@/services/quizService";

export const useQuiz = (quizId: string) => { // Accept quizId as a parameter
  const [quizDuration, setQuizDuration] = useState(0); // State to store fetched quiz duration
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    answers: {},
    markedForLater: {},
    timeRemaining: 0, // Initialize with 0, will be set after fetch
    isSubmitted: false
  });
  
  const [isStarted, setIsStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]); // New state for questions
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true); // Loading state
  const [errorFetchingQuestions, setErrorFetchingQuestions] = useState<string | null>(null); // Error state
  const [isCheckingResult, setIsCheckingResult] = useState(true);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch questions and check for existing result when quizId changes
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId) return;

      setIsLoadingQuestions(true);
      setIsCheckingResult(true);
      setErrorFetchingQuestions(null);

      try {
        // Check for existing result first
        await getExistingResult(quizId);
        setIsAlreadySubmitted(true); // If the request succeeds, a result exists
      } catch (error) {
        // A 404 error is expected if no result exists, so we can proceed
        setIsAlreadySubmitted(false);
      } finally {
        setIsCheckingResult(false);
      }

      try {
        const response = await api.get(`/quiz/${quizId}`);
        setQuestions(response.data.questions);
        setQuizDuration(response.data.duration); // Set the fetched quiz duration
        setQuizState(prev => ({ ...prev, timeRemaining: response.data.duration * 60 })); // Initialize timeRemaining
      } catch (error: any) { 
        setErrorFetchingQuestions(error.response?.data?.message || "Failed to load quiz questions. Please try again.");
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    fetchQuizData();
  }, [quizId]);

  const startQuiz = useCallback(() => {
    setIsStarted(true);
    setQuizState({
      currentQuestion: 0,
      answers: {},
      markedForLater: {},
      timeRemaining: quizDuration * 60, // Use fetched quizDuration
      isSubmitted: false
    });
  }, [quizDuration]);

  const selectAnswer = useCallback((questionId: string, answer: string) => {
    setQuizState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer },
      markedForLater: { ...prev.markedForLater, [questionId]: false } // Unmark if answered
    }));
  }, []);

  const markForLater = useCallback((questionId: string) => {
    setQuizState(prev => ({
      ...prev,
      markedForLater: { ...prev.markedForLater, [questionId]: !prev.markedForLater[questionId] }
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    setQuizState(prev => ({
      ...prev,
      currentQuestion: Math.min(prev.currentQuestion + 1, questions.length - 1) // Use questions.length
    }));
  }, [questions]); // Depend on questions

  const prevQuestion = useCallback(() => {
    setQuizState(prev => ({
      ...prev,
      currentQuestion: Math.max(prev.currentQuestion - 1, 0)
    }));
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setQuizState(prev => ({
      ...prev,
      currentQuestion: index
    }));
  }, []);

  const submitQuiz = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    try {
      await submitQuizService(quizId, quizState.answers);
      setQuizState(prev => ({ ...prev, isSubmitted: true }));
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      // Optionally, show an error to the user
    }
  }, [quizId, quizState.answers]);

  const calculateScore = useCallback(() => {
    let correct = 0;
    questions.forEach(q => {
      if (quizState.answers[q._id] === q.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: questions.length }; // Use questions.length
  }, [quizState.answers, questions]); // Depend on questions

  const resetQuiz = useCallback(() => {
    setIsStarted(false);
    setQuizState({
      currentQuestion: 0,
      answers: {},
      markedForLater: {},
      timeRemaining: quizDuration * 60, // Use fetched quizDuration
      isSubmitted: false
    });
  }, [quizDuration]);

  useEffect(() => {
    if (isStarted && !quizState.isSubmitted && quizState.timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setQuizState(prev => {
          if (prev.timeRemaining <= 1) {
            return { ...prev, timeRemaining: 0, isSubmitted: true };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isStarted, quizState.isSubmitted]);

  return {
    quizState,
    isStarted,
    questions, // Return questions from state
    isLoadingQuestions,
    errorFetchingQuestions,
    isCheckingResult,
    isAlreadySubmitted,
    startQuiz,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitQuiz,
    calculateScore,
    resetQuiz,
    markForLater,
    quizDuration // Export quizDuration
  };
};
