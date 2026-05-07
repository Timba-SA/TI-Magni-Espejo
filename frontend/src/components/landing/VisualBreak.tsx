import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

// ─── Marquee de texto corriendo ───────────────────────────────────────────────
const MARQUEE_TEXT =
  "ARTE · FUEGO · SAL · OFICIO · PRECISIÓN · PASIÓN · TERROIR · DETALLE · SABOR · ORIGEN · ";

function MarqueeStrip({
  direction = 1,
  opacity = 0.07,
}: {
  direction?: 1 | -1;
  opacity?: number;
}) {
  return (
    <div className="overflow-hidden flex" style={{ opacity }}>
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: direction === 1 ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(4)].map((_, i) => (
          <span
            key={i}
            className="text-[clamp(3.5rem,7vw,6rem)] font-bold tracking-tight text-white pr-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {MARQUEE_TEXT}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Datos de los pilares ─────────────────────────────────────────────────────
const PILLARS = [
  {
    number: "01",
    title: "Arte",
    description:
      "No fabricamos comida. Construimos momentos. Cada plato es una decisión editorial, una elección consciente de ingrediente, textura y presentación.",
    accent: "#FF5A00",
    stat: "72hs",
    statLabel: "de maduración promedio",
  },
  {
    number: "02",
    title: "Pasión",
    description:
      "La diferencia entre lo correcto y lo extraordinario es invisible al ojo pero absoluta al paladar. Vivimos en ese margen imposible.",
    accent: "#C1121F",
    stat: "100%",
    statLabel: "ingredientes de origen",
  },
  {
    number: "03",
    title: "Calidad",
    description:
      "Nunca comprometida. El estándar no baja porque la noche esté llena o porque sea martes. Siempre el mismo nivel, siempre el mismo compromiso.",
    accent: "#D4A574",
    stat: "Est.",
    statLabel: "2026 · Buenos Aires",
  },
];

// ─── Columna individual ───────────────────────────────────────────────────────
function PillarColumn({
  pillar,
  index,
}: {
  pillar: (typeof PILLARS)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.3"],
  });

  const clipProgress = useTransform(scrollYProgress, [0, 1], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0, 1]);

  return (
    <div
      ref={ref}
      className="relative flex flex-col"
      style={{ borderLeft: `1px solid rgba(248,248,248,0.06)` }}
    >
      {/* Línea de acento que crece desde arriba al hacer scroll */}
      <motion.div
        className="absolute top-0 left-0 w-[1px]"
        style={{
          height: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]),
          background: pillar.accent,
          transformOrigin: "top",
        }}
      />

      {/* Contenido revelado con clip-path */}
      <motion.div
        className="px-8 pt-12 pb-10 flex flex-col gap-8"
        style={{ clipPath: clipProgress }}
        transition={{ delay: index * 0.1 }}
      >
        {/* Número + stat */}
        <div className="flex items-start justify-between">
          <span
            className="text-[10px] tracking-[0.45em] uppercase font-mono"
            style={{ color: pillar.accent }}
          >
            {pillar.number}
          </span>
          <div className="text-right">
            <p
              className="text-2xl font-bold font-mono leading-none"
              style={{ color: pillar.accent }}
            >
              {pillar.stat}
            </p>
            <p
              className="text-[9px] tracking-widest uppercase font-mono mt-0.5"
              style={{ color: "rgba(248,248,248,0.25)" }}
            >
              {pillar.statLabel}
            </p>
          </div>
        </div>

        {/* Separador delgado */}
        <div style={{ height: 1, background: "rgba(248,248,248,0.05)" }} />

        {/* Título */}
        <h3
          className="text-[clamp(2.8rem,4.5vw,4rem)] font-bold leading-[0.88] tracking-tight text-white"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {pillar.title}
        </h3>

        {/* Cuerpo */}
        <p
          className="text-sm leading-relaxed"
          style={{
            color: "rgba(248,248,248,0.35)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {pillar.description}
        </p>
      </motion.div>

      {/* Badge inferior */}
      <motion.div
        className="mt-auto px-8 pb-10"
        style={{ y, opacity }}
      >
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5"
          style={{
            border: `1px solid ${pillar.accent}30`,
            background: `${pillar.accent}08`,
          }}
        >
          <span
            className="w-1 h-1 rounded-full"
            style={{ background: pillar.accent }}
          />
          <span
            className="text-[9px] tracking-[0.3em] uppercase font-mono"
            style={{ color: `${pillar.accent}80` }}
          >
            The Food Store
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function VisualBreak() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const noiseY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  return (
    <div
      ref={containerRef}
      className="relative bg-[#080808] overflow-hidden"
    >
      {/* Noise parallax */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          y: noiseY,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
          opacity: 0.03,
        }}
      />

      {/* Ambient blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "20%",
          left: "-10%",
          width: "45%",
          height: "60%",
          background: "radial-gradient(ellipse, rgba(255,90,0,0.05) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "10%",
          right: "-5%",
          width: "35%",
          height: "50%",
          background: "radial-gradient(ellipse, rgba(193,18,31,0.04) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* ── Marquee superior ─────────────────────────────────────────────── */}
      <div className="pt-20 pb-8 select-none">
        <MarqueeStrip direction={1} opacity={0.05} />
        <div className="mt-3">
          <MarqueeStrip direction={-1} opacity={0.03} />
        </div>
      </div>

      {/* ── Línea divisora con label ──────────────────────────────────────── */}
      <div
        className="max-w-7xl mx-auto px-8 flex items-center gap-6 pb-0"
        style={{ borderTop: "1px solid rgba(248,248,248,0.05)" }}
      >
        <span
          className="text-[9px] tracking-[0.5em] uppercase font-mono py-4 whitespace-nowrap"
          style={{ color: "rgba(248,248,248,0.15)" }}
        >
          Nuestra filosofía
        </span>
        <div style={{ flex: 1, height: 1, background: "rgba(248,248,248,0.03)" }} />
        <span
          className="text-[9px] tracking-[0.5em] uppercase font-mono py-4 whitespace-nowrap"
          style={{ color: "rgba(248,248,248,0.08)", fontFamily: "'Space Mono', monospace" }}
        >
          I — III
        </span>
      </div>

      {/* ── Grid de pilares ───────────────────────────────────────────────── */}
      <div
        className="max-w-7xl mx-auto px-8"
        style={{ borderTop: "1px solid rgba(248,248,248,0.05)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 min-h-[520px]">
          {PILLARS.map((pillar, index) => (
            <PillarColumn key={pillar.number} pillar={pillar} index={index} />
          ))}
        </div>
      </div>

      {/* ── Marquee inferior invertido ────────────────────────────────────── */}
      <div
        className="pb-20 pt-8 select-none"
        style={{ borderTop: "1px solid rgba(248,248,248,0.04)" }}
      >
        <MarqueeStrip direction={-1} opacity={0.04} />
      </div>
    </div>
  );
}
