import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// ─── Rotating ring (same DNA as the hamburger orbital button) ─────────────────
function SlowOrbit() {
  const TEXT = "THE FOOD STORE · EST. 2026 · NUEVA YORK · ACCESO INTERNO · ";
  return (
    <div className="relative w-[260px] h-[260px] select-none">
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <path
            id="loginOrbit"
            d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
          />
        </defs>
        <text style={{ fontSize: 10.5, fontFamily: "Space Mono, monospace" }}>
          <textPath href="#loginOrbit" startOffset="0%" fill="rgba(248,248,248,0.18)">
            {TEXT}
          </textPath>
        </text>
      </motion.svg>

      {/* Inner circle */}
      <div className="absolute inset-[28px] rounded-full border border-white/[0.06] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-2 h-2 rounded-full bg-[#FF5A00] mx-auto mb-3"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <p
            className="text-[9px] tracking-[0.45em] uppercase text-white/20"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            Panel
            <br />
            Interno
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Floating label input (bottom-border only, no box) ───────────────────────
function LineInput({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  rightSlot,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  rightSlot?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative pb-1">
      {/* Floating label */}
      <motion.span
        className="absolute left-0 pointer-events-none font-mono tracking-[0.25em] uppercase"
        animate={{
          y: active ? -24 : 0,
          fontSize: active ? "9px" : "12px",
          color: focused
            ? "#FF5A00"
            : active
            ? "rgba(248,248,248,0.35)"
            : "rgba(248,248,248,0.22)",
        }}
        style={{ top: active ? "0px" : "18px" }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      >
        {label}
      </motion.span>

      {/* Input */}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        className="w-full bg-transparent border-0 border-b border-white/10 pt-7 pb-2 text-sm text-[#F8F8F8] outline-none pr-10 transition-colors duration-200"
      />

      {/* Animated orange underline */}
      <motion.div
        className="absolute bottom-1 left-0 h-[1px] bg-[#FF5A00] origin-left"
        animate={{ scaleX: focused ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      />

      {rightSlot && (
        <div className="absolute right-0 bottom-2">{rightSlot}</div>
      )}
    </div>
  );
}

// ─── Main LoginPage ───────────────────────────────────────────────────────────
export function LoginPage() {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (isAuthenticated) return <Navigate to="/home" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (isRegistering) {
        if (!user.trim() || !pass.trim() || !email.trim() || !nombre.trim()) {
          setError("Completá todos los campos.");
          return;
        }
    } else {
        if (!user.trim() || !pass.trim()) {
          setError("Completá todos los campos.");
          return;
        }
    }
    
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    
    let ok = false;
    
    if (isRegistering) {
        ok = await register({ username: user, email: email, password: pass, nombre: nombre });
        if (!ok) setError("Error al registrarse. El usuario o email podría estar en uso.");
    } else {
        ok = await login({ usernameOrEmail: user, password: pass });
        if (!ok) setError("Credenciales incorrectas. Verificá usuario y contraseña.");
    }
    
    setLoading(false);
    if (ok) navigate("/home", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#080808] flex overflow-hidden">
      {/* ── LEFT EDITORIAL PANEL ─────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[58%] relative overflow-hidden">
        {/* Grain texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.045] z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px",
          }}
        />

        {/* Radial warm glow */}
        <div className="absolute top-1/2 left-[45%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF5A00]/[0.055] rounded-full blur-[100px] pointer-events-none" />

        {/* Left orange accent stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-[#FF5A00]/70 to-transparent" />

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(to right, #F8F8F8 1px, transparent 1px), linear-gradient(to bottom, #F8F8F8 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Back link */}
        <motion.div
          className="relative z-10 p-10 pb-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase font-mono text-white/20 hover:text-white/50 transition-colors duration-300"
          >
            <motion.span
              className="inline-block"
              animate={{ x: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              ←
            </motion.span>
            The Food Store
          </Link>
        </motion.div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 pb-20">
          {/* Editorial sequence number */}
          <motion.div
            className="self-start mb-8 ml-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-10 bg-[#FF5A00]/60" />
              <span
                className="text-[10px] tracking-[0.4em] text-[#FF5A00]/60 uppercase"
                style={{ fontFamily: "Space Mono, monospace" }}
              >
                {isRegistering ? "02 / Registro" : "01 / Acceso"}
              </span>
            </div>
          </motion.div>

          {/* Rotating orbit ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
          >
            <SlowOrbit />
          </motion.div>

          {/* Brand headline below the ring */}
          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <h1
              className="text-[3.8rem] font-bold leading-[0.88] text-white/90 tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              The Food
              <br />
              <em className="text-[#FF5A00] not-italic">Store.</em>
            </h1>
            <p
              className="mt-5 text-[10px] tracking-[0.45em] uppercase text-white/25"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              Sistema de gestión interna
            </p>
          </motion.div>
        </div>

        {/* Bottom info row */}
        <motion.div
          className="relative z-10 px-10 py-8 flex items-end justify-between border-t border-white/[0.04]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div>
            <p
              className="text-[9px] tracking-[0.4em] text-white/15 uppercase mb-1"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              Ubicación
            </p>
            <p className="text-sm text-white/30 font-mono">Nueva York, NY</p>
          </div>
          <div className="text-right">
            <p
              className="text-[9px] tracking-[0.4em] text-white/15 uppercase mb-1"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              Est.
            </p>
            <p className="text-sm text-white/30 font-mono">2026</p>
          </div>
        </motion.div>
      </div>

      {/* ── VERTICAL DIVIDER ─────────────────────────────────────────── */}
      <div className="hidden lg:block w-[1px] bg-gradient-to-b from-transparent via-white/[0.07] to-transparent" />

      {/* ── RIGHT FORM PANEL ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative bg-[#0c0c0c] overflow-y-auto">
        {/* Grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px",
          }}
        />

        {/* Top corner tag */}
        <div className="relative z-10 flex justify-end p-10 pb-0">
          <span
            className="text-[9px] tracking-[0.45em] text-white/12 uppercase"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            Acceso restringido
          </span>
        </div>

        {/* Form content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10 md:px-16 max-w-sm mx-auto w-full my-8">

          {/* Chapter marker */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[9px] tracking-[0.45em] text-white/18 uppercase font-mono">
                ──── {isRegistering ? "Nuevo Usuario" : "Ingresar"}
              </span>
            </div>
            <h2
              className="text-3xl font-semibold text-[#F8F8F8] leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {isRegistering ? "Creá tu " : "Accedé al "}
              <br className="hidden sm:block" />
              <em style={{ fontStyle: "italic" }}>{isRegistering ? "cuenta." : "sistema."}</em>
            </h2>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            <AnimatePresence mode="popLayout">
                {isRegistering && (
                    <motion.div
                        key="register-fields"
                        initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                        animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
                        exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                        transition={{ duration: 0.4 }}
                        className="space-y-8"
                    >
                        <LineInput
                          label="Nombre Completo"
                          value={nombre}
                          onChange={setNombre}
                          autoComplete="name"
                        />
                        <LineInput
                          label="Correo Electrónico"
                          value={email}
                          onChange={setEmail}
                          autoComplete="email"
                          type="email"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <LineInput
              label={isRegistering ? "Nombre de usuario" : "Usuario o email"}
              value={user}
              onChange={setUser}
              autoComplete="username"
            />

            <LineInput
              label="Contraseña"
              type={showPass ? "text" : "password"}
              value={pass}
              onChange={setPass}
              autoComplete={isRegistering ? "new-password" : "current-password"}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="text-white/25 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-2.5 py-3 px-0 border-l-2 border-[#C1121F] pl-4"
                >
                  <AlertCircle
                    size={13}
                    className="text-[#C1121F] mt-0.5 flex-shrink-0"
                  />
                  <p className="text-xs text-[#C1121F]/90 leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={loading}
                className="relative w-full overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                {/* Background fill animation */}
                <motion.div
                  className="absolute inset-0 bg-[#FF5A00] origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: hovered && !loading ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
                />
                {/* Border */}
                <div className="relative border border-[#FF5A00]/50 group-hover:border-[#FF5A00] transition-colors duration-300 px-6 py-4 flex items-center justify-between">
                  <span
                    className="text-[11px] tracking-[0.4em] uppercase font-mono text-[#F8F8F8] transition-colors"
                    style={{ position: "relative" }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-3">
                        <span className="h-3 w-3 border border-white/40 border-t-white rounded-full animate-spin inline-block" />
                        {isRegistering ? "Registrando" : "Verificando"}
                      </span>
                    ) : (
                      isRegistering ? "Registrarse" : "Ingresar"
                    )}
                  </span>
                  {!loading && (
                    <motion.span
                      animate={{ x: hovered ? 0 : -4, opacity: hovered ? 1 : 0.4 }}
                      transition={{ duration: 0.2 }}
                      className="relative"
                    >
                      <ArrowRight size={14} className="text-[#F8F8F8]" />
                    </motion.span>
                  )}
                </div>
              </motion.button>
            </div>
            
            {/* Toggle Login/Register */}
            <div className="pt-4 text-center">
                <button 
                    type="button" 
                    onClick={() => {
                        setIsRegistering(!isRegistering);
                        setError("");
                    }}
                    className="text-[10px] tracking-[0.2em] text-white/40 hover:text-white/80 uppercase font-mono transition-colors"
                >
                    {isRegistering ? "¿Ya tenés cuenta? Ingresá acá" : "¿No tenés cuenta? Registrate acá"}
                </button>
            </div>
          </motion.form>
        </div>

        {/* Bottom: credentials */}
        <motion.div
          className="relative z-10 px-10 md:px-16 py-8 max-w-sm mx-auto w-full mt-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div className="border-t border-white/[0.05] pt-6">
            <p
              className="text-[9px] tracking-[0.4em] text-white/15 uppercase mb-3"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              Demo
            </p>
            <p className="text-[11px] text-white/20 font-mono">
              <span className="text-white/35">admin</span>
              {" · "}
              <span className="text-white/35">admin123</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
