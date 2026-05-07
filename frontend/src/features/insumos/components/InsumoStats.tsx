import { Package, CheckCircle, XCircle, AlertTriangle, DollarSign } from "lucide-react";
import type { Insumo } from "../types/insumo.types";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { formatCurrency } from "@/utils/formatCurrency";

interface InsumoStatsProps {
  insumos: Insumo[];
}

export function InsumoStats({ insumos }: InsumoStatsProps) {
  const total = insumos.length;
  const activos = insumos.filter((i) => i.estado === "Activo").length;
  const inactivos = insumos.filter((i) => i.estado === "Inactivo").length;
  const stockBajo = insumos.filter(
    (i) => i.stockActual <= i.stockMinimo && i.estado === "Activo"
  ).length;
  const valorTotal = insumos.reduce(
    (acc, i) => acc + i.stockActual * i.precioUnitario,
    0
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <DashboardCard
        title="Total insumos"
        value={total}
        icon={<Package size={22} />}
        accent="orange"
      />
      <DashboardCard
        title="Activos"
        value={activos}
        icon={<CheckCircle size={22} />}
        accent="green"
      />
      <DashboardCard
        title="Inactivos"
        value={inactivos}
        icon={<XCircle size={22} />}
        accent="red"
      />
      <DashboardCard
        title="Stock bajo"
        value={stockBajo}
        subtitle={stockBajo > 0 ? "Requieren atención" : "Todo en orden"}
        icon={<AlertTriangle size={22} />}
        accent="yellow"
      />
      <DashboardCard
        title="Valor inventario"
        value={formatCurrency(valorTotal)}
        icon={<DollarSign size={22} />}
        accent="beige"
      />
    </div>
  );
}
