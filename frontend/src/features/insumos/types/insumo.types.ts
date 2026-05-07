export type EstadoInsumo = "Activo" | "Inactivo";

export interface Insumo {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  precioUnitario: number;
  estado: EstadoInsumo;
  fechaAlta: string;
}

export interface InsumoFormData {
  nombre: string;
  descripcion: string;
  categoria: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  precioUnitario: number;
  estado: EstadoInsumo;
}

export interface InsumoFiltersState {
  search: string;
  categoria: string;
  estado: string;
  soloStockBajo: boolean;
}

export const CATEGORIAS_INSUMO = [
  "Materia prima",
  "Carnes",
  "Lácteos",
  "Verduras",
  "Panificados",
  "Bebidas",
  "Café",
  "Condimentos",
  "Repostería",
  "Packaging",
  "Limpieza",
] as const;

export const UNIDADES_MEDIDA = [
  "kg",
  "g",
  "l",
  "ml",
  "unidad",
  "caja",
  "paquete",
  "bolsa",
  "botella",
] as const;

export type CategoriaInsumo = (typeof CATEGORIAS_INSUMO)[number];
export type UnidadMedida = (typeof UNIDADES_MEDIDA)[number];
