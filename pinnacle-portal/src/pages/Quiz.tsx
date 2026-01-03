import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams
import { Button } from "@/components/ui/button";
import { QuizTimer } from "@/components/QuizTimer";
import { QuestionCard } from "@/components/QuestionCard";
import { QuizProgress } from "@/components/QuizProgress";
import { useQuiz } from "@/hooks/useQuiz";
import { User } from "@/types";
import { ChevronLeft, ChevronRight, Send, RotateCcw, Trophy, Menu, Loader2, AlertTriangle, Info } from "lucide-react"; // Import new icons
import { QuizSidebar } from "@/components/QuizSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface QuizProps {
  user: User | null;
}

export const Quiz = ({ user }: QuizProps) => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>(); // Get quizId from URL
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    quizState,
    isStarted,
    questions,
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
    quizDuration // Access quizDuration
  } = useQuiz(quizId || ""); // Pass quizId to useQuiz

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    // Hide the main header when on the quiz page
    const header = document.querySelector('header');
    if (header) {
      header.style.display = 'none';
    }
    // Cleanup function to restore header display
    return () => {
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
    };
  }, []);

  if (!user) {
    return null;
  }

  // Display loading state for initial data fetch
  if (isLoadingQuestions || isCheckingResult) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-lg text-text-secondary">Loading quiz...</p>
      </div>
    );
  }

  // Display error state
  if (errorFetchingQuestions) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="ml-3 text-lg text-destructive">{errorFetchingQuestions}</p>
      </div>
    );
  }
  
  // Display if user has already submitted the quiz
  if (isAlreadySubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
          <h1 className="mb-4 text-2xl font-bold text-primary">Quiz Already Completed</h1>
          <p className="mb-8 text-text-secondary">
            You have already submitted this quiz. You cannot take it again.
          </p>
          <Button onClick={() => navigate("/dashboard")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Display if no questions are found (e.g., quizId is invalid or quiz has no questions)
  if (!questions || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Info className="h-8 w-8 text-yellow-500" />
        <p className="ml-3 text-lg text-text-secondary">No questions found for this quiz.</p>
      </div>
    );
  }

  // Results Screen
  if (quizState.isSubmitted) {
    const { correct, total } = calculateScore();
    const percentage = Math.round((correct / total) * 100);

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Trophy className="h-10 w-10" />
            </div>
          </div>
          
          <h1 className="mb-2 text-2xl font-bold text-primary">Quiz Completed!</h1>
          <p className="mb-8 text-text-secondary">Great effort, {user.name.split(" ")[0]}!</p>
          
          <div className="mb-8 rounded-lg bg-primary/10 p-6">
            <div className="mb-2 text-5xl font-bold text-primary">
              {correct}/{total}
            </div>
            <p className="text-text-secondary">
              You scored {percentage}%
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={resetQuiz} variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={() => navigate("/dashboard")} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Start Screen
  if (!isStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
          <h1 className="mb-4 text-2xl font-bold text-primary">Ready to Begin?</h1>
          <p className="mb-8 text-text-secondary">
            You have {quizDuration} minutes to complete {questions.length} questions. The timer starts when you click the button below.
          </p>
          <Button size="lg" onClick={startQuiz} className="w-full bg-accent text-primary font-bold hover:bg-accent-hover">
            Start Quiz
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[quizState.currentQuestion];
  const isFirst = quizState.currentQuestion === 0;
  const isLast = quizState.currentQuestion === questions.length - 1;
  const answeredCount = Object.keys(quizState.answers).length;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-card text-primary shadow-sm border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-2xl font-bold text-primary">Pinnacle 2025</span>
          
          <QuizTimer timeRemaining={quizState.timeRemaining} isSubmitted={quizState.isSubmitted} />

          <div>
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm p-0">
                <QuizSidebar 
                  questions={questions}
                  quizState={quizState}
                  onGoToQuestion={(index) => {
                    goToQuestion(index);
                    setIsSidebarOpen(false);
                  }}
                  onMarkForLater={(questionId) => markForLater(questionId)}
                  currentQuestionIndex={quizState.currentQuestion}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      <div className="pt-8 grid w-full max-w-7xl mx-auto grid-cols-1 gap-12 lg:grid-cols-4">
        {/* Main Quiz Content */}
        <div className="lg:col-span-3">
          {/* Question */}
          <QuestionCard
            question={currentQ}
            selectedAnswer={quizState.answers[currentQ._id]}
            onSelectAnswer={(answer) => selectAnswer(currentQ._id, answer)}
            questionNumber={quizState.currentQuestion + 1}
            totalQuestions={questions.length}
          />
        </div>

        {/* Sidebar for larger screens */}
        <div className="hidden lg:block lg:col-span-1">
          <QuizSidebar 
            questions={questions}
            quizState={quizState}
            onGoToQuestion={goToQuestion}
            onMarkForLater={(questionId) => markForLater(questionId)}
            currentQuestionIndex={quizState.currentQuestion}
          />
        </div>
      </div>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={isFirst}
            className="border-primary text-primary hover:bg-primary/10"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm text-text-secondary">
            {answeredCount} of {questions.length} answered
          </span>

          {isLast ? (
            <Button onClick={submitQuiz} className="bg-accent text-primary font-bold hover:bg-accent-hover">
              <Send className="mr-2 h-4 w-4" />
              Submit
            </Button>
          ) : (
            <Button onClick={nextQuestion} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </footer>
    </>
  );
};
