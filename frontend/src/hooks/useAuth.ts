import { useState, useCallback } from "react";
import type { AuthUser, LoginCredentials, RegisterCredentials } from "@/features/auth/types/auth.types";
import {
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  getCurrentUser,
} from "@/features/auth/services/authService";

interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const result = await authLogin(credentials);
      if (result) {
        setUser(result);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      const result = await authRegister(credentials);
      if (result) {
        setUser(result);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return {
    user,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
  };
}
