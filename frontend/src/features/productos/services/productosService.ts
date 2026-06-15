import type { Producto, ProductoFormData } from "../types/producto.types";
import { fetchApi } from "@/shared/api/apiClient";

/** Obtiene todos los productos con offset/limit y filtros opcionales. */
export async function getProductos(
  offset: number = 0,
  limit: number = 20,
  disponible?: boolean,
  includeDeleted: boolean = false
): Promise<Producto[]> {
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  });

  if (disponible !== undefined) {
    params.append("disponible", disponible.toString());
  }
  if (includeDeleted) {
    params.append("include_deleted", "true");
  }

  return await fetchApi<Producto[]>(`/productos/?${params.toString()}`);
}

/** Obtiene un producto por su ID. */
export async function getProductoById(id: number): Promise<Producto | undefined> {
  try {
    return await fetchApi<Producto>(`/productos/${id}`);
  } catch {
    return undefined;
  }
}

/** Crea un nuevo producto. */
export async function createProducto(data: ProductoFormData): Promise<Producto> {
  return fetchApi<Producto>("/productos/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Actualiza un producto existente. */
export async function updateProducto(
  id: number,
  data: ProductoFormData
): Promise<Producto | null> {
  try {
    return await fetchApi<Producto>(`/productos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  } catch {
    return null;
  }
}

/** Da de baja lógicamente un producto. */
export async function deleteProducto(id: number): Promise<boolean> {
  try {
    await fetchApi(`/productos/${id}`, { method: "DELETE" });
    return true;
  } catch {
    return false;
  }
}

/** Reactiva un producto archivado. */
export async function reactivarProducto(id: number): Promise<Producto | null> {
  try {
    return await fetchApi<Producto>(`/productos/${id}/reactivar`, {
      method: "PATCH",
    });
  } catch {
    return null;
  }
}

/** Cambia la disponibilidad de un producto en el backend. */
export async function toggleAvailability(id: number, disponible: boolean): Promise<Producto | null> {
  try {
    return await fetchApi<Producto>(`/productos/${id}/disponibilidad`, {
      method: "PATCH",
      body: JSON.stringify({ disponible }),
    });
  } catch {
    return null;
  }
}

/** Sube una imagen de producto a Cloudinary a través del backend. */
export async function uploadProductoImagen(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  return fetchApi<{ url: string }>("/productos/upload", {
    method: "POST",
    body: formData,
  });
}
