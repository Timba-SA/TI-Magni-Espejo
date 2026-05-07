/**
 * Formatea un número como moneda argentina (ARS).
 * Ejemplo: 1500 → $ 1.500,00
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Formatea un número sin símbolo de moneda.
 * Ejemplo: 1500.5 → 1.500,50
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
  }).format(value);
}
