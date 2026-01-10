import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { forgotPassword, sendResetCode } from "@/services/authService";

const emailSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  code: z.string().min(6, "Code must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"enter-email" | "enter-code">("enter-email");
  
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendResetCode(validation.data.email);
      if (result.success) {
        toast({
          title: "Code sent",
          description: "A reset code has been sent to your email.",
        });
        setStep("enter-code");
      } else {
        setError(result.error || "Failed to send reset code");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const validation = resetPasswordSchema.safeParse({ code, newPassword, confirmPassword });
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await forgotPassword(email, validation.data.code, validation.data.newPassword);
      if (result.success) {
        toast({
          title: "Password changed successfully",
          description: "You can now log in with your new password.",
        });
        navigate("/login");
      } else {
        setError(result.error || "Failed to change password");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isAuthenticated={false} onLogout={() => {}} />

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-xl border bg-card p-8 shadow-sm">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-2xl font-bold text-primary">Forgot Password</h1>
              <p className="text-sm text-text-secondary">
                {step === "enter-email"
                  ? "Enter your email to receive a reset code."
                  : "Enter the reset code and your new password."}
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {step === "enter-email" ? (
              <form onSubmit={handleSendCode} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-text-secondary">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="bg-background focus:ring-primary"
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive">{fieldErrors.email}</p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-accent text-primary font-bold hover:bg-accent-hover" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    "Send Code"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-text-secondary">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Reset Code</Label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isLoading}
                    className="bg-background focus:ring-primary"
                  />
                  {fieldErrors.code && (
                    <p className="text-xs text-destructive">{fieldErrors.code}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-background focus:ring-primary"
                  />
                  {fieldErrors.newPassword && (
                    <p className="text-xs text-destructive">{fieldErrors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-background focus:ring-primary"
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-accent text-primary font-bold hover:bg-accent-hover" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-text-secondary">
              Remember your password?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
