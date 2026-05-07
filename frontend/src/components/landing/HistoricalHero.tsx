import { motion, useScroll, useTransform, useMotionValue, useSpring } from "motion/react";
import { useRef, useEffect } from "react";

// ─── Paleta histórica ────────────────────────────────────────────────────────
const C = {
  parchment: "#1B120A",
  ivory: "#E8D8B8",
  bone: "#D7C49E",
  gold: "#C69A3A",
  goldDim: "#A87B2D",
  lacre: "#8B1E16",
  sepia: "rgba(198,154,58,",    // helper prefix
} as const;

const CORMORANT = "'Cormorant Garamond', 'Playfair Display', serif";
const MONO = "'Space Mono', monospace";
const ORANGE = "#FF5A00";

// ─── Sello circular rotatorio ─────────────────────────────────────────────────
function ManuscriptSeal() {
  const TEXT = "ARCHIVUM GASTRONOMICUM · ORDO SAPORIS · ANNO MCCCXXVI · REFOUND MMXXVI · ";
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ right: "7%", top: "50%", translateY: "-50%" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.5, delay: 1 }}
    >
      <motion.svg
        viewBox="0 0 320 320"
        style={{ width: 320, height: 320 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <path id="sealRing" d="M 160,160 m -120,0 a 120,120 0 1,1 240,0 a 120,120 0 1,1 -240,0" />
        </defs>
        <circle cx="160" cy="160" r="120" fill="none" stroke={C.gold} strokeWidth="0.6" opacity="0.22" />
        <circle cx="160" cy="160" r="110" fill="none" stroke={C.gold} strokeWidth="0.3" opacity="0.12" />
        <circle cx="160" cy="160" r="6" fill="none" stroke={C.gold} strokeWidth="0.6" opacity="0.25" />
        <text style={{ fontSize: 11, fontFamily: CORMORANT, letterSpacing: "2.5px" }}>
          <textPath href="#sealRing" fill={C.gold} opacity="0.28">{TEXT}</textPath>
        </text>
        {/* Cross at center */}
        <line x1="148" y1="160" x2="172" y2="160" stroke={C.gold} strokeWidth="0.7" opacity="0.2" />
        <line x1="160" y1="148" x2="160" y2="172" stroke={C.gold} strokeWidth="0.7" opacity="0.2" />
        {/* Small diamonds at cardinal points */}
        {[0, 90, 180, 270].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const cx = 160 + 120 * Math.cos(rad - Math.PI / 2);
          const cy = 160 + 120 * Math.sin(rad - Math.PI / 2);
          return (
            <polygon
              key={angle}
              points={`${cx},${cy - 4} ${cx + 3},${cy} ${cx},${cy + 4} ${cx - 3},${cy}`}
              fill={C.gold}
              opacity="0.3"
            />
          );
        })}
      </motion.svg>
    </motion.div>
  );
}

// ─── Ornamento de esquina ─────────────────────────────────────────────────────
function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const isRight = pos.endsWith("r");
  const isBottom = pos.startsWith("b");
  const sx = isRight ? -1 : 1;
  const sy = isBottom ? -1 : 1;

  return (
    <motion.svg
      viewBox="0 0 60 60"
      width="60"
      height="60"
      className="absolute pointer-events-none"
      style={{
        [isRight ? "right" : "left"]: "2rem",
        [isBottom ? "bottom" : "top"]: "2rem",
        transform: `scale(${sx}, ${sy})`,
        transformOrigin: isRight ? "right center" : "left center",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 1.2 }}
    >
      <line x1="4" y1="4" x2="30" y2="4" stroke={ORANGE} strokeWidth="0.8" opacity="0.3" />
      <line x1="4" y1="4" x2="4" y2="30" stroke={ORANGE} strokeWidth="0.8" opacity="0.3" />
      <line x1="8" y1="8" x2="20" y2="8" stroke={ORANGE} strokeWidth="0.4" opacity="0.18" />
      <line x1="8" y1="8" x2="8" y2="20" stroke={ORANGE} strokeWidth="0.4" opacity="0.18" />
      <polygon points="4,4 7,1 10,4 7,7" fill={ORANGE} opacity="0.35" />
    </motion.svg>
  );
}

// ─── Ticker inferior histórico ────────────────────────────────────────────────
const BOTTOM_ITEMS = ["FOLIO", "FUEGO", "SAL", "PAN", "VINO", "OFICIO", "SABOR", "RITUAL", "ARCHIVO", "IGNIS"];

function BottomTicker() {
  const items = [...BOTTOM_ITEMS, ...BOTTOM_ITEMS];
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 overflow-hidden py-3"
      style={{ borderTop: `1px solid rgba(255,90,0,0.12)` }}
    >
      <motion.div
        className="flex gap-16 whitespace-nowrap"
        animate={{ x: [0, "-50%"] }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-16 flex-shrink-0">
            <span style={{ fontSize: "10px", letterSpacing: "0.45em", color: `rgba(255,90,0,0.38)`, fontFamily: CORMORANT, fontWeight: 600, textTransform: "uppercase" }}>
              {item}
            </span>
            <span style={{ color: ORANGE, fontSize: "7px", opacity: 0.35 }}>✦</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Ghost word de fondo ──────────────────────────────────────────────────────
function GhostWord({ text, top, left, size, rotate, delay, springX, springY, mx, my }: {
  text: string; top: string; left: string; size: string;
  rotate: number; delay: number;
  springX: ReturnType<typeof useSpring>;
  springY: ReturnType<typeof useSpring>;
  mx: number; my: number;
}) {
  const tx = useTransform(springX, [-0.5, 0.5], [`${-mx}%`, `${mx}%`]);
  const ty = useTransform(springY, [-0.5, 0.5], [`${-my}%`, `${my}%`]);
  return (
    <motion.div
      className="absolute select-none pointer-events-none"
      style={{ top, left, x: tx, y: ty, rotate }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, delay }}
    >
      <span style={{
        fontSize: size,
        fontFamily: CORMORANT,
        fontWeight: 700,
        color: "transparent",
        WebkitTextStroke: `1px rgba(198,154,58,0.07)`,
        letterSpacing: "-0.02em",
        lineHeight: 1,
        display: "block",
      }}>
        {text}
      </span>
    </motion.div>
  );
}

// ─── Línea ornamental ─────────────────────────────────────────────────────────
function OrnamentalRule({ delay }: { delay: number }) {
  return (
    <motion.div
      className="flex items-center gap-3 my-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay }}
    >
      <motion.div
        style={{ height: 1, background: `linear-gradient(to right, transparent, rgba(255,90,0,0.2), transparent)`, flex: 1 }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay, ease: [0.76, 0, 0.24, 1] }}
      />
      <span style={{ color: ORANGE, opacity: 0.45, fontSize: "8px" }}>✦</span>
      <motion.div
        style={{ height: 1, background: `linear-gradient(to left, transparent, rgba(255,90,0,0.2), transparent)`, flex: 1 }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: delay + 0.1, ease: [0.76, 0, 0.24, 1] }}
      />
    </motion.div>
  );
}

// ─── Animación "tinta sobre pergamino" ───────────────────────────────────────
const inkReveal = (delay: number) => ({
  initial: { opacity: 0, y: 28, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 1.2, delay, ease: [0.76, 0, 0.24, 1] as [number, number, number, number] },
});

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export function HistoricalHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const yScroll = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  const springX = useSpring(mouseX, { stiffness: 18, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 18, damping: 30 });
  const orbX = useTransform(springX, [-0.5, 0.5], ["-6%", "6%"]);
  const orbY = useTransform(springY, [-0.5, 0.5], ["-6%", "6%"]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, [mouseX, mouseY]);

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden pt-7" style={{ background: C.parchment }}>

      {/* ── Grain / pergamino ──────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px",
          opacity: 0.08,
          mixBlendMode: "overlay",
        }}
      />

      {/* ── Warm amber glow (lámpara antigua) ─────────────────────── */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-[0]"
        style={{ x: orbX, y: orbY }}
      >
        <div style={{
          position: "absolute", left: "5%", top: "15%",
          width: "65vw", height: "65vw",
          background: "radial-gradient(circle, rgba(198,130,40,0.14) 0%, rgba(139,30,22,0.06) 45%, transparent 70%)",
          filter: "blur(60px)",
        }} />
        <div style={{
          position: "absolute", right: "-5%", bottom: "0%",
          width: "40vw", height: "40vw",
          background: "radial-gradient(circle, rgba(74,15,15,0.2) 0%, transparent 65%)",
          filter: "blur(80px)",
        }} />
      </motion.div>

      {/* ── Viñeta de bordes oscuros ───────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-[2]" style={{
        background: "radial-gradient(ellipse 80% 80% at 40% 50%, transparent 40%, rgba(9,6,4,0.65) 100%)",
      }} />

      {/* ── Líneas de pauta (manuscrito) ──────────────────────────── */}
      {[25, 50, 75].map((pct) => (
        <div key={pct} className="absolute left-0 right-0 pointer-events-none z-[1]" style={{
          top: `${pct}%`,
          height: "1px",
          background: `rgba(198,154,58,0.04)`,
        }} />
      ))}

      {/* ── Palabras fantasma de fondo ────────────────────────────── */}
      <GhostWord text="FOLIO" top="-5%" left="-1%" size="38vw" rotate={-3} delay={0.8} springX={springX} springY={springY} mx={1.5} my={1} />
      <GhostWord text="1326" top="48%" left="50%" size="22vw" rotate={2} delay={1.2} springX={springX} springY={springY} mx={2} my={1.5} />

      {/* ── Sello circular ────────────────────────────────────────── */}
      <ManuscriptSeal />

      {/* ── Ornamentos de esquina ─────────────────────────────────── */}
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      {/* ── Metadata bar — absolutamente posicionada bajo el ticker ── */}
      <motion.div
        {...inkReveal(0.3)}
        className="absolute z-30 flex items-center justify-between px-8 md:px-16"
        style={{ top: "calc(1.75rem + 10px)", left: 0, right: 0 }}
      >
        <div className="flex items-center gap-5">
          <span style={{ fontSize: "9px", letterSpacing: "0.4em", color: "rgba(255,90,0,0.55)", fontFamily: MONO, textTransform: "uppercase", fontWeight: 700 }}>
          </span>
          <span style={{ color: "rgba(255,90,0,0.2)", fontSize: "10px" }}>·</span>
          <span style={{ fontSize: "9px", letterSpacing: "0.35em", color: "rgba(232,216,184,0.18)", fontFamily: MONO, textTransform: "uppercase" }}>

          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.span
            style={{ width: 6, height: 6, borderRadius: "50%", display: "inline-block", background: C.lacre }}
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.35, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <span style={{ fontSize: "9px", letterSpacing: "0.4em", color: "rgba(255,90,0,0.35)", fontFamily: MONO, textTransform: "uppercase" }}>
          </span>
        </div>
      </motion.div>

      {/* ── CONTENIDO PRINCIPAL — tipografía centrada ────────────────── */}
      <motion.div
        style={{ opacity, y: yScroll }}
        className="relative z-20 h-full flex flex-col justify-center px-8 md:px-16 pb-16"
      >
        <OrnamentalRule delay={0.5} />

        {/* BLOQUE TIPOGRÁFICO PRINCIPAL */}
        <div>
          {/* "ANTES" — enorme, marfil */}
          <div style={{ overflow: "hidden", lineHeight: 0.82, fontSize: "clamp(3rem, 12vw, 14rem)", padding: "0.2em 0.1em", margin: "-0.2em -0.1em" }}>
            <motion.div
              initial={{ y: "108%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.55, ease: [0.76, 0, 0.24, 1] }}
              style={{
                fontFamily: CORMORANT,
                fontWeight: 700,
                color: C.ivory,
                letterSpacing: "-0.01em",
              }}
            >
              ANTES
            </motion.div>
          </div>

          {/* "del fuego," — mismo tamaño, italic, sepia */}
          <div style={{ overflow: "hidden", lineHeight: 0.82, fontSize: "clamp(3rem, 12vw, 14rem)", padding: "0.2em 0.1em", margin: "-0.2em -0.1em" }}>
            <motion.div
              initial={{ y: "108%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.75, ease: [0.76, 0, 0.24, 1] }}
              style={{
                fontFamily: CORMORANT,
                fontWeight: 300,
                fontStyle: "italic",
                color: C.bone,
                opacity: 0.65,
                letterSpacing: "-0.01em",
              }}
            >
              del fuego,
            </motion.div>
          </div>

          <OrnamentalRule delay={1.0} />

          {/* "ya existía" — más pequeño, escriba */}
          <div style={{ overflow: "hidden", lineHeight: 0.88, fontSize: "clamp(1.5rem, 5.5vw, 7rem)", padding: "0.2em 0.1em", margin: "-0.2em -0.1em" }}>
            <motion.div
              initial={{ y: "108%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 1.1, delay: 1.05, ease: [0.76, 0, 0.24, 1] }}
              style={{
                fontFamily: CORMORANT,
                fontStyle: "italic",
                fontWeight: 400,
                color: "rgba(255,90,0,0.7)",
                letterSpacing: "0.02em",
              }}
            >
              ya existía
            </motion.div>
          </div>

          <OrnamentalRule delay={1.2} />

          {/* "el sabor." — enorme, naranja */}
          <div style={{ overflow: "hidden", lineHeight: 0.82, fontSize: "clamp(3rem, 12vw, 14rem)", padding: "0.2em 0.1em", margin: "-0.2em -0.1em" }}>
            <motion.div
              initial={{ y: "108%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 1.1, delay: 1.25, ease: [0.76, 0, 0.24, 1] }}
              style={{
                fontFamily: CORMORANT,
                fontWeight: 700,
                color: ORANGE,
                letterSpacing: "-0.01em",
              }}
            >
              el sabor.
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Texto vertical derecho ────────────────────────────────── */}
      <motion.div
        className="absolute right-8 z-30 flex flex-col items-center gap-3"
        style={{ top: "50%", translateY: "-50%" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 2 }}
      >
        <span
          style={{
            writingMode: "vertical-rl",
            fontSize: "9px",
            letterSpacing: "0.45em",
            color: `rgba(255,90,0,0.42)`,
            fontFamily: MONO,
            textTransform: "uppercase",
          }}
        >
          Abrir Folio
        </span>
        <motion.div
          style={{
            width: 1,
            height: 56,
            background: `linear-gradient(to bottom, rgba(255,90,0,0.5), transparent)`,
          }}
          animate={{ scaleY: [1, 0.4, 1], opacity: [1, 0.3, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* ── Ticker inferior histórico ─────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 2 }}>
        <BottomTicker />
      </motion.div>
    </div>
  );
}
