import { createContext, useState, useCallback, type ReactNode } from "react";
import type { AuthUser, LoginCredentials, RegisterCredentials } from "@/features/auth/types/auth.types";
import {
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  getCurrentUser,
} from "@/features/auth/services/authService";

// ─── Tipos del contexto ───────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser | null>;
  register: (credentials: RegisterCredentials) => Promise<AuthUser | null>;
  logout: () => void;
}

// ─── Creación del contexto ────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  // Estado global único — todos los consumers comparten este mismo estado
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser | null> => {
    try {
      const result = await authLogin(credentials);
      if (result) {
        setUser(result);
        return result;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<AuthUser | null> => {
    try {
      const result = await authRegister(credentials);
      if (result) {
        setUser(result);
        return result;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null); // todos los consumers se actualizan automáticamente
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
