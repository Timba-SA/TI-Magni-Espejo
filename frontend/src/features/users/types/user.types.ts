export interface UsuarioResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  celular: string | null;
  is_active: boolean;
  created_at: string;
  deleted_at?: string | null;
}

export interface UsuarioDetailResponse extends UsuarioResponse {
  roles: string[];
}

export interface UsuarioCreateRequest {
  nombre: string;
  apellido: string;
  email: string;
  celular?: string | null;
  password?: string;
  roles: string[];
}

export interface UsuarioUpdateRequest {
  nombre?: string;
  apellido?: string;
  celular?: string;
}

export interface UsuarioListResponse {
  items: UsuarioDetailResponse[];
  total: number;
  skip: number;
  limit: number;
}
