import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { getCurrentUser, isAuthenticated } from "@/features/auth/services/authService";
import type { UserRole } from "@/features/auth/types/auth.types";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Si se especifica, solo esos roles pueden acceder. Sin esto, basta con estar autenticado. */
  allowedRoles?: UserRole[];
}

/**
 * Guard de rutas privadas.
 * - Sin sesión → /login
 * - Cliente intentando acceder al panel → /
 * - Rol no permitido → /home (o puedes cambiar a una página 403)
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();

  // Cliente no tiene acceso al panel de gestión
  if (user?.rol === "CLIENT") {
    return <Navigate to="/" replace />;
  }

  // Guard de rol específico (para rutas dentro del panel)
  if (allowedRoles && user && !allowedRoles.includes(user.rol as UserRole)) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
