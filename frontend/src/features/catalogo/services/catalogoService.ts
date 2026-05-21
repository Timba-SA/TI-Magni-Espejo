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
 * Soporta filtros opcionales de disponibilidad o paginación.
 */
export async function getActiveProductos(): Promise<Producto[]> {
  // Consultamos únicamente los productos marcados como disponibles:
  return fetchApi<Producto[]>("/productos/?limit=100&disponible=true");
}
