export interface Categoria {
  id: number;
  parent_id?: number;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ingrediente {
  id: number;
  nombre: string;
  es_removible: boolean;
}

export interface ProductoIngrediente {
  ingrediente_id: number;
  cantidad: number;
  unidad_medida_id?: number;
  es_removible: boolean;
  ingrediente?: Ingrediente;
}

export interface ProductoCategoria {
  categoria_id: number;
  es_principal: boolean;
  categoria?: Categoria;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  imagenes_url: string[];
  stock_cantidad: number;
  disponible: boolean;
  unidad_venta_id?: number;
  created_at: string;
  updated_at: string;
  categorias: ProductoCategoria[];
  ingredientes: ProductoIngrediente[];
}
