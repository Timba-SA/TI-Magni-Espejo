import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, MapPin, ShoppingBag, Edit2, Save, X, Plus, ChevronRight, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  getMiPerfil,
  actualizarPerfil,
  getMisPedidos,
  listarDirecciones,
  crearDireccion,
  type UsuarioPerfil,
  type ActualizarPerfilRequest,
  type Direccion,
  type PedidoResponse,
} from "@/features/profile/services/profileService";

// ─── Constantes de estilo ─────────────────────────────────────────────────────
const CORMORANT = "'Cormorant Garamond', 'Playfair Display', serif";
const MONO      = "'Space Mono', monospace";
const ORANGE    = "#FF5A00";

const ESTADO_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  PENDIENTE:   { label: "Pendiente",   color: "#facc15", bg: "rgba(250,204,21,0.1)"  },
  CONFIRMADO:  { label: "Confirmado",  color: "#60a5fa", bg: "rgba(96,165,250,0.1)"  },
  EN_CAMINO:   { label: "En camino",   color: ORANGE,    bg: "rgba(255,90,0,0.1)"    },
  ENTREGADO:   { label: "Entregado",   color: "#4ade80", bg: "rgba(74,222,128,0.1)"  },
  CANCELADO:   { label: "Cancelado",   color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
}

function getInitials(nombre: string, apellido?: string) {
  const a = nombre?.[0]?.toUpperCase() ?? "";
  const b = apellido?.[0]?.toUpperCase() ?? "";
  return a + b || "?";
}

// ─── Componente: Input de perfil ──────────────────────────────────────────────
function ProfileInput({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        style={{
          fontFamily: MONO,
          fontSize: "9px",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "rgba(255,90,0,0.45)",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          background:    disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
          border:        `1px solid ${disabled ? "rgba(255,255,255,0.06)" : "rgba(255,90,0,0.25)"}`,
          color:         disabled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)",
          fontFamily:    MONO,
          fontSize:      "13px",
          padding:       "10px 14px",
          outline:       "none",
          width:         "100%",
          transition:    "border-color 0.2s",
          letterSpacing: "0.02em",
        }}
        onFocus={(e) => { if (!disabled) e.currentTarget.style.borderColor = "rgba(255,90,0,0.6)"; }}
        onBlur={(e)  => { if (!disabled) e.currentTarget.style.borderColor = "rgba(255,90,0,0.25)"; }}
      />
    </div>
  );
}

// ─── Sección: Datos personales ────────────────────────────────────────────────
function DatosPersonalesSection({ perfil, onUpdate }: {
  perfil: UsuarioPerfil;
  onUpdate: (p: UsuarioPerfil) => void;
}) {
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [form, setForm]         = useState<ActualizarPerfilRequest>({
    nombre:   perfil.nombre   ?? "",
    apellido: perfil.apellido ?? "",
    celular:  perfil.celular  ?? "",
  });

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const updated = await actualizarPerfil(form);
      onUpdate(updated);
      setEditing(false);
      setFeedback({ type: "ok", msg: "Datos actualizados correctamente." });
    } catch {
      setFeedback({ type: "err", msg: "No se pudo guardar. Intentá de nuevo." });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ nombre: perfil.nombre ?? "", apellido: perfil.apellido ?? "", celular: perfil.celular ?? "" });
    setEditing(false);
    setFeedback(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3
          style={{
            fontFamily: CORMORANT,
            fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
            color: "rgba(255,255,255,0.85)",
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
        >
          Datos Personales
        </h3>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 transition-colors duration-200"
            style={{
              fontFamily: MONO,
              fontSize: "10px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(255,90,0,0.6)",
              border: "1px solid rgba(255,90,0,0.2)",
              padding: "7px 14px",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = ORANGE; e.currentTarget.style.borderColor = "rgba(255,90,0,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,90,0,0.6)"; e.currentTarget.style.borderColor = "rgba(255,90,0,0.2)"; }}
          >
            <Edit2 size={11} />
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)", padding: "7px 14px" }}
            >
              <X size={11} className="inline mr-1" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#080808", background: saving ? "#999" : ORANGE, padding: "7px 14px", border: "none" }}
            >
              <Save size={11} className="inline mr-1" />
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfileInput
          label="Nombre"
          value={editing ? (form.nombre ?? "") : (perfil.nombre ?? "")}
          onChange={(v) => setForm((f) => ({ ...f, nombre: v }))}
          disabled={!editing}
        />
        <ProfileInput
          label="Apellido"
          value={editing ? (form.apellido ?? "") : (perfil.apellido ?? "")}
          onChange={(v) => setForm((f) => ({ ...f, apellido: v }))}
          disabled={!editing}
          placeholder="Sin apellido cargado"
        />
        <ProfileInput
          label="Email"
          value={perfil.email}
          disabled
          type="email"
        />
        <ProfileInput
          label="Celular"
          value={editing ? (form.celular ?? "") : (perfil.celular ?? "")}
          onChange={(v) => setForm((f) => ({ ...f, celular: v }))}
          disabled={!editing}
          placeholder="Sin celular cargado"
        />
        <ProfileInput
          label="Usuario"
          value={perfil.username}
          disabled
        />
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: "12px",
              fontFamily: MONO,
              fontSize: "11px",
              color: feedback.type === "ok" ? "#4ade80" : "#f87171",
              letterSpacing: "0.05em",
            }}
          >
            {feedback.msg}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sección: Mis Direcciones ─────────────────────────────────────────────────
function DireccionesSection() {
  const [direcciones, setDirecciones]   = useState<Direccion[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [saving, setSaving]             = useState(false);
  const [feedback, setFeedback]         = useState<string | null>(null);
  const [form, setForm] = useState({
    alias: "", linea1: "", linea2: "",
    ciudad: "", provincia: "", codigo_postal: "",
  });

  useEffect(() => {
    listarDirecciones()
      .then(setDirecciones)
      .finally(() => setLoading(false));
  }, []);

  const handleAddDireccion = async () => {
    if (!form.linea1.trim() || !form.ciudad.trim()) {
      setFeedback("Calle y ciudad son obligatorios.");
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const nueva = await crearDireccion({
        alias:         form.alias     || undefined,
        linea1:        form.linea1,
        linea2:        form.linea2    || undefined,
        ciudad:        form.ciudad,
        provincia:     form.provincia || undefined,
        codigo_postal: form.codigo_postal || undefined,
      });
      setDirecciones((prev) => [...prev, nueva]);
      setShowForm(false);
      setForm({ alias: "", linea1: "", linea2: "", ciudad: "", provincia: "", codigo_postal: "" });
    } catch {
      setFeedback("No se pudo guardar la dirección.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3
          style={{
            fontFamily: CORMORANT,
            fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
            color: "rgba(255,255,255,0.85)",
            fontWeight: 600,
          }}
        >
          Mis Direcciones
        </h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            fontFamily: MONO, fontSize: "10px", letterSpacing: "0.3em",
            textTransform: "uppercase", color: "rgba(255,90,0,0.6)",
            border: "1px solid rgba(255,90,0,0.2)", padding: "7px 14px",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = ORANGE; e.currentTarget.style.borderColor = "rgba(255,90,0,0.5)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,90,0,0.6)"; e.currentTarget.style.borderColor = "rgba(255,90,0,0.2)"; }}
        >
          <Plus size={11} className="inline mr-1" />
          Nueva
        </button>
      </div>

      {/* Formulario nueva dirección */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="mb-6 p-5 grid grid-cols-1 md:grid-cols-2 gap-4"
              style={{ border: "1px solid rgba(255,90,0,0.15)", background: "rgba(255,90,0,0.03)" }}
            >
              <ProfileInput label="Alias (ej: Casa)" value={form.alias} onChange={(v) => setForm((f) => ({ ...f, alias: v }))} placeholder="Opcional" />
              <ProfileInput label="Calle y número *" value={form.linea1} onChange={(v) => setForm((f) => ({ ...f, linea1: v }))} placeholder="Av. Corrientes 1234" />
              <ProfileInput label="Piso / Depto" value={form.linea2} onChange={(v) => setForm((f) => ({ ...f, linea2: v }))} placeholder="Opcional" />
              <ProfileInput label="Ciudad *" value={form.ciudad} onChange={(v) => setForm((f) => ({ ...f, ciudad: v }))} placeholder="Buenos Aires" />
              <ProfileInput label="Provincia" value={form.provincia} onChange={(v) => setForm((f) => ({ ...f, provincia: v }))} placeholder="CABA" />
              <ProfileInput label="Código Postal" value={form.codigo_postal} onChange={(v) => setForm((f) => ({ ...f, codigo_postal: v }))} placeholder="1000" />

              {feedback && (
                <p style={{ gridColumn: "1 / -1", fontFamily: MONO, fontSize: "11px", color: "#f87171" }}>
                  {feedback}
                </p>
              )}

              <div className="flex gap-2" style={{ gridColumn: "1 / -1" }}>
                <button
                  onClick={() => { setShowForm(false); setFeedback(null); }}
                  style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 16px" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddDireccion}
                  disabled={saving}
                  style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#080808", background: saving ? "#999" : ORANGE, padding: "8px 18px", border: "none" }}
                >
                  {saving ? "Guardando..." : "Agregar dirección"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista */}
      {loading ? (
        <p style={{ fontFamily: MONO, fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
          Cargando direcciones...
        </p>
      ) : direcciones.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-12 gap-3"
          style={{ border: "1px dashed rgba(255,255,255,0.07)" }}
        >
          <MapPin size={28} style={{ color: "rgba(255,90,0,0.25)" }} />
          <p style={{ fontFamily: MONO, fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
            No tenés direcciones cargadas
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {direcciones.map((d) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                padding: "14px 18px",
                border: d.es_principal
                  ? "1px solid rgba(255,90,0,0.3)"
                  : "1px solid rgba(255,255,255,0.06)",
                background: d.es_principal ? "rgba(255,90,0,0.04)" : "rgba(255,255,255,0.02)",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <MapPin size={15} style={{ color: d.es_principal ? ORANGE : "rgba(255,255,255,0.3)", marginTop: 2, flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {d.alias && (
                    <span style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,90,0,0.6)" }}>
                      {d.alias}
                    </span>
                  )}
                  {d.es_principal && (
                    <span style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: ORANGE, background: "rgba(255,90,0,0.12)", padding: "1px 6px" }}>
                      Principal
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: MONO, fontSize: "12px", color: "rgba(255,255,255,0.7)", letterSpacing: "0.02em" }}>
                  {d.linea1}{d.linea2 ? `, ${d.linea2}` : ""}
                </p>
                <p style={{ fontFamily: MONO, fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.02em", marginTop: 2 }}>
                  {d.ciudad}{d.provincia ? `, ${d.provincia}` : ""}{d.codigo_postal ? ` (${d.codigo_postal})` : ""}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sección: Mis Pedidos ─────────────────────────────────────────────────────
function PedidosSection() {
  const [pedidos, setPedidos]   = useState<PedidoResponse[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getMisPedidos()
      .then(setPedidos)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h3
        style={{
          fontFamily: CORMORANT,
          fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
          color: "rgba(255,255,255,0.85)",
          fontWeight: 600,
          marginBottom: "1.5rem",
        }}
      >
        Mis Pedidos
      </h3>

      {loading ? (
        <p style={{ fontFamily: MONO, fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
          Cargando pedidos...
        </p>
      ) : pedidos.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-12 gap-3"
          style={{ border: "1px dashed rgba(255,255,255,0.07)" }}
        >
          <Package size={28} style={{ color: "rgba(255,90,0,0.25)" }} />
          <p style={{ fontFamily: MONO, fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
            Todavía no realizaste ningún pedido
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {[...pedidos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((p) => {
            const badge = ESTADO_BADGE[p.estado_codigo] ?? { label: p.estado_codigo, color: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.05)" };
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  padding: "14px 18px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.02)",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <ShoppingBag size={15} style={{ color: "rgba(255,90,0,0.4)", flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.55)" }}>
                      #{p.id.toString().padStart(4, "0")}
                    </span>
                    <span
                      style={{
                        fontFamily: MONO, fontSize: "9px", letterSpacing: "0.25em",
                        textTransform: "uppercase", color: badge.color,
                        background: badge.bg, padding: "2px 8px",
                      }}
                    >
                      {badge.label}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>
                      {formatDate(p.created_at)}
                    </span>
                  </div>
                  <p style={{ fontFamily: MONO, fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: 3, letterSpacing: "0.02em" }}>
                    {p.detalles.length} {p.detalles.length === 1 ? "producto" : "productos"}
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: CORMORANT, fontSize: "1.1rem", fontWeight: 600,
                    color: "rgba(255,255,255,0.75)", letterSpacing: "0.02em", flexShrink: 0,
                  }}
                >
                  {formatCurrency(p.total)}
                </span>
                <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "datos",       label: "Datos Personales", Icon: User       },
  { id: "direcciones", label: "Mis Direcciones",  Icon: MapPin     },
  { id: "pedidos",     label: "Mis Pedidos",       Icon: ShoppingBag },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export function ProfilePage() {
  const { user } = useAuth();
  const [perfil, setPerfil]   = useState<UsuarioPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("datos");

  const loadPerfil = useCallback(async () => {
    try {
      const data = await getMiPerfil();
      setPerfil(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPerfil(); }, [loadPerfil]);

  const initials = perfil
    ? getInitials(perfil.nombre, perfil.apellido)
    : user?.nombre?.[0]?.toUpperCase() ?? "?";

  const rolLabel = perfil?.roles?.[0] ?? user?.rol ?? "—";

  return (
    <div style={{ background: "#080808", minHeight: "100vh", paddingTop: "7rem" }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        className="px-8 md:px-16 pb-10"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-6"
        >
          {/* Avatar */}
          <div
            style={{
              width: 64, height: 64,
              border: `1px solid rgba(255,90,0,0.3)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,90,0,0.06)",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: CORMORANT, fontSize: "1.6rem", fontWeight: 700,
                color: "rgba(255,90,0,0.8)", letterSpacing: "0.02em",
              }}
            >
              {initials}
            </span>
          </div>

          <div>
            {loading ? (
              <p style={{ fontFamily: MONO, fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em" }}>
                Cargando perfil...
              </p>
            ) : (
              <>
                <h1
                  style={{
                    fontFamily: CORMORANT,
                    fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
                    fontWeight: 700, color: "#F0EBE1",
                    letterSpacing: "-0.01em",
                    lineHeight: 1,
                  }}
                >
                  {perfil?.nombre ?? user?.nombre}{perfil?.apellido ? ` ${perfil.apellido}` : ""}
                </h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <span
                    style={{
                      fontFamily: MONO, fontSize: "9px", letterSpacing: "0.35em",
                      textTransform: "uppercase", color: ORANGE,
                      background: "rgba(255,90,0,0.1)", padding: "2px 8px",
                    }}
                  >
                    {rolLabel}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>
                    {perfil?.email ?? user?.email}
                  </span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div
        className="px-8 md:px-16 pt-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex gap-0">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                fontFamily: MONO,
                fontSize: "10px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                padding: "16px 20px",
                color: activeTab === id ? ORANGE : "rgba(255,255,255,0.3)",
                borderBottom: activeTab === id ? `1px solid ${ORANGE}` : "1px solid transparent",
                background: "transparent",
                border: "none",
                borderBottomStyle: "solid",
                borderBottomWidth: "1px",
                borderBottomColor: activeTab === id ? ORANGE : "transparent",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { if (activeTab !== id) e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
              onMouseLeave={(e) => { if (activeTab !== id) e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenido de la tab activa ────────────────────────────────────── */}
      <div className="px-8 md:px-16 py-10 max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "datos" && perfil && (
              <DatosPersonalesSection perfil={perfil} onUpdate={setPerfil} />
            )}
            {activeTab === "datos" && !perfil && !loading && (
              <p style={{ fontFamily: MONO, fontSize: "11px", color: "rgba(255,90,0,0.5)" }}>
                No se pudo cargar el perfil.
              </p>
            )}
            {activeTab === "direcciones" && <DireccionesSection />}
            {activeTab === "pedidos"     && <PedidosSection />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
