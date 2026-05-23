import { Package, AlertTriangle, DollarSign, Activity } from "lucide-react";
import type { Ingrediente } from "../types/insumo.types";
import { DashboardCard } from "@/components/admin/DashboardCard";

interface InsumoStatsProps {
  insumos: Ingrediente[];
}

export function InsumoStats({ insumos }: InsumoStatsProps) {
  const total = insumos.length;
  
  // Calcular valorización total en base a stock * costo
  const valorizacion = insumos.reduce(
    (acc, i) => acc + (Number(i.stock_actual) * Number(i.costo_unitario)),
    0
  );
  
  // Contar ingredientes en nivel crítico
  const criticos = insumos.filter(
    (i) => Number(i.stock_actual) <= Number(i.stock_minimo) && Number(i.stock_minimo) > 0
  ).length;

  const alergenos = insumos.filter((i) => i.es_alergeno).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardCard
        title="Total ingredientes"
        value={total}
        subtitle="registrados en catálogo"
        icon={<Package size={22} />}
        accent="orange"
      />
      
      <DashboardCard
        title="Valorización de Stock"
        value={`$ ${valorizacion.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        subtitle="capital en inventario"
        icon={<DollarSign size={22} />}
        accent="green"
      />

      <DashboardCard
        title="Stock Crítico"
        value={criticos}
        subtitle={criticos > 0 ? "requieren reposición" : "niveles bajo control"}
        icon={<Activity size={22} />}
        accent={criticos > 0 ? "red" : "orange"}
      />

      <DashboardCard
        title="Alérgenos"
        value={alergenos}
        subtitle={alergenos > 0 ? "con advertencia médica" : "ninguno registrado"}
        icon={<AlertTriangle size={22} />}
        accent="yellow"
      />
    </div>
  );
}
