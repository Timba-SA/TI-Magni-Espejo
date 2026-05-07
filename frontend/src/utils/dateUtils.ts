/**
 * Formatea una fecha ISO a formato legible en español.
 * Ejemplo: "2026-01-15" → "15 de enero de 2026"
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Retorna la fecha actual en formato ISO (YYYY-MM-DD).
 */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Formatea fecha corta: "15/01/2026"
 */
export function formatDateShort(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("es-AR");
}
