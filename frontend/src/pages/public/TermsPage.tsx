import { motion } from "motion/react";

export function TermsPage() {
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
          <p className="text-xs tracking-[0.4em] text-[#C1121F] uppercase font-mono mb-6">
            — Condiciones
          </p>
          <h1
            className="text-[3rem] md:text-[5rem] font-bold leading-[0.9] tracking-tight mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Términos y <br />
            <span className="italic font-light text-[#F8F8F8]/40">condiciones.</span>
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
            <h2 className="text-xl font-serif text-[#F8F8F8] mb-6 uppercase tracking-widest text-[#C1121F]">01. Reservas</h2>
            <p>
              Toda reserva está sujeta a confirmación mediante correo electrónico. Solicitamos puntualidad; después de 15 minutos de retraso sin previo aviso, la mesa podrá ser liberada para otros comensales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#F8F8F8] mb-6 uppercase tracking-widest text-[#C1121F]">02. Cancelaciones</h2>
            <p>
              Agradecemos notificar cualquier cancelación con al menos 24 horas de antelación. En el caso de grupos mayores a 5 personas, se podrá requerir un depósito previo que será reembolsable solo si se cancela dentro del plazo establecido.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#F8F8F8] mb-6 uppercase tracking-widest text-[#C1121F]">03. Código de Vestimenta</h2>
            <p>
              Si bien no imponemos un protocolo rígido, sugerimos un estilo Smart Casual para acompañar la atmósfera de nuestro salón.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#F8F8F8] mb-6 uppercase tracking-widest text-[#C1121F]">04. Alergias y Restricciones</h2>
            <p>
              Es responsabilidad del comensal informar sobre cualquier alergia o restricción alimentaria al momento de la reserva o al llegar al establecimiento para que nuestra brigada pueda tomar los recaudos necesarios.
            </p>
          </section>

          <div className="pt-12 border-t border-[#F8F8F8]/10">
            <p className="text-sm font-mono tracking-widest">The Food Store — Buenos Aires, Argentina</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
