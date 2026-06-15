import { fetchApi } from "@/shared/api/apiClient";

export interface MetricKPICards {
  ingresos_totales: number;
  cantidad_pedidos: number;
  ticket_promedio: number;
  clientes_activos: number;
}

export interface ProductoVendido {
  producto_id: number;
  nombre: string;
  cantidad_vendida: number;
  ingresos_generados: number;
}

export interface ClienteComprador {
  usuario_id: number;
  nombre_completo: string;
  email: string;
  cantidad_pedidos: number;
  total_gastado: number;
}

export interface DistribucionPedidos {
  estado_codigo: string;
  cantidad: number;
}

export interface VentaTemporal {
  fecha: string;
  ingresos: number;
  cantidad_pedidos: number;
}

export interface DashboardMetrics {
  kpis: MetricKPICards;
  productos_mas_vendidos: ProductoVendido[];
  clientes_mas_compradores: ClienteComprador[];
  distribucion_pedidos: DistribucionPedidos[];
  ventas_por_fecha: VentaTemporal[];
}

export async function getMetricasDashboard(
  fechaInicio?: string,
  fechaFin?: string
): Promise<DashboardMetrics> {
  const params = new URLSearchParams();
  if (fechaInicio) params.append("fecha_inicio", fechaInicio);
  if (fechaFin) params.append("fecha_fin", fechaFin);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return fetchApi<DashboardMetrics>(`/admin/dashboard/metrics${qs}`);
}
