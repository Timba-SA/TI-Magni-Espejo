import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

const products = [
  {
    id: "heritage",
    name: "La Herencia",
    type: "Hamburguesa Emblema",
    description: "Carne madurada 72 horas, queso gruyère añejado y panceta crujiente de cerdo de campo.",
    price: "$28",
    accent: "#FF5A00",
    letter: "H",
    processDetail: "— Madurada 72hs en seco",
  },
  {
    id: "noir",
    name: "Noir",
    type: "Café Artesanal",
    description: "Extracción en frío durante 18 horas, con notas de chocolate oscuro y tabaco.",
    price: "$12",
    accent: "#C1121F",
    letter: "N",
    processDetail: "— Frío 18hs",
  },
  {
    id: "velvet",
    name: "Terciopelo",
    type: "Postre",
    description: "Mouse de chocolate belga, tierra de cacao fermentado y una capa de caramelo de flor de sal.",
    price: "$18",
    accent: "#D4A574",
    letter: "T",
    processDetail: "— Hecho al momento",
  },
];

export function ProductShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  const active = products[activeIndex];

  return (
    <div className="relative min-h-screen bg-[#F2F0EC] flex flex-col justify-center py-24">
      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />

      <div className="max-w-7xl mx-auto px-8 w-full">
        {/* Header */}
        <div className="mb-20 max-w-2xl">
          <motion.p
            className="text-xs tracking-[0.4em] text-[#FF5A00] uppercase font-mono mb-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            — Selección de la casa
          </motion.p>
          <motion.h2
            className="text-[5rem] md:text-[7rem] leading-[0.88] font-bold text-[#0B0B0B] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            Destacados
            <br />
            <span className="italic font-light text-[#0B0B0B]/40">de la semana.</span>
          </motion.h2>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Product list */}
          <div className="space-y-0">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                className="group relative py-10 border-t border-[#0B0B0B]/10 cursor-none"
                data-cursor="explore"
                onClick={() => setActiveIndex(index)}
                whileHover={{ x: 8 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {/* Active accent line */}
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-[3px]"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      exit={{ scaleY: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{ transformOrigin: "top", background: product.accent }}
                    />
                  )}
                </AnimatePresence>

                <div className="pl-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p
                        className="text-xs tracking-[0.3em] uppercase font-mono mb-2"
                        style={{ color: activeIndex === index ? product.accent : "#0B0B0B" + "33" }}
                      >
                        {product.type}
                      </p>
                      <h3
                        className="text-5xl font-bold leading-[0.9] text-[#0B0B0B]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {product.name}
                      </h3>
                    </div>
                    <span
                      className="text-2xl font-bold font-mono mt-2"
                      style={{ color: product.accent }}
                    >
                      {product.price}
                    </span>
                  </div>

                  <AnimatePresence>
                    {activeIndex === index && (
                      <motion.p
                        className="text-[#0B0B0B]/55 leading-relaxed mt-4 max-w-lg"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        {product.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
            {/* Last border */}
            <div className="border-t border-[#0B0B0B]/10" />
          </div>

          {/* Right: Visual panel */}
          <div className="relative h-[540px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
              >
                {/* Background block */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${active.accent}10 0%, transparent 60%)`,
                    border: `1px solid ${active.accent}20`,
                  }}
                />

                {/* Giant editorial letter */}
                <span
                  className="absolute font-bold leading-none select-none pointer-events-none"
                  style={{
                    fontSize: "clamp(12rem, 30vw, 26rem)",
                    color: "transparent",
                    WebkitTextStroke: `1px ${active.accent}20`,
                    fontFamily: "'Playfair Display', serif",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {active.letter}
                </span>

                {/* Color orb */}
                <div
                  className="absolute w-64 h-64 rounded-full"
                  style={{
                    background: active.accent,
                    filter: "blur(80px)",
                    opacity: 0.12,
                    top: "30%",
                    left: "40%",
                  }}
                />

                {/* Process detail badge */}
                <motion.div
                  className="absolute bottom-8 left-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <p
                    className="text-xs tracking-[0.35em] uppercase font-mono"
                    style={{ color: active.accent }}
                  >
                    {active.processDetail}
                  </p>
                </motion.div>

                {/* Product name in corner */}
                <motion.div
                  className="absolute top-8 right-8 text-right"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <p
                    className="text-xl font-bold text-[#0B0B0B]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {active.name}
                  </p>
                  <p
                    className="text-xs tracking-widest text-[#0B0B0B]/40 uppercase font-mono mt-1"
                  >
                    {active.type}
                  </p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
