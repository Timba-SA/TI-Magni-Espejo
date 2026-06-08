import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, LoginCredentials, RegisterCredentials } from "@/features/auth/types/auth.types";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  getToken
} from "@/features/auth/services/authService";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser | null>;
  register: (credentials: RegisterCredentials) => Promise<AuthUser | null>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Inicializar desde el storage local existente en authService
      accessToken: getToken(),
      user: getCurrentUser(),
      isAuthenticated: getCurrentUser() !== null,
      
      setUser: (user) => set({ user, isAuthenticated: user !== null }),
      setAccessToken: (accessToken) => set({ accessToken }),
      
      login: async (credentials) => {
        const user = await apiLogin(credentials);
        if (user) {
          const token = getToken();
          set({ user, accessToken: token, isAuthenticated: true });
        }
        return user;
      },
      
      register: async (credentials) => {
        const user = await apiRegister(credentials);
        if (user) {
          const token = getToken();
          set({ user, accessToken: token, isAuthenticated: true });
        }
        return user;
      },
      
      logout: () => {
        apiLogout();
        set({ user: null, accessToken: null, isAuthenticated: false });
      }
    }),
    {
      name: "the_food_store_auth",
      // Persistir únicamente el accessToken en este store
      partialize: (state) => ({ accessToken: state.accessToken }),
    }
  )
);
