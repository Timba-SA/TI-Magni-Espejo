import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

/**
 * Hook para acceder al estado global de autenticación.
 * Debe usarse dentro de <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
