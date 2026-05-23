import type { Categoria } from "@/features/categorias/types/categoria.types";
import type { Ingrediente, UnidadMedida } from "@/features/insumos/types/insumo.types";

export interface ProductoCategoria {
  categoria_id: number;
  es_principal: boolean;
  categoria?: Categoria;
}

export interface ProductoIngrediente {
  ingrediente_id: number;
  cantidad: number;
  unidad_medida_id?: number | null;
  unidad_medida?: UnidadMedida | null;
  es_removible: boolean;
  ingrediente?: Ingrediente;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagenes_url: string[];
  stock_cantidad: number;
  disponible: boolean;
  unidad_venta_id?: number | null;
  unidad_venta?: UnidadMedida | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  categorias: ProductoCategoria[];
  ingredientes: ProductoIngrediente[];
}

export interface ProductoFormData {
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagenes_url: string[];
  stock_cantidad: number;
  disponible: boolean;
  unidad_venta_id: number | null;
  categorias: { categoria_id: number; es_principal: boolean }[];
  ingredientes: {
    ingrediente_id: number;
    cantidad: number;
    unidad_medida_id: number | null;
    es_removible: boolean;
  }[];
}

export interface ProductoFiltersState {
  search: string;
  categoriaId: string;
  mostrarArchivados: boolean;
}
