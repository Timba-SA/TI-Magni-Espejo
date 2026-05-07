import { useState, useEffect } from "react";
import { Outlet, Navigate, useNavigate } from "react-router";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  getCurrentUser,
  getSessionRemainingMs,
  logout,
} from "@/features/auth/services/authService";

const CHECK_INTERVAL_MS = 60_000; // chequea cada 1 minuto

export function AdminLayout() {
  const user = getCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // ─── Auto-logout al expirar la sesión ──────────────────────────────────────
  useEffect(() => {
    // Si no hay sesión al montar, redirige de inmediato
    if (!getCurrentUser()) {
      navigate("/login", { replace: true });
      return;
    }

    const interval = setInterval(() => {
      if (getSessionRemainingMs() <= 0) {
        logout();
        navigate("/login", { replace: true });
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [navigate]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#0B0B0B] overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
