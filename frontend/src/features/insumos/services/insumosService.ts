import type { Ingrediente, IngredienteFormData, UnidadMedida } from "../types/insumo.types";
import { fetchApi } from "@/shared/api/apiClient";

// Respuesta paginada del backend
interface IngredienteListResponse {
  items: Ingrediente[];
  total: number;
  skip: number;
  limit: number;
}

/** Obtiene todos los ingredientes con paginación y filtros opcionales. */
export async function getInsumos(
  skip: number = 0,
  limit: number = 20,
  search: string = "",
  soloAlergenos: boolean = false
): Promise<IngredienteListResponse> {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });
  if (search) params.append("nombre", search);
  if (soloAlergenos) params.append("es_alergeno", "true");

  return await fetchApi<IngredienteListResponse>(`/ingredientes?${params.toString()}`);
}

export async function getInsumoById(id: number): Promise<Ingrediente | undefined> {
  try {
    return await fetchApi<Ingrediente>(`/ingredientes/${id}`);
  } catch {
    return undefined;
  }
}

export async function getUnidadesMedida(): Promise<UnidadMedida[]> {
  try {
    return await fetchApi<UnidadMedida[]>("/unidades-medida/");
  } catch {
    return [];
  }
}

export async function createInsumo(data: IngredienteFormData): Promise<Ingrediente> {
  return fetchApi<Ingrediente>("/ingredientes", {
    method: "POST",
    body: JSON.stringify({
      nombre: data.nombre,
      descripcion: data.descripcion || null,
      es_alergeno: data.es_alergeno,
      unidad_medida_id: data.unidad_medida_id,
      stock_actual: Number(data.stock_actual) || 0,
      stock_minimo: Number(data.stock_minimo) || 0,
      costo_unitario: Number(data.costo_unitario) || 0,
    }),
  });
}

export async function updateInsumo(
  id: number,
  data: IngredienteFormData
): Promise<Ingrediente | null> {
  try {
    return await fetchApi<Ingrediente>(`/ingredientes/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        es_alergeno: data.es_alergeno,
        unidad_medida_id: data.unidad_medida_id,
        stock_actual: Number(data.stock_actual) !== undefined ? Number(data.stock_actual) : undefined,
        stock_minimo: Number(data.stock_minimo) !== undefined ? Number(data.stock_minimo) : undefined,
        costo_unitario: Number(data.costo_unitario) !== undefined ? Number(data.costo_unitario) : undefined,
      }),
    });
  } catch {
    return null;
  }
}

export async function deleteInsumo(id: number): Promise<boolean> {
  return bajaLogicaInsumo(id);
}

/** Elimina un ingrediente del sistema. */
export async function bajaLogicaInsumo(id: number): Promise<boolean> {
  try {
    await fetchApi(`/ingredientes/${id}`, { method: "DELETE" });
    return true;
  } catch {
    return false;
  }
}

/** Reactivar no aplica al modelo Ingrediente — stub para compatibilidad. */
export async function reactivarInsumo(_id: number): Promise<boolean> {
  return false;
}

export async function toggleActiveInsumo(id: number): Promise<Ingrediente | null> {
  try {
    return await fetchApi<Ingrediente>(`/ingredientes/${id}/toggle-active`, {
      method: "PATCH",
    });
  } catch {
    return null;
  }
}

export async function exportarIngredientes(
  search: string = "",
  soloAlergenos: boolean = false
): Promise<void> {
  const token = localStorage.getItem("the_food_store_token");
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const params = new URLSearchParams();
  if (search) params.append("nombre", search);
  if (soloAlergenos) params.append("es_alergeno", "true");

  const response = await fetch(`${import.meta.env.VITE_API_URL}/ingredientes/exportar?${params.toString()}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Error al exportar ingredientes");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ingredientes.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
