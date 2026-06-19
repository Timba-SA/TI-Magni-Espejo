import { fetchApi } from "@/shared/api/apiClient";
import { MOCK_METRICS } from "./estadisticasMock";

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

function mergeMockWithReal(real: DashboardMetrics): DashboardMetrics {
  const mock = MOCK_METRICS;

  // KPIs
  const cantidad_pedidos = real.kpis.cantidad_pedidos + mock.kpis.cantidad_pedidos;
  const ingresos_totales = real.kpis.ingresos_totales + mock.kpis.ingresos_totales;
  const ticket_promedio = cantidad_pedidos > 0 ? ingresos_totales / cantidad_pedidos : 0;
  const clientes_activos = real.kpis.clientes_activos + mock.kpis.clientes_activos;

  // ventas_por_fecha: agrupar por fecha y sumar
  const ventasMap = new Map<string, VentaTemporal>();
  for (const v of [...mock.ventas_por_fecha, ...real.ventas_por_fecha]) {
    const existing = ventasMap.get(v.fecha);
    if (existing) {
      existing.ingresos += v.ingresos;
      existing.cantidad_pedidos += v.cantidad_pedidos;
    } else {
      ventasMap.set(v.fecha, { ...v });
    }
  }
  const ventas_por_fecha = Array.from(ventasMap.values()).sort((a, b) =>
    a.fecha.localeCompare(b.fecha)
  );

  // productos_mas_vendidos: agrupar por nombre y sumar
  const productosMap = new Map<string, ProductoVendido>();
  for (const p of [...mock.productos_mas_vendidos, ...real.productos_mas_vendidos]) {
    const existing = productosMap.get(p.nombre);
    if (existing) {
      existing.cantidad_vendida += p.cantidad_vendida;
      existing.ingresos_generados += p.ingresos_generados;
    } else {
      productosMap.set(p.nombre, { ...p });
    }
  }
  const productos_mas_vendidos = Array.from(productosMap.values())
    .sort((a, b) => b.cantidad_vendida - a.cantidad_vendida)
    .slice(0, 5);

  // distribucion_pedidos: agrupar por estado_codigo y sumar
  const distMap = new Map<string, number>();
  for (const d of [...mock.distribucion_pedidos, ...real.distribucion_pedidos]) {
    distMap.set(d.estado_codigo, (distMap.get(d.estado_codigo) ?? 0) + d.cantidad);
  }
  const distribucion_pedidos = Array.from(distMap.entries()).map(([estado_codigo, cantidad]) => ({
    estado_codigo,
    cantidad,
  }));

  // clientes_mas_compradores: agrupar por usuario_id y sumar
  const clientesMap = new Map<number, ClienteComprador>();
  for (const c of [...mock.clientes_mas_compradores, ...real.clientes_mas_compradores]) {
    const existing = clientesMap.get(c.usuario_id);
    if (existing) {
      existing.cantidad_pedidos += c.cantidad_pedidos;
      existing.total_gastado += c.total_gastado;
    } else {
      clientesMap.set(c.usuario_id, { ...c });
    }
  }
  const clientes_mas_compradores = Array.from(clientesMap.values())
    .sort((a, b) => b.total_gastado - a.total_gastado)
    .slice(0, 5);

  return {
    kpis: { ingresos_totales, cantidad_pedidos, ticket_promedio, clientes_activos },
    ventas_por_fecha,
    productos_mas_vendidos,
    distribucion_pedidos,
    clientes_mas_compradores,
  };
}

export async function getMetricasDashboard(
  fechaInicio?: string,
  fechaFin?: string
): Promise<DashboardMetrics> {
  const params = new URLSearchParams();
  if (fechaInicio) params.append("fecha_inicio", fechaInicio);
  if (fechaFin) params.append("fecha_fin", fechaFin);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const real = await fetchApi<DashboardMetrics>(`/admin/dashboard/metrics${qs}`);
  return mergeMockWithReal(real);
}
