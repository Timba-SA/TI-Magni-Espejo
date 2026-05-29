export interface Categoria {
  id: number;
  parent_id?: number;
  nombre: string;
  descripcion?: string;
  is_active: boolean;
  created_at: string; // Adjusted to match backend `created_at`
}

export interface CategoriaFormData {
  nombre: string;
  descripcion?: string;
  parent_id?: number;
}

export interface CategoriaListResponse {
  items: Categoria[];
  total: number;
  skip: number;
  limit: number;
}
