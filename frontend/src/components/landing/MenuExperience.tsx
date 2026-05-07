import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

type Category = "especiales" | "bebidas" | "postres";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "especiales", label: "Especiales" },
  { id: "bebidas", label: "Bebidas" },
  { id: "postres", label: "Postres" },
];

const MENU: Record<Category, { name: string; sub: string; price: string; isSpecial?: boolean; description: string }[]> = {
  especiales: [
    {
      name: "La Herencia",
      sub: "Hamburguesa Emblema",
      price: "$28",
      isSpecial: true,
      description: "Carne madurada 72hs en seco, queso gruyère añejado, cebolla caramelizada lenta y panceta de cerdo de campo. Acompañada de papas fritas con sal de mar.",
    },
    {
      name: "El Colono",
      sub: "Costilla de res braseada",
      price: "$34",
      description: "Cocinada 12 horas a baja temperatura con hiervas silvestres y un glaseado de melaza y chimichurri de campo.",
    },
    {
      name: "Noche en Blanco",
      sub: "Pasta fresca artesanal",
      price: "$26",
      description: "Fetuccini elaborado a mano con manteca de trufa negra, parmesano 36 meses y yema curada.",
    },
    {
      name: "Tierra y Mar",
      sub: "Pulpo + cerdo",
      price: "$38",
      description: "Tentáculo de pulpo a la brasa sobre espuma de garbanzo ahumado y chipacitos de cerdo.",
    },
  ],
  bebidas: [
    {
      name: "Noir",
      sub: "Café de extracción lenta",
      price: "$12",
      isSpecial: true,
      description: "18 horas de extracción en frío. Notas de chocolate oscuro, tabaco y nuez. Servido sobre piedra.",
    },
    {
      name: "Fermentado de Azahar",
      sub: "Cóctel sin alcohol",
      price: "$14",
      description: "Kombucha artesanal de flores de azahar, jengibre fresco y shrub de limón.",
    },
    {
      name: "El Negroni de la Casa",
      sub: "Cóctel emblemático",
      price: "$18",
      description: "Gin artesanal infusionado con cardamomo, Campari y vermouth rosso de barrica.",
    },
    {
      name: "Agua de Montaña",
      sub: "Naturales o con gas",
      price: "$6",
      description: "Traída directamente de manantiales patagónicos. Temperatura óptima servida a 12°C.",
    },
  ],
  postres: [
    {
      name: "Terciopelo",
      sub: "Mousse de chocolate belga",
      price: "$18",
      isSpecial: true,
      description: "Mousse aireada de cacao 72%, tierra de cacao fermentado y caramelo de flor de sal del Himalaya.",
    },
    {
      name: "La Pera",
      sub: "Tarta de pera y almendra",
      price: "$16",
      description: "Peras Williams pochadas en vino tinto, frangipane de almendra y crema de vainilla de Madagascar.",
    },
    {
      name: "Queso y Dulce",
      sub: "Tabla de quesos artesanales",
      price: "$22",
      description: "Selección rotativa de 4 quesos maduros con membrillo casero, nueces tostadas y miel de campo.",
    },
  ],
};

const BG_TINTS: Record<Category, string> = {
  especiales: "rgba(255,90,0,0.03)",
  bebidas: "rgba(193,18,31,0.03)",
  postres: "rgba(212,165,116,0.03)",
};

const ACCENT: Record<Category, string> = {
  especiales: "#FF5A00",
  bebidas: "#C1121F",
  postres: "#D4A574",
};

export function MenuExperience() {
  const [active, setActive] = useState<Category>("especiales");
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div
      className="relative min-h-screen py-24 transition-colors duration-700"
      style={{ backgroundColor: "#0B0B0B", background: `linear-gradient(180deg, #0B0B0B 0%, ${BG_TINTS[active]} 100%)` }}
    >
      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />

      <div className="max-w-4xl mx-auto px-8">
        {/* Header */}
        <div className="mb-16 relative pl-6">
          <motion.div
            className="absolute left-0 top-0 w-[3px] h-full"
            style={{ background: ACCENT[active], transformOrigin: "top" }}
            animate={{ scaleY: [0, 1] }}
            key={active}
            transition={{ duration: 0.6 }}
          />
          <p className="text-xs tracking-[0.4em] text-[#F8F8F8]/30 uppercase font-mono mb-5">
            — La Carta
          </p>
          <h2
            className="text-[5rem] md:text-[7rem] leading-[0.88] font-bold text-[#F8F8F8] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Menú
            <br />
            <span className="italic font-light text-[#F8F8F8]/40">de temporada.</span>
          </h2>
        </div>

        {/* Category tabs */}
        <div className="relative flex gap-8 mb-16 border-b border-[#F8F8F8]/[0.06] pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActive(cat.id); setExpanded(null); }}
              className="relative pb-3 text-sm font-mono tracking-[0.2em] uppercase transition-colors duration-300"
              style={{ color: active === cat.id ? ACCENT[active] : "rgba(248,248,248,0.3)" }}
            >
              {cat.label}
              {active === cat.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ background: ACCENT[active] }}
                  layoutId="tab-underline"
                  transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Menu items */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-0"
          >
            {MENU[active].map((item, i) => (
              <motion.div
                key={item.name}
                className="border-t border-[#F8F8F8]/[0.06] py-8 group cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                onClick={() => setExpanded(expanded === item.name ? null : item.name)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3
                        className="text-3xl md:text-4xl font-bold text-[#F8F8F8] group-hover:translate-x-2 transition-transform duration-400"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {item.name}
                      </h3>
                      {item.isSpecial && (
                        <motion.span
                          className="text-[9px] tracking-[0.3em] uppercase font-mono px-2 py-1 border"
                          style={{ color: ACCENT[active], borderColor: `${ACCENT[active]}40` }}
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                        >
                          Especial de hoy
                        </motion.span>
                      )}
                    </div>
                    <p className="text-[#F8F8F8]/35 text-sm font-mono tracking-wider">
                      {item.sub}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span
                      className="text-2xl font-bold font-mono"
                      style={{ color: ACCENT[active] }}
                    >
                      {item.price}
                    </span>
                    <motion.span
                      className="text-[#F8F8F8]/30 text-xl"
                      animate={{ rotate: expanded === item.name ? 45 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      +
                    </motion.span>
                  </div>
                </div>

                <AnimatePresence>
                  {expanded === item.name && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.45 }}
                      className="text-[#F8F8F8]/50 leading-relaxed max-w-xl"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {item.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
            <div className="border-t border-[#F8F8F8]/[0.06]" />
          </motion.div>
        </AnimatePresence>

        {/* Bottom note */}
        <motion.p
          className="mt-16 text-[10px] tracking-[0.35em] text-[#F8F8F8]/20 uppercase font-mono text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Precios en dólares · Alérgenos disponibles a pedido · Menú sujeto a disponibilidad
        </motion.p>
      </div>
    </div>
  );
}
