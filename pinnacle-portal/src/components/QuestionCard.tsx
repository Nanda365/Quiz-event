import { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | undefined;
  onSelectAnswer: (answer: string) => void;
  questionNumber: number;
  totalQuestions: number;
}

export const QuestionCard = ({
  question,
  selectedAnswer,
  onSelectAnswer,
  questionNumber,
  totalQuestions
}: QuestionCardProps) => {
  return (
    <div className="rounded-xl border bg-card p-8 shadow-sm">
      <p className="mb-4 text-sm text-text-secondary">
        Question {questionNumber} of {totalQuestions}
      </p>
      
      <h2 className="mb-6 text-xl font-semibold text-primary">
        {question.questionText}
      </h2>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelectAnswer(option)}
            className={`w-full rounded-lg border p-4 text-left transition-all duration-200 ${
              selectedAnswer === option
                ? "border-primary bg-primary/10"
                : "border-gray-200 bg-white hover:border-primary hover:bg-primary/5"
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                selectedAnswer === option
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 text-text-secondary"
              }`}>
                {String.fromCharCode(65 + index)}
              </span>
              <span className="font-medium">{option}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
