import { motion, useMotionValue, useTransform, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Calendar, Users, Clock, FileText, ArrowRight, CheckCircle, type LucideIcon } from "lucide-react";

// ─── Ambient orbs ─────────────────────────────────────────────────────────────
function AmbientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <motion.div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,90,0,0.07) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(193,18,31,0.06) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(212,165,116,0.03) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
    </div>
  );
}

// ─── Noise overlay ────────────────────────────────────────────────────────────
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

// ─── Animated field ───────────────────────────────────────────────────────────
function FormField({
  label,
  icon: Icon,
  children,
  index,
}: {
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
  index: number;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 + index * 0.08, ease: [0.76, 0, 0.24, 1] }}
      className="group relative"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {/* Label row */}
      <div className="flex items-center gap-2 mb-3">
        <Icon
          size={10}
          className="transition-colors duration-300"
          style={{ color: focused ? "#FF5A00" : "rgba(248,248,248,0.25)" }}
        />
        <span
          className="text-[9px] tracking-[0.45em] uppercase font-mono transition-colors duration-300"
          style={{ color: focused ? "rgba(255,90,0,0.8)" : "rgba(248,248,248,0.3)" }}
        >
          {label}
        </span>
      </div>

      {/* Input wrapper */}
      <div className="relative">
        {children}
        {/* Animated bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
        <motion.div
          className="absolute bottom-0 left-0 h-px bg-[#FF5A00]"
          animate={{ width: focused ? "100%" : "0%" }}
          transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
        />
      </div>
    </motion.div>
  );
}

const baseInput =
  "w-full bg-transparent py-3 text-[#F8F8F8] font-mono text-sm focus:outline-none placeholder:text-white/15 transition-colors duration-300";

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.76, 0, 0.24, 1] }}
      className="relative p-5 overflow-hidden group"
      style={{ border: "1px solid rgba(248,248,248,0.06)" }}
    >
      <motion.div
        className="absolute inset-0 bg-white/[0.02]"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <p
        className="text-3xl font-bold tracking-tighter mb-1"
        style={{ fontFamily: "'Playfair Display', serif", color: "#FF5A00" }}
      >
        {value}
      </p>
      <p className="text-[9px] tracking-[0.35em] uppercase font-mono text-white/30">{label}</p>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function ReservationsPage() {
  const [submitted, setSubmitted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [2, -2]);
  const rotateY = useTransform(mouseX, [-300, 300], [-2, 2]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div
      className="relative min-h-screen text-[#F8F8F8] overflow-hidden"
      style={{ background: "#0B0B0B" }}
    >
      <AmbientOrbs />

      {/* Noise */}
      <div
        className="fixed inset-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: NOISE_SVG, backgroundSize: "128px", zIndex: 1 }}
      />

      {/* Fine grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: "linear-gradient(rgba(248,248,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(248,248,248,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          zIndex: 1,
        }}
      />

      <div className="relative pt-36 pb-24 px-8 max-w-7xl mx-auto" style={{ zIndex: 2 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28 items-start">

          {/* ── Left column ── */}
          <div>
            {/* Folio tag */}
            <motion.div
              className="flex items-center gap-4 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[9px] font-mono tracking-[0.6em] text-white/20 uppercase">Folio IV</span>
              <div className="h-px flex-1 max-w-[60px]" style={{ background: "rgba(255,90,0,0.4)" }} />
              <span className="text-[9px] font-mono tracking-[0.5em] text-[#FF5A00]/70 uppercase">Tu Mesa</span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              className="leading-[0.88] tracking-tight mb-10"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3.5rem, 7vw, 7rem)" }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
            >
              <span className="block font-bold text-[#F8F8F8]">Reservá</span>
              <span className="block font-light italic" style={{ color: "rgba(248,248,248,0.25)" }}>
                una velada.
              </span>
            </motion.h1>

            {/* Separator */}
            <motion.div
              className="flex items-center gap-4 mb-10"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ transformOrigin: "left" }}
            >
              <div className="h-px w-16 bg-white/15" />
              <div className="w-1 h-1 rounded-full" style={{ background: "#FF5A00" }} />
              <div className="h-px flex-1 bg-white/5" />
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-base leading-relaxed font-light mb-16 max-w-sm"
              style={{ fontFamily: "'Inter', sans-serif", color: "rgba(248,248,248,0.45)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
            >
              Nuestra capacidad es limitada a{" "}
              <span className="text-[#D4A574] font-medium">40 comensales</span> por noche para
              garantizar una atención exquisita. Las reservas se abren con{" "}
              <span className="text-white/70">30 días de anticipación</span>.
            </motion.p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-14">
              <StatCard value="40" label="Comensales máx." delay={0.45} />
              <StatCard value="4" label="Turnos / noche" delay={0.52} />
              <StatCard value="30d" label="Anticipación" delay={0.59} />
            </div>

            {/* Info strip */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.65 }}
            >
              {[
                { label: "Horarios", value: "Martes a Sábado · 19:00 – 01:00" },
                { label: "Teléfono", value: "+54 9 11 1234 5678" },
                { label: "Email", value: "reservas@thefoodstore.com" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-3 border-b"
                  style={{ borderColor: "rgba(248,248,248,0.06)" }}
                >
                  <span className="text-[10px] tracking-[0.4em] font-mono text-white/25 uppercase">
                    {item.label}
                  </span>
                  <span className="text-sm font-mono text-white/55">{item.value}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right column · Form ── */}
          <motion.div
            style={{ rotateX, rotateY, perspective: 1000 }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              mouseX.set(e.clientX - rect.left - rect.width / 2);
              mouseY.set(e.clientY - rect.top - rect.height / 2);
            }}
            onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
          >
            <motion.div
              className="relative p-10 md:p-14 overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.018)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(24px)",
              }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t border-l" style={{ borderColor: "rgba(255,90,0,0.25)" }} />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r" style={{ borderColor: "rgba(255,90,0,0.15)" }} />

              {/* Ambient glow inside card */}
              <div
                className="absolute -top-20 right-0 w-80 h-80 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(255,90,0,0.09) 0%, transparent 65%)" }}
              />

              {/* Form header */}
              <motion.div
                className="flex items-center justify-between mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div>
                  <p className="text-[9px] tracking-[0.5em] uppercase font-mono text-white/25 mb-1">
                    Formulario de
                  </p>
                  <p
                    className="text-xl font-bold tracking-tight"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Reserva
                  </p>
                </div>
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  style={{ border: "1px solid rgba(255,90,0,0.3)" }}
                >
                  <Calendar size={14} style={{ color: "#FF5A00" }} />
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    className="flex flex-col items-center justify-center py-20 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    >
                      <CheckCircle size={48} style={{ color: "#FF5A00" }} className="mb-6 mx-auto" />
                    </motion.div>
                    <p
                      className="text-2xl font-bold mb-3"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Solicitud Enviada
                    </p>
                    <p className="text-sm font-mono text-white/40 tracking-wider">
                      Te confirmamos en las próximas 24hs
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    className="space-y-7"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                      <FormField label="Nombre completo" icon={FileText} index={0}>
                        <input
                          type="text"
                          placeholder="Ana García"
                          className={baseInput}
                        />
                      </FormField>
                      <FormField label="Comensales" icon={Users} index={1}>
                        <select className={`${baseInput} bg-transparent appearance-none cursor-pointer`}>
                          <option style={{ background: "#0B0B0B" }}>2 Personas</option>
                          <option style={{ background: "#0B0B0B" }}>3 Personas</option>
                          <option style={{ background: "#0B0B0B" }}>4 Personas</option>
                          <option style={{ background: "#0B0B0B" }}>5+ (Requiere seña)</option>
                        </select>
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                      <FormField label="Fecha" icon={Calendar} index={2}>
                        <input
                          type="date"
                          className={`${baseInput} [color-scheme:dark]`}
                        />
                      </FormField>
                      <FormField label="Horario" icon={Clock} index={3}>
                        <select className={`${baseInput} bg-transparent appearance-none cursor-pointer`}>
                          <option style={{ background: "#0B0B0B" }}>19:00</option>
                          <option style={{ background: "#0B0B0B" }}>20:00</option>
                          <option style={{ background: "#0B0B0B" }}>21:00</option>
                          <option style={{ background: "#0B0B0B" }}>22:00</option>
                        </select>
                      </FormField>
                    </div>

                    <FormField label="Notas / Alergias" icon={FileText} index={4}>
                      <textarea
                        rows={2}
                        placeholder="Opcional..."
                        className={`${baseInput} resize-none`}
                      />
                    </FormField>

                    {/* CTA Button */}
                    <motion.button
                      type="submit"
                      className="relative w-full overflow-hidden py-4 font-mono text-xs tracking-[0.35em] uppercase font-bold mt-2 flex items-center justify-center gap-3 group"
                      style={{ border: "1px solid rgba(255,90,0,0.6)", color: "#F8F8F8" }}
                      whileHover="hover"
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Background fill on hover */}
                      <motion.span
                        className="absolute inset-0"
                        style={{ background: "#FF5A00", transformOrigin: "left" }}
                        variants={{ hover: { scaleX: 1 }, initial: { scaleX: 0 } }}
                        initial="initial"
                        transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                      />
                      <span className="relative z-10">Solicitar Reserva</span>
                      <motion.span
                        className="relative z-10"
                        variants={{ hover: { x: 4 } }}
                        initial={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowRight size={14} />
                      </motion.span>
                    </motion.button>

                    <p className="text-[9px] tracking-widest font-mono text-white/20 text-center uppercase">
                      Confirmación en menos de 24 horas
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Vertical folio marker */}
      <div
        className="fixed right-8 top-1/2 -translate-y-1/2 text-[9px] tracking-[0.6em] font-mono pointer-events-none select-none"
        style={{ writingMode: "vertical-rl", color: "rgba(248,248,248,0.07)", zIndex: 2 }}
      >
        The Food Store · Reservas · 2026
      </div>
    </div>
  );
}
