import { Routes, Route, Navigate } from "react-router";
import { LandingPage } from "@/pages/public/LandingPage";
import { MenuPage } from "@/pages/public/MenuPage";
import { AboutPage } from "@/pages/public/AboutPage";
import { ExperiencePage } from "@/pages/public/ExperiencePage";
import { ReservationsPage } from "@/pages/public/ReservationsPage";
import { ContactPage } from "@/pages/public/ContactPage";
import { CareersPage } from "@/pages/public/CareersPage";
import { PressPage } from "@/pages/public/PressPage";
import { PrivacyPage } from "@/pages/public/PrivacyPage";
import { TermsPage } from "@/pages/public/TermsPage";

import { LoginPage } from "@/pages/auth/LoginPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { InsumosPage } from "@/pages/insumos/InsumosPage";
import { CategoriasPage } from "@/pages/categorias/CategoriasPage";
import { UsuariosPage } from "@/pages/usuarios/UsuariosPage";
import { AdminLayout } from "@/layouts/AdminLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppRouter() {
  return (
    <Routes>
      {/* Pública - Layout con Navbar y Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/nosotros" element={<AboutPage />} />
        <Route path="/experiencia" element={<ExperiencePage />} />
        <Route path="/reservas" element={<ReservationsPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/empleo" element={<CareersPage />} />
        <Route path="/prensa" element={<PressPage />} />
        <Route path="/privacidad" element={<PrivacyPage />} />
        <Route path="/terminos" element={<TermsPage />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Privadas — todas dentro del AdminLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<DashboardPage />} />
        <Route path="/insumos" element={<InsumosPage />} />
        <Route path="/categorias" element={<CategoriasPage />} />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <UsuariosPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
