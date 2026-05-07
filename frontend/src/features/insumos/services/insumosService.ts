import type { Insumo, InsumoFormData } from "../types/insumo.types";
import { fetchApi } from "@/shared/api/apiClient";

export async function getInsumos(): Promise<Insumo[]> {
  return fetchApi<Insumo[]>("/insumos");
}

export async function getInsumoById(id: number): Promise<Insumo | undefined> {
  try {
    return await fetchApi<Insumo>(`/insumos/${id}`);
  } catch {
    return undefined;
  }
}

export async function createInsumo(data: InsumoFormData): Promise<Insumo> {
  return fetchApi<Insumo>("/insumos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateInsumo(id: number, data: InsumoFormData): Promise<Insumo | null> {
  try {
    return await fetchApi<Insumo>(`/insumos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  } catch {
    return null;
  }
}

export async function deleteInsumo(id: number): Promise<boolean> {
  return bajaLogicaInsumo(id);
}

/** Baja LÓGICA: cambia estado a "Inactivo" sin eliminar el registro. */
export async function bajaLogicaInsumo(id: number): Promise<boolean> {
  try {
    await fetchApi(`/insumos/${id}`, {
      method: "DELETE",
    });
    return true;
  } catch {
    return false;
  }
}

/** Reactiva un insumo dado de baja lógica. */
export async function reactivarInsumo(id: number): Promise<boolean> {
  try {
    await fetchApi(`/insumos/${id}/reactivar`, {
      method: "PATCH",
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene el resumen de estadísticas.
 */
export async function getInsumosStats(): Promise<any> {
  return fetchApi("/insumos/stats/resumen");
}
