import { motion } from "motion/react";

const BRAND_LETTERS = ["T", "H", "E"];
const BRAND_LINES = ["FOOD", "STORE"];

const TICKER_WORDS = [
  "HECHO CON PRECISIÓN",
  "◆",
  "EST. 2026",
  "◆",
  "PALERMO SOHO • BUENOS AIRES",
  "◆",
  "ABIERTO MAR–SAB",
  "◆",
  "17H–23H",
  "◆",
  "GASTRONOMÍA ARTESANAL",
  "◆",
];

function FooterTicker() {
  const items = [...TICKER_WORDS, ...TICKER_WORDS];
  return (
    <div className="overflow-hidden border-t border-[#F8F8F8]/[0.04] py-4">
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: [0, "-50%"] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className="text-[9px] tracking-[0.45em] uppercase font-mono flex-shrink-0"
            style={{ color: item === "◆" ? "#FF5A00" : "rgba(248,248,248,0.15)" }}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function OpenStatus() {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0=Dom, 1=Lun, 2=Mar, ..., 6=Sáb
  const isOpen = day >= 2 && day <= 6 && hour >= 17 && hour < 23;

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: isOpen ? "#22c55e" : "#C1121F" }}
        animate={{ opacity: isOpen ? [1, 0.4, 1] : 1 }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="text-[9px] tracking-[0.3em] font-mono uppercase" style={{ color: isOpen ? "#22c55e" : "#C1121F" }}>
        {isOpen ? "Abierto ahora" : "Cerrado"}
      </span>
    </div>
  );
}

import { Link } from "react-router";

const NAV_ROUTES: Record<string, string> = {
  "Menú": "/menu",
  "Reservas": "/reservas",
  "Nosotros": "/nosotros",
  "Contacto": "/contacto",
  "Empleo": "/empleo",
  "Prensa": "/prensa",
  "Privacidad": "/privacidad",
  "Términos": "/terminos",
};

export function EditorialFooter() {
  return (
    <footer className="relative bg-[#080808] overflow-hidden">
      {/* Top border animated */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, #FF5A00 30%, #C1121F 70%, transparent 100%)",
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top, rgba(255,90,0,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-8 pt-24 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 mb-24">
          {/* Brand */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="w-2 h-2 rounded-full bg-[#FF5A00]"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <span className="text-xs tracking-[0.4em] text-[#FF5A00] uppercase font-mono">
                  The Food Store
                </span>
              </div>

              {/* "THE" — stagger per letter */}
              <div className="flex gap-0 leading-none">
                {BRAND_LETTERS.map((letter, i) => (
                  <motion.span
                    key={i}
                    className="font-bold text-[#F8F8F8]"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(3rem, 6vw, 4.5rem)",
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>

              {BRAND_LINES.map((line, lineIdx) => (
                <motion.div
                  key={line}
                  className="leading-none"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.35 + lineIdx * 0.12 }}
                >
                  <span
                    className={`font-bold text-[#F8F8F8] ${lineIdx === 1 ? "italic font-light text-[#F8F8F8]/50" : ""}`}
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(3rem, 6vw, 4.5rem)",
                    }}
                  >
                    {line}
                  </span>
                </motion.div>
              ))}
            </div>

            <p
              className="text-[#F8F8F8]/40 leading-relaxed max-w-xs mb-10 text-sm"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Un destino culinario donde la tradición se encuentra con la innovación, y cada detalle importa.
            </p>

            {/* Open status */}
            <div className="mb-6">
              <OpenStatus />
            </div>

            {/* Socials */}
            <div className="flex gap-5">
              {["IG", "TW", "FB"].map((s, i) => (
                <motion.a
                  key={s}
                  href="#"
                  className="w-9 h-9 border border-[#F8F8F8]/10 flex items-center justify-center text-[10px] tracking-widest text-[#F8F8F8]/40 font-mono transition-colors duration-300 hover:border-[#FF5A00] hover:text-[#FF5A00]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -3 }}
                >
                  {s}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Nav links */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.15 }}
          >
            <h4 className="text-[10px] tracking-[0.4em] text-[#F8F8F8]/25 mb-8 uppercase font-mono">
              Navegar
            </h4>
            <ul className="space-y-4">
              {["Menú", "Reservas", "Nosotros", "Contacto"].map((link) => (
                <li key={link}>
                  <Link
                    to={NAV_ROUTES[link]}
                    className="text-[#F8F8F8]/60 hover:text-[#F8F8F8] transition-colors duration-300 text-sm flex items-center gap-3 group block"
                  >
                    <motion.span
                      className="w-4 h-[1px] bg-[#FF5A00] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      whileHover={{ x: 6 }}
                    />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Info links */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.25 }}
          >
            <h4 className="text-[10px] tracking-[0.4em] text-[#F8F8F8]/25 mb-8 uppercase font-mono">
              Información
            </h4>
            <ul className="space-y-4">
              {["Empleo", "Prensa", "Privacidad", "Términos"].map((link) => (
                <li key={link}>
                  <Link
                    to={NAV_ROUTES[link]}
                    className="text-[#F8F8F8]/60 hover:text-[#F8F8F8] transition-colors duration-300 text-sm flex items-center gap-3 group block"
                  >
                    <motion.span
                      className="w-4 h-[1px] bg-[#FF5A00] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      whileHover={{ x: 6 }}
                    />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.35 }}
          >
            <h4 className="text-[10px] tracking-[0.4em] text-[#F8F8F8]/25 mb-8 uppercase font-mono">
              Visitanos
            </h4>
            <address className="not-italic space-y-4 text-sm text-[#F8F8F8]/50" style={{ fontFamily: "'Inter', sans-serif" }}>
              <p>
                123 Palermo Soho
                <br />
                Buenos Aires, BSAS 10001
              </p>
              <p>
                Mar–Sáb
                <br />
                <span className="text-[#FF5A00]">17:00 – 23:00</span>
              </p>
              <p>
                <a href="tel:+15551234567" className="hover:text-[#F8F8F8] transition-colors duration-300">
                  +1 (555) 123-4567
                </a>
              </p>
            </address>
          </motion.div>
        </div>

        {/* Separator */}
        <motion.div
          className="h-[1px] mb-8"
          style={{
            background: "linear-gradient(90deg, #FF5A00 0%, #C1121F 30%, transparent 70%)",
            transformOrigin: "left",
          }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
        />

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="pb-0"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <p className="text-[10px] text-[#F8F8F8]/20 tracking-widest font-mono uppercase">
              © 2026 THE FOOD STORE. Todos los derechos reservados.
            </p>
            <p className="text-[10px] text-[#F8F8F8]/20 tracking-widest font-mono uppercase">
              Hecho con precisión en Nueva York
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer ticker */}
      <FooterTicker />
    </footer>
  );
}
