import { motion } from "motion/react";

export function CareersPage() {
  return (
    <div className="relative min-h-screen bg-[#0B0B0B] text-[#F8F8F8] overflow-hidden pt-32 pb-32">
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />

      <div className="max-w-4xl mx-auto px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          className="mb-24"
        >
          <p className="text-xs tracking-[0.4em] text-[#D4A574] uppercase font-mono mb-6">
            — Carrera
          </p>
          <h1
            className="text-[3rem] md:text-[5rem] font-bold leading-[0.9] tracking-tight mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Únite a <br />
            <span className="italic font-light text-[#F8F8F8]/40">la brigada.</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="space-y-12 text-[#F8F8F8]/60 leading-relaxed font-light text-lg"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <p>
            Buscamos personas apasionadas por la hospitalidad y la excelencia culinaria. En The Food Store, creemos que nuestro equipo es el ingrediente más importante de nuestra experiencia.
          </p>

          <div className="border-t border-[#F8F8F8]/10 pt-12">
            <h2 className="text-2xl font-serif text-[#F8F8F8] mb-6">Posiciones Abiertas</h2>
            
            <div className="space-y-6">
              <div className="group border border-[#F8F8F8]/10 p-6 hover:border-[#D4A574] transition-colors duration-300 cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[#F8F8F8] font-bold tracking-wider">Chef de Partie</h3>
                  <span className="text-[10px] font-mono tracking-widest uppercase border border-[#F8F8F8]/20 px-2 py-1">Full-Time</span>
                </div>
                <p className="text-sm">Experiencia mínima de 3 años en cocinas de alta exigencia.</p>
              </div>

              <div className="group border border-[#F8F8F8]/10 p-6 hover:border-[#D4A574] transition-colors duration-300 cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[#F8F8F8] font-bold tracking-wider">Sommelier</h3>
                  <span className="text-[10px] font-mono tracking-widest uppercase border border-[#F8F8F8]/20 px-2 py-1">Part-Time</span>
                </div>
                <p className="text-sm">Conocimiento profundo de vinos locales y bodegas boutique.</p>
              </div>
            </div>
          </div>

          <div className="pt-12">
            <p>
              Enviá tu CV y carta de presentación a <a href="mailto:careers@thefoodstore.com" className="text-[#D4A574] border-b border-[#D4A574]/30 hover:border-[#D4A574] transition-colors">careers@thefoodstore.com</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
