import { Menu } from "lucide-react";
import { useLocation } from "react-router";

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
        background: "rgba(13,13,13,0.9)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(248,248,248,0.05)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="md:hidden transition-colors"
          style={{ color: "rgba(248,248,248,0.4)" }}
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2" style={{ fontFamily: "'Space Mono', monospace" }}>
          <span
            className="text-[9px] tracking-[0.35em] uppercase"
            style={{ color: "rgba(248,248,248,0.2)" }}
          >
            TFS
          </span>
          <span style={{ color: "rgba(248,248,248,0.12)", fontSize: "10px" }}>
            /
          </span>
          <span
            className="text-[9px] tracking-[0.35em] uppercase"
            style={{ color: "rgba(248,248,248,0.2)" }}
          >
            {page.section}
          </span>
          <span style={{ color: "rgba(248,248,248,0.12)", fontSize: "10px" }}>
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
      <div className="flex items-center gap-5">
        {/* Date */}
        <span
          className="hidden sm:block text-[9px] tracking-[0.3em] uppercase"
          style={{ color: "rgba(248,248,248,0.18)", fontFamily: "'Space Mono', monospace" }}
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
            style={{ color: "rgba(248,248,248,0.25)", fontFamily: "'Space Mono', monospace" }}
          >
            En línea
          </span>
        </div>
      </div>
    </header>
  );
}
