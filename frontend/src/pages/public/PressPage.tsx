import { motion } from "motion/react";

export function PressPage() {
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
          <p className="text-xs tracking-[0.4em] text-[#C1121F] uppercase font-mono mb-6">
            — Reconocimientos
          </p>
          <h1
            className="text-[3rem] md:text-[5rem] font-bold leading-[0.9] tracking-tight mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Prensa <br />
            <span className="italic font-light text-[#F8F8F8]/40">& artículos.</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="space-y-16"
        >
          <div className="group block border-b border-[#F8F8F8]/10 pb-8 hover:border-[#C1121F] transition-colors duration-500 cursor-pointer">
            <p className="text-xs font-mono tracking-widest text-[#F8F8F8]/40 uppercase mb-4">Gourmet Magazine • 2026</p>
            <h3 className="text-2xl font-serif mb-4 group-hover:text-[#C1121F] transition-colors duration-500">
              "El refugio donde el tiempo se mide en maduración y textura."
            </h3>
            <p className="text-[#F8F8F8]/60 font-light max-w-2xl leading-relaxed">
              Un análisis detallado sobre cómo The Food Store desafía las tendencias de la fast-gastronomy, devolviendo el romanticismo al acto de comer.
            </p>
          </div>

          <div className="group block border-b border-[#F8F8F8]/10 pb-8 hover:border-[#C1121F] transition-colors duration-500 cursor-pointer">
            <p className="text-xs font-mono tracking-widest text-[#F8F8F8]/40 uppercase mb-4">The Culinary Post • 2025</p>
            <h3 className="text-2xl font-serif mb-4 group-hover:text-[#C1121F] transition-colors duration-500">
              "La arquitectura del sabor: Diseño y cocina en perfecta sincronía."
            </h3>
            <p className="text-[#F8F8F8]/60 font-light max-w-2xl leading-relaxed">
              Entrevista exclusiva con nuestros fundadores sobre el proceso de diseño espacial y su influencia en la experiencia del comensal.
            </p>
          </div>

          <div className="pt-12">
            <p className="text-[#F8F8F8]/60 font-light font-sans">
              Para consultas de prensa o material en alta resolución, contactar a <a href="mailto:press@thefoodstore.com" className="text-[#C1121F] border-b border-[#C1121F]/30 hover:border-[#C1121F] transition-colors">press@thefoodstore.com</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
