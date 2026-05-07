const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

import type { Categoria, CategoriaFormData } from "../types/categoria.types";

export async function getCategorias(): Promise<Categoria[]> {
  const res = await fetch(`${API_URL}/api/categorias`);
  if (!res.ok) throw new Error("Error al obtener categorías");
  return res.json();
}

export async function createCategoria(data: CategoriaFormData): Promise<Categoria> {
  const res = await fetch(`${API_URL}/api/categorias`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Error al crear la categoría");
  }
  return res.json();
}

export async function deleteCategoria(id: number): Promise<Categoria> {
  const res = await fetch(`${API_URL}/api/categorias/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar la categoría");
  return res.json();
}
