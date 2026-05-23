import type { AuthUser, LoginCredentials, RegisterCredentials } from "../types/auth.types";
import { fetchApi } from "@/shared/api/apiClient";

const STORAGE_KEY = "the_food_store_session";
const TOKEN_KEY = "the_food_store_token";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 horas (igual que JWT_EXPIRE_HOURS)

interface StoredSession {
  user: AuthUser;
  expiresAt: number;
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function isSessionExpired(session: StoredSession): boolean {
  return Date.now() > session.expiresAt;
}

function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

// ─── API pública ──────────────────────────────────────────────────────────────

export async function login(credentials: LoginCredentials): Promise<AuthUser | null> {
  try {
    const response = await fetchApi<{ access_token: string; refresh_token: string; user: AuthUser }>(
      "/auth/login",
      { 
        method: "POST", 
        body: JSON.stringify({
          email: credentials.usernameOrEmail,
          password: credentials.password
        }) 
      }
    );

    if (response.access_token && response.user) {
      const session: StoredSession = {
        user: response.user,
        expiresAt: Date.now() + SESSION_DURATION_MS,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(TOKEN_KEY, response.access_token);
      return response.user;
    }
    return null;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

export async function register(credentials: RegisterCredentials): Promise<AuthUser | null> {
  try {
    const response = await fetchApi<{ access_token: string; refresh_token: string; user: AuthUser }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );

    if (response.access_token && response.user) {
      const session: StoredSession = {
        user: response.user,
        expiresAt: Date.now() + SESSION_DURATION_MS,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(TOKEN_KEY, response.access_token);
      return response.user;
    }
    return null;
  } catch (error) {
    console.error("Register failed:", error);
    throw error;
  }
}

export function logout(): void {
  clearSession();
}

export function getCurrentUser(): AuthUser | null {
  const session = loadSession();
  if (!session) return null;
  if (isSessionExpired(session)) {
    clearSession();
    return null;
  }
  return session.user;
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/** Retorna el JWT para enviarlo en el header Authorization. */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getSessionRemainingMs(): number {
  const session = loadSession();
  if (!session || isSessionExpired(session)) return 0;
  return session.expiresAt - Date.now();
}

export function renewSession(): void {
  const session = loadSession();
  if (!session || isSessionExpired(session)) return;
  session.expiresAt = Date.now() + SESSION_DURATION_MS;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}
