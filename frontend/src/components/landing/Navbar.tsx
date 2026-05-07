import { motion, useMotionValue, useSpring, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// ─── Historical ticker ──────────────────────────────────────────────────────
const TICKER_TEXT =
  "ARCHIVUM GASTRONOMICUM ✦ THE FOOD STORE ✦ FOLIO I ✦ FUEGO ✦ SAL ✦ PAN ✦ VINO ✦ OFICIO ✦ SABOR ✦ ";

function Ticker() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-7 overflow-hidden flex items-center" style={{ background: "#8B1E16" }}>
      <motion.div
        className="flex gap-0 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(4)].map((_, i) => (
          <span
            key={i}
            className="text-[10px] tracking-[0.45em] uppercase px-3"
            style={{ color: "#E8D8B8", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
          >
            {TICKER_TEXT}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Orbital menu button ─────────────────────────────────────────────────────
function OrbitalButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative w-14 h-14 flex items-center justify-center group"
      aria-label="Toggle menu"
    >
      {/* Rotating ring text */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      >
        <defs>
          <path id="circle" d="M 50,50 m -30,0 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0" />
        </defs>
        <text className="fill-white/40 text-[8px]" style={{ fontSize: 8.5, fontFamily: "Space Mono" }}>
          <textPath href="#circle" startOffset="0%">
            MENÚ · MENÚ · MENÚ · MENÚ ·{" "}
          </textPath>
        </text>
      </motion.svg>

      {/* Inner cross / close */}
      <div className="relative z-10 w-5 h-5">
        <motion.span
          className="absolute top-1/2 left-0 right-0 h-[1px] bg-white origin-center"
          animate={{ rotate: open ? 45 : 0, y: open ? 0 : -4 }}
          transition={{ duration: 0.4 }}
        />
        <motion.span
          className="absolute top-1/2 left-0 right-0 h-[1px] bg-white origin-center"
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />
        <motion.span
          className="absolute top-1/2 left-0 right-0 h-[1px] bg-white origin-center"
          animate={{ rotate: open ? -45 : 0, y: open ? 0 : 4 }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </button>
  );
}

// ─── Magnetic link ───────────────────────────────────────────────────────────
const NAV_LABELS: Record<string, string> = {
  Menu: "Menú",
  About: "Nosotros",
  Experience: "Experiencia",
  Reservations: "Reservas",
  Contact: "Contacto",
};

const PANEL_COLORS: Record<string, string> = {
  Menu: "#FF5A00",
  About: "#C1121F",
  Experience: "#D4A574",
  Contact: "#1a1a1a",
  Reservations: "#0B0B0B",
};

function MagneticLink({
  label,
  index,
  onHover,
  isOpen,
  onClose,
}: {
  label: string;
  index: number;
  onHover: (label: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 120, damping: 15 });
  const sy = useSpring(y, { stiffness: 120, damping: 15 });

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
    onHover(null);
  };

  const fromX = index % 2 === 0 ? "-8vw" : "8vw";
  const displayLabel = NAV_LABELS[label] || label;

  const NAV_ROUTES: Record<string, string> = {
    Menu: "menu",
    About: "nosotros",
    Experience: "experiencia",
    Reservations: "reservas",
    Contact: "contacto",
  };

  const targetPath = `/${NAV_ROUTES[label] || label.toLowerCase()}`;

  return (
    <motion.div
      ref={ref}
      className="relative overflow-hidden cursor-none group"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseEnter={() => onHover(label)}
      data-cursor="open"
      initial={{ opacity: 0, x: fromX, y: 20 }}
      animate={
        isOpen
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x: fromX, y: 20 }
      }
      transition={{
        duration: 0.7,
        delay: isOpen ? 0.1 + index * 0.07 : 0,
        ease: [0.76, 0, 0.24, 1],
      }}
    >
      <motion.div
        style={{ x: sx, y: sy }}
        className="block relative"
      >
        <Link to={targetPath} className="block relative" onClick={() => { onHover(null); onClose(); }}>
          {/* Number */}
          <span
            className="absolute -left-2 top-1/2 -translate-y-1/2 text-xs text-white/20 font-mono tracking-widest"
            style={{ writingMode: "vertical-rl" }}
          >
            0{index + 1}
          </span>

          {/* Main text */}
          <span
            className="block text-[7vw] font-bold leading-[0.85] tracking-tight text-white transition-colors duration-300 group-hover:text-transparent"
            style={{
              fontFamily: "'Playfair Display', serif",
              WebkitTextStroke: "1px rgba(248,248,248,0.9)",
            }}
          >
            {displayLabel}
          </span>

          {/* Ghost fill on hover */}
          <motion.span
            className="absolute inset-0 block text-[7vw] font-bold leading-[0.85] tracking-tight text-white pointer-events-none overflow-hidden"
            style={{ fontFamily: "'Playfair Display', serif", clipPath: "inset(0 100% 0 0)" }}
            whileHover={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
          >
            {displayLabel}
          </motion.span>
        </Link>
      </motion.div>

      {/* Bottom rule */}
      <motion.div
        className="h-[1px] bg-white/10 mt-1"
        initial={{ scaleX: 0 }}
        animate={isOpen ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.6, delay: isOpen ? 0.2 + index * 0.07 : 0 }}
        style={{ transformOrigin: "left" }}
      />
    </motion.div>
  );
}

// ─── Full-screen overlay menu ────────────────────────────────────────────────
const NAV_ITEMS = ["Menu", "About", "Experience", "Reservations", "Contact"];

function FullScreenMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { isAuthenticated, logout } = useAuth();

  const activeBg = hoveredItem ? PANEL_COLORS[hoveredItem] : "#0B0B0B";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[150] flex overflow-hidden"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Color panel background */}
          <motion.div
            className="absolute inset-0"
            animate={{ backgroundColor: activeBg }}
            transition={{ duration: 0.4 }}
          />

          {/* Noise */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: "128px",
            }}
          />

          {/* Links */}
          <div className="relative z-10 w-full flex flex-col justify-center px-[8vw] pt-28 pb-16">
            <div className="space-y-0">
              {NAV_ITEMS.map((item, i) => (
                <MagneticLink
                  key={item}
                  label={item}
                  index={i}
                  onHover={setHoveredItem}
                  isOpen={open}
                  onClose={onClose}
                />
              ))}
            </div>

            {/* Footer info */}
            <motion.div
              className="mt-12 flex justify-between items-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div>
                <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-mono mb-1">
                  Ubicación
                </p>
                <p className="text-sm text-white/60 font-mono">Buenos Aires, BSAS</p>
                {isAuthenticated && (
                  <button 
                    onClick={() => { logout(); onClose(); }}
                    className="text-[10px] tracking-[0.2em] text-red-400/80 hover:text-red-300 uppercase font-mono mt-4 transition-colors"
                  >
                    [ Cerrar sesión ]
                  </button>
                )}
              </div>
              <div className="flex gap-6">
                {["IG", "TW", "FB"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="text-[10px] tracking-widest text-white/30 hover:text-white font-mono transition-colors duration-300 uppercase"
                  >
                    {s}
                  </a>
                ))}
              </div>
              <div className="text-right">
                <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-mono mb-1">
                  Horarios
                </p>
                <p className="text-sm text-white/60 font-mono">Mar–Sáb, 17–23hs</p>
              </div>
            </motion.div>
          </div>

          {/* Vertical brand text */}
          <div
            className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.5em] text-white/10 uppercase font-mono pointer-events-none"
            style={{ writingMode: "vertical-rl" }}
          >
            The Food Store · Est. 2026
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Navbar export ───────────────────────────────────────────────────────
export function Navbar() {
  const [open, setOpen] = useState(false);

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <Ticker />

      {/* Corner: Logo */}
      <motion.a
        href="/"
        className="fixed top-7 left-8 z-[200] flex items-center gap-2.5 group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="relative w-8 h-8 border border-[#FF5A00]/60 flex items-center justify-center group-hover:border-[#FF5A00] transition-colors duration-300">
          <span className="text-[10px] font-bold text-[#FF5A00] font-mono tracking-wider">TFS</span>
          <motion.div
            className="absolute inset-0 bg-[#FF5A00]"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: "left", zIndex: -1 }}
          />
        </div>
        <span
          className="text-[10px] text-white/40 tracking-[0.3em] uppercase font-mono hidden md:block group-hover:text-white/70 transition-colors duration-300"
        >
          The Food Store
        </span>
      </motion.a>

      {/* Corner: Menu button */}
      <motion.div
        className="fixed top-7 right-8 z-[200]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <OrbitalButton open={open} onClick={() => setOpen(!open)} />
      </motion.div>

      {/* Panel login button — histórico */}
      <motion.div
        className="fixed top-[38px] right-28 z-[200]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Link
          to="/login"
          className="group flex items-center gap-2 px-4 py-1.5 transition-all duration-300"
          style={{
            border: "1px solid rgba(198,154,58,0.35)",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(198,154,58,0.8)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(198,154,58,0.35)")}
        >
          <LogIn size={11} style={{ color: "rgba(198,154,58,0.8)" }} />
          <span
            className="text-[10px] tracking-[0.35em] uppercase transition-colors"
            style={{ color: "rgba(198,154,58,0.6)", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
          >
            Panel
          </span>
        </Link>
      </motion.div>

      {/* Full screen overlay */}
      <FullScreenMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
