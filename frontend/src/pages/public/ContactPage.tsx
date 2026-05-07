import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { MapPin, Clock, Mail, Phone, ArrowRight, CheckCircle, MessageSquare } from "lucide-react";

// ─── Noise overlay ────────────────────────────────────────────────────────────
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

// ─── Ambient orbs ─────────────────────────────────────────────────────────────
function AmbientOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <motion.div
        className="absolute -top-48 -right-48 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(193,18,31,0.07) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,90,0,0.05) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
    </div>
  );
}

// ─── Info block ───────────────────────────────────────────────────────────────
function InfoBlock({
  icon: Icon,
  title,
  lines,
  accent,
  delay,
}: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  title: string;
  lines: string[];
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      className="flex gap-5 items-start py-6 border-b group"
      style={{ borderColor: "rgba(248,248,248,0.07)" }}
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Icon box */}
      <div
        className="mt-0.5 w-9 h-9 flex-shrink-0 flex items-center justify-center transition-colors duration-300"
        style={{ border: `1px solid ${accent}30`, background: `${accent}08` }}
      >
        <Icon size={14} style={{ color: accent }} />
      </div>

      <div>
        <p className="text-[9px] tracking-[0.45em] font-mono uppercase mb-2" style={{ color: `${accent}80` }}>
          {title}
        </p>
        {lines.map((line, i) => (
          <p key={i} className="text-sm font-mono leading-relaxed" style={{ color: "rgba(248,248,248,0.55)" }}>
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Animated form field ──────────────────────────────────────────────────────
function FormField({
  label,
  children,
  index,
  accent = "#C1121F",
}: {
  label: string;
  children: React.ReactNode;
  index: number;
  accent?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25 + index * 0.07, ease: [0.76, 0, 0.24, 1] }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <span
        className="block text-[9px] tracking-[0.45em] uppercase font-mono mb-3 transition-colors duration-300"
        style={{ color: focused ? `${accent}90` : "rgba(248,248,248,0.25)" }}
      >
        {label}
      </span>
      <div className="relative">
        {children}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
        <motion.div
          className="absolute bottom-0 left-0 h-px"
          style={{ background: accent }}
          animate={{ width: focused ? "100%" : "0%" }}
          transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
        />
      </div>
    </motion.div>
  );
}

const baseInput =
  "w-full bg-transparent py-3 text-[#F8F8F8] font-mono text-sm focus:outline-none placeholder:text-white/15 transition-colors duration-300";

// ─── Page ─────────────────────────────────────────────────────────────────────
export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

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
        className="fixed inset-0 pointer-events-none opacity-[0.012]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(248,248,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(248,248,248,0.5) 1px, transparent 1px)",
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
              <span className="text-[9px] font-mono tracking-[0.6em] text-white/20 uppercase">Folio V</span>
              <div className="h-px flex-1 max-w-[60px]" style={{ background: "rgba(193,18,31,0.4)" }} />
              <span className="text-[9px] font-mono tracking-[0.5em] uppercase" style={{ color: "rgba(193,18,31,0.7)" }}>
                Diálogo
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              className="leading-[0.88] tracking-tight mb-10"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(3.5rem, 7vw, 7rem)" }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
            >
              <span className="block font-bold text-[#F8F8F8]">Hablemos</span>
              <span className="block font-light italic" style={{ color: "rgba(248,248,248,0.22)" }}>
                de comida.
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
              <div className="w-1 h-1 rounded-full" style={{ background: "#C1121F" }} />
              <div className="h-px flex-1 bg-white/5" />
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-base leading-relaxed font-light mb-14 max-w-sm"
              style={{ fontFamily: "'Inter', sans-serif", color: "rgba(248,248,248,0.4)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
            >
              Cada conversación es el inicio de una experiencia. Respondemos en{" "}
              <span className="text-white/65">menos de 48 horas</span> a cada consulta.
            </motion.p>

            {/* Info blocks */}
            <div>
              <InfoBlock
                icon={MapPin}
                title="Ubicación"
                lines={["Palermo Soho, Buenos Aires", "Argentina"]}
                accent="#C1121F"
                delay={0.4}
              />
              <InfoBlock
                icon={Clock}
                title="Horarios"
                lines={["Mar – Sáb · 19:00 → 01:00", "Dom – Lun · Cerrado"]}
                accent="#D4A574"
                delay={0.48}
              />
              <InfoBlock
                icon={Mail}
                title="Email"
                lines={["hola@thefoodstore.com"]}
                accent="#C1121F"
                delay={0.56}
              />
              <InfoBlock
                icon={Phone}
                title="Teléfono"
                lines={["+54 9 11 1234 5678"]}
                accent="#D4A574"
                delay={0.64}
              />
            </div>
          </div>

          {/* ── Right column · Form ── */}
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
            <div className="absolute top-0 left-0 w-12 h-12 border-t border-l" style={{ borderColor: "rgba(193,18,31,0.25)" }} />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r" style={{ borderColor: "rgba(193,18,31,0.15)" }} />

            {/* Ambient inside card */}
            <div
              className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(193,18,31,0.1) 0%, transparent 65%)" }}
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
                  Contacto
                </p>
              </div>
              <div
                className="w-8 h-8 flex items-center justify-center"
                style={{ border: "1px solid rgba(193,18,31,0.35)" }}
              >
                <MessageSquare size={14} style={{ color: "#C1121F" }} />
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
                    <CheckCircle size={48} style={{ color: "#C1121F" }} className="mb-6 mx-auto" />
                  </motion.div>
                  <p
                    className="text-2xl font-bold mb-3"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Mensaje Enviado
                  </p>
                  <p className="text-sm font-mono text-white/40 tracking-wider">
                    Te respondemos en menos de 48hs
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
                  <FormField label="Nombre" index={0} accent="#C1121F">
                    <input type="text" placeholder="Carlos Gardel" className={baseInput} />
                  </FormField>

                  <FormField label="Email" index={1} accent="#C1121F">
                    <input type="email" placeholder="hola@ejemplo.com" className={baseInput} />
                  </FormField>

                  <FormField label="Asunto" index={2} accent="#C1121F">
                    <select className={`${baseInput} appearance-none cursor-pointer`} style={{ background: "transparent" }}>
                      <option style={{ background: "#0B0B0B" }}>Consulta General</option>
                      <option style={{ background: "#0B0B0B" }}>Eventos Privados</option>
                      <option style={{ background: "#0B0B0B" }}>Prensa</option>
                      <option style={{ background: "#0B0B0B" }}>Oportunidades Laborales</option>
                    </select>
                  </FormField>

                  <FormField label="Mensaje" index={3} accent="#C1121F">
                    <textarea
                      rows={4}
                      placeholder="Escribí acá tu mensaje..."
                      className={`${baseInput} resize-none`}
                    />
                  </FormField>

                  {/* CTA Button */}
                  <motion.button
                    type="submit"
                    className="relative w-full overflow-hidden py-4 font-mono text-xs tracking-[0.35em] uppercase font-bold mt-2 flex items-center justify-center gap-3"
                    style={{ border: "1px solid rgba(193,18,31,0.55)", color: "#F8F8F8" }}
                    whileHover="hover"
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.span
                      className="absolute inset-0"
                      style={{ background: "#C1121F", transformOrigin: "left" }}
                      variants={{ hover: { scaleX: 1 }, initial: { scaleX: 0 } }}
                      initial="initial"
                      transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
                    />
                    <span className="relative z-10">Enviar Mensaje</span>
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
                    Respondemos en menos de 48 horas
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </div>

      {/* Vertical folio marker */}
      <div
        className="fixed right-8 top-1/2 -translate-y-1/2 text-[9px] tracking-[0.6em] font-mono pointer-events-none select-none"
        style={{ writingMode: "vertical-rl", color: "rgba(248,248,248,0.07)", zIndex: 2 }}
      >
        The Food Store · Contacto · 2026
      </div>
    </div>
  );
}
