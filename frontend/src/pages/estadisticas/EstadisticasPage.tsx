import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, ShoppingBag, Users, DollarSign, Loader2 } from "lucide-react";
import { getMetricasDashboard, type DashboardMetrics } from "@/features/estadisticas/services/estadisticasService";
import { BackToDashboard } from "@/components/admin/BackToDashboard";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionLabel({ label, code }: { label: string; code: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <span
        className="text-[8px] tracking-[0.5em] uppercase flex-shrink-0"
        style={{ color: "rgba(255,90,0,0.55)", fontFamily: "'Space Mono', monospace" }}
      >
        {code} — {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--tfs-divider)" }} />
    </div>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

function fmtShort(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KPICard({
  title, value, subtitle, icon: Icon, accent = "orange"
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  accent?: "orange" | "green" | "blue" | "purple";
}) {
  const colors = {
    orange: { fg: "#FF5A00", bg: "rgba(255,90,0,0.08)", border: "rgba(255,90,0,0.2)" },
    green:  { fg: "#4CAF50", bg: "rgba(76,175,80,0.08)", border: "rgba(76,175,80,0.2)" },
    blue:   { fg: "#2196F3", bg: "rgba(33,150,243,0.08)", border: "rgba(33,150,243,0.2)" },
    purple: { fg: "#9C27B0", bg: "rgba(156,39,176,0.08)", border: "rgba(156,39,176,0.2)" },
  }[accent];

  return (
    <div
      className="p-5 flex flex-col gap-3"
      style={{
        background: "var(--tfs-card-bg)",
        border: `1px solid var(--tfs-border-subtle)`,
      }}
    >
      <div style={{ height: 1, background: `linear-gradient(to right, ${colors.fg}55, transparent)` }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] tracking-[0.4em] uppercase mb-2" style={{ color: "var(--tfs-text-muted)", fontFamily: "'Space Mono', monospace" }}>
            {title}
          </p>
          <p className="text-2xl font-light" style={{ color: "var(--tfs-text-heading)", letterSpacing: "-0.03em" }}>
            {value}
          </p>
          <p className="text-[10px] mt-1" style={{ color: "var(--tfs-text-subtle)" }}>{subtitle}</p>
        </div>
        <div
          className="w-9 h-9 flex items-center justify-center flex-shrink-0"
          style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
        >
          <Icon size={15} style={{ color: colors.fg }} />
        </div>
      </div>
    </div>
  );
}

// ─── Colores del pie ──────────────────────────────────────────────────────────
const PIE_COLORS: Record<string, string> = {
  PENDIENTE:  "#FF5A00",
  CONFIRMADO: "#2196F3",
  EN_PREP:    "#9C27B0",
  ENTREGADO:  "#4CAF50",
  CANCELADO:  "#F44336",
};

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE:  "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREP:    "En Cocina",
  ENTREGADO:  "Entregado",
  CANCELADO:  "Cancelado",
};

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 text-xs"
      style={{
        background: "var(--tfs-card-bg)",
        border: "1px solid var(--tfs-border-subtle)",
        fontFamily: "'Space Mono', monospace",
        color: "var(--tfs-text-primary)",
      }}
    >
      <p className="mb-1 text-[9px] uppercase tracking-widest" style={{ color: "var(--tfs-text-muted)" }}>{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name === "ingresos" ? fmt(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

// ─── Selector de rango ────────────────────────────────────────────────────────
const RANGOS = [
  { label: "7 días",  days: 7 },
  { label: "30 días", days: 30 },
  { label: "90 días", days: 90 },
];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function EstadisticasPage() {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangoIdx, setRangoIdx] = useState(1); // default 30 días

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const fechaInicio = daysAgo(RANGOS[rangoIdx].days);
        const result = await getMetricasDashboard(fechaInicio);
        setData(result);
      } catch {
        setError("No se pudieron cargar las métricas.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [rangoIdx]);

  return (
    <div className="p-6 md:p-8 space-y-10 max-w-6xl mx-auto">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div>
        <BackToDashboard />
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2" style={{ fontFamily: "'Space Mono', monospace" }}>
              <TrendingUp size={10} style={{ color: "rgba(255,90,0,0.5)" }} />
              <span className="text-[9px] tracking-[0.45em] uppercase" style={{ color: "var(--tfs-text-subtle)" }}>
                Módulo 08
              </span>
            </div>
            <h2
              className="leading-none"
              style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 300, letterSpacing: "-0.02em", color: "var(--tfs-text-heading)" }}
            >
              Estadísticas <span style={{ color: "#FF5A00", fontWeight: 600 }}>& Métricas</span>
            </h2>
          </div>

          {/* Selector de rango */}
          <div className="flex gap-1">
            {RANGOS.map((r, i) => (
              <button
                key={r.days}
                onClick={() => setRangoIdx(i)}
                className="px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase transition-all"
                style={{
                  background: rangoIdx === i ? "rgba(255,90,0,0.15)" : "var(--tfs-card-bg)",
                  border: rangoIdx === i ? "1px solid rgba(255,90,0,0.4)" : "1px solid var(--tfs-border-subtle)",
                  color: rangoIdx === i ? "#FF5A00" : "var(--tfs-text-muted)",
                  cursor: "pointer",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5" style={{ height: 1, background: "linear-gradient(to right, rgba(255,90,0,0.4), rgba(255,90,0,0.05), transparent)" }} />
      </div>

      {/* ── Loading / Error ────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 size={18} className="animate-spin" style={{ color: "#FF5A00" }} />
          <span className="text-xs font-mono tracking-widest uppercase" style={{ color: "var(--tfs-text-muted)" }}>
            Cargando métricas...
          </span>
        </div>
      )}

      {error && (
        <div className="py-10 text-center text-xs font-mono" style={{ color: "#F44336" }}>{error}</div>
      )}

      {data && !loading && (
        <>
          {/* ── KPIs ──────────────────────────────────────────────── */}
          <div>
            <SectionLabel label="KPIs del período" code="01" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KPICard
                title="Ingresos totales"
                value={fmt(Number(data.kpis.ingresos_totales))}
                subtitle="pedidos no cancelados"
                icon={DollarSign}
                accent="orange"
              />
              <KPICard
                title="Pedidos"
                value={data.kpis.cantidad_pedidos}
                subtitle="en el período"
                icon={ShoppingBag}
                accent="blue"
              />
              <KPICard
                title="Ticket promedio"
                value={fmt(Number(data.kpis.ticket_promedio))}
                subtitle="por pedido"
                icon={TrendingUp}
                accent="green"
              />
              <KPICard
                title="Clientes activos"
                value={data.kpis.clientes_activos}
                subtitle="compradores únicos"
                icon={Users}
                accent="purple"
              />
            </div>
          </div>

          {/* ── Evolución de ventas ────────────────────────────────── */}
          <div>
            <SectionLabel label="Evolución de ingresos" code="02" />
            {data.ventas_por_fecha.length === 0 ? (
              <EmptyChart />
            ) : (
              <div
                className="p-4"
                style={{ background: "var(--tfs-card-bg)", border: "1px solid var(--tfs-border-subtle)" }}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data.ventas_por_fecha} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="fecha"
                      tick={{ fontSize: 9, fill: "var(--tfs-text-muted)", fontFamily: "Space Mono" }}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: "var(--tfs-text-muted)", fontFamily: "Space Mono" }}
                      tickFormatter={fmtShort}
                      width={55}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="ingresos"
                      name="ingresos"
                      stroke="#FF5A00"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: "#FF5A00" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ── Productos + Distribución ───────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Productos más vendidos */}
            <div>
              <SectionLabel label="Productos más vendidos" code="03" />
              {data.productos_mas_vendidos.length === 0 ? (
                <EmptyChart />
              ) : (
                <div
                  className="p-4"
                  style={{ background: "var(--tfs-card-bg)", border: "1px solid var(--tfs-border-subtle)" }}
                >
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={data.productos_mas_vendidos.map(p => ({
                        nombre: p.nombre.length > 18 ? p.nombre.slice(0, 18) + "…" : p.nombre,
                        unidades: p.cantidad_vendida,
                        ingresos: Number(p.ingresos_generados),
                      }))}
                      margin={{ top: 8, right: 8, left: 0, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="nombre"
                        tick={{ fontSize: 9, fill: "var(--tfs-text-muted)", fontFamily: "Space Mono" }}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 9, fill: "var(--tfs-text-muted)", fontFamily: "Space Mono" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="unidades" name="unidades" fill="#FF5A00" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Distribución por estado */}
            <div>
              <SectionLabel label="Distribución por estado" code="04" />
              {data.distribucion_pedidos.length === 0 ? (
                <EmptyChart />
              ) : (
                <div
                  className="p-4"
                  style={{ background: "var(--tfs-card-bg)", border: "1px solid var(--tfs-border-subtle)" }}
                >
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={data.distribucion_pedidos.map(d => ({
                          name: ESTADO_LABEL[d.estado_codigo] ?? d.estado_codigo,
                          value: d.cantidad,
                          color: PIE_COLORS[d.estado_codigo] ?? "#888",
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {data.distribucion_pedidos.map((d) => (
                          <Cell
                            key={d.estado_codigo}
                            fill={PIE_COLORS[d.estado_codigo] ?? "#888"}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [value, name]}
                        contentStyle={{
                          background: "#1a1a1a",
                          border: "1px solid rgba(255,255,255,0.1)",
                          fontSize: 10,
                          fontFamily: "Space Mono",
                          color: "#ffffff",
                        }}
                        itemStyle={{ color: "#ffffff" }}
                        labelStyle={{ color: "#ffffff" }}
                      />
                      <Legend
                        iconSize={8}
                        formatter={(value) => (
                          <span style={{ color: "#ffffff", fontSize: 9, fontFamily: "Space Mono" }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* ── Clientes top ──────────────────────────────────────────── */}
          {data.clientes_mas_compradores.length > 0 && (
            <div>
              <SectionLabel label="Top clientes" code="05" />
              <div style={{ background: "var(--tfs-card-bg)", border: "1px solid var(--tfs-border-subtle)" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--tfs-border-subtle)" }}>
                      {["#", "Cliente", "Email", "Pedidos", "Total gastado"].map(h => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-[9px] tracking-[0.35em] uppercase font-normal"
                          style={{ color: "var(--tfs-text-muted)", fontFamily: "'Space Mono', monospace" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.clientes_mas_compradores.map((c, i) => (
                      <tr
                        key={c.usuario_id}
                        style={{ borderBottom: "1px solid var(--tfs-border-subtle)" }}
                      >
                        <td className="px-4 py-3 font-mono text-[9px]" style={{ color: "rgba(255,90,0,0.5)" }}>
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td className="px-4 py-3 font-semibold" style={{ color: "var(--tfs-text-primary)" }}>
                          {c.nombre_completo}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--tfs-text-muted)" }}>
                          {c.email}
                        </td>
                        <td className="px-4 py-3 font-mono text-center" style={{ color: "var(--tfs-text-primary)" }}>
                          {c.cantidad_pedidos}
                        </td>
                        <td className="px-4 py-3 font-semibold" style={{ color: "#FF5A00" }}>
                          {fmt(Number(c.total_gastado))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Pedidos por día ────────────────────────────────────── */}
          {data.ventas_por_fecha.length > 0 && (
            <div>
              <SectionLabel label="Pedidos por día" code="06" />
              <div
                className="p-4"
                style={{ background: "var(--tfs-card-bg)", border: "1px solid var(--tfs-border-subtle)" }}
              >
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data.ventas_por_fecha} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="fecha"
                      tick={{ fontSize: 9, fill: "var(--tfs-text-muted)", fontFamily: "Space Mono" }}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 9, fill: "var(--tfs-text-muted)", fontFamily: "Space Mono" }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="cantidad_pedidos" name="pedidos" fill="rgba(255,90,0,0.4)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div className="pt-4" style={{ borderTop: "1px solid var(--tfs-divider)" }}>
        <p className="text-[9px] text-center tracking-[0.4em] uppercase" style={{ color: "var(--tfs-text-subtle)", fontFamily: "'Space Mono', monospace" }}>
          The Food Store · Estadísticas internas · 2026
        </p>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div
      className="flex items-center justify-center py-12 text-[10px] font-mono tracking-widest uppercase"
      style={{
        background: "var(--tfs-card-bg)",
        border: "1px solid var(--tfs-border-subtle)",
        color: "var(--tfs-text-subtle)",
      }}
    >
      Sin datos para el período
    </div>
  );
}
