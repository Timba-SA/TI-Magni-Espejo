import { fetchApi } from "@/shared/api/apiClient";
import type { PedidoResponse } from "@/features/checkout/types/checkout.types";

export interface HistorialEstado {
  id: number;
  estado_desde: string | null;
  estado_hacia: string;
  usuario_id: number;
  motivo?: string;
  created_at: string;
}

export interface PedidoDetailResponse extends PedidoResponse {
  historial: HistorialEstado[];
}

export async function listarPedidosGestion(): Promise<PedidoResponse[]> {
  return fetchApi<PedidoResponse[]>("/pedidos/gestion");
}

export async function obtenerPedido(id: number): Promise<PedidoDetailResponse> {
  return fetchApi<PedidoDetailResponse>(`/pedidos/${id}`);
}

export async function avanzarEstadoPedido(
  id: number,
  estadoHacia: string,
  motivo?: string,
  devolverStock?: boolean
): Promise<PedidoResponse> {
  return fetchApi<PedidoResponse>(`/pedidos/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({
      estado_hacia: estadoHacia,
      motivo: motivo || undefined,
      devolver_stock: devolverStock !== undefined ? devolverStock : true,
    }),
  });
}
