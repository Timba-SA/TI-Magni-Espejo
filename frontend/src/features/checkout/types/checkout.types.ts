export interface Direccion {
  id: number;
  usuario_id: number;
  alias?: string;
  linea1: string;
  linea2?: string;
  ciudad: string;
  provincia?: string;
  codigo_postal?: string;
  es_principal: boolean;
  created_at: string;
}

export interface DireccionCreateRequest {
  alias?: string;
  linea1: string;
  linea2?: string;
  ciudad: string;
  provincia?: string;
  codigo_postal?: string;
}

export interface DireccionUpdateRequest {
  alias?: string;
  linea1?: string;
  linea2?: string;
  ciudad?: string;
  provincia?: string;
  codigo_postal?: string;
}

export interface FormaPago {
  codigo: string;
  descripcion: string;
  habilitado: boolean;
}

export interface ItemPedidoRequest {
  producto_id: number;
  cantidad: number;
  personalizacion?: number[]; // Excluidos (IDs de insumos)
}

export interface CrearPedidoRequest {
  items: ItemPedidoRequest[];
  direccion_id?: number;
  forma_pago_codigo: string;
  notas?: string;
}

export interface DetallePedido {
  id?: number;
  producto_id: number;
  cantidad: number;
  nombre_snapshot: string;
  precio_snapshot: number;
  subtotal_snap: number;
  personalizacion?: number[];
}

export interface PedidoResponse {
  id: number;
  usuario_id: number;
  direccion_id?: number;
  estado_codigo: string;
  forma_pago_codigo: string;
  subtotal: number;
  descuento: number;
  costo_envio: number;
  total: number;
  notas?: string;
  created_at: string;
  updated_at: string;
  detalles: DetallePedido[];
}
