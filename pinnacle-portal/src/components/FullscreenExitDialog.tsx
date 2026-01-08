import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldAlert } from "lucide-react";

interface FullscreenExitDialogProps {
  open: boolean;
  onConfirm: () => void;
  chancesLeft: number;
}

export const FullscreenExitDialog = ({ open, onConfirm, chancesLeft }: FullscreenExitDialogProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-yellow-500" />
            Fullscreen Exit Warning
          </AlertDialogTitle>
          <AlertDialogDescription>
            You have exited fullscreen mode. Please stay in fullscreen for the duration of the quiz.
            <br />
            You have <strong>{chancesLeft}</strong> {chancesLeft === 1 ? "chance" : "chances"} left.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onConfirm}>Okay</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
