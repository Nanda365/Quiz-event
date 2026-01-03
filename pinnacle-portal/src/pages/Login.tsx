import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import logo from '@/assests/Login page.png';

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

export const Login = ({ onLogin, isLoading }: LoginProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const validation = loginSchema.safeParse({ email, password });
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

    const result = await onLogin(email, password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Header isAuthenticated={false} onLogout={() => {}} />

      <main className="flex w-full flex-1">
        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary to-secondary">
          <div className="flex h-full flex-col items-center justify-center p-12 text-white">
            <h1 className="mt-20 mb-4 text-4xl font-bold">Your Gateway to Glory: Pinnacle 2025</h1>
            <p className="mb-4 text-center text-lg text-primary-foreground/80">
              Compete, Conquer, and kickstart your IT career.
            </p>
            <img src={logo} alt="Pinnacle Logo" className="mb-2 h-25 w-25" />
          </div>
        </div>
        
        <div className="flex w-full items-center justify-center p-4 lg:w-1/2">
          <div className="w-full max-w-md">
            <div className="rounded-xl border bg-card p-8 shadow-sm">
              <div className="mb-8 text-center">
                <h1 className="mb-2 text-2xl font-bold text-primary">Welcome back</h1>
                <p className="text-sm text-text-secondary">Sign in to your account</p>
              </div>

              {error && (
                <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-text-secondary">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={isLoading}
                    className="bg-background focus:ring-primary"
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="bg-background focus:ring-primary"
                  />
                  {fieldErrors.password && (
                    <p className="text-xs text-destructive">{fieldErrors.password}</p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-accent text-primary font-bold hover:bg-accent-hover" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-text-secondary">
                Don't have an account?{" "}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  Register
                </Link>
              </div>
              <div className="mt-4 text-center text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
