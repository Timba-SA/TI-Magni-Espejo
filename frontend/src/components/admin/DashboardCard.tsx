import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  accent?: "orange" | "red" | "beige" | "green" | "yellow";
  onClick?: () => void;
}

const ACCENT = {
  orange: { top: "#FF5A00",  text: "#FF5A00",   dim: "rgba(255,90,0,0.12)",   border: "rgba(255,90,0,0.2)"   },
  red:    { top: "#C1121F",  text: "#C1121F",   dim: "rgba(193,18,31,0.12)",  border: "rgba(193,18,31,0.2)"  },
  beige:  { top: "#D4A574",  text: "#D4A574",   dim: "rgba(212,165,116,0.12)",border: "rgba(212,165,116,0.2)"},
  green:  { top: "#34D399",  text: "#34D399",   dim: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.18)"},
  yellow: { top: "#FBBF24",  text: "#FBBF24",   dim: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.18)"},
};

export function DashboardCard({
  title, value, subtitle, icon, accent = "orange", onClick,
}: DashboardCardProps) {
  const a = ACCENT[accent];

  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden group transition-all duration-300"
      style={{
        background: "#0F0F0F",
        border: `1px solid rgba(248,248,248,0.05)`,
        cursor: onClick ? "pointer" : "default",
      }}
      onMouseEnter={(e) => {
        if (!onClick) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = a.border;
        el.style.background = "#111111";
      }}
      onMouseLeave={(e) => {
        if (!onClick) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "rgba(248,248,248,0.05)";
        el.style.background = "#0F0F0F";
      }}
    >
      {/* Top accent line */}
      <div style={{ height: "2px", background: a.top, opacity: 0.7 }} />

      {/* Content */}
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <p
            className="text-[8px] tracking-[0.5em] uppercase"
            style={{ color: "rgba(248,248,248,0.3)", fontFamily: "'Space Mono', monospace" }}
          >
            {title}
          </p>
          <div
            className="w-7 h-7 flex items-center justify-center flex-shrink-0 transition-colors duration-300"
            style={{ color: a.text, opacity: 0.7 }}
          >
            {icon}
          </div>
        </div>

        {/* Value */}
        <p
          className="leading-none mb-1.5 truncate"
          style={{
            fontSize: value.toString().length > 10 ? "clamp(1.25rem, 2vw, 1.75rem)" : "clamp(1.75rem, 3vw, 2.5rem)",
            fontWeight: 300,
            letterSpacing: "-0.03em",
            color: "#E8E8E8",
          }}
          title={value.toString()}
        >
          {value}
        </p>

        {/* Subtitle */}
        {subtitle && (
          <p
            className="text-[10px] tracking-[0.1em]"
            style={{ color: "rgba(248,248,248,0.3)" }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Arrow hint for clickable cards */}
      {onClick && (
        <div
          className="absolute bottom-4 right-4 text-[9px] tracking-widest uppercase transition-all duration-200 group-hover:translate-x-0.5"
          style={{ color: a.text, opacity: 0, }}
        >
          →
        </div>
      )}
    </div>
  );
}
