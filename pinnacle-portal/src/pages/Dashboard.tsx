import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QuizStartDialog } from "@/components/QuizStartDialog";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth from context
import { CheckCircle, AlertCircle, Play, Trophy } from "lucide-react";
import { useState } from "react";

const rules = [
  "Each question has 4 options with only one correct answer.",
  "You have 10 minutes to complete the quiz.",
  "You cannot go back after submitting the quiz.",
  "Ensure a stable internet connection throughout.",
  "Do not refresh or close the browser during the quiz.",
  "Your score will be displayed immediately after submission."
];

export const Dashboard = () => {
  const { user } = useAuth(); // Get user from context
  const navigate = useNavigate();
  const [showQuizDialog, setShowQuizDialog] = useState(false);

  const handleStartQuiz = (quizId: string, quizType: string) => {
    console.log("Starting quiz:", quizId, quizType);
    setShowQuizDialog(false);
    navigate(`/quiz/${quizId}`); // Navigate to quiz with ID
  };

  if (!user) {
    // This can be a loading spinner or null, as ProtectedRoute handles the redirect
    return null;
  }

  return (
    <>
      <div className="mx-auto max-w-4xl pb-16">
        {/* Welcome Section */}
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold text-primary">
            Welcome back, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-lg text-text-secondary">Ready to showcase your IT expertise?</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Rules Card */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-primary">Quiz Rules</h2>
              </div>
              <ul className="space-y-3">
                {rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-green-500" />
                    <span className="text-text-secondary">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Status Card */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Trophy className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-primary">Quiz Status</h3>
              </div>
              <div className="rounded-md bg-blue-50 p-4 text-center">
                <p className="font-semibold text-primary">Not Started</p>
                <p className="text-sm text-blue-600">Complete the quiz to see your rank.</p>
              </div>
            </div>

            {/* Start Quiz Button */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-bold text-primary">Ready to begin?</h3>
              <Button 
                size="lg" 
                onClick={() => setShowQuizDialog(true)}
                className="w-full bg-accent text-primary font-bold hover:bg-accent-hover shadow-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Your Quiz
              </Button>
              <p className="mt-3 text-center text-sm text-text-secondary">Click to enter your quiz ID and begin.</p>
            </div>
          </div>
        </div>
      </div>

      <QuizStartDialog
        open={showQuizDialog}
        onOpenChange={setShowQuizDialog}
        onStartQuiz={handleStartQuiz}
      />
    </>
  );
};
