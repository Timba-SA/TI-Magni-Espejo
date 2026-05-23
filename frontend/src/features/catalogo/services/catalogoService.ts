import { fetchApi } from "@/shared/api/apiClient";
import type { Categoria, Producto } from "../types/catalogo.types";

/**
 * Obtiene todas las categorías no archivadas del backend.
 * Filtra las que tienen is_active === true para el flujo de clientes.
 */
export async function getActiveCategorias(): Promise<Categoria[]> {
  const res = await fetchApi<{ items: Categoria[] }>("/categorias?limit=100");
  return (res.items || []).filter((c) => c.is_active);
}

/**
 * Obtiene la lista de productos disponibles en el catálogo.
 * Soporta filtros opcionales de disponibilidad, categoría o texto de búsqueda.
 */
export async function getActiveProductos(categoriaId?: number, search?: string): Promise<Producto[]> {
  let url = "/productos/?limit=100&disponible=true";
  if (categoriaId) {
    url += `&categoria_id=${categoriaId}`;
  }
  if (search && search.trim() !== "") {
    url += `&search=${encodeURIComponent(search.trim())}`;
  }
  return fetchApi<Producto[]>(url);
}

