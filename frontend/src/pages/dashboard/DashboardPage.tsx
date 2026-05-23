import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Package, AlertTriangle, ArrowRight, LayoutDashboard, Tag, Users } from "lucide-react";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { getCurrentUser } from "@/features/auth/services/authService";
import { getInsumos } from "@/features/insumos/services/insumosService";

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
      <div style={{ flex: 1, height: 1, background: "var(--tfs-divider)" }} />
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
        setInsumos(data.items);
      } catch (error) {
        console.error("Error fetching insumos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsumos();
  }, []);

  const total = insumos.length;
  const alergenos = insumos.filter((i: any) => i.es_alergeno).length;

  // ─── Configuración de módulos de acceso rápido ─────────────────────────────
  const MODULES = [
    {
      to: "/insumos",
      label: "Gestión de Insumos",
      description: "Administrá el inventario completo. Creá, editá y eliminá insumos.",
      icon: Package,
      visibleFor: ["ADMIN", "ENCARGADO"],
    },
    {
      to: "/categorias",
      label: "Gestión de Categorías",
      description: "Organizá los insumos por categoría. Creá y eliminá categorías.",
      icon: Tag,
      visibleFor: ["ADMIN", "ENCARGADO"],
    },
    {
      to: "/usuarios",
      label: "Gestión de Usuarios",
      description: "Administrá roles y visualizá todos los usuarios registrados.",
      icon: Users,
      visibleFor: ["ADMIN"],
    },
  ].filter((m) => !user?.rol || m.visibleFor.includes(user.rol));

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
            style={{ color: "var(--tfs-text-subtle)" }}
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
            color: "var(--tfs-text-heading)",
          }}
        >
          Bienvenido,{" "}
          <span style={{ color: "#FF5A00", fontWeight: 600 }}>
            {user?.nombre ?? "Administrador"}
          </span>
        </h2>

        <p
          className="text-xs"
          style={{ color: "var(--tfs-text-muted)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em" }}
        >
          {user?.rol} · The Food Store Sistema de Gestión
        </p>

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
          <div className="grid grid-cols-2 gap-3">
            <DashboardCard
              title="Total ingredientes"
              value={total}
              subtitle="registrados en el sistema"
              icon={<Package size={16} />}
              accent="orange"
              onClick={() => navigate("/insumos")}
            />
            <DashboardCard
              title="Alérgenos"
              value={alergenos}
              subtitle={alergenos > 0 ? "requieren etiquetado" : "ninguno registrado"}
              icon={<AlertTriangle size={16} />}
              accent="yellow"
              onClick={() => navigate("/insumos")}
            />
          </div>
        </div>
      )}

      {/* ── Módulos / Acceso rápido ────────────────────────────────── */}
      <div>
        <SectionLabel label="Módulos" code="02" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODULES.map(({ to, label, description, icon: Icon }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="group text-left transition-all duration-300"
              style={{
                background: "var(--tfs-card-bg)",
                border: "1px solid var(--tfs-border-subtle)",
                padding: "1.25rem",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "rgba(255,90,0,0.25)";
                el.style.background = "var(--tfs-card-hover)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "var(--tfs-border-subtle)";
                el.style.background = "var(--tfs-card-bg)";
              }}
            >
              <div style={{ height: "1px", background: "rgba(255,90,0,0.3)", marginBottom: "1rem" }} />

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon size={14} style={{ color: "#FF5A00" }} />
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
                  style={{ color: "var(--tfs-text-muted)" }}
                />
              </div>

              <h3
                className="text-sm font-semibold mb-1"
                style={{ color: "var(--tfs-text-heading)", letterSpacing: "-0.01em" }}
              >
                {label}
              </h3>
              <p className="text-xs" style={{ color: "var(--tfs-text-muted)" }}>
                {description}
              </p>
            </button>
          ))}
        </div>
      </div>


      {/* ── Footer ────────────────────────────────────────────────── */}
      <div className="pt-4" style={{ borderTop: "1px solid var(--tfs-divider)" }}>
        <p
          className="text-[9px] text-center tracking-[0.4em] uppercase"
          style={{ color: "var(--tfs-text-subtle)", fontFamily: "'Space Mono', monospace" }}
        >
          The Food Store · Sistema de gestión interna · 2026
        </p>
      </div>
    </div>
  );
}
