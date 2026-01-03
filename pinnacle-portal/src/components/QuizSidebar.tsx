import { Question, QuizState } from "@/types";
import { CircleDotDashed, CheckCircle2, Bookmark, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuizSidebarProps {
  questions: Question[];
  quizState: QuizState;
  onGoToQuestion: (index: number) => void;
  onMarkForLater: (questionId: string) => void;
  currentQuestionIndex: number;
}

export const QuizSidebar = ({
  questions,
  quizState,
  onGoToQuestion,
  onMarkForLater,
  currentQuestionIndex,
}: QuizSidebarProps) => {
  const { answers, markedForLater } = quizState;

  const getQuestionStatus = (questionId: string, index: number) => {
    if (index === currentQuestionIndex) {
      return "current";
    } else if (answers[questionId] !== undefined) {
      return "answered";
    } else if (markedForLater[questionId]) {
      return "marked";
    } else {
      return "unanswered";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "answered":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "marked":
        return <Bookmark className="h-4 w-4 text-yellow-500" />;
      case "unanswered":
        return <Circle className="h-4 w-4 text-gray-400" />;
      case "current":
        return <CircleDotDashed className="h-4 w-4 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-xl font-bold text-primary">Question Overview</h3>
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={() => onMarkForLater(questions[currentQuestionIndex]._id)}
          className={cn(
            "w-full",
            markedForLater[questions[currentQuestionIndex]._id] ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "text-primary hover:bg-primary/10"
          )}
        >
          <Bookmark className="mr-2 h-4 w-4" />
          {markedForLater[questions[currentQuestionIndex]._id] ? "Unmark for Later" : "Mark for Later"}
        </Button>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, index) => {
          const status = getQuestionStatus(q._id, index);
          return (
            <Button
              key={q._id}
              onClick={() => onGoToQuestion(index)}
              variant="outline"
              size="icon"
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium transition-all",
                status === "current" && "bg-primary text-primary-foreground border-primary scale-105",
                status === "answered" && "bg-green-100 text-green-700 border-green-300",
                status === "marked" && "bg-yellow-100 text-yellow-700 border-yellow-300",
                status === "unanswered" && "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
              )}
            >
              {index + 1}
              {status !== "unanswered" && status !== "current" && (
                <span className="absolute -top-1 -right-1">
                  {getStatusIcon(status)}
                </span>
              )}
            </Button>
          );
        })}
      </div>
      
      <div className="mt-6">
        <h4 className="mb-2 text-lg font-bold text-primary">Legend</h4>
        <div className="space-y-2 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" /> Answered
          </div>
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-yellow-500" /> Marked for Later
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-gray-400" /> Unanswered
          </div>
          <div className="flex items-center gap-2">
            <CircleDotDashed className="h-4 w-4 text-primary" /> Current
          </div>
        </div>
      </div>
    </div>
  );
};
