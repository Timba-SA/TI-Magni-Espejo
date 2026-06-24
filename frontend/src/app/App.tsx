import { AppRouter } from "@/router/AppRouter";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import { useSessionRefresh } from "@/hooks/useSessionRefresh";

function AppContent() {
  useSessionRefresh();
  return (
    <>
      <AppRouter />
      <Toaster position="top-left" />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
