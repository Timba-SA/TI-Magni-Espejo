import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Link } from "react-router";

const CORMORANT = "'Cormorant Garamond', 'Playfair Display', serif";
const MONO      = "'Space Mono', monospace";
const ORANGE    = "#FF5A00";

// ─── Ticker ───────────────────────────────────────────────────────────────────
const ITEMS = [
  "The Food Store","·","Buenos Aires","·","Est. MMXXVI","·",
  "Cocina de autor","·","Mar–Sáb 17–23hs","·","Pedidos online","·",
];
function Ticker() {
  const all = [...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <div style={{ overflow:"hidden", borderTop:`1px solid rgba(255,90,0,0.1)` }}>
      <motion.div
        style={{ display:"flex", gap:"2.5rem", whiteSpace:"nowrap", width:"max-content", padding:"9px 0" }}
        animate={{ x:["0%","-33.33%"] }}
        transition={{ duration:36, repeat:Infinity, ease:"linear" }}
      >
        {all.map((t,i) => (
          <span key={i} style={{
            fontFamily:MONO, fontSize:"8px", letterSpacing:"0.45em",
            textTransform:"uppercase",
            color: t==="·" ? ORANGE : "rgba(255,255,255,0.14)",
          }}>{t}</span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
export function HistoricalHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset:["start start","end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const yOut    = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        height: "100svh",
        overflow: "hidden",
        // Fondo: cálido oscuro, no negro puro
        background: "#0C0A08",
        // Trama diagonal muy sutil — da textura sin granos
        backgroundImage: `
          repeating-linear-gradient(
            45deg,
            rgba(255,255,255,0.013) 0px,
            rgba(255,255,255,0.013) 1px,
            transparent 1px,
            transparent 6px
          )
        `,
      }}
    >
      {/* Resplandor central muy suave — da profundidad al fondo */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:"radial-gradient(ellipse 75% 55% at 50% 42%, rgba(255,100,20,0.055) 0%, transparent 70%)",
      }} />

      {/* CONTENIDO */}
      <motion.div
        style={{
          opacity, y: yOut,
          position:"absolute", inset:0,
          display:"flex", flexDirection:"column",
        }}
      >
        {/* Spacer navbar */}
        <div style={{ height:"72px", flexShrink:0 }} />

        {/* ── Eyebrow centrado ──────────────────────────────────────────── */}
        <motion.div
          style={{ padding:"0 clamp(24px,6vw,80px)", flexShrink:0 }}
          initial={{ opacity:0 }} animate={{ opacity:1 }}
          transition={{ duration:0.7, delay:0.2 }}
        >
          <div style={{ height:"1px", background:`rgba(255,90,0,0.15)`, marginBottom:"16px" }} />
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:"24px" }}>
            <div style={{ flex:1, height:"1px", background:"rgba(255,90,0,0.07)" }} />
            <span style={{ fontFamily:MONO, fontSize:"8px", letterSpacing:"0.55em", textTransform:"uppercase", color:"rgba(255,90,0,0.35)", whiteSpace:"nowrap" }}>
              Buenos Aires · Est. 2026
            </span>
            <div style={{ flex:1, height:"1px", background:"rgba(255,90,0,0.07)" }} />
          </div>
        </motion.div>

        {/* ── BLOQUE PRINCIPAL — centrado ───────────────────────────────── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"0 clamp(24px,6vw,80px)", textAlign:"center" }}>

          {/* "ANTES" */}
          <div style={{ overflow:"hidden" }}>
            <motion.h1
              initial={{ y:"105%" }}
              animate={{ y:"0%" }}
              transition={{ duration:0.9, delay:0.3, ease:[0.76,0,0.24,1] }}
              style={{
                fontFamily:CORMORANT,
                fontSize:"clamp(4.5rem,13vw,17rem)",
                fontWeight:800,
                lineHeight:0.82,
                color:"rgba(240,236,228,0.88)",
                letterSpacing:"-0.04em",
                margin:0,
              }}
            >ANTES</motion.h1>
          </div>

          {/* "del fuego, ya existía" */}
          <div style={{ overflow:"hidden", marginTop:"0.08em" }}>
            <motion.div
              initial={{ y:"105%" }}
              animate={{ y:"0%" }}
              transition={{ duration:0.9, delay:0.44, ease:[0.76,0,0.24,1] }}
              style={{ display:"flex", alignItems:"baseline", justifyContent:"center", gap:"clamp(8px,2vw,28px)", flexWrap:"wrap" }}
            >
              <span style={{
                fontFamily:CORMORANT, fontWeight:300, fontStyle:"italic",
                fontSize:"clamp(2rem,5.5vw,7.5rem)",
                color:"rgba(240,228,210,0.18)",
                letterSpacing:"-0.025em", lineHeight:0.85,
              }}>del fuego,</span>
              <span style={{
                fontFamily:CORMORANT, fontWeight:400, fontStyle:"italic",
                fontSize:"clamp(1rem,2.6vw,3.5rem)",
                color:"rgba(255,90,0,0.4)",
                letterSpacing:"0.01em", lineHeight:1,
              }}>ya existía</span>
            </motion.div>
          </div>

          {/* "el sabor." */}
          <div style={{ overflow:"hidden", marginTop:"0.05em" }}>
            <motion.h2
              initial={{ y:"105%" }}
              animate={{ y:"0%" }}
              transition={{ duration:0.9, delay:0.58, ease:[0.76,0,0.24,1] }}
              style={{
                fontFamily:CORMORANT,
                fontSize:"clamp(4.5rem,13vw,17rem)",
                fontWeight:800,
                lineHeight:0.82,
                color:ORANGE,
                letterSpacing:"-0.04em",
                margin:0,
              }}
            >el sabor.</motion.h2>
          </div>

          {/* ── Regla + CTAs centrados ────────────────────────────────────── */}
          <motion.div
            style={{ marginTop:"clamp(28px,4.5vh,56px)", width:"100%", display:"flex", flexDirection:"column", alignItems:"center", gap:"20px" }}
            initial={{ opacity:0, y:8 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.6, delay:0.85 }}
          >
            {/* Línea decorativa */}
            <div style={{ display:"flex", alignItems:"center", gap:"16px", width:"100%", maxWidth:"480px" }}>
              <div style={{ flex:1, height:"1px", background:"rgba(255,90,0,0.12)" }} />
              <div style={{ width:4, height:4, background:ORANGE, borderRadius:"50%", opacity:0.5 }} />
              <div style={{ flex:1, height:"1px", background:"rgba(255,90,0,0.12)" }} />
            </div>

            {/* Botones */}
            <div style={{ display:"flex", gap:"clamp(8px,1.5vw,14px)", flexWrap:"wrap", justifyContent:"center" }}>
              <Link to="/menu" style={{
                fontFamily:MONO, fontSize:"8px", letterSpacing:"0.44em",
                textTransform:"uppercase", color:"rgba(255,90,0,0.55)",
                border:"1px solid rgba(255,90,0,0.18)", padding:"13px 28px",
                transition:"all 0.22s", display:"inline-block", whiteSpace:"nowrap",
              }}
                onMouseEnter={e=>{ e.currentTarget.style.color=ORANGE; e.currentTarget.style.borderColor="rgba(255,90,0,0.45)"; e.currentTarget.style.background="rgba(255,90,0,0.05)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.color="rgba(255,90,0,0.55)"; e.currentTarget.style.borderColor="rgba(255,90,0,0.18)"; e.currentTarget.style.background="transparent"; }}
              >Ver Menú</Link>

              <Link to="/checkout" style={{
                fontFamily:MONO, fontSize:"8px", letterSpacing:"0.44em",
                textTransform:"uppercase", color:"#0C0A08", fontWeight:700,
                background:ORANGE, padding:"14px 28px",
                transition:"all 0.2s", display:"inline-block", whiteSpace:"nowrap",
              }}
                onMouseEnter={e=>{ e.currentTarget.style.background="#FF6820"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=ORANGE; }}
              >Hacer Pedido</Link>
            </div>

            {/* Stats centrados */}
            <div style={{ display:"flex", gap:"clamp(20px,4vw,56px)", justifyContent:"center" }}>
              {[["48+","Platos"],["5","Años"],["12","Chefs"]].map(([n,l])=>(
                <div key={l} style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:CORMORANT, fontSize:"clamp(1.3rem,2.4vw,2.8rem)", fontWeight:700, color:"rgba(255,255,255,0.3)", lineHeight:1, letterSpacing:"-0.02em" }}>{n}</div>
                  <div style={{ fontFamily:MONO, fontSize:"7px", letterSpacing:"0.4em", textTransform:"uppercase", color:"rgba(255,90,0,0.25)", marginTop:"4px" }}>{l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Ticker */}
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }}
          transition={{ duration:0.6, delay:1.1 }}
        >
          <Ticker />
        </motion.div>
      </motion.div>
    </div>
  );
}
