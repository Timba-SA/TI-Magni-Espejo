import * as XLSX from "xlsx";
import type { Insumo } from "@/features/insumos/types/insumo.types";
import { formatCurrency } from "@/utils/formatCurrency";

/**
 * Exporta un listado de insumos a un archivo .xlsx.
 * @param insumos  Array a exportar (puede ser el filtrado o el completo).
 * @param fileName Nombre del archivo sin extensión.
 */
export function exportInsumosToExcel(
  insumos: Insumo[],
  fileName = "insumos_the_food_store"
): void {
  // Transformamos cada insumo a una fila legible
  const rows = insumos.map((i) => ({
    ID: i.id,
    Nombre: i.nombre,
    Descripción: i.descripcion,
    Categoría: i.categoria,
    "Unidad de medida": i.unidadMedida,
    "Stock actual": i.stockActual,
    "Stock mínimo": i.stockMinimo,
    "Precio unitario": formatCurrency(i.precioUnitario),
    Estado: i.estado,
    "Fecha de alta": i.fechaAlta,
    "Stock bajo": i.stockActual <= i.stockMinimo ? "Sí" : "No",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Ancho de columnas automático
  const colWidths = [
    { wch: 6 },  // ID
    { wch: 28 }, // Nombre
    { wch: 36 }, // Descripción
    { wch: 18 }, // Categoría
    { wch: 16 }, // Unidad
    { wch: 13 }, // Stock actual
    { wch: 13 }, // Stock mínimo
    { wch: 16 }, // Precio
    { wch: 10 }, // Estado
    { wch: 14 }, // Fecha
    { wch: 11 }, // Stock bajo
  ];
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Insumos");

  // Genera y descarga el archivo
  XLSX.writeFile(workbook, `${fileName}_${todayForFile()}.xlsx`);
}

function todayForFile(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
