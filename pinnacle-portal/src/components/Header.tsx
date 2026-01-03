import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface HeaderProps {
  isAuthenticated: boolean;
  user?: { name: string; role: 'student' | 'admin' };
  onLogout?: () => void;
}

export const Header = ({ isAuthenticated, user, onLogout }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card text-primary shadow-sm border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">Pinnacle 2025</span>
        </Link>
        
        <nav className="flex items-center gap-4">
          {isAuthenticated && user && (
            <>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard">
                  <Button variant="ghost" size="sm" className="text-primary">Admin</Button>
                </Link>
              )}
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-primary">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          )}
          {!isAuthenticated && (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-primary">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-accent text-primary font-bold hover:bg-accent-hover">Register</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
