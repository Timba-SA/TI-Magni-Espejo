import { motion } from "motion/react";

export function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[#0B0B0B] text-[#F8F8F8] overflow-hidden pt-32 pb-32">
      {/* Background Noise */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          className="mb-24"
        >
          <p className="text-xs tracking-[0.4em] text-[#C1121F] uppercase font-mono mb-6">
            — Nuestra Historia
          </p>
          <h1
            className="text-[4rem] md:text-[8rem] font-bold leading-[0.85] tracking-tight mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Orígenes <br />
            <span className="italic font-light text-[#F8F8F8]/40">y herencia.</span>
          </h1>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 mb-32">
          <motion.div
            className="md:col-span-5"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="aspect-[3/4] bg-[#111] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#FF5A00]/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img
                src="https://images.unsplash.com/photo-1541557435984-1c79685a082b?q=80&w=2070&auto=format&fit=crop"
                alt="Chef en la cocina"
                className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
              />
              <div className="absolute bottom-4 left-4 border border-[#F8F8F8]/20 px-3 py-1 bg-black/50 backdrop-blur-sm text-[9px] font-mono tracking-widest text-[#F8F8F8]/60 uppercase">
                Fig. 01 — El Fuego
              </div>
            </div>
          </motion.div>

          <motion.div
            className="md:col-span-7 flex flex-col justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2
              className="text-3xl md:text-5xl font-bold mb-8 text-[#F8F8F8]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Un refugio para <span className="italic font-light text-[#FF5A00]">puristas</span>.
            </h2>
            <div className="space-y-6 text-[#F8F8F8]/60 leading-relaxed max-w-2xl text-lg font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
              <p>
                The Food Store nació en 2026 como una respuesta al ritmo desenfrenado de la ciudad. Queríamos crear un espacio donde el tiempo pareciera detenerse, un santuario culinario donde cada ingrediente fuera respetado y cada técnica honrara su origen.
              </p>
              <p>
                No seguimos tendencias. Buscamos productores locales obsesionados con la calidad, ganaderos que entienden el tiempo de maduración y agricultores que respetan la tierra.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Second block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24">
          <motion.div
            className="md:col-span-6 md:order-2"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
          >
            <div className="aspect-video bg-[#111] relative overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2070&auto=format&fit=crop"
                alt="Detalles del restaurante"
                className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
              />
              <div className="absolute top-4 right-4 border border-[#F8F8F8]/20 px-3 py-1 bg-black/50 backdrop-blur-sm text-[9px] font-mono tracking-widest text-[#F8F8F8]/60 uppercase">
                Fig. 02 — El Salón
              </div>
            </div>
          </motion.div>

          <motion.div
            className="md:col-span-6 md:order-1 flex flex-col justify-center"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2
              className="text-3xl md:text-5xl font-bold mb-8 text-[#F8F8F8]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Arquitectura del <span className="italic font-light text-[#C1121F]">sabor</span>.
            </h2>
            <div className="space-y-6 text-[#F8F8F8]/60 leading-relaxed max-w-2xl text-lg font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
              <p>
                Cada plato es diseñado como una obra arquitectónica. Estudiamos las texturas, los contrastes térmicos y el balance de acidez para lograr una experiencia sensorial completa. 
              </p>
              <p>
                Nuestra cocina es completamente a la vista. No hay secretos, solo oficio puro y la coreografía de nuestros chefs trabajando en total sincronía.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
