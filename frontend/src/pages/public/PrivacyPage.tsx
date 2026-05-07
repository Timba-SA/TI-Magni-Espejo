import { motion } from "motion/react";

export function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-[#0B0B0B] text-[#F8F8F8] overflow-hidden pt-32 pb-32">
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />

      <div className="max-w-3xl mx-auto px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          className="mb-24"
        >
          <p className="text-xs tracking-[0.4em] text-[#FF5A00] uppercase font-mono mb-6">
            — Legal
          </p>
          <h1
            className="text-[3rem] md:text-[5rem] font-bold leading-[0.9] tracking-tight mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Políticas de <br />
            <span className="italic font-light text-[#F8F8F8]/40">privacidad.</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="space-y-12 text-[#F8F8F8]/60 leading-relaxed font-light text-lg"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <section>
            <h2 className="text-xl font-serif text-[#F8F8F8] mb-6 uppercase tracking-widest">01. Recopilación de Datos</h2>
            <p>
              En The Food Store, respetamos profundamente su privacidad. Recopilamos información personal únicamente cuando es estrictamente necesaria para gestionar sus reservas y mejorar su experiencia gastronómica. Esto incluye su nombre, dirección de correo electrónico y número de teléfono.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#F8F8F8] mb-6 uppercase tracking-widest">02. Uso de la Información</h2>
            <p>
              Sus datos se utilizan exclusivamente para confirmar reservas, enviar recordatorios y, si usted lo autoriza, informarle sobre eventos especiales o actualizaciones de nuestro menú. Nunca compartimos sus datos con terceros con fines comerciales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#F8F8F8] mb-6 uppercase tracking-widest">03. Seguridad</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra el acceso no autorizado, la pérdida o la alteración. Sus datos están seguros con nosotros.
            </p>
          </section>

          <div className="pt-12 border-t border-[#F8F8F8]/10">
            <p className="text-sm font-mono tracking-widest">Última actualización: Mayo 2026</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
