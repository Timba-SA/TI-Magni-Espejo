import { NavLink, useNavigate } from "react-router";
import { LayoutDashboard, Package, LogOut, ChefHat, X, ArrowLeft, Tag, Users } from "lucide-react";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { logout, getCurrentUser } from "@/features/auth/services/authService";

interface AdminSidebarProps {
  user: AuthUser;
  isOpen: boolean;
  onClose: () => void;
}

const ALL_NAV_ITEMS = [
  { to: "/home",       label: "Dashboard",  icon: LayoutDashboard, code: "01", roles: ["Admin", "Encargado"] },
  { to: "/insumos",    label: "Insumos",    icon: Package,         code: "02", roles: ["Admin", "Encargado"] },
  { to: "/categorias", label: "Categorías", icon: Tag,             code: "03", roles: ["Admin", "Encargado"] },
  { to: "/usuarios",   label: "Usuarios",   icon: Users,           code: "04", roles: ["Admin"] },
];


export function AdminSidebar({ user, isOpen, onClose }: AdminSidebarProps) {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const NAV_ITEMS = ALL_NAV_ITEMS.filter(
    (item) => !currentUser || item.roles.includes(currentUser.rol)
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
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
          background: "linear-gradient(180deg, #0F0F0F 0%, #0B0B0B 100%)",
          borderRight: "1px solid rgba(248,248,248,0.05)",
        }}
      >
        {/* ── Brand ─────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-5"
          style={{ borderBottom: "1px solid rgba(248,248,248,0.04)" }}
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
                style={{ color: "#E8E8E8" }}
              >
                The Food Store
              </p>
              <p
                className="text-[9px] mt-0.5 tracking-widest uppercase"
                style={{ color: "rgba(248,248,248,0.28)", fontFamily: "'Space Mono', monospace" }}
              >
                Gestión
              </p>
            </div>
          </div>
          <button
            className="md:hidden transition-colors"
            style={{ color: "rgba(248,248,248,0.3)" }}
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
                style={{ color: "#E8E8E8" }}
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
          style={{ color: "rgba(248,248,248,0.2)", fontFamily: "'Space Mono', monospace" }}
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
                color: isActive ? "#FF5A00" : "rgba(248,248,248,0.45)",
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
                style={{ color: "rgba(248,248,248,0.15)" }}
              >
                {code}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* ── Footer / Logout ───────────────────────────────────────── */}
        <div
          className="p-3 space-y-0.5"
          style={{ borderTop: "1px solid rgba(248,248,248,0.04)" }}
        >
          {/* Volver al sitio */}
          <NavLink
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition-all duration-200"
            style={{ color: "rgba(248,248,248,0.3)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(248,248,248,0.7)";
              e.currentTarget.style.background = "rgba(248,248,248,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(248,248,248,0.3)";
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
            style={{ color: "rgba(248,248,248,0.3)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#C1121F";
              e.currentTarget.style.background = "rgba(193,18,31,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(248,248,248,0.3)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={14} />
            <span>Cerrar sesión</span>
          </button>

          <p
            className="text-center text-[8px] tracking-widest uppercase mt-3"
            style={{ color: "rgba(248,248,248,0.1)", fontFamily: "'Space Mono', monospace" }}
          >
            TFS · 2026
          </p>
        </div>
      </aside>
    </>
  );
}
