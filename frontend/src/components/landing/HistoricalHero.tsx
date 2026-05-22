import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Link } from "react-router";

const CORMORANT = "'Cormorant Garamond', 'Playfair Display', serif";
const MONO      = "'Space Mono', monospace";
const ORANGE    = "#FF5A00";

// ─── Regla ornamental ─────────────────────────────────────────────────────────
function OrnamentalRule({ delay }: { delay: number }) {
  return (
    <motion.div
      className="flex items-center gap-3 my-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay }}
    >
      <motion.div
        style={{
          height: 1,
          background: "linear-gradient(to right, transparent, rgba(255,90,0,0.3), transparent)",
          flex: 1,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay, ease: [0.76, 0, 0.24, 1] }}
      />
      <span style={{ color: ORANGE, opacity: 0.5, fontSize: "7px" }}>✦</span>
      <motion.div
        style={{
          height: 1,
          background: "linear-gradient(to left, transparent, rgba(255,90,0,0.3), transparent)",
          flex: 1,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: delay + 0.05, ease: [0.76, 0, 0.24, 1] }}
      />
    </motion.div>
  );
}

// ─── Reveal de texto desde abajo ──────────────────────────────────────────────
function Reveal({
  children,
  delay,
  style,
  fontSize,
  lineHeight = 0.86,
}: {
  children: React.ReactNode;
  delay: number;
  style?: React.CSSProperties;
  fontSize: string;
  lineHeight?: number;
}) {
  return (
    <div style={{ overflow: "hidden", lineHeight, fontSize, padding: "0.1em 0", margin: "-0.1em 0" }}>
      <motion.div
        initial={{ y: "105%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ duration: 0.9, delay, ease: [0.76, 0, 0.24, 1] }}
        style={{ fontFamily: CORMORANT, ...style }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export function HistoricalHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const yScroll  = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <div
      ref={containerRef}
      className="relative h-screen overflow-hidden"
      style={{ background: "#080808" }}
    >
      {/* ── Glow — vive en el centro-derecha para iluminar "el sabor." ───── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 72% 65%, rgba(255,90,0,0.07) 0%, rgba(255,90,0,0.02) 55%, transparent 80%)",
        }}
      />
      {/* Glow secundario tenue — base */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 25% at 50% 100%, rgba(180,55,0,0.06) 0%, transparent 70%)",
        }}
      />

      {/* ── Regla vertical divisoria ─────────────────────────────────────── */}
      <motion.div
        className="absolute top-0 bottom-0 hidden md:block pointer-events-none"
        style={{ left: "52%", width: "1px", background: "rgba(255,255,255,0.04)" }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.2, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* ── Regla horizontal a mitad de pantalla ─────────────────────────── */}
      <motion.div
        className="absolute left-0 right-0 hidden md:block pointer-events-none"
        style={{ top: "50%", height: "1px", background: "rgba(255,255,255,0.03)" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* ── LAYOUT PRINCIPAL ──────────────────────────────────────────────── */}
      <motion.div
        style={{ opacity, y: yScroll }}
        className="relative z-10 h-full"
      >
        {/*
          Grid de 2 columnas:
          IZQUIERDA (52%): "ANTES" + "del fuego," + metadata inferior
          DERECHA  (48%): "ya existía" + "el sabor." + CTA
        */}
        <div
          className="h-full grid grid-cols-1 md:grid-cols-[52fr_48fr]"
          style={{ paddingTop: "80px" }} /* clearance de la navbar */
        >

          {/* ─────────────── COLUMNA IZQUIERDA ─────────────── */}
          <div className="flex flex-col justify-between px-8 md:px-16 py-10 md:py-14">

            {/* Eyebrow — esquina superior izquierda */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
            >
              <p style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(255,90,0,0.35)" }}>
                Archivum Gastronomicum · Folio I
              </p>
            </motion.div>

            {/* Bloque tipográfico izquierdo */}
            <div className="flex-1 flex flex-col justify-center">
              {/* ANTES — el titular principal */}
              <Reveal
                delay={0.12}
                fontSize="clamp(4rem, 9.5vw, 13rem)"
                lineHeight={0.84}
                style={{ fontWeight: 700, color: "#F0EBE1", letterSpacing: "-0.03em" }}
              >
                ANTES
              </Reveal>

              {/* del fuego, — italic, desvanecida */}
              <Reveal
                delay={0.24}
                fontSize="clamp(3.2rem, 8vw, 11rem)"
                lineHeight={0.84}
                style={{ fontWeight: 300, fontStyle: "italic", color: "rgba(225,215,196,0.38)", letterSpacing: "-0.03em" }}
              >
                del fuego,
              </Reveal>
            </div>

            {/* Metadata inferior izquierda */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.75 }}
              className="flex items-end justify-between"
            >
              <div>
                <p style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)" }}>
                  Ubicación
                </p>
                <p style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>
                  Buenos Aires, BSAS
                </p>
              </div>
              <div className="text-right">
                <p style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)" }}>
                  Fundado
                </p>
                <p style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>
                  Est. MMXXVI
                </p>
              </div>
            </motion.div>
          </div>

          {/* ─────────────── COLUMNA DERECHA ─────────────── */}
          <div className="flex flex-col justify-end px-8 md:px-14 py-10 md:py-14">

            {/* Número de sección — esquina superior derecha */}
            <motion.div
              className="hidden md:flex flex-col items-end mb-auto pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <span style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.45em", textTransform: "uppercase", color: "rgba(255,90,0,0.28)" }}>
                01 / Hero
              </span>
              <motion.div
                style={{ width: 1, height: 48, background: "linear-gradient(to bottom, rgba(255,90,0,0.3), transparent)", marginTop: 8 }}
                animate={{ scaleY: [1, 0.3, 1], opacity: [0.7, 0.15, 0.7] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Bloque tipográfico derecho */}
            <div>
              {/* ya existía */}
              <Reveal
                delay={0.36}
                fontSize="clamp(1.4rem, 4.5vw, 6rem)"
                lineHeight={0.9}
                style={{ fontWeight: 400, fontStyle: "italic", color: "rgba(255,90,0,0.7)", letterSpacing: "0.01em" }}
              >
                ya existía
              </Reveal>

              {/* el sabor. — el protagonista naranja */}
              <Reveal
                delay={0.48}
                fontSize="clamp(3.8rem, 9vw, 12.5rem)"
                lineHeight={0.84}
                style={{ fontWeight: 700, color: ORANGE, letterSpacing: "-0.03em" }}
              >
                el sabor.
              </Reveal>

              <OrnamentalRule delay={0.6} />

              {/* CTA */}
              <motion.div
                className="flex items-center gap-3 mt-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Link
                  to="/menu"
                  style={{
                    fontFamily: MONO,
                    fontSize: "10px",
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    color: "rgba(255,90,0,0.7)",
                    fontWeight: 400,
                    border: "1px solid rgba(255,90,0,0.25)",
                    padding: "11px 22px",
                    transition: "all 0.2s",
                    display: "inline-block",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background   = "rgba(255,90,0,0.07)";
                    e.currentTarget.style.borderColor  = "rgba(255,90,0,0.55)";
                    e.currentTarget.style.color        = ORANGE;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background   = "transparent";
                    e.currentTarget.style.borderColor  = "rgba(255,90,0,0.25)";
                    e.currentTarget.style.color        = "rgba(255,90,0,0.7)";
                  }}
                >
                  Ver Menú
                </Link>

                <Link
                  to="/checkout"
                  style={{
                    fontFamily: MONO,
                    fontSize: "10px",
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    color: "#080808",
                    fontWeight: 700,
                    background: ORANGE,
                    padding: "12px 22px",
                    transition: "background 0.2s",
                    display: "inline-block",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#FF7430"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ORANGE; }}
                >
                  Hacer Pedido
                </Link>
              </motion.div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
