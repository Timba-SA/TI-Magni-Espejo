import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { isAuthenticated } from "@/features/auth/services/authService";

interface AuthProtectedRouteProps {
  children: ReactNode;
}

export function AuthProtectedRoute({ children }: AuthProtectedRouteProps) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
