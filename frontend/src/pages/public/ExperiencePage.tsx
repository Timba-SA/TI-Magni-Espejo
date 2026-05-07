import { motion, useScroll, useTransform, useSpring, useMotionValue } from "motion/react";
import { useRef, useEffect } from "react";

const SERIF = "'Playfair Display', 'Cormorant Garamond', serif";
const MONO = "'Space Mono', monospace";
const ORANGE = "#FF5A00";
const GOLD = "#D4A574";

// ─── Grain overlay ────────────────────────────────────────────────────────────
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

// ─── Ornamental rule ──────────────────────────────────────────────────────────
function OrnRule({ delay = 0, color = ORANGE }: { delay?: number; color?: string }) {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay }}
    >
      <motion.div
        style={{ height: 1, flex: 1, background: `linear-gradient(to right, transparent, ${color}30, transparent)` }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, delay, ease: [0.76, 0, 0.24, 1] }}
      />
      <span style={{ color, opacity: 0.5, fontSize: 8 }}>✦</span>
      <motion.div
        style={{ height: 1, flex: 1, background: `linear-gradient(to left, transparent, ${color}30, transparent)` }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, delay: delay + 0.1, ease: [0.76, 0, 0.24, 1] }}
      />
    </motion.div>
  );
}

// ─── Chapter marker ───────────────────────────────────────────────────────────
function ChapterMark({ index, label, delay = 0 }: { index: string; label: string; delay?: number }) {
  return (
    <motion.div
      className="flex items-center gap-4"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay }}
    >
      <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.4em", color: `${ORANGE}70`, textTransform: "uppercase" }}>
        {index}
      </span>
      <div style={{ width: 32, height: 1, background: `${ORANGE}40` }} />
      <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.35em", color: `${GOLD}80`, textTransform: "uppercase" }}>
        {label}
      </span>
    </motion.div>
  );
}

// ─── Parallax image wrapper ───────────────────────────────────────────────────
function ParallaxImage({ src, alt, strength = 80 }: { src: string; alt: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-strength / 2, strength / 2]);

  return (
    <div ref={ref} className="relative overflow-hidden w-full h-full">
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale: 1.15 }}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

// ─── Floating stat ────────────────────────────────────────────────────────────
function Stat({ number, label, delay = 0 }: { number: string; label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay }}
      className="text-center"
    >
      <div style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 5vw, 4.5rem)", color: ORANGE, fontWeight: 300, lineHeight: 1 }}>
        {number}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.4em", color: `${GOLD}70`, textTransform: "uppercase", marginTop: 8 }}>
        {label}
      </div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function ExperiencePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 20, damping: 35 });
  const springY = useSpring(mouseY, { stiffness: 20, damping: 35 });
  const orbX = useTransform(springX, [-0.5, 0.5], ["-5%", "5%"]);
  const orbY = useTransform(springY, [-0.5, 0.5], ["-5%", "5%"]);

  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "20%"]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, [mouseX, mouseY]);

  return (
    <div className="bg-[#080808] text-[#F8F8F8] overflow-hidden">

      {/* ── Global grain ── */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.04]"
        style={{ backgroundImage: GRAIN_SVG, backgroundSize: "160px" }} />

      {/* ══════════════════════════════════════════════════════
          HERO — Pantalla completa, parallax, texto gigante
      ══════════════════════════════════════════════════════ */}
      <div ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Parallax bg image */}
        <motion.div className="absolute inset-0" style={{ y: heroY, scale: 1.1 }}>
          <img src="/images/experience/interior.png" alt="Interior" className="w-full h-full object-cover" />
        </motion.div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-[#080808]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

        {/* Ambient glow — mouse reactive */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ x: orbX, y: orbY }}>
          <div style={{
            position: "absolute", left: "20%", top: "30%",
            width: "60vw", height: "60vh",
            background: `radial-gradient(ellipse, ${ORANGE}18 0%, transparent 65%)`,
            filter: "blur(80px)",
          }} />
        </motion.div>

        {/* Corner ornaments */}
        {(["tl","tr","bl","br"] as const).map(pos => (
          <motion.svg key={pos} viewBox="0 0 50 50" width={50} height={50}
            className="absolute pointer-events-none"
            style={{
              [pos.endsWith("r") ? "right" : "left"]: "2rem",
              [pos.startsWith("b") ? "bottom" : "top"]: "2rem",
              transform: `scale(${pos.endsWith("r") ? -1 : 1}, ${pos.startsWith("b") ? -1 : 1})`,
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 1 }}
          >
            <line x1="4" y1="4" x2="28" y2="4" stroke={ORANGE} strokeWidth="0.8" opacity="0.35" />
            <line x1="4" y1="4" x2="4" y2="28" stroke={ORANGE} strokeWidth="0.8" opacity="0.35" />
            <polygon points="4,4 7,1 10,4 7,7" fill={ORANGE} opacity="0.4" />
          </motion.svg>
        ))}

        {/* Hero text */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 h-full flex flex-col justify-end pb-24 px-10 md:px-20"
        >
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}>
            <ChapterMark index="001" label="La Experiencia" />
          </motion.div>

          <div style={{ overflow: "hidden", marginTop: "1.5rem" }}>
            <motion.div
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.1, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
              style={{ fontFamily: SERIF, fontSize: "clamp(3.5rem, 10vw, 11rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 0.88, color: "#F8F8F8" }}
            >
              Una cena
            </motion.div>
          </div>
          <div style={{ overflow: "hidden" }}>
            <motion.div
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.1, delay: 0.7, ease: [0.76, 0, 0.24, 1] }}
              style={{ fontFamily: SERIF, fontSize: "clamp(3.5rem, 10vw, 11rem)", fontWeight: 300, fontStyle: "italic", letterSpacing: "-0.02em", lineHeight: 0.88, color: ORANGE }}
            >
              inolvidable.
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(248,248,248,0.45)", maxWidth: 420, marginTop: "2rem", lineHeight: 1.7 }}
          >
            Más que un restaurante. Un ritual curado con obsesión por cada detalle sensorial.
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            className="flex items-center gap-3 mt-12"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.5 }}
          >
            <motion.div
              style={{ width: 1, height: 60, background: `linear-gradient(to bottom, ${ORANGE}, transparent)` }}
              animate={{ scaleY: [1, 0.4, 1], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.4em", color: `${ORANGE}60`, textTransform: "uppercase", writingMode: "vertical-rl" }}>
              Descubrí
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECCIÓN 1 — El Espacio (texto + imagen grande)
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-40 px-10 md:px-20">
        {/* Ghost number */}
        <div className="absolute right-0 top-16 pointer-events-none select-none" style={{
          fontFamily: SERIF, fontSize: "clamp(8rem, 20vw, 22rem)", fontWeight: 700,
          color: "transparent", WebkitTextStroke: `1px rgba(212,165,116,0.05)`, lineHeight: 1
        }}>01</div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center max-w-7xl mx-auto">
          {/* Text col */}
          <div className="md:col-span-5 space-y-8">
            <ChapterMark index="01" label="El Espacio" delay={0.1} />
            <OrnRule delay={0.2} />
            <motion.h2
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.15 }}
              style={{ fontFamily: SERIF, fontSize: "clamp(2.2rem, 4vw, 3.8rem)", fontWeight: 700, lineHeight: 1.1, color: "#F8F8F8" }}
            >
              Donde la luz se{" "}
              <span style={{ fontStyle: "italic", fontWeight: 300, color: GOLD }}>
                convierte en ambientación.
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(248,248,248,0.5)", lineHeight: 1.9 }}
            >
              Cada rincón fue diseñado para estimular los sentidos antes de que el primer plato llegue. Las mesas de roble carbonizado, la iluminación ambarina y los materiales crudos crean una atmósfera que envuelve sin abrumar.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(248,248,248,0.35)", lineHeight: 1.9 }}
            >
              La música se cura diariamente. El aroma, también. Todo conspira para que el acto de comer vuelva a ser un ritual.
            </motion.p>

            {/* Stats row */}
            <motion.div
              className="grid grid-cols-3 gap-4 pt-6"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }}
            >
              <OrnRule delay={0.5} />
              <OrnRule delay={0.5} />
              <OrnRule delay={0.5} />
            </motion.div>
            <div className="grid grid-cols-3 gap-4">
              <Stat number="12" label="Mesas" delay={0.6} />
              <Stat number="80" label="Cubiertos" delay={0.7} />
              <Stat number="'08" label="Desde" delay={0.8} />
            </div>
          </div>

          {/* Image col */}
          <motion.div
            className="md:col-span-7 relative"
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 1.1, delay: 0.2 }}
          >
            {/* Decorative frame */}
            <div className="absolute -top-4 -right-4 bottom-4 left-4 border border-white/5 pointer-events-none z-10" />
            <div className="aspect-[4/3] overflow-hidden bg-[#111]">
              <ParallaxImage src="/images/experience/table.png" alt="Mesa preparada" strength={60} />
            </div>
            {/* Caption */}
            <motion.div
              className="absolute -bottom-6 left-0 flex items-center gap-3"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div style={{ width: 20, height: 1, background: `${ORANGE}60` }} />
              <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.35em", color: `${ORANGE}50`, textTransform: "uppercase" }}>
                Salón principal — Palermo
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECCIÓN 2 — La Cocina (imagen grande + texto)
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">
        {/* Full-bleed image */}
        <div className="relative h-[75vh] w-full overflow-hidden">
          <ParallaxImage src="/images/experience/chef.png" alt="Chef plating" strength={100} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-transparent to-[#080808]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/50 via-transparent to-[#080808]" />

          {/* Overlay text */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 1 }}
              >
                <ChapterMark index="02" label="La Cocina" delay={0.1} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }}
                style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 7vw, 8rem)", fontWeight: 700, lineHeight: 0.9, marginTop: "1.5rem" }}
              >
                La precisión de
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 1, delay: 0.35 }}
                style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 7vw, 8rem)", fontWeight: 300, fontStyle: "italic", lineHeight: 0.9, color: ORANGE }}
              >
                un laboratorio.
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }}
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(248,248,248,0.45)", maxWidth: 480, margin: "1.5rem auto 0", lineHeight: 1.8 }}
              >
                Nuestra cocina abierta es un escenario donde la técnica se encuentra con la pasión. Cada movimiento está coreografiado, cada ingrediente tratado con respeto absoluto.
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECCIÓN 3 — Galería asimétrica (Terraza + Cava)
      ══════════════════════════════════════════════════════ */}
      <section className="py-32 px-10 md:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

            {/* Card grande — Terraza */}
            <motion.div
              className="md:col-span-8 relative overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 1 }}
            >
              <div className="aspect-[16/10] overflow-hidden bg-[#111]">
                <ParallaxImage src="/images/experience/terrace.png" alt="Terraza" strength={50} />
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-700" />
              {/* Label */}
              <div className="absolute inset-x-0 bottom-0 p-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <p style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.4em", color: `${ORANGE}90`, textTransform: "uppercase", marginBottom: 6 }}>
                    03 — The View
                  </p>
                  <h3 style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3vw, 3rem)", fontWeight: 700, color: "#F8F8F8", lineHeight: 1.1 }}>
                    Bajo las estrellas,<br />
                    <span style={{ fontWeight: 300, fontStyle: "italic", color: `rgba(248,248,248,0.55)` }}>sobre la ciudad.</span>
                  </h3>
                </motion.div>
              </div>
              {/* Corner mark */}
              <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-white/20 group-hover:border-orange-500/60 transition-colors duration-500" />
            </motion.div>

            {/* Card chica — Cava */}
            <motion.div
              className="md:col-span-4 relative overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }}
            >
              <div className="aspect-[3/4] md:aspect-auto md:h-full overflow-hidden bg-[#111]">
                <ParallaxImage src="/images/experience/cellar.png" alt="La cava" strength={50} />
              </div>
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/15 transition-colors duration-700" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <p style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.4em", color: `${GOLD}90`, textTransform: "uppercase", marginBottom: 6 }}>
                    04 — The Cellar
                  </p>
                  <h3 style={{ fontFamily: SERIF, fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", fontWeight: 700, color: "#F8F8F8", lineHeight: 1.1 }}>
                    Tesoro<br />
                    <span style={{ fontWeight: 300, fontStyle: "italic", color: GOLD }}>líquido.</span>
                  </h3>
                </motion.div>
              </div>
              <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-white/20 group-hover:border-amber-400/60 transition-colors duration-500" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECCIÓN 4 — Cierre editorial
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-40 px-10 md:px-20 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 100%, ${ORANGE}10 0%, transparent 70%)`
        }} />

        <div className="max-w-4xl mx-auto text-center">
          <OrnRule delay={0.1} />
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }}
            className="my-12"
          >
            <p style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.5em", color: `${ORANGE}70`, textTransform: "uppercase", marginBottom: "1.5rem" }}>
              La Invitación
            </p>
            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 6vw, 6rem)", fontWeight: 700, lineHeight: 1, color: "#F8F8F8" }}>
              Reservá tu{" "}
              <span style={{ fontWeight: 300, fontStyle: "italic", color: ORANGE }}>experiencia.</span>
            </h2>
          </motion.div>

          <motion.a
            href="/reservas"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-5 relative overflow-hidden group"
            style={{
              border: `1px solid ${ORANGE}50`,
              padding: "1.25rem 3rem",
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#F8F8F8",
              textDecoration: "none",
            }}
          >
            <motion.div
              className="absolute inset-0 origin-left"
              style={{ background: ORANGE }}
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
            />
            <span className="relative z-10">Hacer una reserva</span>
            <span className="relative z-10" style={{ color: ORANGE }}>→</span>
          </motion.a>
          <OrnRule delay={0.6} />
        </div>
      </section>
    </div>
  );
}
