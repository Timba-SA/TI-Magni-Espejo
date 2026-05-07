import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { EditorialFooter } from "@/components/landing/EditorialFooter";

export function PublicLayout() {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="relative bg-[#0B0B0B] overflow-x-hidden min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <EditorialFooter />
    </div>
  );
}
