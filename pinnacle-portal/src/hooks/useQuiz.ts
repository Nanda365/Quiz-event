import { useState, useCallback, useEffect, useRef } from "react";
import { QuizState, Question } from "@/types";
import api from "@/lib/api"; // Import api for fetching
import { submitQuiz as submitQuizService, getExistingResult } from "@/services/quizService";
import { toast } from "sonner";

export const useQuiz = (quizId: string) => { // Accept quizId as a parameter
  const [quizDuration, setQuizDuration] = useState(0); // State to store fetched quiz duration
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [chancesLeft, setChancesLeft] = useState(3);
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

  const fetchQuizData = useCallback(async () => {
    if (!quizId) return;

    setIsLoadingQuestions(true);
    setIsCheckingResult(true);
    setErrorFetchingQuestions(null);

    try {
      await getExistingResult(quizId);
      setIsAlreadySubmitted(true);
    } catch (error) {
      setIsAlreadySubmitted(false);
    } finally {
      setIsCheckingResult(false);
    }

    try {
      const response = await api.get(`/quiz/${quizId}?_time=${new Date().getTime()}`);
      const newQuestions = response.data.questions;
      const newDuration = response.data.duration;
      
      setQuestions(newQuestions);
      setQuizDuration(newDuration);

      // Use a callback with the state setter to ensure we have the latest `isStarted` value
      // and avoid depending on it in the useCallback.
      setQuizState(prev => {
        if (!prev.isSubmitted) { // Only update time if the quiz is not submitted
          return { ...prev, timeRemaining: newDuration * 60 };
        }
        return prev;
      });

    } catch (error: any) {
      const message =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "Failed to load quiz questions. Please try again.";
      setErrorFetchingQuestions(message);
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [quizId]); // Removed dependencies on `isStarted` and `questions.length`

  // Fetch questions on initial load and when quizId changes
  useEffect(() => {
    fetchQuizData();
  }, [fetchQuizData]);

  // Refetch data when the window/tab gets focus
  useEffect(() => {
    const handleFocus = () => {
      // We can't use `isStarted` directly here as it would be stale.
      // Instead, we check the quiz state. A quiz is "started" if time is running
      // or it is submitted. We only want to refetch if it's pristine.
      setQuizState(currentQuizState => {
        if (currentQuizState.timeRemaining === quizDuration * 60 && !currentQuizState.isSubmitted) {
          fetchQuizData();
        }
        return currentQuizState;
      });
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchQuizData, quizDuration]);

  const startQuiz = useCallback(() => {
    setIsStarted(true);
    setQuizState(prev => ({
      ...prev,
      currentQuestion: 0,
      answers: {},
      markedForLater: {},
      timeRemaining: quizDuration * 60,
      isSubmitted: false
    }));

    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
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
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Failed to submit quiz. Please try again.");
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
            submitQuiz();
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
  }, [isStarted, quizState.isSubmitted, submitQuiz]);

  const reEnterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  const handleExit = useCallback((exitMethod: "fullscreen" | "tab") => {
    setFullscreenExitCount(prevCount => {
      const newCount = prevCount + 1;
      if (newCount >= 3) {
        toast.error(`You have exited fullscreen or switched tabs too many times. Your quiz will be submitted automatically.`);
        submitQuiz();
      } else {
        setChancesLeft(3 - newCount);
        setIsExitDialogOpen(true);
      }
      return newCount;
    });
  }, [submitQuiz]);

  const closeExitDialog = () => {
    setIsExitDialogOpen(false);
    reEnterFullscreen();
  };
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isStarted) {
        handleExit("tab");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isStarted) {
        handleExit("fullscreen");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isStarted, handleExit]);

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
    quizDuration, // Export quizDuration
    isExitDialogOpen,
    chancesLeft,
    closeExitDialog
  };
};
