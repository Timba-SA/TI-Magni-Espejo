import { fetchApi, handleTokenExpired } from "@/shared/api/apiClient";
import type {
  UsuarioDetailResponse,
  UsuarioResponse,
  UsuarioCreateRequest,
} from "../types/user.types";

// El perfil propio (/usuarios/me) se gestiona en profileService.ts
// para no duplicar la lógica. Usar getMiPerfil() / actualizarPerfil() de allí.

/** Lista todos los usuarios con filtros opcionales. Solo ADMIN. */
export async function getUsuarios(
  skip: number = 0,
  limit: number = 20,
  rol?: string,
  includeDeleted: boolean = false
): Promise<import("../types/user.types").UsuarioListResponse> {
  let url = `/usuarios/?skip=${skip}&limit=${limit}&include_deleted=${includeDeleted}`;
  if (rol) {
    url += `&rol=${encodeURIComponent(rol)}`;
  }
  return fetchApi<import("../types/user.types").UsuarioListResponse>(url);
}

/** Crea un nuevo usuario administrativamente. Solo ADMIN. */
export async function crearUsuario(data: UsuarioCreateRequest): Promise<UsuarioDetailResponse> {
  return fetchApi<UsuarioDetailResponse>("/usuarios/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Alterna el estado activo/suspendido de un usuario. Solo ADMIN. */
export async function toggleActive(id: number): Promise<UsuarioResponse> {
  return fetchApi<UsuarioResponse>(`/usuarios/${id}/toggle-active`, {
    method: "PATCH",
  });
}

/** Actualiza los roles de un usuario. Solo ADMIN. */
export async function updateUserRoles(id: number, roles: string[]): Promise<UsuarioDetailResponse> {
  return fetchApi<UsuarioDetailResponse>(`/usuarios/${id}/roles`, {
    method: "PATCH",
    body: JSON.stringify({ roles }),
  });
}

/** Elimina un usuario (soft delete). Solo ADMIN. */
export async function eliminarUsuario(id: number): Promise<void> {
  return fetchApi<void>(`/usuarios/${id}`, {
    method: "DELETE",
  });
}

/** Restaura un usuario eliminado lógicamente. Solo ADMIN. */
export async function restaurarUsuario(id: number): Promise<UsuarioDetailResponse> {
  return fetchApi<UsuarioDetailResponse>(`/usuarios/${id}/restore`, {
    method: "PATCH",
  });
}

export async function exportarUsuarios(): Promise<void> {
  const token = localStorage.getItem("the_food_store_token");
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/exportar`, {
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      handleTokenExpired();
    }
    throw new Error("Error al exportar usuarios");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "usuarios.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
