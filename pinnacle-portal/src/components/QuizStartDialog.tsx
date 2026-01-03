import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Zap } from "lucide-react"; // Import only needed icons

interface QuizStartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartQuiz: (quizId: string, quizType: string) => void; // quizType will always be an empty string or generic
}

export const QuizStartDialog = ({ open, onOpenChange, onStartQuiz }: QuizStartDialogProps) => {
  const [quizId, setQuizId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setQuizId("");
      setError("");
    }
  }, [open]);

  const handleStart = () => {
    if (!quizId.trim()) {
      setError("Please enter a valid Quiz ID");
      return;
    }
    setError("");
    onStartQuiz(quizId, ""); // Pass quizId and an empty string for quizType
  };

  const getCategoryVisual = (categoryName: string) => {
    return categoryVisuals[categoryName] || { icon: CircleHelp, color: "from-gray-400 to-gray-500" };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full p-4 max-w-sm md:max-w-md lg:max-w-lg border-0 bg-gradient-to-br from-card via-card to-secondary/30 shadow-2xl max-h-screen overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <Rocket className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Launch Your Quiz
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your quiz ID and select the category to begin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quiz ID Input */}
          <div className="space-y-2">
            <Label htmlFor="quizId" className="text-sm font-medium text-foreground">
              Quiz ID
            </Label>
            <div className="relative">
              <Input
                id="quizId"
                placeholder="Enter your quiz ID (e.g., PIN2025)"
                value={quizId}
                onChange={(e) => {
                  setQuizId(e.target.value.toUpperCase());
                  setError("");
                }}
                className="h-12 bg-background/50 border-2 border-border focus:border-primary transition-all duration-200 text-lg font-mono tracking-wider"
              />
              <Zap className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <Rocket className="h-4 w-4 mr-2" />
            Start Quiz
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
