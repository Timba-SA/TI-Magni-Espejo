export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  fechaAlta: string;
}

export interface CategoriaFormData {
  nombre: string;
  descripcion?: string;
}
