import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

/**
 * Botón contextual para volver al panel de administración (/home).
 * Se coloca en la parte superior de cada página interior del panel.
 */
export function BackToDashboard() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/home")}
      className="flex items-center gap-2 text-xs font-mono tracking-wider transition-all duration-200 mb-6"
      style={{ color: "var(--tfs-text-muted)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#FF5A00";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--tfs-text-muted)";
      }}
    >
      <ArrowLeft size={12} />
      <span className="text-[9px] tracking-[0.4em] uppercase">Volver al panel</span>
    </button>
  );
}
