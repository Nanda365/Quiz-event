import { Question } from "@/types";

interface QuizProgressProps {
  questions: Question[];
  currentQuestion: number;
  answers: Record<number, number>;
  onGoToQuestion: (index: number) => void;
}

export const QuizProgress = ({
  questions,
  currentQuestion,
  answers,
  onGoToQuestion
}: QuizProgressProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-4">
      {questions.map((q, index) => {
        const isAnswered = answers[q.id] !== undefined;
        const isCurrent = currentQuestion === index;

        return (
          <button
            key={q.id}
            onClick={() => onGoToQuestion(index)}
            className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-all duration-200 ${
              isCurrent
                ? "bg-primary text-primary-foreground scale-110 shadow-lg"
                : isAnswered
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
};
