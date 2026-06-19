import { fetchApi } from "@/shared/api/apiClient";
import type {
  Direccion,
  DireccionCreateRequest,
  DireccionUpdateRequest,
  FormaPago,
  CrearPedidoRequest,
  PedidoResponse,
} from "../types/checkout.types";

/** Obtiene las direcciones registradas del usuario autenticado */
export async function listarDirecciones(): Promise<Direccion[]> {
  return fetchApi<Direccion[]>("/direcciones/");
}

/** Registra una nueva dirección para el usuario autenticado */
export async function crearDireccion(data: DireccionCreateRequest): Promise<Direccion> {
  return fetchApi<Direccion>("/direcciones/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Actualiza los datos de una dirección del usuario autenticado */
export async function actualizarDireccion(id: number, data: DireccionUpdateRequest): Promise<Direccion> {
  return fetchApi<Direccion>(`/direcciones/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** Establece una dirección como la principal del usuario autenticado */
export async function setPrincipalDireccion(id: number): Promise<Direccion> {
  return fetchApi<Direccion>(`/direcciones/${id}/principal`, {
    method: "PATCH",
  });
}

/** Elimina (soft delete) una dirección del usuario autenticado */
export async function eliminarDireccion(id: number): Promise<void> {
  return fetchApi<void>(`/direcciones/${id}`, {
    method: "DELETE",
  });
}

/** Obtiene las formas de pago habilitadas */
export async function listarFormasPago(): Promise<FormaPago[]> {
  return fetchApi<FormaPago[]>("/pedidos/formas-pago");
}

/** Crea un nuevo pedido con transacción atómica (Unit of Work) */
export async function crearPedido(data: CrearPedidoRequest): Promise<PedidoResponse> {
  return fetchApi<PedidoResponse>("/pedidos/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Inicia el flujo de pago con Mercado Pago creando una preferencia en el backend */
export async function iniciarPago(pedidoId: number): Promise<{ preference_id: string; init_point: string }> {
  return fetchApi<{ preference_id: string; init_point: string }>("/pagos/crear", {
    method: "POST",
    body: JSON.stringify({ pedido_id: pedidoId }),
  });
}

/** Obtiene el detalle de un pedido por ID */
export async function obtenerPedido(pedidoId: number): Promise<PedidoResponse> {
  return fetchApi<PedidoResponse>(`/pedidos/${pedidoId}`);
}

