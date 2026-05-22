// ─── Modelo real del backend ─────────────────────────────────────────────────

export interface UnidadMedida {
  id: number;
  nombre: string;
  simbolo: string;
  tipo: string;
  created_at: string;
}

export interface Ingrediente {
  id: number;
  nombre: string;
  descripcion: string | null;
  es_alergeno: boolean;
  is_active: boolean;         // false = Inhabilitado (visible en admin con etiqueta)
  unidad_medida_id: number | null;
  stock_actual: number;
  stock_minimo: number;
  costo_unitario: number;
  peso: number | null;
  unidad_medida: UnidadMedida | null;
  deleted_at: string | null;  // null = activo, fecha = archivado
  created_at: string;
  updated_at: string;
}

export interface IngredienteFormData {
  nombre: string;
  descripcion: string;
  es_alergeno: boolean;
  unidad_medida_id: number | null;
  stock_actual: number;
  stock_minimo: number;
  costo_unitario: number;
  peso: number | null;
}

// ─── Tipos del estado de filtros ──────────────────────────────────────────────

export interface IngredienteFiltersState {
  search: string;
  soloAlergenos: boolean;
  mostrarInactivos: boolean;
}

// ─── Alias legacy para compatibilidad con componentes que usen "Insumo" ──────
// Renombrar gradualmente hacia "Ingrediente"
export type Insumo = Ingrediente;
export type InsumoFormData = IngredienteFormData;
export type InsumoFiltersState = IngredienteFiltersState;
