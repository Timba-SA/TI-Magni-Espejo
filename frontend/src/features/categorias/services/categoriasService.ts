import type { Categoria, CategoriaFormData, CategoriaListResponse } from "../types/categoria.types";
import { fetchApi, handleTokenExpired } from "@/shared/api/apiClient";
export async function getCategorias(skip: number = 0, limit: number = 20): Promise<CategoriaListResponse> {
  return fetchApi<CategoriaListResponse>(`/categorias?skip=${skip}&limit=${limit}`);
}

export async function toggleActiveCategoria(id: number): Promise<Categoria> {
  return fetchApi<Categoria>(`/categorias/${id}/toggle-active`, { method: "PATCH" });
}

export async function createCategoria(data: CategoriaFormData): Promise<Categoria> {
  return fetchApi<Categoria>("/categorias", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteCategoria(id: number): Promise<Categoria> {
  return fetchApi<Categoria>(`/categorias/${id}`, { method: "DELETE" });
}

export async function exportarCategorias(): Promise<void> {
  const token = localStorage.getItem("the_food_store_token");
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL}/categorias/exportar`, {
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      handleTokenExpired();
    }
    throw new Error("Error al exportar categorías");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "categorias.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
