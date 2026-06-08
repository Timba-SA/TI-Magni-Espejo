import { axiosClient } from "@/shared/api/axiosClient";
import type {
  Direccion,
  DireccionCreateRequest,
  FormaPago,
  CrearPedidoRequest,
  PedidoResponse,
} from "../types/checkout.types";

/** Obtiene las direcciones registradas del usuario autenticado */
export async function listarDirecciones(): Promise<Direccion[]> {
  const response = await axiosClient.get<Direccion[]>("/direcciones/");
  return response.data;
}

/** Registra una nueva dirección para el usuario autenticado */
export async function crearDireccion(data: DireccionCreateRequest): Promise<Direccion> {
  const response = await axiosClient.post<Direccion>("/direcciones/", data);
  return response.data;
}

/** Obtiene las formas de pago habilitadas */
export async function listarFormasPago(): Promise<FormaPago[]> {
  const response = await axiosClient.get<FormaPago[]>("/pedidos/formas-pago");
  return response.data;
}

/** Crea un nuevo pedido con transacción atómica (Unit of Work) */
export async function crearPedido(data: CrearPedidoRequest): Promise<PedidoResponse> {
  const response = await axiosClient.post<PedidoResponse>("/pedidos/", data);
  return response.data;
}

/** Inicia el flujo de pago con Mercado Pago creando una preferencia en el backend */
export async function iniciarPago(pedidoId: number): Promise<{ preference_id: string; init_point: string }> {
  const response = await axiosClient.post<{ preference_id: string; init_point: string }>("/pagos/iniciar", { pedido_id: pedidoId });
  return response.data;
}

/** Obtiene el detalle de un pedido por ID */
export async function obtenerPedido(pedidoId: number): Promise<PedidoResponse> {
  const response = await axiosClient.get<PedidoResponse>(`/pedidos/${pedidoId}`);
  return response.data;
}

