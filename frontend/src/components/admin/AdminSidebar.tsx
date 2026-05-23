import { NavLink, useNavigate } from "react-router";
import { LayoutDashboard, Package, LogOut, ChefHat, X, ArrowLeft, Tag, Users, ClipboardList, User } from "lucide-react";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { getCurrentUser } from "@/features/auth/services/authService";
import { useAuth } from "@/hooks/useAuth";

interface AdminSidebarProps {
  user: AuthUser;
  isOpen: boolean;
  onClose: () => void;
}

const ALL_NAV_ITEMS = [
  { to: "/home",         label: "Dashboard",  icon: LayoutDashboard, code: "01", roles: ["ADMIN", "ENCARGADO"] },
  { to: "/insumos",      label: "Insumos",    icon: Package,         code: "02", roles: ["ADMIN", "ENCARGADO"] },
  { to: "/categorias",   label: "Categorías", icon: Tag,             code: "03", roles: ["ADMIN", "ENCARGADO"] },
  { to: "/productos",    label: "Productos",  icon: ChefHat,         code: "05", roles: ["ADMIN", "ENCARGADO"] },
  { to: "/usuarios",     label: "Usuarios",   icon: Users,           code: "04", roles: ["ADMIN"] },
  { to: "/pedidos",      label: "Pedidos",    icon: ClipboardList,   code: "06", roles: ["ADMIN", "ENCARGADO", "CAJERO", "COCINERO"] },
  { to: "/perfil-admin", label: "Mi Perfil",  icon: User,            code: "07", roles: ["ADMIN", "ENCARGADO"] },
];


export function AdminSidebar({ user, isOpen, onClose }: AdminSidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentUser = getCurrentUser();
  const NAV_ITEMS = ALL_NAV_ITEMS.filter(
    (item) => !currentUser || item.roles.includes(currentUser.rol)
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-56 flex flex-col transform transition-transform duration-300 ease-out md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "var(--tfs-sidebar-bg)",
          borderRight: "1px solid var(--tfs-border-subtle)",
        }}
      >
        {/* ── Brand ─────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-5"
          style={{ borderBottom: "1px solid var(--tfs-border-subtle)" }}
        >
          <div className="flex items-center gap-3">
            {/* Monogram box */}
            <div
              className="w-7 h-7 flex items-center justify-center flex-shrink-0"
              style={{ background: "#FF5A00" }}
            >
              <ChefHat size={13} className="text-white" />
            </div>
            <div>
              <p
                className="text-[10px] font-bold tracking-[0.3em] uppercase leading-none"
                style={{ color: "var(--tfs-text-primary)" }}
              >
                The Food Store
              </p>
              <p
                className="text-[9px] mt-0.5 tracking-widest uppercase"
                style={{ color: "var(--tfs-text-muted)", fontFamily: "'Space Mono', monospace" }}
              >
                Gestión
              </p>
            </div>
          </div>
          <button
            className="md:hidden transition-colors"
            style={{ color: "var(--tfs-text-muted)" }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── User card ─────────────────────────────────────────────── */}
        <div
          className="mx-4 my-4 p-3 rounded"
          style={{
            background: "rgba(255,90,0,0.06)",
            border: "1px solid rgba(255,90,0,0.12)",
          }}
        >
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div
              className="w-7 h-7 flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{
                background: "rgba(255,90,0,0.15)",
                border: "1px solid rgba(255,90,0,0.25)",
                color: "#FF5A00",
              }}
            >
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p
                className="text-xs font-semibold truncate"
                style={{ color: "var(--tfs-text-primary)" }}
              >
                {user.nombre}
              </p>
              <p
                className="text-[9px] truncate tracking-[0.2em] uppercase"
                style={{ color: "rgba(255,90,0,0.55)", fontFamily: "'Space Mono', monospace" }}
              >
                {user.rol}
              </p>
            </div>
          </div>
        </div>

        {/* ── Section label ─────────────────────────────────────────── */}
        <p
          className="px-5 pb-2 text-[8px] tracking-[0.5em] uppercase"
          style={{ color: "var(--tfs-text-subtle)", fontFamily: "'Space Mono', monospace" }}
        >
          Módulos
        </p>

        {/* ── Navigation ────────────────────────────────────────────── */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, code }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition-all duration-200 relative ${
                  isActive ? "active-nav-item" : ""
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "#FF5A00" : "var(--tfs-text-muted)",
                background: isActive ? "rgba(255,90,0,0.08)" : "transparent",
                borderLeft: isActive
                  ? "2px solid #FF5A00"
                  : "2px solid transparent",
                paddingLeft: "0.875rem",
              })}
            >
              <Icon size={14} />
              <span className="flex-1">{label}</span>
              <span
                className="text-[8px] tracking-widest font-mono"
                style={{ color: "var(--tfs-text-subtle)" }}
              >
                {code}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* ── Footer / Logout ───────────────────────────────────────── */}
        <div
          className="p-3 space-y-0.5"
          style={{ borderTop: "1px solid var(--tfs-border-subtle)" }}
        >
          {/* Volver al sitio */}
          <NavLink
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition-all duration-200"
            style={{ color: "var(--tfs-text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--tfs-text-primary)";
              e.currentTarget.style.background = "var(--tfs-input-bg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--tfs-text-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <ArrowLeft size={13} />
            <span>Volver al sitio</span>
          </NavLink>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition-all duration-200"
            style={{ color: "var(--tfs-text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#C1121F";
              e.currentTarget.style.background = "rgba(193,18,31,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--tfs-text-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={14} />
            <span>Cerrar sesión</span>
          </button>

          <p
            className="text-center text-[8px] tracking-widest uppercase mt-3"
            style={{ color: "var(--tfs-text-subtle)", fontFamily: "'Space Mono', monospace" }}
          >
            TFS · 2026
          </p>
        </div>
      </aside>
    </>
  );
}
