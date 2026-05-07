import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Package, AlertTriangle, TrendingUp, ArrowRight, LayoutDashboard } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { getCurrentUser } from "@/features/auth/services/authService";
import { getInsumos } from "@/features/insumos/services/insumosService";
import { formatCurrency } from "@/utils/formatCurrency";

// ─── Separador de sección ────────────────────────────────────────────────────
function SectionLabel({ label, code }: { label: string; code: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <span
        className="text-[8px] tracking-[0.5em] uppercase flex-shrink-0"
        style={{ color: "rgba(255,90,0,0.55)", fontFamily: "'Space Mono', monospace" }}
      >
        {code} — {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(248,248,248,0.04)" }} />
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function DashboardPage() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [insumos, setInsumos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsumos = async () => {
      try {
        const data = await getInsumos();
        setInsumos(data);
      } catch (error) {
        console.error("Error fetching insumos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsumos();
  }, []);

  const total = insumos.length;
  const activos = insumos.filter((i) => i.estado === "Activo").length;
  const inactivos = insumos.filter((i) => i.estado === "Inactivo").length;
  const stockBajo = insumos.filter(
    (i) => i.stockActual <= i.stockMinimo && i.estado === "Activo"
  ).length;
  const valorInventario = insumos.reduce(
    (acc, i) => acc + i.stockActual * i.precioUnitario,
    0
  );

  return (
    <div className="p-6 md:p-8 space-y-10 max-w-5xl mx-auto">

      {/* ── Welcome ───────────────────────────────────────────────── */}
      <div>
        <div
          className="flex items-center gap-2 mb-3"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          <LayoutDashboard size={10} style={{ color: "rgba(255,90,0,0.5)" }} />
          <span
            className="text-[9px] tracking-[0.45em] uppercase"
            style={{ color: "rgba(248,248,248,0.2)" }}
          >
            Panel principal
          </span>
        </div>

        <h2
          className="leading-none mb-2"
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            color: "#E8E8E8",
          }}
        >
          Bienvenido,{" "}
          <span style={{ color: "#FF5A00", fontWeight: 600 }}>
            {user?.nombre ?? "Administrador"}
          </span>
        </h2>

        <p
          className="text-xs"
          style={{ color: "rgba(248,248,248,0.28)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em" }}
        >
          {user?.rol} · The Food Store Sistema de Gestión
        </p>

        {/* Thin accent rule */}
        <div
          className="mt-5"
          style={{
            height: 1,
            background: "linear-gradient(to right, rgba(255,90,0,0.4), rgba(255,90,0,0.05), transparent)",
          }}
        />
      </div>

      {/* ── Métricas ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-xs font-mono text-white/50 tracking-widest">Cargando métricas...</p>
        </div>
      ) : (
      <div>
        <SectionLabel label="Métricas" code="01" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <DashboardCard
            title="Total insumos"
            value={total}
            subtitle="en sistema"
            icon={<Package size={16} />}
            accent="orange"
            onClick={() => navigate("/insumos")}
          />
          <DashboardCard
            title="Activos"
            value={activos}
            subtitle={`${inactivos} inactivos`}
            icon={<TrendingUp size={16} />}
            accent="green"
            onClick={() => navigate("/insumos")}
          />
          <DashboardCard
            title="Stock bajo"
            value={stockBajo}
            subtitle={stockBajo > 0 ? "Requieren atención" : "Todo en orden"}
            icon={<AlertTriangle size={16} />}
            accent={stockBajo > 0 ? "yellow" : "green"}
            onClick={() => navigate("/insumos")}
          />
          <DashboardCard
            title="Valor inventario"
            value={formatCurrency(valorInventario)}
            subtitle="estimado actual"
            icon={<span style={{ fontSize: "14px", fontWeight: 600 }}>$</span>}
            accent="beige"
          />
        </div>
      </div>
      )}

      {/* ── Acciones y alertas ────────────────────────────────────── */}
      <div>
        <SectionLabel label="Acceso rápido" code="02" />
        <div className="grid md:grid-cols-2 gap-3">

          {/* Acceso rápido a insumos */}
          <button
            onClick={() => navigate("/insumos")}
            className="group text-left transition-all duration-300"
            style={{
              background: "#0F0F0F",
              border: "1px solid rgba(248,248,248,0.05)",
              padding: "1.25rem",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "rgba(255,90,0,0.25)";
              el.style.background = "#111111";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "rgba(248,248,248,0.05)";
              el.style.background = "#0F0F0F";
            }}
          >
            {/* Top line */}
            <div
              style={{ height: "1px", background: "rgba(255,90,0,0.3)", marginBottom: "1rem" }}
            />

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package size={14} style={{ color: "#FF5A00" }} />
                <span
                  className="text-[9px] tracking-[0.45em] uppercase"
                  style={{ color: "rgba(255,90,0,0.65)", fontFamily: "'Space Mono', monospace" }}
                >
                  Módulo
                </span>
              </div>
              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: "rgba(248,248,248,0.2)" }}
              />
            </div>

            <h3
              className="text-sm font-semibold mb-1"
              style={{ color: "#E8E8E8", letterSpacing: "-0.01em" }}
            >
              Gestión de Insumos
            </h3>
            <p
              className="text-xs"
              style={{ color: "rgba(248,248,248,0.3)" }}
            >
              Administrá el inventario completo. Creá, editá y eliminá insumos.
            </p>
          </button>

          {/* Alertas de stock */}
          <div
            style={{
              background: "#0F0F0F",
              border: "1px solid rgba(248,248,248,0.05)",
              padding: "1.25rem",
            }}
          >
            {/* Top line */}
            <div
              style={{
                height: "1px",
                background: stockBajo > 0
                  ? "rgba(251,191,36,0.4)"
                  : "rgba(52,211,153,0.3)",
                marginBottom: "1rem",
              }}
            />

            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle
                size={12}
                style={{ color: stockBajo > 0 ? "#FBBF24" : "#34D399" }}
              />
              <span
                className="text-[9px] tracking-[0.45em] uppercase"
                style={{
                  color: stockBajo > 0
                    ? "rgba(251,191,36,0.65)"
                    : "rgba(52,211,153,0.55)",
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                {stockBajo > 0 ? `${stockBajo} alertas` : "Sin alertas"}
              </span>
            </div>

            {stockBajo === 0 ? (
              <p className="text-xs" style={{ color: "rgba(248,248,248,0.3)" }}>
                ✓ Todos los insumos tienen stock suficiente.
              </p>
            ) : (
              <div className="space-y-1.5">
                {insumos
                  .filter((i) => i.stockActual <= i.stockMinimo && i.estado === "Activo")
                  .slice(0, 5)
                  .map((i) => (
                    <div
                      key={i.id}
                      className="flex items-center justify-between text-xs py-1.5"
                      style={{ borderBottom: "1px solid rgba(248,248,248,0.03)" }}
                    >
                      <span style={{ color: "rgba(248,248,248,0.6)" }}>
                        {i.nombre}
                      </span>
                      <span
                        style={{ color: "#FBBF24", fontFamily: "'Space Mono', monospace", fontSize: "10px" }}
                      >
                        {i.stockActual}/{i.stockMinimo} {i.unidadMedida}
                      </span>
                    </div>
                  ))}
                {stockBajo > 5 && (
                  <button
                    onClick={() => navigate("/insumos")}
                    className="text-[10px] mt-1 tracking-wider"
                    style={{ color: "#FF5A00" }}
                  >
                    Ver {stockBajo - 5} más →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div
        className="pt-4"
        style={{ borderTop: "1px solid rgba(248,248,248,0.03)" }}
      >
        <p
          className="text-[9px] text-center tracking-[0.4em] uppercase"
          style={{ color: "rgba(248,248,248,0.1)", fontFamily: "'Space Mono', monospace" }}
        >
          The Food Store · Sistema de gestión interna · 2026
        </p>
      </div>
    </div>
  );
}
