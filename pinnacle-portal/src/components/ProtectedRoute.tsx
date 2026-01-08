import React from 'react';
import { Navigate } from 'react-router-dom';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  user: User | null;
  adminOnly?: boolean;
  children: JSX.Element;
}

const ProtectedRoute = ({ user, adminOnly, children }: ProtectedRouteProps) => {
  const { isLoading } = useAuth(); // Get isLoading from useAuth

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading authentication...</div>; // Or a spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
