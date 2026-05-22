import { fetchApi } from "@/shared/api/apiClient";
import {
  listarDirecciones,
  crearDireccion,
} from "@/features/checkout/services/checkoutService";
import type { Direccion, DireccionCreateRequest, PedidoResponse } from "@/features/checkout/types/checkout.types";

// ─── Tipos del perfil ─────────────────────────────────────────────────────────

export interface UsuarioPerfil {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellido?: string;
  celular?: string;
  roles: string[];
}

export interface ActualizarPerfilRequest {
  nombre?: string;
  apellido?: string;
  celular?: string;
}

// ─── Servicios ────────────────────────────────────────────────────────────────

/** Obtiene el perfil completo del usuario autenticado */
export async function getMiPerfil(): Promise<UsuarioPerfil> {
  return fetchApi<UsuarioPerfil>("/usuarios/me");
}

/** Actualiza nombre, apellido y/o celular del usuario autenticado */
export async function actualizarPerfil(data: ActualizarPerfilRequest): Promise<UsuarioPerfil> {
  return fetchApi<UsuarioPerfil>("/usuarios/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/** Obtiene los pedidos del usuario autenticado */
export async function getMisPedidos(): Promise<PedidoResponse[]> {
  return fetchApi<PedidoResponse[]>("/pedidos/");
}

// Re-export de checkout para no duplicar lógica
export { listarDirecciones, crearDireccion };
export type { Direccion, DireccionCreateRequest, PedidoResponse };
