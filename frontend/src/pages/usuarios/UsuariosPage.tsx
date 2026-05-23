import { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Download, 
  Trash2, 
  RotateCcw, 
  UserPlus, 
  Filter, 
  ShieldAlert 
} from "lucide-react";
import type { 
  UsuarioDetailResponse, 
  UsuarioCreateRequest 
} from "@/features/users/types/user.types";
import { 
  getUsuarios, 
  toggleActive, 
  updateUserRoles, 
  exportarUsuarios,
  crearUsuario,
  eliminarUsuario,
  restaurarUsuario
} from "@/features/users/services/usersService";
import { BackToDashboard } from "@/components/admin/BackToDashboard";
import { useAuth } from "@/hooks/useAuth";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { UsuarioCreateModal } from "./components/UsuarioCreateModal";

// ── Helpers ────────────────────────────────────────────────────────────────────

function SectionLabel({ label, code }: { label: string; code: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <span
        className="text-[8px] tracking-[0.5em] uppercase flex-shrink-0"
        style={{ color: "rgba(255,90,0,0.55)", fontFamily: "'Space Mono', monospace" }}
      >
        {code} — {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--tfs-divider)" }} />
    </div>
  );
}

// Mapa de estilos por rol — alineado con ROL_PRIORITY del backend
const ROL_STYLES: Record<string, { color: string; bg: string; border: string; label: string }> = {
  ADMIN:     { color: "#FF5A00",               bg: "rgba(255,90,0,0.1)",      border: "rgba(255,90,0,0.25)",      label: "Admin" },
  ENCARGADO: { color: "rgba(251,191,36,0.9)",  bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.25)",   label: "Encargado" },
  CAJERO:    { color: "rgba(167,139,250,0.9)", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)",  label: "Cajero" },
  COCINERO:  { color: "rgba(249,115,22,0.9)",  bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.25)",   label: "Cocinero" },
  STOCK:     { color: "rgba(56,189,248,0.9)",  bg: "rgba(56,189,248,0.08)",  border: "rgba(56,189,248,0.25)",   label: "Stock" },
  PEDIDOS:   { color: "rgba(147,197,253,0.9)", bg: "rgba(147,197,253,0.08)", border: "rgba(147,197,253,0.25)",  label: "Pedidos" },
  CLIENT:    { color: "rgba(52,211,153,0.85)", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)",    label: "Cliente" },
};

// ── Página principal ───────────────────────────────────────────────────────────

export function UsuariosPage() {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioDetailResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Acciones en curso
  const [toggling, setToggling] = useState<number | null>(null);
  const [updatingRole, setUpdatingRole] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [restoring, setRestoring] = useState<number | null>(null);

  // Filtros
  const [rolFiltro, setRolFiltro] = useState<string>("");
  const [includeDeleted, setIncludeDeleted] = useState<boolean>(false);

  // Modal Alta
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Popover de edición de roles
  const [rolePickerUserId, setRolePickerUserId] = useState<number | null>(null);
  const [pendingRoles, setPendingRoles] = useState<string[]>([]);

  const ALL_ROLES = ["ADMIN", "ENCARGADO", "CAJERO", "COCINERO", "STOCK", "PEDIDOS", "CLIENT"] as const;

  const openRolePicker = (id: number, currentRoles: string[]) => {
    setRolePickerUserId(id);
    setPendingRoles([...currentRoles]);
  };

  const handleRoleToggle = (rol: string) => {
    setPendingRoles((prev) =>
      prev.includes(rol)
        ? prev.length > 1 ? prev.filter((r) => r !== rol) : prev  // al menos 1 rol
        : [...prev, rol]
    );
  };

  const handleRoleSave = async (id: number) => {
    setUpdatingRole(id);
    setRolePickerUserId(null);
    try {
      const updated = await updateUserRoles(id, pendingRoles);
      setUsuarios((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar los roles.");
    } finally {
      setUpdatingRole(null);
    }
  };

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsuarios(skip, limit, rolFiltro || undefined, includeDeleted);
      setUsuarios(data.items);
      setTotal(data.total);
    } catch {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, [skip, limit, rolFiltro, includeDeleted]);

  useEffect(() => { 
    fetchUsuarios(); 
  }, [fetchUsuarios]);

  const handleToggle = async (id: number) => {
    setToggling(id);
    try {
      const updated = await toggleActive(id);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cambiar el estado del usuario.");
    } finally {
      setToggling(null);
    }
  };



  const handleSoftDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que querés archivar (soft delete) a este usuario?")) {
      return;
    }
    setDeleting(id);
    try {
      await eliminarUsuario(id);
      // Recargamos el listado para reflejar el cambio (si includeDeleted es false desaparece, si es true cambia opacidad)
      await fetchUsuarios();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al archivar el usuario.");
    } finally {
      setDeleting(null);
    }
  };

  const handleRestore = async (id: number) => {
    setRestoring(id);
    try {
      const restored = await restaurarUsuario(id);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === restored.id ? restored : u))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al restaurar el usuario.");
    } finally {
      setRestoring(null);
    }
  };

  const handleCreateUser = async (data: UsuarioCreateRequest) => {
    await crearUsuario(data);
    await fetchUsuarios();
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportarUsuarios();
    } catch {
      setError("Error al exportar usuarios a Excel.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="min-h-screen p-8"
      style={{ background: "var(--tfs-bg-primary)", color: "var(--tfs-text-primary)" }}
    >
      <BackToDashboard />

      {/* Header */}
      <div className="max-w-5xl mx-auto mt-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users size={18} style={{ color: "#FF5A00" }} />
              <span
                className="text-[9px] tracking-[0.5em] uppercase"
                style={{ color: "rgba(255,90,0,0.6)", fontFamily: "'Space Mono', monospace" }}
              >
                Panel Admin
              </span>
            </div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: "var(--tfs-text-heading)", fontFamily: "'Playfair Display', serif" }}
            >
              Gestión de Usuarios
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--tfs-text-muted)" }}>
              Administrá accesos, asigná múltiples roles, habilitá suspensiones y gestioná bajas lógicas.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold px-4 py-2.5 rounded transition-all duration-200 border"
              style={{ 
                background: "var(--tfs-card-bg)", 
                color: "var(--tfs-text-heading)", 
                borderColor: "var(--tfs-border-subtle)",
                fontFamily: "'Space Mono', monospace"
              }}
              onMouseEnter={(e) => { if(!exporting) e.currentTarget.style.borderColor = "#FF5A00"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--tfs-border-subtle)"; }}
            >
              <Download size={13} />
              {exporting ? "Exportando..." : "Exportar Excel"}
            </button>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold px-4 py-2.5 rounded transition-all duration-200 border"
              style={{ 
                background: "rgba(255,90,0,0.15)", 
                color: "#FF5A00", 
                borderColor: "rgba(255,90,0,0.4)",
                fontFamily: "'Space Mono', monospace"
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.backgroundColor = "rgba(255,90,0,0.25)"; 
                e.currentTarget.style.borderColor = "#FF5A00";
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.backgroundColor = "rgba(255,90,0,0.15)";
                e.currentTarget.style.borderColor = "rgba(255,90,0,0.4)";
              }}
            >
              <UserPlus size={13} />
              Agregar Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-5xl mx-auto">
        
        {/* Barra de Filtros Premium */}
        <div 
          className="mb-6 p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{ 
            backgroundColor: "var(--tfs-card-bg)", 
            borderColor: "var(--tfs-border-subtle)" 
          }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={13} style={{ color: "#FF5A00" }} />
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold" style={{ fontFamily: "'Space Mono', monospace" }}>
                Filtrar:
              </span>
            </div>
            
            {/* Dropdown por Rol */}
            <div className="relative">
              <select
                value={rolFiltro}
                onChange={(e) => {
                  setRolFiltro(e.target.value);
                  setSkip(0);
                }}
                className="appearance-none rounded border px-3 py-1.5 pr-8 text-xs text-white focus:outline-none transition-all cursor-pointer"
                style={{
                  background: "rgba(20, 20, 20, 0.4)",
                  borderColor: "var(--tfs-border-subtle)",
                }}
                onFocus={(e) => e.target.style.borderColor = "#FF5A00"}
                onBlur={(e) => e.target.style.borderColor = "var(--tfs-border-subtle)"}
              >
                <option value="" style={{ background: "#171717" }}>Todos los roles</option>
                <option value="ADMIN"     style={{ background: "#171717" }}>Administrador (ADMIN)</option>
                <option value="ENCARGADO" style={{ background: "#171717" }}>Encargado (ENCARGADO)</option>
                <option value="CAJERO"    style={{ background: "#171717" }}>Cajero (CAJERO)</option>
                <option value="COCINERO"  style={{ background: "#171717" }}>Cocinero (COCINERO)</option>
                <option value="STOCK"     style={{ background: "#171717" }}>Gestor de Stock (STOCK)</option>
                <option value="PEDIDOS"   style={{ background: "#171717" }}>Gestor de Pedidos (PEDIDOS)</option>
                <option value="CLIENT"    style={{ background: "#171717" }}>Cliente (CLIENT)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-500">
                ▼
              </div>
            </div>
          </div>

          {/* Toggle de Archivados */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => {
                  setIncludeDeleted(e.target.checked);
                  setSkip(0);
                }}
                className="sr-only peer"
              />
              <div 
                className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-[#FF5A00] after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-orange-950/40 border peer-checked:border-orange-500/50"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              />
              <span className="ml-2 text-xs text-zinc-300 select-none">
                Mostrar eliminados lógicamente (Archivados)
              </span>
            </label>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <SectionLabel label="Listado" code="01" />
        </div>

        {loading && (
          <div className="text-center py-16" style={{ color: "var(--tfs-text-subtle)" }}>
            <p className="text-[10px] tracking-[0.4em] uppercase" style={{ fontFamily: "'Space Mono', monospace" }}>
              Cargando usuarios…
            </p>
          </div>
        )}

        {error && (
          <div
            className="rounded px-4 py-3 text-sm mb-6 flex items-center gap-2.5"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgb(239,68,68)" }}
          >
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && (
          <div
            className="rounded overflow-hidden"
            style={{ border: "1px solid var(--tfs-border-subtle)" }}
          >
            {/* Table header */}
            <div
              className="grid grid-cols-[3rem_1fr_1fr_6rem_7rem_10rem_9rem] px-5 py-3 text-[9px] tracking-[0.4em] uppercase"
              style={{
                background: "var(--tfs-card-bg)",
                borderBottom: "1px solid var(--tfs-border-subtle)",
                color: "var(--tfs-text-subtle)",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              <span>#</span>
              <span>Usuario</span>
              <span>Email</span>
              <span className="text-center">Rol Principal</span>
              <span className="text-center">Estado</span>
              <span className="text-center">Fecha Anulación</span>
              <span className="text-center">Acciones</span>
            </div>

            {/* Rows */}
            {usuarios.length === 0 ? (
              <div className="text-center py-12" style={{ color: "var(--tfs-text-subtle)" }}>
                <p className="text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: "'Space Mono', monospace" }}>
                  No hay usuarios registrados que coincidan
                </p>
              </div>
            ) : (
              usuarios.map((u, i) => {
                const isSoftDeleted = !!u.deleted_at;
                const rolesArray = u.roles || [];
                // Prioridad alineada con ROL_PRIORITY del backend
                const ROL_ORDER = ["ADMIN", "ENCARGADO", "CAJERO", "COCINERO", "STOCK", "PEDIDOS", "CLIENT"];
                const primaryRole = ROL_ORDER.find((r) => rolesArray.includes(r)) ?? "CLIENT";
                
                return (
                  <div
                    key={u.id}
                    className="grid grid-cols-[3rem_1fr_1fr_6rem_7rem_10rem_9rem] px-5 py-4 items-center transition-all duration-200"
                    style={{
                      borderBottom: i < usuarios.length - 1 ? "1px solid var(--tfs-border-subtle)" : "none",
                      background: isSoftDeleted 
                        ? "rgba(20, 20, 20, 0.4)" 
                        : "var(--tfs-bg-primary)",
                      opacity: isSoftDeleted 
                        ? 0.45 
                        : u.is_active ? 1 : 0.65,
                    }}
                  >
                    {/* ID */}
                    <span className="text-xs font-mono" style={{ color: "var(--tfs-text-subtle)" }}>
                      {u.id}
                    </span>

                    {/* Nombre */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7.5 h-7.5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ 
                          background: isSoftDeleted 
                            ? "rgba(100,100,100,0.1)" 
                            : "rgba(255,90,0,0.12)", 
                          color: isSoftDeleted ? "#71717a" : "#FF5A00",
                          border: isSoftDeleted ? "1px solid rgba(100,100,100,0.2)" : "1px solid rgba(255,90,0,0.15)"
                        }}
                      >
                        {u.nombre[0]}{u.apellido[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">
                          {u.nombre} {u.apellido}
                        </span>
                        {u.celular && (
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {u.celular}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <span className="text-xs font-mono truncate text-zinc-400">
                      {u.email}
                    </span>

                    {/* Rol principal — click abre el editor de roles */}
                    <div className="flex justify-center relative">
                      <button
                        onClick={() => !isSoftDeleted && u.id !== currentUser?.id && openRolePicker(u.id, rolesArray)}
                        disabled={isSoftDeleted || updatingRole === u.id || u.id === currentUser?.id}
                        className="text-[9px] tracking-widest uppercase px-2 py-1 rounded transition-all font-semibold border"
                        style={{
                          color: ROL_STYLES[primaryRole]?.color ?? "var(--tfs-text-muted)",
                          background: ROL_STYLES[primaryRole]?.bg ?? "var(--tfs-card-bg)",
                          borderColor: ROL_STYLES[primaryRole]?.border ?? "var(--tfs-border-mid)",
                          cursor: isSoftDeleted || u.id === currentUser?.id ? "not-allowed" : "pointer",
                          opacity: updatingRole === u.id ? 0.5 : 1,
                        }}
                        title={
                          isSoftDeleted
                            ? "No se puede editar rol de usuario anulado"
                            : u.id === currentUser?.id
                              ? "No pods cambiar tu propio rol"
                              : "Editar roles"
                        }
                      >
                        {updatingRole === u.id ? "…" : (ROL_STYLES[primaryRole]?.label ?? primaryRole)}
                      </button>
                    </div>

                    {/* Estado badge */}
                    <div className="flex justify-center">
                      {isSoftDeleted ? (
                        <span
                          className="text-[8px] tracking-widest uppercase px-2 py-1 rounded font-bold"
                          style={{ color: "#71717a", background: "rgba(100,100,100,0.1)", border: "1px solid rgba(100,100,100,0.25)" }}
                        >
                          Anulado
                        </span>
                      ) : (
                        <span
                          className="text-[8px] tracking-widest uppercase px-2 py-1 rounded font-semibold"
                          style={
                            u.is_active
                              ? { color: "rgba(52,211,153,0.9)", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)" }
                              : { color: "rgba(239,68,68,0.8)", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.18)" }
                          }
                        >
                          {u.is_active ? "Activo" : "Suspendido"}
                        </span>
                      )}
                    </div>

                    {/* Fecha de anulación */}
                    <div className="flex flex-col items-center justify-center">
                      {isSoftDeleted && u.deleted_at ? (
                        <>
                          <span
                            className="text-[9px] font-mono font-semibold"
                            style={{ color: "rgba(239,68,68,0.75)" }}
                          >
                            {new Date(u.deleted_at).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                          <span
                            className="text-[8px] font-mono"
                            style={{ color: "rgba(239,68,68,0.45)" }}
                          >
                            {new Date(u.deleted_at).toLocaleTimeString("es-AR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </>
                      ) : (
                        <span
                          className="text-[9px] font-mono"
                          style={{ color: "var(--tfs-text-subtle)" }}
                        >
                          —
                        </span>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-center gap-2">
                      {isSoftDeleted ? (
                        /* Botón para Restaurar si está eliminado lógicamente */
                        <button
                          onClick={() => handleRestore(u.id)}
                          disabled={restoring === u.id}
                          className="flex items-center gap-1 text-[8px] tracking-widest uppercase px-2.5 py-1.5 rounded transition-all font-semibold border"
                          style={{
                            fontFamily: "'Space Mono', monospace",
                            borderColor: "rgba(52,211,153,0.3)",
                            background: "rgba(52,211,153,0.05)",
                            color: "rgba(52,211,153,0.9)",
                            cursor: restoring === u.id ? "not-allowed" : "pointer",
                          }}
                          onMouseEnter={(e) => {
                            if (restoring !== u.id) {
                              e.currentTarget.style.background = "rgba(52,211,153,0.12)";
                              e.currentTarget.style.borderColor = "rgba(52,211,153,0.6)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(52,211,153,0.05)";
                            e.currentTarget.style.borderColor = "rgba(52,211,153,0.3)";
                          }}
                          title="Restaurar usuario"
                        >
                          <RotateCcw size={10} />
                          Restaurar
                        </button>
                      ) : (
                        /* Botones normales de Suspender + Soft Delete */
                        <>
                          <button
                            onClick={() => handleToggle(u.id)}
                            disabled={toggling === u.id}
                            className="flex items-center justify-center p-1.5 rounded border transition-all"
                            style={{
                              borderColor: "var(--tfs-border-subtle)",
                              background: "var(--tfs-card-bg)",
                              color: u.is_active ? "var(--tfs-text-muted)" : "#FF5A00",
                              cursor: toggling === u.id ? "not-allowed" : "pointer",
                            }}
                            title={u.is_active ? "Suspender usuario" : "Activar usuario"}
                          >
                            {u.is_active ? <UserX size={12} /> : <UserCheck size={12} />}
                          </button>

                          <button
                            onClick={() => handleSoftDelete(u.id)}
                            disabled={deleting === u.id || u.id === currentUser?.id}
                            className="flex items-center justify-center p-1.5 rounded border transition-all"
                            style={{
                              borderColor: "rgba(239, 68, 68, 0.15)",
                              background: "rgba(239, 68, 68, 0.04)",
                              color: "rgba(239, 68, 68, 0.8)",
                              cursor: deleting === u.id || u.id === currentUser?.id ? "not-allowed" : "pointer",
                              opacity: u.id === currentUser?.id ? 0.35 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (u.id !== currentUser?.id) {
                                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
                                e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.15)";
                              e.currentTarget.style.background = "rgba(239, 68, 68, 0.04)";
                            }}
                            title={u.id === currentUser?.id ? "No puedes eliminar tu propia cuenta" : "Archivar usuario"}
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Paginación */}
            <div className="pt-4 pb-2">
              <DataTablePagination
                total={total}
                skip={skip}
                limit={limit}
                onPageChange={(newSkip) => setSkip(newSkip)}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setSkip(0);
                }}
              />
            </div>
          </div>
        )}

        {/* Roles legend */}
        {!loading && usuarios.length > 0 && (
          <div className="mt-6 flex items-center gap-4">
            <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: "var(--tfs-text-subtle)", fontFamily: "'Space Mono', monospace" }}>
              Leyenda
            </span>
            {Object.entries(ROL_STYLES).map(([rol, styles]) => (
              <span
                key={rol}
                className="text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-sm"
                style={{ color: styles.color, background: styles.bg, border: `1px solid ${styles.border}` }}
              >
                {rol}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Modal para agregar usuario */}
      <UsuarioCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateUser}
      />

      {/* Popover de edición de roles */}
      {rolePickerUserId !== null && (() => {
        const usuario = usuarios.find((u) => u.id === rolePickerUserId);
        if (!usuario) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setRolePickerUserId(null)}
            />
            {/* Panel */}
            <div
              className="relative w-full max-w-xs rounded-xl border p-5 shadow-2xl"
              style={{
                background: "rgba(23, 23, 23, 0.95)",
                backdropFilter: "blur(16px)",
                borderColor: "rgba(255, 90, 0, 0.2)",
                boxShadow: "0 20px 40px -15px rgba(0,0,0,0.8), 0 0 40px -10px rgba(255,90,0,0.1)",
              }}
            >
              {/* Header */}
              <div className="mb-4">
                <p className="text-[9px] tracking-[0.4em] uppercase mb-1" style={{ color: "rgba(255,90,0,0.6)", fontFamily: "'Space Mono', monospace" }}>
                  Editar roles
                </p>
                <p className="text-sm font-semibold text-white">
                  {usuario.nombre} {usuario.apellido}
                </p>
                <p className="text-[10px] font-mono text-zinc-500">{usuario.email}</p>
              </div>

              {/* Chips de roles */}
              <div className="flex flex-wrap gap-2 mb-5">
                {ALL_ROLES.map((rol) => {
                  const active = pendingRoles.includes(rol);
                  const style = ROL_STYLES[rol];
                  const isLast = active && pendingRoles.length === 1;
                  return (
                    <button
                      key={rol}
                      type="button"
                      onClick={() => handleRoleToggle(rol)}
                      disabled={isLast}
                      className="text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-full transition-all duration-150 border font-semibold"
                      style={{
                        backgroundColor: active ? style.bg : "transparent",
                        borderColor: active ? style.border : "rgba(255,255,255,0.08)",
                        color: active ? style.color : "rgba(255,255,255,0.3)",
                        cursor: isLast ? "not-allowed" : "pointer",
                      }}
                      title={isLast ? "Debe tener al menos un rol" : undefined}
                    >
                      {style.label}
                    </button>
                  );
                })}
              </div>

              {/* Acciones */}
              <div className="flex gap-2.5 justify-end">
                <button
                  onClick={() => setRolePickerUserId(null)}
                  className="px-3 py-1.5 rounded text-[10px] uppercase tracking-widest border transition-colors"
                  style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    color: "var(--tfs-text-muted)",
                    background: "transparent",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleRoleSave(rolePickerUserId)}
                  className="px-4 py-1.5 rounded text-[10px] uppercase tracking-widest border font-semibold transition-all"
                  style={{
                    backgroundColor: "rgba(255,90,0,0.15)",
                    borderColor: "rgba(255,90,0,0.4)",
                    color: "#FF5A00",
                  }}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
