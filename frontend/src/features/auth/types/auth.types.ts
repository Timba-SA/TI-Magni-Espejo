export type UserRole = "Admin" | "Encargado" | "Cliente";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  nombre: string;
  rol: UserRole;
}

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  nombre: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}
