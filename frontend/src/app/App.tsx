import { AppRouter } from "@/router/AppRouter";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/features/carrito/contexts/CartContext";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <AppRouter />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
