import { useState, useEffect } from "react";
import { Users, ShieldCheck, User, ChevronDown, Ban, CheckCircle } from "lucide-react";
import type { AppUser } from "@/features/users/types/user.types";
import { getUsers } from "@/features/users/services/usersService";
import { getCurrentUser } from "@/features/auth/services/authService";
import { fetchApi } from "@/shared/api/apiClient";

function SectionLabel({ label, code }: { label: string; code: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <span
        className="text-[8px] tracking-[0.5em] uppercase flex-shrink-0"
        style={{ color: "rgba(255,90,0,0.55)", fontFamily: "'Space Mono', monospace" }}
      >
        {code} — {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(248,248,248,0.04)" }} />
    </div>
  );
}

const ROL_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  Admin:     { color: "#FF5A00",                bg: "rgba(255,90,0,0.1)",          border: "rgba(255,90,0,0.2)" },
  Encargado: { color: "rgba(248,248,248,0.6)",  bg: "rgba(248,248,248,0.05)",      border: "rgba(248,248,248,0.1)" },
  Cliente:   { color: "rgba(52,211,153,0.8)",   bg: "rgba(52,211,153,0.08)",       border: "rgba(52,211,153,0.2)" },
};

const ROLES = ["Admin", "Encargado", "Cliente"] as const;

export function UsuariosPage() {
  const [users, setUsers]     = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.rol === "Admin";

  const fetchUsers = () => {
    setLoading(true);
    getUsers()
      .then(setUsers)
      .catch(() => setError("No se pudieron cargar los usuarios."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRolChange = async (userId: number, newRol: string) => {
    setUpdating(userId);
    try {
      await fetchApi(`/auth/users/${userId}/rol`, {
        method: "PATCH",
        body: JSON.stringify({ rol: newRol }),
      });
      fetchUsers(); // Recarga la lista
    } catch {
      setError("No se pudo actualizar el rol.");
    } finally {
      setUpdating(null);
    }
  };

  const handleEstadoChange = async (userId: number, activo: boolean) => {
    setUpdating(userId);
    try {
      await fetchApi(`/auth/users/${userId}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ activo }),
      });
      fetchUsers();
    } catch {
      setError("No se pudo actualizar el estado.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-10 max-w-4xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3" style={{ fontFamily: "'Space Mono', monospace" }}>
          <Users size={10} style={{ color: "rgba(255,90,0,0.5)" }} />
          <span className="text-[9px] tracking-[0.45em] uppercase" style={{ color: "rgba(248,248,248,0.2)" }}>
            Panel de gestión
          </span>
        </div>
        <h2
          className="leading-none mb-2"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 300, letterSpacing: "-0.02em", color: "#E8E8E8" }}
        >
          Usuarios <span style={{ color: "#FF5A00", fontWeight: 600 }}>registrados</span>
        </h2>
        <p className="text-xs" style={{ color: "rgba(248,248,248,0.28)", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em" }}>
          {users.length} usuario{users.length !== 1 ? "s" : ""} en el sistema
          {isAdmin && " · Podés cambiar roles directamente desde la tabla"}
        </p>
        <div className="mt-5" style={{ height: 1, background: "linear-gradient(to right, rgba(255,90,0,0.4), rgba(255,90,0,0.05), transparent)" }} />
      </div>

      {/* ── Tabla ───────────────────────────────────────────────────── */}
      <div>
        <SectionLabel label="Listado de usuarios" code="01" />

        {error && <p className="text-xs mb-4" style={{ color: "#C1121F" }}>{error}</p>}

        {loading ? (
          <p className="text-xs font-mono tracking-widest" style={{ color: "rgba(248,248,248,0.3)" }}>Cargando usuarios...</p>
        ) : users.length === 0 ? (
          <div style={{ background: "#0F0F0F", border: "1px solid rgba(248,248,248,0.05)", padding: "2rem" }} className="text-center">
            <p className="text-xs font-mono tracking-widest" style={{ color: "rgba(248,248,248,0.2)" }}>No hay usuarios registrados.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* Header row */}
            <div
              className="grid gap-4 px-4 py-2 text-[9px] tracking-[0.3em] uppercase font-mono"
              style={{ color: "rgba(248,248,248,0.2)", gridTemplateColumns: "auto 1fr 1fr auto auto" }}
            >
              <span>#</span>
              <span>Nombre / Usuario</span>
              <span>Email</span>
              <span>Rol</span>
              <span>Estado</span>
            </div>

            {users.map((u) => {
              const rolStyle = ROL_STYLES[u.rol] ?? ROL_STYLES["Encargado"];
              const isSelf = currentUser?.id === u.id;

              return (
                <div
                  key={u.id}
                  className="grid gap-4 items-center px-4 py-3 transition-all duration-150"
                  style={{ background: "#0F0F0F", border: "1px solid rgba(248,248,248,0.05)", gridTemplateColumns: "auto 1fr 1fr auto auto" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,90,0,0.12)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(248,248,248,0.05)"; }}
                >
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: rolStyle.bg, border: `1px solid ${rolStyle.border}`, color: rolStyle.color, opacity: u.activo ? 1 : 0.4 }}
                  >
                    {u.nombre.charAt(0).toUpperCase()}
                  </div>

                  {/* Nombre / username */}
                  <div className="min-w-0" style={{ opacity: u.activo ? 1 : 0.4 }}>
                    <p className="text-sm font-medium truncate flex items-center gap-2" style={{ color: u.activo ? "#E8E8E8" : "#999" }}>
                      {u.nombre}
                      {!u.activo && (
                        <span className="text-[8px] font-mono tracking-widest px-1.5 py-0.5" style={{ color: "#C1121F", background: "rgba(193,18,31,0.1)", border: "1px solid rgba(193,18,31,0.2)" }}>
                          suspendido
                        </span>
                      )}
                      {isSelf && (
                        <span className="text-[8px] font-mono tracking-widest px-1.5 py-0.5" style={{ color: "#FF5A00", background: "rgba(255,90,0,0.08)", border: "1px solid rgba(255,90,0,0.15)" }}>
                          vos
                        </span>
                      )}
                    </p>
                    <p className="text-xs font-mono truncate" style={{ color: "rgba(248,248,248,0.3)" }}>@{u.username}</p>
                  </div>

                  {/* Email */}
                  <p className="text-xs truncate" style={{ color: "rgba(248,248,248,0.45)", opacity: u.activo ? 1 : 0.4 }}>{u.email}</p>

                  {/* Rol — Admin puede cambiar, resto es solo lectura */}
                  {isAdmin && !isSelf ? (
                    <div className="relative flex-shrink-0">
                      <select
                        value={u.rol}
                        disabled={updating === u.id || !u.activo}
                        onChange={(e) => handleRolChange(u.id, e.target.value)}
                        className="appearance-none pr-7 pl-3 py-1.5 text-[10px] font-mono tracking-wider rounded transition-all cursor-pointer outline-none"
                        style={{
                          background: rolStyle.bg,
                          border: `1px solid ${rolStyle.border}`,
                          color: rolStyle.color,
                          opacity: (updating === u.id || !u.activo) ? 0.5 : 1,
                        }}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r} style={{ background: "#111", color: "#E8E8E8" }}>{r}</option>
                        ))}
                      </select>
                      <ChevronDown
                        size={10}
                        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: rolStyle.color }}
                      />
                    </div>
                  ) : (
                    <span
                      className="text-[9px] font-mono tracking-wider px-2.5 py-1 uppercase flex-shrink-0 flex items-center gap-1.5"
                      style={{ color: rolStyle.color, background: rolStyle.bg, border: `1px solid ${rolStyle.border}`, opacity: !u.activo ? 0.5 : 1 }}
                    >
                      {u.rol === "Admin" ? <ShieldCheck size={10} /> : <User size={10} />}
                      {u.rol}
                    </span>
                  )}

                  {/* Acciones (Estado) */}
                  <div className="flex justify-end min-w-[30px]">
                    {isAdmin && !isSelf && (
                      <button
                        onClick={() => handleEstadoChange(u.id, !u.activo)}
                        disabled={updating === u.id}
                        title={u.activo ? "Suspender usuario" : "Reactivar usuario"}
                        className="p-1.5 rounded transition-all"
                        style={{
                          color: u.activo ? "rgba(248,248,248,0.4)" : "#34D399",
                          background: u.activo ? "transparent" : "rgba(52,211,153,0.1)",
                          opacity: updating === u.id ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (u.activo) {
                            e.currentTarget.style.color = "#C1121F";
                            e.currentTarget.style.background = "rgba(193,18,31,0.1)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (u.activo) {
                            e.currentTarget.style.color = "rgba(248,248,248,0.4)";
                            e.currentTarget.style.background = "transparent";
                          }
                        }}
                      >
                        {u.activo ? <Ban size={14} /> : <CheckCircle size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div className="pt-4" style={{ borderTop: "1px solid rgba(248,248,248,0.03)" }}>
        <p className="text-[9px] text-center tracking-[0.4em] uppercase" style={{ color: "rgba(248,248,248,0.1)", fontFamily: "'Space Mono', monospace" }}>
          The Food Store · Sistema de gestión interna · 2026
        </p>
      </div>
    </div>
  );
}
