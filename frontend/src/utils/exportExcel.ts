import * as XLSX from "xlsx";
import type { Insumo } from "@/features/insumos/types/insumo.types";

/**
 * Exporta un listado de ingredientes (insumos) a un archivo .xlsx.
 * @param insumos  Array a exportar (puede ser el filtrado o el completo).
 * @param fileName Nombre del archivo sin extensión.
 */
export function exportInsumosToExcel(
  insumos: Insumo[],
  fileName = "ingredientes_the_food_store"
): void {
  // Transformamos cada insumo a una fila legible
  const rows = insumos.map((i) => ({
    ID: i.id,
    Nombre: i.nombre,
    Descripción: i.descripcion || "",
    "Es Alérgeno": i.es_alergeno ? "Sí" : "No",
    Estado: i.is_active ? "Activo" : "Suspendido",
    "Fecha de alta": i.created_at,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Ancho de columnas automático
  const colWidths = [
    { wch: 6 },  // ID
    { wch: 28 }, // Nombre
    { wch: 36 }, // Descripción
    { wch: 15 }, // Es Alérgeno
    { wch: 15 }, // Estado
    { wch: 24 }, // Fecha de alta
  ];
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ingredientes");

  // Genera y descarga el archivo
  XLSX.writeFile(workbook, `${fileName}_${todayForFile()}.xlsx`);
}

function todayForFile(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
