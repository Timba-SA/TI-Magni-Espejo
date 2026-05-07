import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";

const statements = [
  {
    text: "Artesanal.",
    subtext: "No fabricado.",
    body: "No seguimos recetas. Creamos experiencias que trascienden el momento ordinario.",
    position: "left",
    accent: "#FF5A00",
    number: "01",
  },
  {
    text: "Cada bocado",
    subtext: "cuenta una historia.",
    body: "Desde la selección de ingredientes hasta la presentación final, cada momento es deliberado e intencional.",
    position: "right",
    accent: "#C1121F",
    number: "02",
  },
  {
    text: "Precisión",
    subtext: "en cada detalle.",
    body: "La diferencia entre lo bueno y lo extraordinario está en los detalles que no se ven — pero siempre se sienten.",
    position: "left",
    accent: "#D4A574",
    number: "03",
  },
];

export function EditorialStatement() {
  return (
    <div className="relative bg-[#F2F0EC] overflow-hidden">
      {/* Subtle grain */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />
      <div className="py-16">
        {statements.map((statement, index) => (
          <StatementBlock key={index} statement={statement} index={index} />
        ))}
      </div>
    </div>
  );
}

function StatementBlock({
  statement,
  index: _index,
}: {
  statement: (typeof statements)[0];
  index: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 0.4, 0.6, 1],
    statement.position === "left" ? [-80, 0, 0, 60] : [80, 0, 0, -60]
  );
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);
  const lineWidth = useTransform(scrollYProgress, [0.2, 0.5], ["0%", "100%"]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-[80vh] flex items-center overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Number watermark — outline only */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 text-[22rem] font-bold leading-none select-none pointer-events-none ${
          statement.position === "left" ? "right-0 translate-x-[20%]" : "left-0 -translate-x-[20%]"
        }`}
        style={{
          color: "transparent",
          WebkitTextStroke: `2px ${statement.accent}`,
          opacity: hovered ? 0.12 : 0.06,
          fontFamily: "'Space Mono', monospace",
          transition: "opacity 0.7s ease",
        }}
      >
        {statement.number}
      </div>

      <motion.div
        style={{ x, opacity }}
        className={`w-full max-w-7xl mx-auto px-8 ${
          statement.position === "right" ? "text-right" : ""
        }`}
      >
        <div className="relative">
          {/* Accent line */}
          {statement.position === "left" ? (
            <motion.div
              className="absolute -left-6 top-0 w-[3px]"
              style={{ background: statement.accent, transformOrigin: "top" }}
              initial={{ scaleY: 0, height: "100%" }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          ) : (
            <motion.div
              className="absolute -right-6 top-0 w-[3px]"
              style={{ background: statement.accent, transformOrigin: "top" }}
              initial={{ scaleY: 0, height: "100%" }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          )}

          {/* Category label */}
          <motion.p
            className="text-xs tracking-[0.4em] uppercase font-mono mb-8"
            style={{ color: statement.accent }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            — {statement.number} de {statements.length}
          </motion.p>

          <motion.h2
            className="text-[6rem] md:text-[10rem] lg:text-[14rem] leading-[0.83] font-bold text-[#0B0B0B] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            {statement.text}
          </motion.h2>

          <motion.p
            className="text-[3.5rem] md:text-[5.5rem] lg:text-[7.5rem] leading-[0.9] font-light italic mt-2"
            style={{ fontFamily: "'Playfair Display', serif", color: `${statement.accent}80` }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.3 }}
          >
            {statement.subtext}
          </motion.p>

          {/* Painted underline */}
          <div className={`mt-6 ${statement.position === "right" ? "flex justify-end" : ""}`}>
            <div className="relative h-[1px] w-48 overflow-hidden bg-[#0B0B0B]/10">
              <motion.div
                className="absolute inset-y-0 left-0 h-full"
                style={{ width: lineWidth, backgroundColor: statement.accent }}
              />
            </div>
          </div>

          <motion.p
            className={`mt-10 text-lg text-[#0B0B0B]/50 max-w-lg leading-relaxed ${
              statement.position === "right" ? "ml-auto" : ""
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.55 }}
          >
            {statement.body}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
