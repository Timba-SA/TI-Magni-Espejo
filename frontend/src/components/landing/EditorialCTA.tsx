import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const INFO = [
  {
    label: "Ubicación",
    lines: ["123 Palermo Soho", "Buenos Aires, BSAS 10001"],
    accent: "#FF5A00",
  },
  {
    label: "Horarios",
    lines: ["Mar–Sáb: 17:00 – 23:00", "Dom–Lun: Cerrado"],
    accent: "#C1121F",
  },
  {
    label: "Contacto",
    lines: ["+1 (555) 123-4567", "hola@thefoodstore.com"],
    accent: "#D4A574",
  },
];

const words = ["Probalo", "vos"];

export function EditorialCTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[#F2F0EC] flex items-center justify-center overflow-hidden py-32"
    >
      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />

      {/* Decorative abstract map — SVG geometric */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none opacity-[0.04]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.04 }}
        viewport={{ once: true }}
        transition={{ duration: 2 }}
      >
        <svg viewBox="0 0 400 800" className="w-full h-full">
          {[0, 60, 120, 180, 240, 300, 360].map((x) => (
            <line key={`v${x}`} x1={x} y1={0} x2={x} y2={800} stroke="#0B0B0B" strokeWidth="0.5" />
          ))}
          {[0, 80, 160, 240, 320, 400, 480, 560, 640, 720, 800].map((y) => (
            <line key={`h${y}`} x1={0} y1={y} x2={400} y2={y} stroke="#0B0B0B" strokeWidth="0.5" />
          ))}
          <circle cx="120" cy="320" r="8" fill="none" stroke="#FF5A00" strokeWidth="1.5" />
          <circle cx="120" cy="320" r="3" fill="#FF5A00" />
          <circle cx="240" cy="160" r="5" fill="none" stroke="#0B0B0B" strokeWidth="1" />
          <circle cx="60" cy="500" r="4" fill="none" stroke="#0B0B0B" strokeWidth="1" />
          <text x="130" y="318" fontSize="8" fill="#FF5A00" fontFamily="monospace">THE FOOD STORE</text>
        </svg>
      </motion.div>

      <motion.div
        style={{ scale, opacity }}
        className="relative w-full max-w-7xl mx-auto px-8"
      >
        <div className="relative">
          <motion.div
            className="absolute -left-4 top-0 w-1 h-full bg-[#C1121F]"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3 }}
            style={{ transformOrigin: "top" }}
          />

          <div className="space-y-12">
            {/* Headline */}
            <h2
              className="leading-[0.85] font-bold text-[#0B0B0B] tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(5rem, 14vw, 16rem)" }}
            >
              {words.map((word, i) => (
                <motion.span
                  key={word}
                  className="inline-block mr-[0.25em]"
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.2 + i * 0.15, ease: [0.76, 0, 0.24, 1] }}
                >
                  {word}
                </motion.span>
              ))}
              <br />
              <motion.span
                className="inline-block italic font-light"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
              >
                mismo.
              </motion.span>
            </h2>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between"
            >
              <p className="text-2xl text-[#0B0B0B]/55 max-w-2xl leading-relaxed">
                Visitanos y descubrí por qué las mejores cosas
                <br />
                no se explican — solo se viven.
              </p>

              <div className="flex flex-col gap-4">
                <motion.button
                  className="group relative px-16 py-6 bg-[#0B0B0B] text-[#F8F8F8] overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-[#FF5A00]"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                  <span className="relative z-10 text-xl tracking-widest uppercase font-medium">
                    Reservar mesa
                  </span>
                </motion.button>

                <motion.div className="relative overflow-hidden">
                  <input
                    type="email"
                    placeholder="Recibí novedades"
                    className="w-full bg-transparent border border-[#0B0B0B]/20 px-5 py-3 text-sm text-[#0B0B0B] placeholder-[#0B0B0B]/30 font-mono tracking-widest outline-none focus:border-[#FF5A00] transition-colors duration-300"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Info grid */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.9 }}
              className="pt-12 border-t border-[#0B0B0B]/10"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {INFO.map((info) => (
                  <div key={info.label} className="group">
                    <p
                      className="text-sm tracking-[0.3em] mb-3 uppercase font-mono"
                      style={{ color: info.accent }}
                    >
                      {info.label}
                    </p>
                    {info.lines.map((line, i) => (
                      <p key={i} className="text-xl text-[#0B0B0B]">
                        {line}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-2 bg-[#0B0B0B]"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.5 }}
        style={{ transformOrigin: "left" }}
      />
    </div>
  );
}
