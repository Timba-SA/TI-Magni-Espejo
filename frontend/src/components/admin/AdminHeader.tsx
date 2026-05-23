import { Menu } from "lucide-react";
import { useLocation } from "react-router";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

const ROUTE_LABELS: Record<string, { title: string; section: string }> = {
  "/home":    { title: "Dashboard",          section: "Vista general"    },
  "/insumos": { title: "Gestión de Insumos", section: "Inventario"       },
};

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const location = useLocation();
  const page = ROUTE_LABELS[location.pathname] ?? { title: "Panel interno", section: "Sistema" };

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-AR", {
    weekday: "short", day: "numeric", month: "short",
  }).toUpperCase();

  return (
    <header
      className="h-12 flex items-center justify-between px-5 flex-shrink-0"
      style={{
        background: "var(--tfs-bg-surface)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--tfs-border-subtle)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="md:hidden transition-colors"
          style={{ color: "var(--tfs-text-muted)" }}
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2" style={{ fontFamily: "'Space Mono', monospace" }}>
          <span
            className="text-[9px] tracking-[0.35em] uppercase"
            style={{ color: "var(--tfs-text-subtle)" }}
          >
            TFS
          </span>
          <span style={{ color: "var(--tfs-border-mid)", fontSize: "10px" }}>
            /
          </span>
          <span
            className="text-[9px] tracking-[0.35em] uppercase"
            style={{ color: "var(--tfs-text-subtle)" }}
          >
            {page.section}
          </span>
          <span style={{ color: "var(--tfs-border-mid)", fontSize: "10px" }}>
            /
          </span>
          <span
            className="text-[9px] tracking-[0.35em] uppercase font-bold"
            style={{ color: "rgba(255,90,0,0.7)" }}
          >
            {page.title}
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Date */}
        <span
          className="hidden sm:block text-[9px] tracking-[0.3em] uppercase"
          style={{ color: "var(--tfs-text-subtle)", fontFamily: "'Space Mono', monospace" }}
        >
          {dateStr}
        </span>

        {/* Live dot */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
              style={{ background: "#FF5A00" }}
            />
            <span
              className="relative inline-flex rounded-full h-1.5 w-1.5"
              style={{ background: "#FF5A00" }}
            />
          </span>
          <span
            className="text-[9px] tracking-[0.3em] uppercase hidden sm:block"
            style={{ color: "var(--tfs-text-subtle)", fontFamily: "'Space Mono', monospace" }}
          >
            En línea
          </span>
        </div>

        {/* Theme toggle */}
        <ThemeToggle size={14} />
      </div>
    </header>
  );
}
