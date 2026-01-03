export interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  state: string;
  mobile: string;
  interestedCategories: string[];
  role: 'student' | 'admin';
}

export interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  marks: number;
}

export interface QuizState {
  currentQuestion: number;
  answers: Record<string, string>;
  markedForLater: Record<string, boolean>;
  timeRemaining: number;
  isSubmitted: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
