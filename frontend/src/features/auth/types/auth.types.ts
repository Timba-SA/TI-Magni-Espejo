export type UserRole = "ADMIN" | "ENCARGADO" | "CLIENT" | "CAJERO" | "COCINERO" | "STOCK" | "PEDIDOS";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  nombre: string;
  /** Rol principal (mayor privilegio). Usado para display y routing básico. */
  rol: UserRole;
  /** Todos los roles asignados al usuario. Usar para guards de permisos. */
  roles: UserRole[];
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
