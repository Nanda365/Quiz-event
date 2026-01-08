import { useMemo, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { Dashboard } from "@/pages/Dashboard";
import { Quiz } from "@/pages/Quiz";
import NotFound from "./pages/NotFound";
import { Header } from "./components/Header";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCreateQuiz from "./pages/admin/CreateQuiz";
import AdminEditQuiz from "./pages/admin/EditQuiz";
import ManageQuestions from "./pages/admin/ManageQuestions"; // Import ManageQuestions
import QuizResults from "./pages/admin/QuizResults"; // Import QuizResults
import ProtectedRoute from "./components/ProtectedRoute";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, isAuthenticated, isLoading, login, register, logout, isAuthResolved } = useAuth();
  const location = useLocation();
  const showFooter = !['/login', '/register', '/forgot-password'].includes(location.pathname);

  useEffect(() => {
    const handleAuthError = () => {
      logout();
    };

    window.addEventListener('auth-error', handleAuthError);

    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, [logout]);

  const headerUser = useMemo(() => {
    return user ? { name: user.name, role: user.role } : undefined;
  }, [user]);

  if (!isAuthResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-lg text-text-secondary">Loading application...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header isAuthenticated={isAuthenticated} user={headerUser} onLogout={logout} />
      <main className="flex-grow px-4 pt-16 pb-8">
        <Routes>
          <Route 
            path="/" 
            element={
              <Home />
            } 
          />
          <Route 
            path="/login" 
            element={
              isLoading ? (
                <div className="flex min-h-screen items-center justify-center">Loading authentication...</div>
              ) : isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={login} isLoading={isLoading} />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              isLoading ? (
                <div className="flex min-h-screen items-center justify-center">Loading authentication...</div>
              ) : isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register onRegister={register} isLoading={isLoading} />
              )
            } 
          />
          <Route 
            path="/forgot-password"
            element={<ForgotPassword />}
          />
          <Route 
            path="/dashboard" 
            element={<Dashboard user={user} onLogout={logout} />} 
          />
          <Route 
            path="/quiz/:quizId" 
            element={<Quiz user={user} />} 
          />
          <Route 
            path="/admin/quizzes"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route 
            path="/admin/dashboard"
            element={
              <ProtectedRoute user={user} adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin/quizzes/create"
            element={
              <ProtectedRoute user={user} adminOnly>
                <AdminCreateQuiz />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin/quizzes/edit/:quizId"
            element={
              <ProtectedRoute user={user} adminOnly>
                <AdminEditQuiz />
              </ProtectedRoute>
            }
          />
          <Route // New route for managing questions
            path="/admin/quizzes/:quizId/questions"
            element={
              <ProtectedRoute user={user} adminOnly>
                <ManageQuestions />
              </ProtectedRoute>
            }
          />
          <Route // New route for viewing quiz results
            path="/admin/quizzes/:quizId/results"
            element={
              <ProtectedRoute user={user} adminOnly>
                <QuizResults />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {showFooter && (
        <footer className="border-t py-8 text-center text-sm text-text-secondary">
          <p>© 2025 Pinnacle. All rights reserved.</p>
        </footer>
      )}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;