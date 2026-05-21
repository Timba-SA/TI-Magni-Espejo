import { fetchApi } from "@/shared/api/apiClient";
import type {
  Direccion,
  DireccionCreateRequest,
  FormaPago,
  CrearPedidoRequest,
  PedidoResponse,
} from "../types/checkout.types";

export async function listarDirecciones(): Promise<Direccion[]> {
  return fetchApi<Direccion[]>("/direcciones/");
}

export async function crearDireccion(data: DireccionCreateRequest): Promise<Direccion> {
  return fetchApi<Direccion>("/direcciones/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listarFormasPago(): Promise<FormaPago[]> {
  return fetchApi<FormaPago[]>("/pedidos/formas-pago");
}

export async function crearPedido(data: CrearPedidoRequest): Promise<PedidoResponse> {
  return fetchApi<PedidoResponse>("/pedidos/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
