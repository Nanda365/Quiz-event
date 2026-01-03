import { Clock } from "lucide-react";

interface QuizTimerProps {
  timeRemaining: number;
}

export const QuizTimer = ({ timeRemaining }: QuizTimerProps) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLow = timeRemaining < 60;

  return (
    <div className={`flex items-center gap-2 rounded-lg px-4 py-2 text-lg font-semibold ${
      isLow ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
    }`}>
      <Clock className="h-5 w-5" />
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
};
