import { motion } from "motion/react";
import { useRef, useState, useEffect } from "react";

const items = [
  {
    title: "Origen",
    description: "Trabajamos directamente con agricultores locales y productores artesanales que comparten nuestro compromiso con la calidad.",
    number: "01",
    icon: "◈",
    accent: "#FF5A00",
  },
  {
    title: "Preparación",
    description: "Cada ingrediente es tratado con respeto, usando técnicas que honran tanto la tradición como la innovación.",
    number: "02",
    icon: "◎",
    accent: "#C1121F",
  },
  {
    title: "Presentación",
    description: "La armonía visual no es decoración. Es una parte integral de la experiencia culinaria.",
    number: "03",
    icon: "◇",
    accent: "#D4A574",
  },
  {
    title: "Experiencia",
    description: "La culminación del arte, la pasión y la precisión en cada bocado.",
    number: "04",
    icon: "◉",
    accent: "#FF5A00",
  },
];

export function HorizontalExplorer() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  };

  // Drag to scroll
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartScroll.current = trackRef.current?.scrollLeft ?? 0;
    document.body.style.cursor = "grabbing";
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !trackRef.current) return;
      trackRef.current.scrollLeft = dragStartScroll.current - (e.clientX - dragStartX.current);
    };
    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <section className="relative bg-[#F2F0EC] h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="pt-16 pb-4 max-w-7xl mx-auto px-8 w-full flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-end justify-between">
            <div className="relative pl-6">
              <motion.div
                className="absolute left-0 top-0 w-1 h-full bg-[#C1121F]"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                style={{ transformOrigin: "top" }}
              />
              <p className="text-xs tracking-[0.4em] text-[#C1121F] uppercase font-mono mb-2">
                — Nuestro proceso
              </p>
              <h2
                className="text-[2.5rem] md:text-[4rem] lg:text-[5.5rem] leading-[0.9] font-bold text-[#0B0B0B] tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Del campo
                <br />
                <span className="italic font-light text-[#0B0B0B]/50">a la mesa.</span>
              </h2>
            </div>
            <div className="hidden md:flex flex-col items-end gap-1 pb-1">
              <p className="text-xs tracking-[0.3em] text-[#0B0B0B]/30 uppercase font-mono">
                {items.length} etapas
              </p>
              <p className="text-[9px] tracking-[0.25em] text-[#0B0B0B]/20 uppercase font-mono">
                ← arrastrá para explorar →
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress bar */}
        <div className="mt-4 h-[1px] bg-[#0B0B0B]/10 overflow-hidden">
          <motion.div
            className="h-full bg-[#C1121F] origin-left"
            style={{ scaleX: progress }}
          />
        </div>
      </div>

      {/* Horizontal scroll track */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        onMouseDown={onMouseDown}
        className="flex gap-8 px-8 pb-8 overflow-x-auto overflow-y-hidden flex-1 min-h-0 cursor-grab active:cursor-grabbing"
        style={{
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

        {items.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 h-full"
            style={{ scrollSnapAlign: "start", width: "min(680px, calc(100vw - 4rem))" }}
          >
            <div
              className="relative h-full p-10 flex flex-col justify-between overflow-hidden group"
              style={{
                background: "#0B0B0B",
                clipPath: index % 2 === 0
                  ? "polygon(0 0, 100% 0, 100% 92%, 92% 100%, 0 100%)"
                  : "polygon(0 0, 100% 0, 100% 100%, 8% 100%, 0 92%)",
                border: `1px solid ${item.accent}20`,
              }}
            >
              {/* Hover gradient */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: `linear-gradient(135deg, ${item.accent}12 0%, transparent 60%)` }}
              />

              {/* Top */}
              <div className="relative z-10 flex items-start justify-between">
                <span
                  className="text-[8rem] font-bold leading-none select-none"
                  style={{
                    color: "transparent",
                    WebkitTextStroke: `1px ${item.accent}25`,
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {item.number}
                </span>
                <motion.span
                  className="text-4xl mt-4"
                  style={{ color: item.accent, opacity: 0.5 }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  {item.icon}
                </motion.span>
              </div>

              {/* Bottom */}
              <div className="relative z-10 space-y-4">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-0 w-1 h-full" style={{ background: item.accent }} />
                  <h3
                    className="text-4xl font-bold text-[#F8F8F8]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {item.title}
                  </h3>
                </div>
                <p className="text-lg text-[#F8F8F8]/60 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="h-[1px]" style={{ background: item.accent, width: 40 }} />
                  <span className="text-[10px] tracking-[0.4em] uppercase font-mono" style={{ color: item.accent }}>
                    Etapa {item.number}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Right padding card */}
        <div className="flex-shrink-0 w-8 h-full" />
      </div>
    </section>
  );
}
