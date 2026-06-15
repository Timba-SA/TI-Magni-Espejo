import { AppRouter } from "@/router/AppRouter";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <ThemeProvider>
      <AppRouter />
      <Toaster position="top-left" />
    </ThemeProvider>
  );
}
