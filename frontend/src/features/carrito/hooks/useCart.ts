import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

export const useCart = () => {
  const user = useAuthStore((state) => state.user);
  const key = user ? `user_${user.id}` : "guest";
  
  const carts = useCartStore((state) => state.carts);
  const isOpen = useCartStore((state) => state.isOpen);
  const setIsOpen = useCartStore((state) => state.setIsOpen);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  // Derivar reactivamente los items e importes del usuario activo
  const items = carts[key] || [];
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);
  const totalPrecio = items.reduce((acc, item) => acc + item.cantidad * item.producto.precio_base, 0);

  return {
    items,
    totalItems,
    totalPrecio,
    isOpen,
    setIsOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };
};
